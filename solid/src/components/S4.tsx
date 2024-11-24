import { Component, createSignal, onMount, onCleanup, For } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import ky from "ky";

const WaitingScreen: Component = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const roomCode = location.state?.roomCode;
    const currentTeamName = location.state?.teamName;
    const checkPreInfoConfirmed = async () => {
        try {
          if (!roomCode) return;
    
          const response = await ky
            .get(`http://localhost:8000/player/room/${roomCode}/game_info_confirmed`)
            .json<{ message: string; current_phase: string }>();
    
          if (response.current_phase === "bag_selection") {
            navigate("/bagselect", {
              state: { roomCode, teamName: currentTeamName },
            });
          }
        } catch (error) {
          console.error("Error checking pre info confirmed:", error);
        }
      };
      onMount(() => {
        const checkPreInfoConfirmedInterval = setInterval(checkPreInfoConfirmed, 3000);
    
        onCleanup(() => {
          clearInterval(checkPreInfoConfirmedInterval);
        });
      });
  return (
    <div class="flex flex-col justify-center items-center h-screen bg-neutral-950 text-white font-sans">
      <div class="text-center mb-8">
        <p class="text-lg text-orange-500 font-sans mb-2">Room : {roomCode}</p>
        <div class="flex justify-center items-center mb-8">
        <img
          src="resource/logo.png"
          alt="Disaster.io Logo"
          class="h-36 w-auto"
        />
      </div>
        <h2 class="text-gray-200 text-2xl font-sans">호스트의 가족 정보와 지역 정보 안내를 듣고</h2>
        <h2 class="text-gray-200 text-2xl font-sans">재난에 대비하세요.</h2>
        <p class="text-orange-500 mt-5 text-xl font-sans">YOU : {currentTeamName}</p>
      </div>
    </div>
  );
};

export default WaitingScreen;
