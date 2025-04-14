import { Component, createSignal, createEffect, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { roomCode, socket } from '../store';
import logoImage from '../../resource/logo_horizon.png';
import ky from "ky";

interface TeamStatus {
  name: string;
  ready: boolean;
}

const ReadyInfo: Component = () => {
  const navigate = useNavigate();
  const currentRoomCode = roomCode();

  const [teams, setTeams] = createSignal<TeamStatus[]>([]);
  const [isDisabled, setIsDisabled] = createSignal(true);

  onMount(() => {
    const ws = socket();

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected");
      return;
    }

    // 초기 팀 데이터 요청
    ws.send(JSON.stringify({ action: "get_team_list" }));

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.action === "update_users") {
        const newTeams = msg.data.map((user: any) => ({
          name: user.username,
          ready: false,
        }));
        setTeams(newTeams);
      }

      if (msg.action === "update_bag_status") {
        const { team, status } = msg.data;
        setTeams(prev =>
          prev.map(t =>
            t.name === team ? { ...t, ready: status === "submitted" } : t
          )
        );
      }
    };

    onCleanup(() => {
      ws.onmessage = null;
    });
  });

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center py-5 font-sans">
      <div class="max-w-screen-xl mx-auto mt-2 flex flex-col items-center">
        <img
          src={logoImage}
          alt="Disaster.io Logo"
          class="h-16 w-auto mb-2"
        />
        <h1 class="text-2xl mb-4">게임 플레이</h1>
      </div>

      <div class="flex justify-center bg-gray-800 gap-5 w-4/5 max-w-[1100px] p-5 rounded-lg">
        {teams().map((team) => (
          <div class="bg-gray-200 text-black p-4 rounded-lg w-[50%]">
            <h3 class="text-xl font-bold mb-3">{team.name} 팀 현황</h3>
            <div class={`mt-4 font-bold ${team.ready ? "text-green-500" : "text-gray-500"}`}>
              {team.ready ? "준비 완료" : "준비 중..."}
            </div>
          </div>
        ))}
      </div>

      <div class="mt-5">
        <button 
          onClick={() => navigate('/host/sceneinfo')}
          class={`bg-orange-400 text-black px-10 py-2.5 text-xl font-bold rounded-md ${
            isDisabled() ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-orange-500'
          }`}
          disabled={isDisabled()}
        >
          게임 완료
        </button>
      </div>
    </div>
  );
};

export default ReadyInfo;