import { createSignal } from 'solid-js';
import logoImage from '../../resource/logo.png';

const DisasterIO = () => {
  const [destination, setDestination] = createSignal('');
  
  const [activeButton, setActiveButton] = createSignal<string | null>(null);

  const handleHostNavigate = () => {
    window.location.href = '/host/roombuild';
  };

  const handlePlayerNavigate = () => {
    window.location.href = '/start';
  };

  return (
    <div class="flex items-center justify-center h-screen bg-neutral-950 text-white">
      <div class="bg-gray-800 rounded-lg p-8 flex flex-col shadow-lg">
        <div class="flex flex-col items-center text-center">
          <img
            src={logoImage}
            alt="Disaster.io Logo"
            class="h-36 w-auto mb-3"
          />
        </div>
        <div class="text-gray-200 text-xl text-center mb-6 font-sans">한국형 생존 대비 시뮬레이션</div>
        
        <button
          class="w-full py-4 mb-5 text-black font-bold rounded-lg bg-gray-200 hover:bg-gray-400 font-sans flex flex-col items-center transition-colors"
          onClick={handlePlayerNavigate}
        >
          <span class="text-xl mb-1">플레이어 입장</span>
          <span class="text-sm text-gray-600">강사님으로부터 코드를 부여받은 경우 클릭하세요.</span>
        </button>
        
        <div class="mt-2 text-center">
          <a 
            href="#" 
            class="text-blue-400 hover:text-blue-300 hover:underline text-sm"
            onClick={(e) => {
              e.preventDefault();
              handleHostNavigate();
            }}
          >
            게임을 호스트하는 강사님의 경우 여기를 클릭해 로그인하세요.
          </a>
        </div>
      </div>
    </div>
  );
};

export default DisasterIO;