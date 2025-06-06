from fastapi import WebSocket
from pydantic import BaseModel, Field
from typing import Optional
import json

class GameSettings(BaseModel):
    max_players: int        = Field(..., gt=0, description="게임에 참여할 수 있는 최대 인원수")
    time_limit_minutes: int = Field(..., gt=0, description="게임 진행 시간(분)")
    allow_spectators: bool  = Field(default=False, description="관전 허용 여부")
    map_type: str           = Field("default_map", description="맵 타입")
    difficulty: str         = Field("normal", description="난이도 설정")

class ConnectionManager:
    def __init__(self, host: str):
        self.active_connections: list[WebSocket] = []
        self.user_data: dict[WebSocket, dict] = {}
        self.host_username = host
        self.bag_data: dict[str, dict] = {}
        self.bag_status: dict[str, str] = {}  
        self.bag_choices: dict[str, dict] = {}

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

class RoomData:
    def __init__(self, connection_manager: ConnectionManager, host_nickname: str, pre_info: str, disaster: str, room_settings: GameSettings):
        self.manager = connection_manager
        self.host_nickname = host_nickname
        self.selected_pre_info = pre_info
        self.selected_disaster = disaster
        self.room_settings = room_settings


class RoomManager:
    def __init__(self):
        self.rooms: dict[str, RoomData] = {}

    def create_room(self, room_id: str, host_nickname: str, pre_info: str, disaster: str, room_settings: GameSettings) -> bool:
        if room_id in self.rooms:
            return False

        conn_manager = ConnectionManager(host=host_nickname)
        self.rooms[room_id] = RoomData(conn_manager, host_nickname, pre_info, disaster, room_settings)
        return True

    def get_room(self, room_id: str) -> Optional[ConnectionManager]:
        room = self.rooms.get(room_id)
        return room.manager if room else None

    def get_room_info(self, room_id: str) -> Optional[RoomData]:
        return self.rooms.get(room_id)

    def cleanup_room(self, room_id: str):
        room = self.rooms.get(room_id)
        if room and not room.manager.active_connections:
            del self.rooms[room_id]
room_manager = RoomManager()