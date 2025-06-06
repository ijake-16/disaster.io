import { createSignal } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { setSocket, setRoomCode } from "../store";

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

    // const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    // const ws = new WebSocket(`${wsProtocol}://${window.location.host}/player/ws/${roomCode}/${trimmedName}`);

    const ws = new WebSocket(`/player/ws/${roomCode}/${trimmedTeamName}`);

    ws.onopen = () => {
      console.log("WebSocket 연결 성공!");
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.action === "room_join_confirmed") {
        setRoomCode(roomCode);   
        navigate("/waiting", {
        state: { roomCode, teamName: trimmedTeamName },
        });
      }
      else if (msg.action === "error") {
        setErrorMessage(msg.message)
      }
    };
    ws.onerror = () => {
      setErrorMessage("연결에 실패했습니다. 방이 닫혔거나 닉네임이 중복됐을 수 있어요.");
    };

    ws.onclose = (e) => {
      if (e.code === 4000) {
        setErrorMessage("해당 방이 존재하지 않거나 입장할 수 없습니다.");
      } else {
        console.warn("소켓이 닫혔습니다:", e);
      }
    };
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
          class="connect-button bg-orange-400 text-black text-xl font-bold py-2.5 px-10 mt-5 rounded font-bold hover:bg-orange-500 transition-colors font-sans"
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
