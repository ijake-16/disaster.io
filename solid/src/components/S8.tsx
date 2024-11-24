import { createEffect } from 'solid-js';
import soundFile from './alert.mp3';
import type { Component } from 'solid-js';
import '../index.css';

const SimulInfo: Component = () => {
  createEffect(() => {
    const audio = new Audio(soundFile);
    audio.play();
    const iPhone = document.getElementById('iphone-animation');
    if (iPhone) {
      iPhone.classList.remove('hidden');
      iPhone.classList.add('animate-rise-up');
    }
  });

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center pt-8 font-sans">
      <div class="text-center">
        <div class="flex justify-center items-center mb-4">
          <img
            src="resource/logo.png"
            alt="Disaster.io Logo"
            class="h-32 w-auto"
          />
        </div>
        <div class="text-2xl text-gray-200 mb-8">재난 발생</div>
      </div>


          <div id="iphone-animation" class="hidden">
            <div class="w-[878.25px] h-[901.5px] relative bg-[#050029]/0">
              <div class="w-[616.875px] h-[1014.375px] left-[130.5px] top-[17.625px] absolute bg-[#1a1a1a] rounded-[112.5px] border-8 border-black"></div>
              <div class="w-[521.625px] h-[143.25px] left-[178.125px] top-[450.75px] absolute">
                <div class="w-[521.625px] h-[132px] left-0 top-0 absolute bg-white/45 rounded-[20.625px]"></div>
                <img src="resource/triangle.png" alt="Triangle" class="absolute left-5 top-5 w-6 h-6" />
                <div class="w-[106.125px] h-3.75 left-[42.75px] top-[22.125px] absolute text-center text-[#444444] text-[16.875px] font-normal font-['Judson']">긴급재난문자</div>
                <div class="w-[65.625px] h-3.75 left-[451.125px] top-[22.125px] absolute text-center text-[#444444] text-[16.875px] font-normal font-['Judson']">지금</div>
                <div class="w-[501px] h-[83.25px] left-[15.75px] top-[60px] absolute text-black text-[21.375px] font-normal font-['Judson'] leading-[28.125px]">대전광역시 유성구 한국과학기술원 부근 규모 5.5 지진 발생<br/>신속하게 생존가방을 챙겨 대피하십시오 [대전지방기상청]</div>
              </div>
              <div class="w-[156.75px] h-[41.625px] left-[360.75px] top-[54px] absolute bg-black rounded-[150px] border-8 border-black"></div>
              <div class="w-3.75 h-3.75 left-[478.125px] top-[67.125px] absolute bg-black rounded-full border-8 border-[#141414]"></div>
            </div>
         </div>
    </div>
  );
};

export default SimulInfo;