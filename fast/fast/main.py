from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import random
import string
from typing import Dict

router = APIRouter()

game_rooms = {}

class Team(BaseModel):
    name: str

class Room(BaseModel):
    code: str
    teams: Dict[str, Team] = {}

class Participant(BaseModel):
    team_name: str

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

@router.get("/example")
async def example_api():
    return {"메시지": "이것은 예시 API 메서드입니다."}

@router.post("/create_room")
async def create_room():
    room_code = generate_room_code()
    while room_code in game_rooms:
        room_code = generate_room_code()
    game_rooms[room_code] = Room(code=room_code)
    return {"room_code": room_code}

@router.post("/join_room/{room_code}")
async def join_room(room_code: str, participant: Participant):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    room = game_rooms[room_code]
    
    if participant.team_name in room.teams:
        raise HTTPException(status_code=400, detail="이미 존재하는 팀 이름입니다")
    
    room.teams[participant.team_name] = Team(name=participant.team_name)
    return {"message": f"{participant.team_name} 팀이 방에 참가했습니다", 
            "team": participant.team_name}

@router.get("/room/{room_code}")
async def get_room_info(room_code: str):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    room = game_rooms[room_code]
    return {
        "room_code": room.code,
        "teams": [team.name for team in room.teams.values()]
    }

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
