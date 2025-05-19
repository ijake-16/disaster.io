import { Component, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { roomCode, socket } from '../store';
import logoImage from '../../resource/logo_horizon.png';
import { selectedPreInfo, selectedDisaster, family_info, disaster_info } from '../store';

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
  const navigate = useNavigate();
  const preIndex = selectedPreInfo;
  const disIndex = selectedDisaster;

  const familyScenarios: FamilyMember[][] = [
    // 0: 나랑 와이프
    [
      { role: '나', age: 50, gender: '남성' },
      { role: '아내', age: 45, gender: '여성' },
    ],
    // 1: 엄마, 아빠, 나
    [
      { role: '아버지', age: 50, gender: '남성' },
      { role: '어머니', age: 45, gender: '여성' },
      { role: '나', age: 15, gender: '남성' },
    ],
    // 2: 엄마, 아빠, 나, 여동생
    [
      { role: '아버지', age: 50, gender: '남성' },
      { role: '어머니', age: 45, gender: '여성' },
      { role: '나', age: 15, gender: '남성' },
      { role: '여동생', age: 12, gender: '여성' },
    ],
    // 3: 엄마, 아빠, 나, 강아지
    [
      { role: '아버지', age: 50, gender: '남성' },
      { role: '어머니', age: 45, gender: '여성' },
      { role: '나', age: 15, gender: '남성' },
      { role: '강아지', age: 3, gender: '기타' },
    ],
  ];
  const currentFamily = () => {
    const idx = preIndex();
    if (idx === null || idx < 0 || idx >= familyScenarios.length) {
      return [] as FamilyMember[];
    }
    return familyScenarios[idx];
  };

  const regionInfo: RegionInfo = {
    type: '도시',
    characteristics: ['해안가', '기후 변동 적용', '남부 지방'],
  };
  onMount(() => {
    const ws = socket();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected or not open.");
      return;
    }
  
    ws.onclose = () => {
      console.warn("WebSocket closed");
    };
  });
  
  const handleContinue = () => {
    const ws = socket();
    if (!ws) {
      console.error("WebSocket is not connected.");
      return;
    }

    // ✅ start_game 메시지 전송
    ws.send(JSON.stringify({ action: "start_select" }));
    navigate('/host/readyinfo')
  };
  return (
    <div class="min-h-screen bg-neutral-950 text-white font-sans">
      {/* Header Section */}
      <header class="p-4 text-center">
        <p class="text-xl text-orange-400 mb-1">Room : {roomCode()}</p>
        <div class="max-w-screen-xl mx-auto flex flex-col items-center">
          <img
            src={logoImage}
            alt="Disaster.io Logo"
            class="h-16 w-auto mb-4"
          />
        </div>
        <h2 class="text-xl font-normal text-gray-200">
          가족 정보와 지역 정보를 확인하세요. 재난에 대비하세요.
        </h2>
      </header>

      {/* Information Boxes */}
      <div class="flex flex-col md:flex-row justify-center items-stretch gap-4 p-5">
        {/* Family Info Box */}
        <div class="w-full md:w-64">
          <div class="bg-gray-200 rounded-lg p-5 h-full text-black">
            <div class="w-full h-[150px] rounded-lg bg-black flex items-center justify-center">
            {preIndex() !== null ? (
            <img
              src={family_info[preIndex()!]}
              alt="Selected Family Scenario"
              class="max-w-full max-h-full rounded-lg object-scale-down"
            />
          ) : (
              <img 
                src="../../resource/family3.png" 
                alt="Region Icon" 
                class="max-w-full max-h-full rounded-lg object-scale-down"
              />
          )}
            </div>
            <div class="mt-3 text-base leading-relaxed">
              <p>당신의 가족 구성원은 다음과 같습니다.</p>
              <div class="mt-2">
                {currentFamily().map((m) => (
                <p>
                  {m.role} – {m.age}세, {m.gender}
                </p>
              ))}
                <p> </p>
              </div>
            </div>
          </div>
        </div>

        {/* Region Info Box */}
        <div class="w-full md:w-64">
          <div class="bg-gray-200 rounded-lg p-5 h-full text-black">
          <div class="w-full h-[150px] rounded-lg bg-black flex items-center justify-center">
            <img 
              src="../../resource/map.png" 
              alt="Region Icon" 
              class="max-w-full max-h-full rounded-lg object-scale-down"
            />
          </div>
            <div class="mt-3 text-base leading-relaxed">
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
      <div class="text-center mt-4 pb-8">
        <button
          onClick={handleContinue}
          class="bg-orange-400 text-black text-xl font-bold px-10 py-2.5 rounded-lg hover:bg-orange-500 transition-colors"
        >
          네, 생존할 준비가 되었습니다.
        </button>
      </div>
    </div>
  );
};

export default H4PreInfo;