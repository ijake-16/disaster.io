import { Component, createSignal, onMount, onCleanup, For } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import ky from "ky";

const S3: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomCode = location.state?.roomCode;
  const currentTeamName = location.state?.teamName;
  const [teamNames, setTeamNames] = createSignal<string[]>([]);
  const [errorMessage, setErrorMessage] = createSignal("");

  const fetchTeamNames = async () => {
    try {
      if (!roomCode) {
        setErrorMessage("유효하지 않은 방 코드입니다.");
        return;
      }

      const response = await ky
        .get(`http://localhost:8000/player/room/${roomCode}/teams`)
        .json<{ teams: string[] }>();

      // 현재 팀 이름 제외
      const filteredTeams = response.teams.filter(
        (team) => team !== currentTeamName
      );
      setTeamNames(filteredTeams);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to fetch team names:", error);
      setErrorMessage("팀 목록을 불러오는 데 실패했습니다.");
    }
  };
  const checkJoinConfirmed = async () => {
    try {
      if (!roomCode) return;

      const response = await ky
        .get(`http://localhost:8000/player/room/${roomCode}/join_confirmed`)
        .json<{ message: string; current_phase: string }>();

      if (response.current_phase === "game_info") {
        navigate("/preinfo", {
          state: { roomCode, teamName: currentTeamName },
        });
      }
    } catch (error) {
      console.error("Error checking join confirmed:", error);
      // 에러는 무시, 신호가 없거나 서버가 준비되지 않은 상태일 수 있음.
    }
  };
  onMount(() => {
    fetchTeamNames();
    const teamNamesInterval = setInterval(fetchTeamNames, 3000);
    const joinConfirmedInterval = setInterval(checkJoinConfirmed, 3000);

    onCleanup(() => {
      clearInterval(teamNamesInterval);
      clearInterval(joinConfirmedInterval);
    });
  });

  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white">
      <div class="w-[300px] bg-neutral-800 rounded-lg p-5 shadow-lg">
      <div class="flex justify-center items-center mb-6">
        <img
          src="resource/logo.png"
          alt="Disaster.io Logo"
          class="h-24 w-auto"
        />
      </div>
        <div class="text-base text-amber-500 mb-2.5 font-sans">{roomCode}</div>

        <div class="text-sm text-gray-400 mb-5 font-sans">입장 대기 중 ...</div>

        <div class="bg-amber-500 text-black p-2.5 rounded font-bold mb-4 font-sans">
          YOU : {currentTeamName}
        </div>

        {errorMessage() ? (
          <div class="text-red-500 font-sans">{errorMessage()}</div>
        ) : (
          <For each={teamNames()}>
            {(team) => (
              <button class="w-full bg-white text-black py-2.5 px-0 my-1 rounded text-base hover:bg-gray-100 transition-colors font-sans">
                {team}
              </button>
            )}
          </For>
        )}

        <button
          class="bg-amber-300 text-black py-2.5 px-5 mt-5 rounded text-lg font-sans"
        >
          호스트가 게임을 시작할 때까지 기다려주세요.
        </button>
      </div>
    </div>
  );
};

export default S3;
