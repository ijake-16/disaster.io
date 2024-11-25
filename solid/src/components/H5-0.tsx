import { Component, createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import ky from "ky";
import logoImage from '../../resource/logo.png';

const BagCheck: Component = () => {
    const navigate = useNavigate();
    const [teamStatus, setTeamStatus] = createSignal<{ [key: string]: boolean }>({
      "정빈팀": false,
      "카이스트에서 살아남기": false
    });
  
    // fetchTeams 함수 수정
    const fetchTeams = async () => {
      try {
        const response = await ky
          .get(`http://localhost:8000/host/room/{room_code}/finish_info`)
          .json<{ [key: string]: boolean }>(); // 응답 타입 지정
        setTeamStatus(response); // 받아온 데이터를 상태로 설정
      } catch (error) {
        console.error("Failed to fetch teams:", error);
      }
    };

  onMount(() => {
    fetchTeams();
    const interval = setInterval(fetchTeams, 3000);

    return () => clearInterval(interval);
  });

//여기까지

  return (
    <div class="min-h-screen bg-gray-800 text-white flex flex-col items-center py-5">
      {/* Header */}
      <div class="max-w-screen-xl mx-auto flex flex-col items-center">
        <img
          src={logoImage}
          alt="Disaster.io Logo"
          class="h-32 w-auto mb-2"
        />
        <h1 class="text-lg">게임 준비</h1>
      </div>

      {/* Game Status Container */}
      <div class="flex justify-center gap-5 w-4/5 max-w-[900px] bg-gray-700 p-5 rounded-lg">
        {Object.entries(teamStatus()).map(([teamName, status]) => (
          <TeamStatus 
            teamName={`${teamName} 팀 현황`}
            type={status}
          />
        ))}
      </div>
    </div>
  );
};

// TeamStatus Component
interface TeamStatusProps {
  teamName: string;
  type: boolean;
}

const TeamStatus: Component<TeamStatusProps> = (props) => {
  return (
    <div class="bg-gray-100 text-black p-4 rounded-lg w-[45%]">
      <h3 class="text-lg font-bold mb-3">{props.teamName}</h3>

      {/* Backpack */}
      <div class="mt-2">
        <img 
          src={props.type ? "../../resource/water.png" : "../../resource/zipbags.png"} 
          alt={props.type ? "Water" : "Zipbags"} 
          class="w-15 h-auto mx-auto" 
        />
      </div>
    </div>
  );
};


export default BagCheck;