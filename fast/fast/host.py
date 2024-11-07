from fastapi import APIRouter, HTTPException
from .models import game_rooms, Room, generate_room_code, CreateRoomRequest
from typing import Dict

router = APIRouter(prefix="/host")

#h1
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

#h2
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

#h3
@router.post("/room/{room_code}/join_confirm")
async def confirm_to_start_game_info(room_code: str):
    """
    게임 참여가 완료되어 사전정보 안내를 시작합니다.
    """
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    room.current_phase = "game_info"
    return {
        "message": "사전정보 안내를 시작합니다",
        "current_phase": room.current_phase
    }

#h5
@router.post("/room/{room_code}/game_info")
async def set_game_info(room_code: str, game_info: Dict):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    room.game_info = game_info
    return {"message": "게임 정보가 성공적으로 업로드되었습니다", "game_info": game_info} 

#h6
@router.post("/room/{room_code}/game_info_confirm")
async def confirm_to_start_bag_selection(room_code: str):
    """
    사전정보 안내가 완료되어 가방 선택을 시작합니다.
    """
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    room.current_phase = "bag_selection"
    return {
        "message": "가방 선택을 시작합니다",
        "current_phase": room.current_phase
    }

#h7
@router.get("/room/{room_code}/bag_contents")
async def get_bag_contents(room_code: str):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    team_bags = {}
    
    for team_name, team in room.teams.items():
        team_bags[team_name] = team.bag_contents
    
    return team_bags

