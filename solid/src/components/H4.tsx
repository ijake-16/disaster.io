import { Component } from 'solid-js';
import { roomCode } from '../store';
import ky from "ky";

interface FamilyMember {
  role: string;
  age: number;
  gender: string;
}

interface RegionInfo {
  type: string;
  characteristics: string[];
}

const H4PreInfo: Component = () => {
  const familyMembers: FamilyMember[] = [
    { role: '아버지', age: 50, gender: '남성' },
    { role: '어머니', age: 45, gender: '여성' },
    { role: '나', age: 15, gender: '남성' },
    { role: '동생', age: 7, gender: '여성' },
  ];

  const regionInfo: RegionInfo = {
    type: '도시',
    characteristics: ['해안가', '기후 변동 적용', '남부 지방'],
  };

  const handleContinue = async () => {
    try {
      console.log("Using room code:", roomCode());
      await ky.post(`http://localhost:8000/host/room/${roomCode()}/game_info_confirm`);
      window.location.href = '/sceneinfo'; 
    } catch (error) {
      console.error("Failed to confirm game info:", error);
    }
  };

  return (
    <div class="min-h-screen bg-gray-900 text-white">
      {/* Header Section */}
      <header class="p-5 text-center">
        <p class="text-gray-300">Room : {roomCode()}</p>
        <h1 class="text-3xl my-2">Disaster.io</h1>
        <h2 class="text-xl font-normal text-gray-300">
          가족 정보와 지역 정보를 확인하세요. 재난에 대비하세요.
        </h2>
      </header>

      {/* Information Boxes */}
      <div class="flex flex-col md:flex-row justify-center items-stretch gap-5 p-5">
        {/* Family Info Box */}
        <div class="w-full md:w-64">
          <div class="bg-gray-200 rounded-lg p-5 h-full text-black">
            <img 
              src="resource/cigs.png" 
              alt="Family Icon" 
              class="w-full rounded-lg"
            />
            <div class="mt-3 text-sm leading-relaxed">
              <p>당신의 가족 구성원은 다음과 같습니다.</p>
              <div class="mt-2">
                {familyMembers.map((member) => (
                  <p>
                    {member.role} ... {member.age}세, {member.gender}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Region Info Box */}
        <div class="w-full md:w-64">
          <div class="bg-gray-200 rounded-lg p-5 h-full text-black">
            <img 
              src="resource/map.png" 
              alt="Region Icon" 
              class="w-full rounded-lg"
            />
            <div class="mt-3 text-sm leading-relaxed">
              <p>당신의 거주 지역은 다음과 같습니다.</p>
              <div class="mt-2">
                <p>{regionInfo.type}</p>
                {regionInfo.characteristics.map((char) => (
                  <p>{char}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div class="text-center mt-5 pb-8">
        <button
          onClick={handleContinue}
          class="bg-amber-500 text-black px-10 py-2 rounded-lg text-lg hover:bg-amber-600 transition-colors"
        >
          네, 생존할 준비가 되었습니다.
        </button>
      </div>
    </div>
  );
};

export default H4PreInfo;