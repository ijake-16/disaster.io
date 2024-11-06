from fastapi import APIRouter, HTTPException
from .models import game_rooms, Room, generate_room_code, CreateRoomRequest
from typing import Dict

router = APIRouter(prefix="/host")

@router.post("/create_room")
async def create_room(request: CreateRoomRequest):
    room_code = generate_room_code()
    while room_code in game_rooms:
        room_code = generate_room_code()
    
    game_rooms[room_code] = Room(
        code=room_code,
        host_nickname=request.host_nickname
    )
    
    return {
        "room_code": room_code,
        "host_nickname": request.host_nickname
    }



@router.get("/room/{room_code}/info")
async def get_room_info(room_code: str):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    return {
        "room_code": room_code,
        "host_nickname": room.host_nickname,
        "players": [team.name for team in room.teams.values()]
    }

@router.post("/room/{room_code}/game_info")
async def set_game_info(room_code: str, game_info: Dict):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    room.game_info = game_info
    return {"message": "게임 정보가 성공적으로 업로드되었습니다", "game_info": game_info} 