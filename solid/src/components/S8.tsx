import { createEffect } from 'solid-js';
//import soundFile from 'path/to/sound.mp3';
import type { Component } from 'solid-js';

const SimulInfo: Component = () => {
  createEffect(() => {
    //const audio = new Audio(soundFile);
    //audio.play();
    const iPhone = document.getElementById('iphone-animation');
    if (iPhone) {
      iPhone.classList.add('animate-pop-up');
    }
  });

  return (
    <div class="min-h-screen bg-gray-800 text-white flex flex-col items-center pt-5 font-sans">
      <div class="text-center">
        <div class="flex justify-center items-center mb-6">
          <img
            src="resource/logo.png"
            alt="Disaster.io Logo"
            class="h-24 w-auto"
          />
        </div>
        <div class="text-2xl mb-8">재난 발생</div>
      </div>

      <div class="flex justify-center items-center gap-8 bg-black p-5 rounded-lg max-w-[800px] w-[90%]">
        <div class="text-center">
          <div id="iphone-animation" class="hidden">
            <img 
              src="resource/disaster-message.png" 
              alt="Map Icon" 
              class="w-[650px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulInfo;