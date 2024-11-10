import { Component } from "solid-js";

const S1: Component = () => {
  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white">
      <div class="container text-center">
        <h1 class="font-sans Arial text-4xl mb-0">Disaster.io</h1>
        <div class="subtitle text-lg text-gray-400 mt-2 mb-8">
          한국형 생존 대비 시뮬레이션
        </div>
        <input
          class="code-input bg-gray-200 text-black w-64 p-2 mx-auto rounded font-bold"
          placeholder="호스트에게 전달받은 코드 입력"
        />
        <button
          class="main-button bg-yellow-500 text-black py-2 px-8 mt-5 rounded"
          onclick={() => (window.location.href = 's2_teambuild.tsx')}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

export default S1; 