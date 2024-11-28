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
  const family_info = ["../../resource/family2.png","../../resource/family3.png","../../resource/family4.png","../../resource/familydog.png"];

  return (
    <div class="min-h-screen bg-neutral-950 text-gray-200 flex flex-col mx-auto justify-center items-center font-sans">
      {/* Header Section */}
      <div class="mx-auto flex items-center">
        <img
          src={logoImage}
          alt="Disaster.io Logo"
          class="h-16 w-auto mb-6"
        />
      </div>

      {/* Panels Section */}
      <div class="w-[80%] gap-1 flex flex-row">
        {/* Left Panel */}
        <div class="flex flex-col gap-5 w-[30%] h-[90%] bg-gray-800 p-5 rounded-lg shrink-0">
          <div class="bg-gray-700 text-xl p-4 text-center rounded">게임 설정</div>
          <input
            class="bg-gray-700 text-lg p-4 text-center rounded"
            placeholder="방 제목을 입력하세요"
            value={roomTitle()}
            onInput={(e) => setRoomTitle(e.currentTarget.value)}
          />

          <div class="bg-gray-700 text-lg p-4 rounded flex justify-between items-center">
            <span>최대 팀 수</span>
            <span>4</span>
          </div>

          <div class="bg-gray-700 text-lg p-4 rounded flex justify-between items-center">
            <span>가방 싸기 시간</span>
            <span>150</span>
          </div>

          <button
            class="bg-orange-500 p-4 text-xl rounded font-bold text-black hover:bg-orange-600 transition-colors"
            onClick={createRoom}
          >
            방 만들기
          </button>
        </div>

        {/* Right Panel */}
        <div class="flex flex-col gap-3 w-[55%] h-[90%] bg-gray-800 p-5 rounded-lg shrink-0 grow">
          <div class="bg-orange-500 text-xl font-bold p-2.5 text-center rounded text-black">
            사전 정보 설정
          </div>

          <div class="flex flex-row gap-2">
            {[1, 2].map((gridIndex) => (
              <div class="grid grid-cols-2 gap-2 w-full rounded-lg overflow-hidden p-1">
                {[1, 2].map((imgIndex) => {
                  const index = (gridIndex - 1) * 4 + imgIndex - 1;
                  console.log(imgIndex,gridIndex);
                  return (
                    <img
                      src={family_info[(gridIndex - 1)*2 + imgIndex - 1]}
                      class={`w-full h-[115px] object-scale-down cursor-pointer border-2 
                        ${selectedPreInfo() === index ? "border-orange-400" : "border-transparent"} 
                        hover:border-orange-600`}
                      onClick={toggleBorder("pre", index)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div class="bg-orange-500 text-xl font-bold p-2.5 text-center rounded text-black">
            재난 정보 설정
          </div>

          <div class="flex flex-row gap-2">
            {[1, 2].map((gridIndex) => (
              <div class="grid grid-cols-2 gap-2 w-full rounded-lg overflow-hidden p-1">
                {[1, 2].map((imgIndex) => {
                  const index = (gridIndex - 1) * 4 + imgIndex - 1;
                  return (
                    <img
                      src="../../resource/earthquake.png"
                      class={`w-full h-[115px] object-scale-down cursor-pointer border-2 
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
    </div>
  );
};

export default RoomBuild;
