import { Component, createSignal, createEffect, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import ky from "ky";

const S1: Component = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal("");
  const [isValidCode, setIsValidCode] = createSignal(false);

  createEffect(() => {
    // Check if code is exactly 6 alphanumeric characters
    const code = roomCode().trim();
    setIsValidCode(/^[A-Za-z0-9]{6}$/.test(code));
  });

  const handleNext = async () => {
    try {
      const code = roomCode().trim();
      if (!code) {
        setErrorMessage("코드를 입력해주세요.");
        return;
      }

      const response = await ky
        .get(`/api/player/room/${code}`)
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
      <div class="container max-w-md mx-auto text-center">
        <div class="flex justify-center items-center mb-4">
          <img
            src="resource/logo.png"
            alt="Disaster.io Logo"
            class="h-36 w-auto"
          />
        </div>
        <div class="subtitle text-xl text-center text-gray-200 mt-2 mb-6 font-sans">
          한국형 생존 대비 시뮬레이션
        </div>
        
        <div class="flex flex-col items-center">
          <input
            class="code-input bg-gray-200 text-black w-80 p-6 rounded font-bold font-sans text-3xl text-center"
            placeholder="6 자리 코드 입력"
            value={roomCode()}
            onInput={(e) => setRoomCode(e.currentTarget.value.toUpperCase())}
            maxlength="6"
            style="text-transform: uppercase;"
          />
          
          <Show when={isValidCode()}>
            <button
              class="main-button bg-orange-400 text-black py-3 px-12 mt-5 rounded-lg font-bold hover:bg-orange-500 transition-colors font-sans text-lg"
              onClick={handleNext}
            >
              입장하기
            </button>
          </Show>
          
          {errorMessage() && (
            <div class="text-red-500 mt-3 font-sans">{errorMessage()}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default S1;
