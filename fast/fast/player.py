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

    except WebSocketDisconnect:
        room.disconnect(websocket)
        await room.broadcast_room()
        room_manager.cleanup_room(room_id)
