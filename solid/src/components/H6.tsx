import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const SimulationInfo: Component = () => {
  const navigate = useNavigate();

  return (
    <div class="min-h-screen bg-gray-800 text-white flex flex-col items-center pt-5">
      {/* Header */}
      <div class="mb-5">
        <h1 class="text-3xl font-bold">Disaster.io</h1>
        <div class="text-lg">시뮬레이션 설명</div>
      </div>

      {/* Content */}
      <div class="flex justify-center items-center gap-8 bg-gray-200 text-black p-5 rounded-lg max-w-3xl w-4/5 mb-5">
        {/* Situation Section */}
        <div class="flex flex-col items-center">
          <img 
            src="/resource/ebrush.png" 
            alt="Situation Icon" 
            class="w-16 h-16"
          />
          <p class="text-lg mt-2.5">
            Situation: 진도 7.0의 대지진
          </p>
        </div>
        
        {/* Goal Section */}
        <div class="flex flex-col items-center">
          <img 
            src="/resource/snacks.png" 
            alt="Goal Icon" 
            class="w-16 h-16"
          />
          <p class="text-lg mt-2.5">
            Goal: 무사히 대피소로 이동하기
          </p>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => navigate('/host/simulresult')}
        class="bg-amber-500 text-black px-10 py-2.5 text-lg rounded-lg font-bold mt-8 hover:bg-amber-600 transition-colors"
      >
        시뮬레이션 시작!
      </button>
    </div>
  );
};

export default SimulationInfo;