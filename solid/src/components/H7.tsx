import { Component } from 'solid-js';

const H7SimulResult: Component = () => {
  return (
    <div class="min-h-screen bg-gray-800 text-white flex flex-col items-center p-5">
      <h1 class="text-4xl my-2 mb-8">시뮬레이션 결과</h1>

      <div class="flex justify-around items-center bg-gray-200 text-black w-[90%] max-w-[1000px] p-5 rounded-lg">
        {/* Left Status */}
        <div class="bg-gray-100 p-5 rounded-lg w-[30%] text-center">
          <img src="../../resource/wallet.png" alt="Backpack" class="w-24 h-auto mx-auto" />
          <div class="mt-2.5 text-base">상태 - 배고픔</div>
          <div class="flex justify-center gap-2 items-center">
            <img src="../../resource/snacks.png" alt="Food" class="w-10" /> <span>2</span>
            <img src="../../resource/water.png" alt="Water" class="w-10" /> <span>4</span>
          </div>
        </div>

        {/* Action Section */}
        <div class="text-base mx-5 text-center">
          <img src="../../resource/snacks.png" alt="Action Icon" class="w-12 h-auto mx-auto my-2.5" />
          <p>배고파서 식량을 하나 섭취하였다.</p>
          <p>포만감 +50</p>
        </div>

        {/* Right Status */}
        <div class="bg-gray-100 p-5 rounded-lg w-[30%] text-center">
          <img src="../../resource/wallet.png" alt="Backpack" class="w-24 h-auto mx-auto" />
          <div class="mt-2.5 text-base">상태 - 든든함</div>
          <div class="flex justify-center gap-2 items-center">
            <img src="../../resource/snacks.png" alt="Food" class="w-10" /> <span>1</span>
            <img src="../../resource/water.png" alt="Water" class="w-10" /> <span>4</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div class="flex items-center justify-center mt-5">
        <div class="w-[70%] max-w-[800px] h-2.5 bg-gray-600 rounded relative flex items-center">
          <div class="w-3.5 h-3.5 rounded-full bg-blue-500 absolute -bottom-1 left-0"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-green-500 absolute -bottom-1 left-[25%]"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-red-500 absolute -bottom-1 left-[50%]"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-yellow-500 absolute -bottom-1 left-[75%]"></div>
        </div>
      </div>

      {/* Buttons */}
      <div class="mt-5 flex gap-3">
        <button class="bg-gray-600 text-white px-5 py-2.5 rounded hover:bg-gray-700 transition-colors">
          결과 내보내기
        </button>
        <button class="bg-orange-400 text-black px-10 py-2.5 text-lg rounded font-bold hover:bg-orange-500 transition-colors">
          시뮬레이션 시작!
        </button>
      </div>
    </div>
  );
};

export default H7SimulResult;