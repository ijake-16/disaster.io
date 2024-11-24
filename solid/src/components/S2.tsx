import { createSignal } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import ky from "ky";

const S2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomCode = location.state?.roomCode; // roomCode 전달받기
  const [teamName, setTeamName] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal("");

  const handleConnect = async () => {
    if (!roomCode) {
      setErrorMessage("방 코드가 유효하지 않습니다.");
      return;
    }

    const trimmedTeamName = teamName().trim();
    if (!trimmedTeamName) {
      setErrorMessage("팀 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await ky
        .post(`http://localhost:8000/player/room/${roomCode}/join`, {
          json: { team_name: trimmedTeamName },
        })
        .json<{ message: string; room_code: string; player_name: string }>();

      console.log("Join response:", response);
      setErrorMessage("");
      navigate("/waiting", { state: { roomCode, teamName: trimmedTeamName } });
    } catch (error) {
      console.error("Failed to join room:", error);
      setErrorMessage("팀 이름이 이미 존재하거나 잘못된 요청입니다.");
    }
  };

  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white">
      <div class="container text-center">
      <div class="flex justify-center items-center mb-4">
        <img
          src="resource/logo.png"
          alt="Disaster.io Logo"
          class="h-36 w-auto"
        />
      </div>
        <div class="subtitle text-xl text-gray-200 mt-2 mb-8 font-sans">
          한국형 생존 대비 시뮬레이션
        </div>

        <div class="prompt text-xl mb-4 font-sans">팀명을 정해주세요</div>
        <input
          class="team-name bg-gray-200 text-black w-64 p-2.5 mx-auto rounded font-bold font-sans"
          placeholder="팀명을 입력하세요"
          value={teamName()}
          onInput={(e) => setTeamName(e.currentTarget.value)}
        />
        <div></div>

        <button
          class="connect-button bg-orange-500 text-black text-xl font-bold py-2.5 px-10 mt-5 rounded font-bold hover:bg-orange-600 transition-colors font-sans"
          onClick={handleConnect}
        >
          접속하기
        </button>
        {errorMessage() && (
          <div class="text-red-500 mt-2 font-sans">{errorMessage()}</div>
        )}
      </div>
    </div>
  );
};

export default S2;
