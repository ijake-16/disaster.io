from fastapi import APIRouter, HTTPException
from .models import game_rooms, Room, generate_room_code
from typing import Dict

router = APIRouter(prefix="/host")

@router.post("/create_room")
async def create_room():
    room_code = generate_room_code()
    while room_code in game_rooms:
        room_code = generate_room_code()
    game_rooms[room_code] = Room(code=room_code)
    return {"room_code": room_code}

@router.get("/rooms")
async def get_all_rooms():
    return {
        "rooms": [
            {
                "room_code": room.code,
                "teams_count": len(room.teams)
            } for room in game_rooms.values()
        ]
    }

@router.post("/room/{room_code}/game_info")
async def set_game_info(room_code: str, game_info: Dict):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    room.game_info = game_info
    return {"message": "게임 정보가 성공적으로 업로드되었습니다", "game_info": game_info} 

@router.get("/room/{room_code}/bag_contents")
async def get_bag_contents(room_code: str):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    team_bags = {}
    
    for team_name, team in room.teams.items():
        team_bags[team_name] = team.bag_contents
    
    return team_bags

