import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import logoImage from '../../resource/logo_horizon.png';

const SimulationInfo: Component = () => {
  const navigate = useNavigate();

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center pt-5 font-sans">
      {/* Header */}
      <div class="max-w-screen-xl mx-auto mt-2 flex flex-col items-center">
        <img
          src={logoImage}
          alt="Disaster.io Logo"
          class="h-16 w-auto mb-2"
        />
        <h1 class="text-2xl mb-4">시뮬레이션 설명</h1>
      </div>

      <div class="flex justify-center items-stretch bg-gray-800 text-gray-200 p-8 rounded-lg max-w-3xl w-4/5 mb-4 gap-4">
        {/* Situation Section */}
        <div class="flex flex-col items-center w-1/2">
          <div class="flex items-center justify-center h-full w-full">
            <img 
              src="../../resource/earthquake.png" 
              alt="Situation Icon" 
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <p class="text-xl mt-2.5">
            Situation: 진도 7.0의 대지진
          </p>
        </div>
        
        {/* Goal Section */}
        <div class="flex flex-col items-center w-1/2">
          <div class="flex items-center justify-center h-full w-full">
            <img 
              src="../../resource/map.png" 
              alt="Goal Icon" 
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <p class="text-xl mt-2.5">
            Goal: 무사히 대피소로 이동하기
          </p>
        </div>
      </div>


      {/* Start Button */}
      <button
        onClick={() => navigate('/host/simulresult')}
        class="bg-orange-400 text-black px-10 py-2.5 text-xl rounded-lg font-bold mt-4 hover:bg-orange-500 transition-colors"
      >
        시뮬레이션 시작!
      </button>
    </div>
  );
};

export default SimulationInfo;