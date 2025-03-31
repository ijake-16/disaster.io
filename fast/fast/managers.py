from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self, host: str):
        self.active_connections: list[WebSocket] = []
        self.user_data: dict[WebSocket, dict] = {}
        self.host_username = host

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        is_host = username == self.host_username
        self.user_data[websocket] = {"username": username, "ready": False, "is_host": is_host}
        await self.broadcast_room()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.user_data:
            del self.user_data[websocket]

    async def broadcast_room(self):
        room_state = [
            {"username": info["username"], "ready": info["ready"], "is_host": info["is_host"]}
            for info in self.user_data.values()
        ]
        await self.broadcast_message({"action": "update_users", "data": room_state})

    async def broadcast_message(self, message: dict):
        text = json.dumps(message)
        for conn in self.active_connections:
            await conn.send_text(text)


class RoomManager:
    def __init__(self):
        self.rooms: dict[str, ConnectionManager] = {}

    def create_room(self, room_id: str, host_username: str) -> bool:
        if room_id in self.rooms:
            return False  # 방이 이미 있음
        self.rooms[room_id] = ConnectionManager(host_username)
        return True

    def get_room(self, room_id: str) -> ConnectionManager | None:
        return self.rooms.get(room_id)

    def cleanup_room(self, room_id: str):
        if room_id in self.rooms and not self.rooms[room_id].active_connections:
            del self.rooms[room_id]
