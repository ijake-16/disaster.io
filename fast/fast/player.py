from fastapi import APIRouter, HTTPException
from .models import game_rooms, Participant, Team
from typing import Dict

router = APIRouter(prefix="/player")

#p1
@router.get("/room/{room_code}/host")
async def get_host_nickname(room_code: str):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    return {
        "room_code": room_code,
        "host_nickname": room.host_nickname
    }

#p2
@router.post("/room/{room_code}/join")
async def join_room(room_code: str, player: Participant):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    if player.team_name in room.teams:
        raise HTTPException(status_code=400, detail="이미 존재하는 플레이어 이름입니다")
    
    room.teams[player.team_name] = Team(name=player.team_name)
    return {
        "message": f"{player.team_name}님이 방에 참가했습니다",
        "room_code": room_code,
        "host_nickname": room.host_nickname,
        "player_name": player.team_name
    }

#p3
@router.get("/room/{room_code}/teams")
async def get_room_teams(room_code: str):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    teams = list(room.teams.keys())
    return {"teams": teams}

#p4
@router.get("/room/{room_code}/join_confirmed")
async def confirmed_to_start_game_info(room_code: str):
    """
    게임 참여가 완료되어 사전정보 안내가 시작됩니다.
    """
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    if room.current_phase != "game_info":
        raise HTTPException(status_code=400, detail="다른 팀이 게임 참여 중입니다")
        
    return {
        "message": "사전정보 안내가 시작되었습니다",
        "current_phase": room.current_phase
    }

#p6
@router.post("/room/{room_code}/team/{team_name}/select_bag")
async def select_bag(room_code: str, team_name: str, bag_number: int):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    if team_name not in room.teams:
        raise HTTPException(status_code=404, detail="팀을 찾을 수 없습니다")
    
    if bag_number not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="유효하지 않은 가방 번호입니다")
    
    room.teams[team_name].selected_bag = bag_number
    return {"message": f"{team_name} 팀이 {bag_number}번 가방을 선택했습니다"}

#이건 삭제해야 할 것 같습니다?
@router.get("/room/{room_code}/team_selections")
async def get_team_selections(room_code: str):
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    
    room = game_rooms[room_code]
    team_selections = {
        team_name: team.selected_bag 
        for team_name, team in room.teams.items()
    }
    return {"team_selections": team_selections}

#p7
@router.post("/room/{room_code}/team/{team_name}/submit_bag")
async def submit_bag_contents(room_code: str, team_name: str, bag_contents: Dict[str, int]):
    """
    가방 내용물을 저장하는 함수
    
    Args:
        room_code (str): 방 코드
        team_name (str): 팀 이름
        bag_contents (Dict[str, int]): 가방 내용물 정보 (예: {"bag": 3, "water": 4, "toy": 0})
    """
    if room_code not in game_rooms:
        raise HTTPException(status_code=404, detail="존재하지 않는 방입니다")
    
    room = game_rooms[room_code]
    if team_name not in room.teams:
        raise HTTPException(status_code=404, detail="존재하지 않는 팀입니다")
    
    team = room.teams[team_name]
    team.bag_contents = bag_contents
    return {"message": f"{team_name} 팀의 가방 내용물이 저장되었습니다"}
