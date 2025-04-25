from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fast.managers import room_manager
import json

router = APIRouter(prefix="/player")


@router.get("/room/{room_id}")
async def get_room_host(room_id: str):
    room_data = room_manager.get_room_info(room_id)
    if not room_data:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {
        "room_code": room_id,
        "host_nickname": room_data.host_nickname
    }


@router.websocket("/ws/{room_id}/{username}")
async def player_websocket(websocket: WebSocket, room_id: str, username: str):
    room = room_manager.get_room(room_id)
    if not room:
        await websocket.close(code=4000)
        return

    await room.connect(websocket, username)

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
                team_name = data_json["data"]["team"]
                flat       = data_json["data"]["contents"]
                # flat → snapshot 구조로 재조립
                snapshot = {
                    "items": { k: v for k, v in flat.items() if k not in ("totalWeight","totalVolume","bagID") },
                    "totalWeight": flat["totalWeight"],
                    "totalVolume": flat["totalVolume"],
                    "bagID": flat["bagID"]
                }
                print(f"[{room_id}] 팀 {team_name}이 가방을 제출했습니다: {bag_contents}")

                # 필요하면 room 객체에 저장하거나 DB 연동
                room.bag_data[team_name] = snapshot

                await room.broadcast_message({
                    "action": "submitted_bag",
                    "data": {
                        "team": team_name,
                        "status": "submitted"
                    }
                })
                await room.broadcast_message({
                    "action": "bag_updated",
                    "data": { "team": team_name, "snapshot": snapshot }
                })
            elif action == "bag_update" and user:
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
