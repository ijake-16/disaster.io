import { Component, createSignal, onMount, onCleanup, For } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { socket } from "../store";

const S3: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomCode = location.state?.roomCode;
  const currentTeamName = location.state?.teamName;
  const [teamNames, setTeamNames] = createSignal<string[]>([]);
  const [errorMessage, setErrorMessage] = createSignal("");

  onMount(() => {
    const ws = socket();
    if (!ws) {
      setErrorMessage("웹소켓 연결이 유효하지 않습니다.");
      return;
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.action === "update_users") {
          const allUsers = msg.data;
          const others = allUsers
            .map((user: any) => user.username)
            .filter((name: string) => name !== currentTeamName);
          setTeamNames(others);
        }

        if (msg.action === "start_game") {
          navigate("/preinfo", {
            state: { roomCode, teamName: currentTeamName },
          });
        }
      } catch (err) {
        console.error("WebSocket 메시지 파싱 오류:", err);
      }
    };

    ws.onerror = () => {
      setErrorMessage("웹소켓 오류가 발생했습니다.");
    };

    ws.onclose = () => {
      setErrorMessage("연결이 끊어졌습니다.");
    };
  });

  return (
    <div class="flex justify-center text-center items-center h-screen bg-neutral-950 text-white">
      <div class="w-auto rounded-lg p-8 shadow-lg">
        <div class="flex justify-center items-center mb-6">
          <img
            src="resource/logo.png"
            alt="Disaster.io Logo"
            class="h-36 w-auto"
          />
        </div>

        <div class="text-base text-orange-400 mb-2.5 font-sans">{roomCode}</div>
        <div class="text-base text-gray-400 mb-5 font-sans">입장 대기 중 ...</div>

        <div class="w-full bg-orange-400 text-black p-2.5 rounded font-bold mb-4 font-sans">
          YOU : {currentTeamName}
        </div>

        {errorMessage() ? (
          <div class="text-red-500 font-sans">{errorMessage()}</div>
        ) : (
          <For each={teamNames()}>
            {(team) => (
              <button class="w-full bg-gray-200 text-black py-2.5 px-0 my-1 rounded text-base hover:bg-gray-400 transition-colors font-sans">
                {team}
              </button>
            )}
          </For>
        )}

        <button
          class="w-full bg-orange-800 text-black py-2.5 px-5 mt-5 rounded text-lg hover:bg-orange-900 transition-colors font-sans"
        >
          호스트가 게임을 시작할 때까지 기다려주세요.
        </button>
      </div>
    </div>
  );
};

export default S3;
