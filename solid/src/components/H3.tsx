import { Component, createSignal, onMount } from 'solid-js';
import { roomCode, setRoomCode } from "../store";
import ky from "ky";
import logoImage from '../../resource/logo.png';

const H3Waiting: Component = () => {
  const [teams, setTeams] = createSignal<string[]>([]);
  const currentRoomCode = roomCode();

  const fetchTeams = async () => {
    try {
      const response = await ky.get(`http://localhost:8000/host/room/${currentRoomCode}/info`).json<{ players: string[] }>();
      setTeams(response.players);
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    }
  };

  onMount(() => {
    fetchTeams();
    const interval = setInterval(fetchTeams, 3000);

    return () => clearInterval(interval);
  });

  const handleGameStart = async () => {
    try {
      await ky.post(`http://localhost:8000/host/room/${currentRoomCode}/join_confirm`);
      setRoomCode(currentRoomCode);
      console.log("Room code set to:", currentRoomCode);
      window.location.href = '/host/preinfo';
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-sans">
      <div class="flex flex-col items-center w-[300px] bg-gray-700 rounded-lg px-12 py-8 shadow-lg">
        <div class="max-w-screen-xl mx-auto flex flex-col items-center">
          <img
            src={logoImage}
            alt="Disaster.io Logo"
            class="h-32 w-auto mb-6"
          />
        </div>
        
        <div class="text-2xl text-center text-orange-400 mb-2.5">
          {currentRoomCode}
        </div>
        
        <div class="text-xl text-center text-gray-200 mb-5">
          ({teams().length}/4) 입장 대기 중..
        </div>

        {teams().map((team) => (
          <button class="w-full bg-white text-black py-2.5 px-2.5 mb-1.5 rounded text-base cursor-pointer hover:bg-gray-100 transition-colors">
            {team}
          </button>
        ))}

        <button 
          onClick={handleGameStart}
          class="items-center bg-orange-400 text-black text-xl font-bold py-2.5 px-5 mt-5 rounded text-xl text-center cursor-pointer hover:bg-orange-500 transition-colors"
        >
          게임 시작하기
        </button>
      </div>
    </div>
  );
};

export default H3Waiting;