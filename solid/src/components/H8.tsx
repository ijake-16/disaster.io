import { Component, createSignal, onMount, For } from 'solid-js';
import { eventOptions } from '../data/events';
import { itemOptions } from '../data/items';
import { useLocation } from '@solidjs/router';

const allItems = itemOptions.map(item => ({ ...item, img_path: `../../resource/${item.name}.png` }));

function getItemById(id: number) {
  return allItems.find(item => item.id === id);
}

interface TeamHealthSnapshot {
  teamName: string;
  health: number;
}
type EventResult = {
  eventId: number;
  eventName: string;
  eventDescription: string;
  eventScore: number;
  requirements: number[][];
  teamResults: TeamHealthSnapshot[];
};
type SimulationHistory = EventResult[];

const FinalResult: Component= () => {
  console.log("FinalResult");
  const location = useLocation();
  console.log(location.state);
  const history = (location.state as { history: SimulationHistory })?.history ?? [];
  console.log(history);
  const [hoveredIdx, setHoveredIdx] = createSignal<number | null>(null);
  console.log(hoveredIdx());

  return (
    <div class="min-h-screen bg-neutral-950 flex flex-col items-center p-8 font-sans">
      <div class="flex justify-center flex-col items-center mb-8">
        <img src="../../resource/logo_horizon.png" alt="Disaster.io Logo" class="h-16 w-auto" />
        <div class="mt-4 text-center text-white text-3xl font-bold">최종 결과</div>
        <div class="mt-2 text-center text-white text-xl">Final Result</div>
      </div>
      {/* 이벤트 카드 가로 스크롤 영역 */}
      <div class="w-full max-w-5xl min-w-0 overflow-x-auto mb-12">
        <div class="flex flex-row whitespace-nowrap">
          <For each={history}>{(eventResult, idx) => (
            <div
              class="flex-shrink-0 w-48 h-64 mr-4 bg-gradient-to-br from-gray-600 to-gray-800 border-4 border-gray-900 rounded-lg shadow-2xl flex flex-col justify-between items-center cursor-pointer transition-transform hover:scale-105 relative"
              onMouseEnter={() => setHoveredIdx(idx())}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <img src="../../resource/logo.png" alt="Card Back" class="w-2/3 opacity-40 mt-8" />
              <div class="text-white text-lg font-bold mt-4">{eventResult.eventName}</div>
              <div class="text-white text-sm mb-4">{eventResult.eventDescription}</div>
              <div class="absolute top-2 right-2 text-yellow-400 font-bold text-sm">Score: {eventResult.eventScore}</div>
            </div>
          )}</For>
        </div>
        {/* Hover 시 requirements/팀별 결과 오버레이 */}
        {hoveredIdx() !== null && (
          <div class="absolute left-1/2 -translate-x-1/2 top-72 z-20 flex flex-row gap-8">
            {/* 필요 아이템 */}
            <div class="bg-gray-900 ...">
              <div class="text-white text-xl font-bold mb-4">필요 아이템 조합</div>
              <For each={history[hoveredIdx()].requirements}>{(group, gidx) => (
                <div class="flex flex-row gap-4 mb-2 items-center" >
                  <For each={group}>{(itemId) => {
                    const item = getItemById(itemId);
                    return item ? (
                      <div class="flex flex-col items-center">
                        <img src={item.img_path} alt={item.korName} class="w-10 h-10 mb-1" />
                        <span class="text-white text-xs">{item.korName}</span>
                      </div>
                    ) : null;
                  }}</For>
                  {gidx() < history[hoveredIdx()].requirements.length - 1 && (
                    <span class="text-orange-400 font-bold text-lg mx-2">OR</span>
                  )}
                </div>
              )}</For>
            </div>
            {/* 팀별 결과 */}
            <div class="bg-gray-900 ... min-w-[250px] p-6 rounded-xl border-2 border-blue-400 flex flex-col items-center">
              <div class="text-white text-xl font-bold mb-4">팀별 Health 랭킹</div>
                <For each={
                  history[hoveredIdx()]?.teamResults
                    ? [...history[hoveredIdx()].teamResults].sort((a, b) => b.health - a.health)
                    : []
                }>
                {(team, rank) => (
                  <div class="flex flex-row items-center gap-2 mb-2">
                    <span class="text-yellow-300 font-bold">{rank() + 1}위</span>
                    <span class="text-white">{team.teamName}</span>
                    <span class="text-blue-300 font-bold">{Math.round(team.health)}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </div>
      {/* 아래에 추가적인 시뮬레이션 결과 등 표시 가능 */}
    </div>
  );
};

export default FinalResult;
