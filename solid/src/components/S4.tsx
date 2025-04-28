import { Component, createSignal, onMount, onCleanup, For } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { socket } from "../store";

const WaitingScreen: Component = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const roomCode = location.state?.roomCode;
    const currentTeamName = location.state?.teamName;
    
    onMount(() => {
      const ws = socket(); // 전역 WebSocket 인스턴스 가져오기
      if (!ws) return;
    
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
    
        if (msg.action === "start_select") {
          navigate("/bagselect", {
            state: { roomCode, teamName: currentTeamName },
          });
        }
      };
    
      // 필요하면 연결 해제 처리
      onCleanup(() => {
        if (ws) {
          ws.onmessage = null;
        }
      });
    });
      
  return (
    <div class="flex flex-col justify-center items-center h-screen bg-neutral-950 text-white font-sans">
      <div class="text-center mb-8">
        <p class="text-lg text-orange-400 font-sans mb-2">Room : {roomCode}</p>
        <div class="flex justify-center items-center mb-8">
        <img
          src="resource/logo.png"
          alt="Disaster.io Logo"
          class="h-36 w-auto"
        />
      </div>
        <h2 class="text-gray-200 text-2xl font-sans">호스트의 가족 정보와 지역 정보 안내를 듣고</h2>
        <h2 class="text-gray-200 text-2xl font-sans">재난에 대비하세요.</h2>
        <p class="text-orange-400 mt-5 text-xl font-sans">YOU : {currentTeamName}</p>
      </div>
    </div>
  );
};

export default WaitingScreen;
