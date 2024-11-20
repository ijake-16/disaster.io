import { Component, createSignal, onMount } from 'solid-js';
import { roomCode } from "../store";
import ky from "ky";

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

  const handleGameStart = () => {
    // Using router would be better in a real application
    window.location.href = '/host/preinfo';
  };

  return (
    <div class="min-h-screen bg-gray-800 text-white flex items-center justify-center">
      <div class="w-[300px] bg-gray-700 rounded-lg p-5 shadow-lg">
        <h1 class="text-2xl m-0">Disaster.io</h1>
        
        <div class="text-xl text-orange-400 mb-2.5">
          {currentRoomCode}
        </div>
        
        <div class="text-sm text-gray-300 mb-5">
          ({teams().length}/4) 입장 대기 중 ...
        </div>

        {teams().map((team) => (
          <button class="w-full bg-white text-black py-2.5 px-2.5 mb-1.5 rounded text-base cursor-pointer hover:bg-gray-100 transition-colors">
            {team}
          </button>
        ))}

        <button 
          onClick={handleGameStart}
          class="bg-orange-400 text-black py-2.5 px-5 mt-5 rounded text-lg cursor-pointer hover:bg-orange-500 transition-colors"
        >
          게임시작하기
        </button>
      </div>
    </div>
  );
};

export default H3Waiting;