import { Component } from 'solid-js';

const H3Waiting: Component = () => {
  const teams = [
    "꿈돌이와넙죽이",
    "카이스트에서 살아남기",
    "전기양"
  ];

  const handleGameStart = () => {
    // Using router would be better in a real application
    window.location.href = '/host/preinfo';
  };

  return (
    <div class="min-h-screen bg-gray-800 text-white flex items-center justify-center">
      <div class="w-[300px] bg-gray-700 rounded-lg p-5 shadow-lg">
        <h1 class="text-2xl m-0">Disaster.io</h1>
        
        <div class="text-base text-orange-400 mb-2.5">
          882910
        </div>
        
        <div class="text-sm text-gray-300 mb-5">
          (3/4) 입장 대기 중 ...
        </div>

        {teams.map((team) => (
          <button class="w-full bg-white text-black py-2.5 px-2.5 mb-1.5 rounded text-base cursor-pointer hover:bg-gray-100 transition-colors">
            {team}
          </button>
        ))}

        <button 
          onClick={handleGameStart}
          class="bg-orange-400 text-black py-2.5 px-5 mt-5 rounded text-lg cursor-pointer hover:bg-orange-500 transition-colors"
        >
          게임시작하기
        </button>
      </div>
    </div>
  );
};

export default H3Waiting;