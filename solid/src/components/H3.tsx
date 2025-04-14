import { Component, createSignal, onMount, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { roomCode, setRoomCode } from "../store";
import { socket , setSocket } from "../store";
import ky from "ky";
import logoImage from '../../resource/logo.png';

const H3Waiting: Component = () => {
  const navigate = useNavigate();
  const currentRoomCode = roomCode();
  const ws = socket(); // 전역에서 불러온 WebSocket 인스턴스
  const [teams, setTeams] = createSignal<string[]>([]);

  onMount(() => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("⚠️ WebSocket 연결이 유효하지 않습니다. 처음부터 다시 시작해주세요.");
      navigate("/");
      return;
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.action === "update_users") {
          const userList = msg.data.map((user: any) => user.username);
          setTeams(userList);
        }
      } catch (err) {
        console.warn("[WS] 메시지 파싱 실패:", err);
      }
    };

    ws.onclose = () => {
      console.warn("WebSocket closed");
      alert("❌ 연결이 종료되었습니다. 다시 접속해주세요.");
      navigate("/");
    };
  });

  const handleGameStart = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("❌ WebSocket 연결이 종료되었습니다.");
      return;
    }

    ws.send(JSON.stringify({ action: "start_game" }));
    navigate("/host/preinfo");
  };

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-sans">
      <div class="flex flex-col items-center bg-gray-800 rounded-lg px-12 py-8 shadow-lg">
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
