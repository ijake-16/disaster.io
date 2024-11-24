import { Component, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import ky from "ky";
import { setRoomCode } from "../store";
import logoImage from '../../resource/logo_horizon.png';

const RoomBuild: Component = () => {
  const navigate = useNavigate();
  const [roomTitle, setRoomTitle] = createSignal("");
  const [selectedPreInfo, setSelectedPreInfo] = createSignal<number | null>(null);
  const [selectedDisaster, setSelectedDisaster] = createSignal<number | null>(null);

  const createRoom = async () => {
    try {
      const payload = {
        host_nickname: roomTitle(),
        selected_pre_info: selectedPreInfo(),
        selected_disaster: selectedDisaster(),
      };

      const response = await ky.post("http://localhost:8000/host/create_room", {
          json: payload,
        })
        .json<{ room_code: string; host_nickname: string }>();

      console.log("Room created successfully:", response);
      setRoomCode(response.room_code);
      navigate("/host/notice");
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const toggleBorder = (section: "pre" | "disaster", index: number) => (event: Event) => {
    if (section === "pre") {
      setSelectedPreInfo(index);
    } else {
      setSelectedDisaster(index);
    }
  };

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex justify-center items-center gap-5 p-5 font-sans">
      {/* Left Panel */}
      <div class="flex flex-col gap-5 w-[350px] h-[90%] bg-gray-700 p-5 rounded-lg shrink-0">
        <div class="max-w-screen-xl mx-auto flex flex-col items-center">
          <img
            src={logoImage}
            alt="Disaster.io Logo"
            class="h-9 w-auto mb-2"
          />
        </div>

        <div class="bg-gray-600 p-4 text-center rounded">게임 설정</div>

        <input
          class="bg-gray-600 p-4 text-center rounded"
          placeholder="방 제목을 입력하세요"
          value={roomTitle()}
          onInput={(e) => setRoomTitle(e.currentTarget.value)}
        />

        <div class="bg-gray-600 p-4 rounded flex justify-between items-center">
          <span>최대 팀 수</span>
          <span>4</span>
        </div>

        <div class="bg-gray-600 p-4 rounded flex justify-between items-center">
          <span>가방 싸기 시간</span>
          <span>150</span>
        </div>

        <button
          class="bg-orange-500 p-4 rounded font-bold text-black hover:bg-orange-600 transition-colors"
          onClick={createRoom}
        >
          방 만들기
        </button>
      </div>

      {/* Right Panel */}
      <div class="flex flex-col gap-5 w-[1000px] h-[90%] bg-gray-700 p-5 rounded-lg shrink-0 grow">
        <div class="bg-orange-500 p-3 text-center rounded text-black text-lg">
          사전 정보 설정
        </div>

        <div class="flex flex-row gap-5 m-1">
          {[1, 2].map((gridIndex) => (
            <div class="grid grid-cols-2 gap-0 w-full rounded-lg overflow-hidden p-1">
              {[1, 2, 3, 4].map((imgIndex) => {
                const index = (gridIndex - 1) * 4 + imgIndex - 1;
                return (
                  <img
                    src="../../resource/tsunami.png"
                    class={`w-full h-[100px] object-scale-down cursor-pointer border-2 
                      ${selectedPreInfo() === index ? "border-yellow-400" : "border-transparent"} 
                      hover:border-orange-600`}
                    onClick={toggleBorder("pre", index)}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div class="bg-orange-500 p-3 text-center rounded text-black text-lg">
          재난 정보 설정
        </div>

        <div class="flex flex-row gap-5 m-1">
          {[1, 2].map((gridIndex) => (
            <div class="grid grid-cols-2 gap-0 w-full rounded-lg overflow-hidden p-1">
              {[1, 2, 3, 4].map((imgIndex) => {
                const index = (gridIndex - 1) * 4 + imgIndex - 1;
                return (
                  <img
                    src="../../resource/earthquake.png"
                    class={`w-full h-[100px] object-scale-down cursor-pointer border-2 
                      ${selectedDisaster() === index ? "border-yellow-400" : "border-transparent"} 
                      hover:border-orange-600`}
                    onClick={toggleBorder("disaster", index)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomBuild;
