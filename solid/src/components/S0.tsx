import { createSignal } from 'solid-js';

const DisasterIO = () => {
  const [destination, setDestination] = createSignal('');
  const [activeButton, setActiveButton] = createSignal<string | null>(null);

  const handleSetDestination = (page: string, buttonId: string) => {
    setDestination(page);
    setActiveButton(buttonId);
  };

  const handleNavigate = () => {
    if (destination() === 'h1') {
      window.location.href = '/host/start';
    } else if (destination() === 's1') {
      window.location.href = '/start';
    } else {
      alert("먼저 '호스트' 또는 '플레이어'를 선택하세요.");
    }
  };

  return (
    <div class="flex items-center justify-center h-screen bg-neutral-950 text-white">
      <div class="w-72 bg-gray-800 rounded-lg p-8 flex flex-col shadow-lg">
        <h1 class="text-4xl mb-0 font-sans">Disaster.io</h1>
        <div class="text-gray-400 text-sm mb-6 font-sans">한국형 생존 대비 시뮬레이션</div>
        
        <button
          class={`w-full py-2 mb-2 text-black rounded-lg ${
            activeButton() === 'h1' ? 'bg-gray-400' : 'bg-white'
          } font-sans`}
          onClick={() => handleSetDestination('h1', 'h1')}
        >
        호스트
        </button>   
        <button
          class={`w-full py-2 mb-2 text-black rounded-lg ${
            activeButton() === 's1' ? 'bg-gray-400' : 'bg-white'
          } font-sans`}
          onClick={() => handleSetDestination('s1', 's1')}
        >
        플레이어
        </button>
        
        <button
          class="bg-yellow-500 text-black py-2 mt-4 rounded-lg text-lg font-sans"
          onClick={handleNavigate}
        >
        선택
        </button>
      </div>
    </div>
  );
};

export default DisasterIO;