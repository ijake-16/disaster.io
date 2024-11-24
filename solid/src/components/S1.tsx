import { Component, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import ky from "ky";

const S1: Component = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal("");

  const handleNext = async () => {
    try {
      const code = roomCode().trim();
      if (!code) {
        setErrorMessage("코드를 입력해주세요.");
        return;
      }

      const response = await ky
        .get(`http://localhost:8000/player/room/${code}/host`)
        .json<{ room_code: string; host_nickname: string }>();

      console.log("Room found:", response);
      setErrorMessage("");
      navigate("/teambuild", { state: { roomCode: code } }); // roomCode 전달
    } catch (error) {
      console.error("Failed to fetch room:", error);
      setErrorMessage("유효하지 않은 코드입니다. 다시 시도해주세요.");
    }
  };

  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white">
      <div class="container text-center">
      <div class="flex justify-center items-center mb-6">
        <img
          src="resource/logo.png"
          alt="Disaster.io Logo"
          class="h-36 w-auto"
        />
      </div>
        <div class="subtitle text-lg text-gray-400 mt-2 mb-8 font-sans">
          한국형 생존 대비 시뮬레이션
        </div>
        <input
          class="code-input bg-gray-200 text-black w-64 p-2 mx-auto rounded font-bold font-sans"
          placeholder="호스트에게 전달받은 코드 입력"
          value={roomCode()}
          onInput={(e) => setRoomCode(e.currentTarget.value)}
        />
        <button
          class="main-button bg-yellow-500 text-black py-2 px-8 mt-5 rounded font-sans"
          onClick={handleNext}
        >
          {'>'}
        </button>
        {errorMessage() && (
          <div class="text-red-500 mt-2 font-sans">{errorMessage()}</div>
        )}
      </div>
    </div>
  );
};

export default S1;
