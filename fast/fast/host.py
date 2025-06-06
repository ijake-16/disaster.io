from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uuid
from fast.managers import room_manager, GameSettings
import json

router = APIRouter(prefix="/host")

class CreateRoomPayload(BaseModel):
    host_nickname: str
    selected_pre_info: int
    selected_disaster: int
    game_settings: GameSettings

@router.post("/create_room")
async def create_room(payload: CreateRoomPayload):
    room_code = str(uuid.uuid4())[:6].upper()
    success = room_manager.create_room(
        room_code,
        payload.host_nickname,
        payload.selected_pre_info,
        payload.selected_disaster,
        payload.game_settings 
    )

    if not success:
        return JSONResponse(status_code=400, content={"detail": "Room already exists."})

    return {
        "room_code": room_code,
        "host_nickname": payload.host_nickname
    }

@router.get("/rooms")
async def list_rooms():
    room_list = []
    for room_id, room in room_manager.rooms.items():
        room_list.append({
            "room_code": room_id,
            "host_nickname": room.host_nickname,
            "selected_pre_info": room.selected_pre_info,
            "selected_disaster": room.selected_disaster,
            "user_count": len(room.manager.active_connections),
        })

    return room_list

@router.websocket("/ws/{room_id}/{username}")
async def host_websocket(websocket: WebSocket, room_id: str, username: str):
    print(room_id,username)
    room        = room_manager.get_room(room_id)
    room_data   = room_manager.get_room_info(room_id)
    if not room:
        await websocket.close(code=4000)
        return
    await room.connect(websocket, username)
    await websocket.send_text(json.dumps({
        "action": "initial_state",
        "data": {
            "bags": room.bag_data,
            "status": room.bag_status
        }
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
            if action == "fetch_room" and user and user["is_host"]:
                await room.broadcast_room()
            if action == "start_game" and user and user["is_host"]:
                room_data.started = True
                await room.broadcast_message({
                    "action": "start_game",
                    "data": f"Game is starting in room {room_id}!"
                })
            
            
            if action == "start_select" and user and user["is_host"]:
                await room.broadcast_message({
                    "action": "start_select"
                })


    except WebSocketDisconnect:
        room.disconnect(websocket)
        await room.broadcast_room()
        room_manager.cleanup_room(room_id)
