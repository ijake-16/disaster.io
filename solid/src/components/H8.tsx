import { Component, createSignal } from 'solid-js';

interface EventResult {
  status: 'success' | 'failure';
  hunger: number;
  thirst: number;
  stress: number;
  items: string[];
}

const H8: Component = () => {
  const [selectedTeam, setSelectedTeam] = createSignal<string | null>(null);
  const [selectedEvent, setSelectedEvent] = createSignal<number | null>(null);

  const eventResults: EventResult[] = [
    { status: "success", hunger: 80, thirst: 70, stress: 20, items: [] },
    { status: "failure", hunger: 90, thirst: 85, stress: 60, items: ["물병"] },
    { status: "success", hunger: 60, thirst: 50, stress: 10, items: [] },
    { status: "failure", hunger: 95, thirst: 88, stress: 75, items: ["식량"] },
    { status: "success", hunger: 70, thirst: 60, stress: 15, items: [] }
  ];

  return (
    <div class="min-h-screen bg-gray-800 text-white flex flex-col">
      <header class="text-center bg-gray-900 p-5">
        <h1 class="text-4xl">레이싱 팀 랭킹</h1>
      </header>

      <main class="flex flex-1">
        {/* 랭킹 섹션 */}
        <div class="w-[30%] bg-gray-700 p-5">
          <h2 class="text-2xl text-center mb-4">팀 랭킹</h2>
          <div class="space-y-2">
            {['Team 1', 'Team 2'].map((team, index) => (
              <div
                onClick={() => setSelectedTeam(team)}
                class="flex items-center bg-orange-400 hover:bg-orange-500 p-3 rounded cursor-pointer transition-colors"
              >
                <span class="font-bold mr-3">{index + 1}</span>
                <span class="flex-1">{team}</span>
                <span class="bg-white text-green-700 px-2 py-1 rounded text-sm font-bold">
                  {5 - index}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 상세 정보 섹션 */}
        <div class="flex-1 bg-gray-800 p-5">
          {selectedTeam() ? (
            <>
              <h2 class="text-2xl text-center mb-6">{selectedTeam()}</h2>
              
              {/* 이벤트 상태 표시 */}
              <div class="flex justify-center gap-4 mb-8">
                {eventResults.map((event, index) => (
                  <button
                    onClick={() => setSelectedEvent(index)}
                    class={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                      ${event.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* 이벤트 상세 정보 */}
              {selectedEvent() !== null && (
                <div class="bg-gray-700 p-5 rounded-lg max-w-2xl mx-auto">
                  <h3 class="text-xl mb-4">이벤트 {selectedEvent()! + 1} 상세 정보</h3>
                  
                  {/* 스탯 바들 */}
                  <div class="space-y-4">
                    {[
                      { label: '배고픔', value: eventResults[selectedEvent()!].hunger, color: 'bg-orange-400' },
                      { label: '목마름', value: eventResults[selectedEvent()!].thirst, color: 'bg-blue-500' },
                      { label: '스트레스', value: eventResults[selectedEvent()!].stress, color: 'bg-purple-500' }
                    ].map(stat => (
                      <div>
                        <p class="mb-1">{stat.label}: {stat.value}</p>
                        <div class="w-full h-5 bg-gray-600 rounded-full">
                          <div
                            class={`h-full rounded-full ${stat.color}`}
                            style={`width: ${stat.value}%`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 필요 아이템 목록 */}
                  <div class="mt-4">
                    <h4 class="text-lg mb-2">필요했던 아이템:</h4>
                    <ul class="space-y-2">
                      {eventResults[selectedEvent()!].items.length > 0 ? 
                        eventResults[selectedEvent()!].items.map(item => (
                          <li class="bg-gray-600 p-2 rounded">{item}</li>
                        )) : 
                        <li class="bg-gray-600 p-2 rounded">없음</li>
                      }
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p class="text-center text-xl">팀을 선택하면 상세 정보가 표시됩니다.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default H8; 