from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fast.managers import RoomManager
import json
import uuid

app = FastAPI()
room_manager = RoomManager()

class CreateRoomPayload(BaseModel):
    host_nickname: str
    selected_pre_info: str
    selected_disaster: str

@app.post("/create_room")
async def create_room(payload: CreateRoomPayload):
    room_code = str(uuid.uuid4())[:6]
    success = room_manager.create_room(
        room_code,
        payload.host_nickname,
        payload.selected_pre_info,
        payload.selected_disaster
    )
    if not success:
        return JSONResponse(status_code=400, content={"detail": "Room already exists."})

    return {
        "room_code": room_code,
        "host_nickname": payload.host_nickname
    }

@app.get("/rooms")
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

@app.websocket("/ws/{room_id}/{username}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, username: str):
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

            elif action == "start_game" and user and user["is_host"]:
                await room.broadcast_message({
                    "action": "start_game",
                    "data": f"Game is starting in room {room_id}!"
                })

    except WebSocketDisconnect:
        room.disconnect(websocket)
        await room.broadcast_room()
        room_manager.cleanup_room(room_id)
