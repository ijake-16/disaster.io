import type { Component } from 'solid-js';

const SimulInfo: Component = () => {
  return (
    <div class="min-h-screen bg-gray-800 text-white flex flex-col items-center pt-5">
      <div class="text-center">
        <h1 class="text-5xl mb-2.5">Disaster.io</h1>
        <div class="text-2xl mb-8">재난 발생</div>
      </div>

      <div class="flex justify-center items-center gap-8 bg-black p-5 rounded-lg max-w-[800px] w-[90%]">
        <div class="text-center">
          <img 
            src="resource/disaster-message.png" 
            alt="Map Icon" 
            class="w-[650px]"
          />
        </div>
      </div>
    </div>
  );
};

export default SimulInfo;