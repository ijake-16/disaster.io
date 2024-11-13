import { Component, createSignal, createEffect, onMount } from "solid-js";
import * as XLSX from 'xlsx';

interface Item {
  id: number;
  korName: string;
  name: string;
  weight: number;
  volume: number;
  description: string;
  imgsource: string;
}

const S6: Component = () => {
  // 상태 관리
  const [items, setItems] = createSignal<Item[]>([]);
  const [teamName, setTeamName] = createSignal("Team Name");
  const [timer, setTimer] = createSignal(150);
  const [currentWeight, setCurrentWeight] = createSignal(0);
  const [currentVolume, setCurrentVolume] = createSignal(0);
  const [selectedItem, setSelectedItem] = createSignal<Item | null>(null);
  const [quantity, setQuantity] = createSignal(1);
  const [showModal, setShowModal] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");

  const maxWeight = 100;
  const maxVolume = 100;

  // Excel 파일에서 아이템 데이터 읽기
  async function readItemsFromExcel() {
    try {
      const response = await fetch("Items.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const mappedItems = data.map((row: any, index) => ({
        id: index + 1,
        korName: row['korName'] || '',
        name: row['name'] || '',
        weight: parseFloat(row['weight']) || 0,
        volume: parseFloat(row['volume']) || 0,
        description: row['description'] || '',
        imgsource: `resource/${row['name']}.png`
      }));

      setItems(mappedItems);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      setItems([]);
    }
  }

  // 타이머 시작
  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 게임 종료
  const endGame = () => {
    alert('시간이 종료되었습니다!');
    window.location.href = 's7_sceneinfo.html';
  };

  // 아이템 추가
  const addItemToBag = () => {
    const item = selectedItem();
    if (!item) return;

    const totalWeight = item.weight * quantity();
    const totalVolume = item.volume * quantity();

    if (currentWeight() + totalWeight > maxWeight || 
        currentVolume() + totalVolume > maxVolume) {
      alert('가방의 용량이나 무게 제한을 초과합니다!');
      return;
    }

    setCurrentWeight(prev => prev + totalWeight);
    setCurrentVolume(prev => prev + totalVolume);
    setShowModal(false);
  };

  // 컴포넌트 마운트 시 초기화
  onMount(() => {
    readItemsFromExcel();
    startTimer();
  });

  return (
    <div class="max-w-[1500px] mx-auto p-5 text-white">
      {/* Header */}
      <header class="flex justify-between items-center mb-5">
        <div class="team-info">
          <h1 class="text-2xl text-white">{teamName()}</h1>
        </div>
        
        <div class="timer">
          <div class="w-[50px] h-[50px] bg-green-500 rounded-full flex items-center justify-center text-xl font-bold">
            <span>{timer()}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="grid grid-cols-[300px_1fr] gap-5">
        {/* Inventory Section */}
        <section class="inventory-section">
          <div class="mb-5">
            <input 
              type="text" 
              placeholder="아이템 검색..." 
              class="w-full p-2 border-none rounded bg-neutral-700 text-white"
            />
          </div>

          <div class="bg-neutral-800 rounded-lg p-4">
            <div class="category">
              <div class="grid grid-cols-3 gap-2.5">
                {/* Items will be dynamically populated here */}
              </div>
            </div>
          </div>
        </section>

        {/* Bag Section */}
        <section class="bg-neutral-800 rounded-lg p-4 h-fit min-w-[800px]">
          <div class="mb-5">
            <div class="space-y-2.5">
              {/* Weight Bar */}
              <div>
                <div>무게</div>
                <div class="h-5 bg-neutral-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 w-0 transition-width duration-300"></div>
                </div>
                <span>0/100</span>
              </div>

              {/* Volume Bar */}
              <div>
                <div>부피</div>
                <div class="h-5 bg-neutral-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 w-0 transition-width duration-300"></div>
                </div>
                <span>0/100</span>
              </div>
            </div>
          </div>

          {/* Bag Grid */}
          <div class="bg-neutral-700 rounded w-full h-[400px] grid grid-cols-[repeat(8,100px)] gap-[1.25%] p-[2.5%] overflow-auto">
            {/* Bag items will be added here */}
          </div>
        </section>
      </main>

      {/* Modal */}
      <div class="hidden fixed inset-0 bg-black/70 z-50">
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-800 p-5 rounded-lg w-[90%] max-w-[400px]">
          <div class="text-right">×</div>

          <div class="text-center mb-5">
            <img src="" alt="item" class="w-20 h-20 mx-auto mb-2.5" />
            <h3 class="text-green-500"></h3>
          </div>

          <table class="mb-5 w-full">
            <tbody>
            <tr>
              <td class="min-w-[80px] whitespace-nowrap pr-2.5 p-1.5">무게:</td>
              <td class="p-1.5"></td>
            </tr>
            <tr>
              <td class="min-w-[80px] whitespace-nowrap pr-2.5 p-1.5">부피:</td>
              <td class="p-1.5"></td>
            </tr>
            <tr>
              <td class="min-w-[80px] whitespace-nowrap pr-2.5 p-1.5">상세정보:</td>
              <td class="p-1.5 break-words"></td>
            </tr>
            </tbody>
          </table>

          <div class="mb-5">
            수량:
            <div class="flex items-center gap-2.5 mt-1.5">
              <input 
                type="range" 
                min="1" 
                max="10" 
                value="1"
                class="flex-grow h-1 bg-neutral-700 rounded appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span class="min-w-[30px] text-center">1</span>
            </div>
          </div>

          <button class="w-full py-3 bg-green-500 rounded text-white font-bold hover:bg-green-600 transition-colors">
            가방에 넣기
          </button>
        </div>
      </div>
    </div>
  );
};

export default S6; 