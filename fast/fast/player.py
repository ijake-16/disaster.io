from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fast.managers import room_manager
import json

router = APIRouter(prefix="/player")


@router.get("/room/{room_id}")
async def get_room_host(room_id: str):
    room_data = room_manager.get_room_info(room_id)
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    num_players = len(room_data.manager.active_connections)
    max_players = room_data.room_settings.max_players
    return {
        "room_code": room_id,
        "host_nickname": room_data.host_nickname,
        "num_players": num_players,
        "max_players": max_players,
    }


@router.websocket("/ws/{room_id}/{username}")
async def player_websocket(websocket: WebSocket, room_id: str, username: str):
    room = room_manager.get_room(room_id)
    if not room:
        await websocket.close(code=4000)
        return
    room_data = room_manager.get_room_info(room_id)
    num_players = len(room_data.manager.active_connections) -1 # 호스트 빼주기
    max_players = room_data.room_settings.max_players
    if num_players >= max_players:
        await websocket.accept()
        await websocket.send_text(json.dumps({
            "action": "error",
            "message": f"방이 가득 찼습니다. ({num_players}/{max_players})"
        }))
        await websocket.close(code=4001)
        return
    for ws, info in room.user_data.items():
        if info["username"] == username:
            await websocket.accept()
            await websocket.send_text(json.dumps({
                "action": "error",
                "message": "이미 사용 중인 닉네임입니다."
            }))
            await websocket.close(code=4002)
            return

    await room.connect(websocket, username)
    await websocket.send_text(json.dumps({
            "action": "room_join_confirmed",
            "message": f"어서오세요"
        }))
    try:
        while True:
            data = await websocket.receive_text()
            try:
                data_json = json.loads(data)
            except json.JSONDecodeError:
                continue

            action = data_json.get("action")
            user = room.user_data.get(websocket)

            if action == "toggle_ready" and user:
                user["ready"] = not user["ready"]
                await room.broadcast_room()
            
            elif action =="fetch_room_bags" and user:
                await room.broadcast_message({
                   "action": "room_state",
                   "data": { "bags": room.bag_data }
                })
                await room.broadcast_message({
                    "action": "ready_state",
                    "data" :{"readys" :
                    [
                        info["username"]
                        for info in room.user_data.values()
                        if info.get("ready")
                    ]}
                })
                


            elif action == "select_bag" and user:
                team_name = data_json["data"].get("team")
                bag_id = data_json["data"].get("bagID")

                if team_name and bag_id:
                    room.bag_data[team_name] = {
                        "items": {},
                        "totalWeight": 0,
                        "totalVolume": 0,
                        "bagID": bag_id
                    }

                    # 브로드캐스트: 가방 상태 업데이트
                    await room.broadcast_message({
                        "action": "room_state",
                        "data": { "bags": room.bag_data }
                    })
                    print(f"[INFO] {team_name} selected bag {bag_id}")
            elif action == "submit_bag" and user:
                team = data_json["data"]["team"]
                snapshot = data_json["data"]["snapshot"]
                user['ready'] = True

                # 메모리에 저장
                room.bag_data[team] = snapshot

                # 전체 클라이언트(호스트 포함)에 브로드캐스트
                await room.broadcast_message({
                    "action": "bag_updated",
                    "data": { "team": team, "snapshot": snapshot }
                })

                await room.broadcast_message({
                    "action": "submitted_bag",
                    "data": {
                        "team": team,
                        "status": "submitted"
                    }
                })
                
            elif action == "update_bag" and user:
                team = data_json["data"]["team"]
                snapshot = data_json["data"]["snapshot"]

                # 메모리에 저장
                room.bag_data[team] = snapshot

                # 전체 클라이언트(호스트 포함)에 브로드캐스트
                await room.broadcast_message({
                    "action": "bag_updated",
                    "data": { "team": team, "snapshot": snapshot }
                })


    except WebSocketDisconnect:
        room.disconnect(websocket)
        await room.broadcast_room()
        room_manager.cleanup_room(room_id)
