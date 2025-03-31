from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from managers import RoomManager
import json

app = FastAPI()
room_manager = RoomManager()

@app.post("/create_room/{room_id}/{username}")
async def create_room(room_id: str, username: str):
    success = room_manager.create_room(room_id, username)
    if not success:
        return JSONResponse(status_code=400, content={"detail": "Room already exists."})
    return {"message": f"Room '{room_id}' created by '{username}'."}


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
