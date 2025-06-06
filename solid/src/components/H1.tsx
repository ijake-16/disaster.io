import { Component, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import ky from "ky";
import { setRoomCode } from "../store";
import { socket, setSocket, initSocket } from "../store";
import { selectedPreInfo, setSelectedPreInfo, selectedDisaster, setSelectedDisaster, family_info, disaster_info } from '../store';
import logoImage from '../../resource/logo_horizon.png';

const RoomBuild: Component = () => {
  const navigate = useNavigate();
  const [roomTitle, setRoomTitle] = createSignal("");

  const createRoom = async () => {
    try {
      const host_nickname = roomTitle();
      const payload = {
        host_nickname: host_nickname,
        selected_pre_info: selectedPreInfo(),
        selected_disaster: selectedDisaster(),
      };

      const response = await ky.post("/api/host/create_room", {
          json: payload,
        })
        .json<{ room_code: string; host_nickname: string }>();

      console.log("Room creating:", payload);
      console.log("Room created successfully:", response);
      setRoomCode(response.room_code);

      initSocket(response.room_code, host_nickname, true, () => {
        navigate("/host/notice", {
          state: { hostNickname: host_nickname }
        });
      });
      
      
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
            class="bg-orange-400 p-4 text-xl rounded font-bold text-black hover:bg-orange-500 transition-colors"
            onClick={createRoom}
          >
            방 만들기
          </button>
        </div>

        {/* Right Panel */}
        <div class="flex flex-col gap-3 w-[55%] h-[90%] bg-gray-800 p-5 rounded-lg shrink-0 grow">
          <div class="bg-orange-400 text-xl font-bold p-2.5 text-center rounded text-black">
            사전 정보 설정
          </div>

          <div class="flex flex-row gap-2">
            {[0,1].map((row) => (
              <div class="grid grid-cols-2 gap-2 w-full rounded-lg overflow-hidden p-1">
                {
                  [0,1].map((col) => {
                  const index = row * 2 + col;
                  return (
                    <img
                      src={family_info[index]}
                      class={`cursor-pointer border-2 
                        ${selectedPreInfo() === index ? "border-orange-400" : "border-transparent"} 
                        hover:border-orange-500`}
                      onClick={toggleBorder("pre", index)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div class="bg-orange-400 text-xl font-bold p-2.5 text-center rounded text-black">
            재난 정보 설정
          </div>

          <div class="flex flex-row gap-2">
            {[0,1].map((row) => (
              <div class="grid grid-cols-2 gap-2 w-full rounded-lg overflow-hidden p-1">
                {
                  [0,1].map((col) => {
                  const index = row * 2 + col;
                  return (
                    <img
                      src={disaster_info[index]}
                      class={`cursor-pointer border-2 
                        ${selectedDisaster() === index ? "border-orange-400" : "border-transparent"} 
                        hover:border-orange-500`}
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
