import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const S3: Component = () => {
  const navigate = useNavigate();

  const handleConnect = () => {
    navigate('/bagselect');
  };

  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white">
      <div class="w-[300px] bg-neutral-800 rounded-lg p-5 shadow-lg">
        <h1 class="font-sans text-2xl mb-0">Disaster.io</h1>
        
        <div class="text-base text-amber-500 mb-2.5">
          882910
        </div>
        
        <div class="text-sm text-gray-400 mb-5">
          (3/4) 입장 대기 중 ...
        </div>
        
        <div class="bg-amber-500 text-black p-2.5 rounded font-bold mb-4">
          YOU : 꿈돌이와넙죽이
        </div>
        
        <button class="w-full bg-white text-black py-2.5 px-0 my-1 rounded text-base hover:bg-gray-100 transition-colors">
          카이스트에서 살아남기
        </button>
        
        <button class="w-full bg-white text-black py-2.5 px-0 my-1 rounded text-base hover:bg-gray-100 transition-colors">
          전기양
        </button>
        
        <button 
          class="bg-amber-500 text-black py-2.5 px-5 mt-5 rounded text-lg hover:bg-amber-600 transition-colors"
          onClick={handleConnect}
        >
          네, 생존할 준비가 되었습니다.
        </button>
      </div>
    </div>
  );
};

export default S3;
