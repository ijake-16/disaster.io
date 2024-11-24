import { Component, createSignal } from 'solid-js';
import { useNavigate } from "@solidjs/router";
import ky from "ky";
import logoImage from '../../resource/logo.png';

interface Result {
  team: string;
  used_item: string[];
  item_path: string[];
  event_result: string[];
  required_item: string[];
  hunger: number[];
  thirst: number[];
  stress: number[];
}

const H8: Component = () => {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = createSignal<string | null>(null);
  const [selectedEvent, setSelectedEvent] = createSignal<number | null>(null);

  // 아이템 이름을 반환하는 함수 추가
  const getItemName = (itemId: string): string => {
    const itemNames: { [key: string]: string } = {
      'water': '물',
      'food': '음식',
      'medkit': '의료 키트',
      '': '없음'
    };
    return itemNames[itemId] || itemId;
  };

  // 아이템 설명을 반환하는 함수 추가
  const getItemDescription = (itemId: string): string => {
    const itemDescriptions: { [key: string]: string } = {
      'water': '갈증을 해소할 수 있는 물입니다.',
      'food': '배고픔을 해결할 수 있는 음식입니다.',
      'medkit': '부상을 치료할 수 있는 의료 키트입니다.',
      '': '필요한 아이템이 없습니다.'
    };
    return itemDescriptions[itemId] || '아이템 설명이 없습니다.';
  };

  const teamResults: Result[] = [
    {
      team: 'Team 1',
      used_item: Array(6).fill(''),
      item_path: Array(6).fill(''),
      event_result: ['success', 'failure', 'success', 'failure', 'success', 'failure'],
      required_item: ['', 'water', '', 'food', '', 'medkit'],
      hunger: [80, 90, 60, 95, 70, 85],
      thirst: [70, 85, 50, 88, 60, 80],
      stress: [20, 60, 10, 75, 15, 45]
    },
    {
      team: 'Team 2',
      used_item: Array(6).fill(''),
      item_path: Array(6).fill(''),
      event_result: ['success', 'failure', 'success', 'failure', 'success', 'failure'],
      required_item: ['', 'water', '', 'food', '', 'medkit'],
      hunger: [80, 90, 60, 95, 70, 85],
      thirst: [70, 85, 50, 88, 60, 80],
      stress: [20, 60, 10, 75, 15, 45]
    }
  ];

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <header class="bg-neutral-950 py-4 px-5 shadow-lg">
        <div class="max-w-screen-xl mx-auto mb-2 flex flex-col items-center">
          <img
            src={logoImage}
            alt="Disaster.io Logo"
            class="h-12 w-auto mb-2"
          />
          <h1 class="text-xl text-gray-300">이벤트 결과</h1>
        </div>
      </header>

      <main class="flex flex-1">
        {/* 랭킹 섹션 */}
        <div class="w-[30%] bg-gray-700 p-5">
          <h2 class="text-2xl text-center mb-4">팀 랭킹</h2>
          <div class="space-y-2">
            {['Team 1', 'Team 2'].map((team, index) => (
              <div
                onClick={() => setSelectedTeam(team)}
                class={`flex items-center p-3 rounded cursor-pointer transition-colors
                  ${selectedTeam() === team 
                    ? 'bg-orange-400 hover:bg-orange-500 text-black font-bold' 
                    : 'bg-white hover:bg-gray-200 text-black font-bold'}`}
              >
                <span class="mr-3">{index + 1}</span>
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
              {/* 이벤트 상태 표시 */}
              <div class="max-w-3xl mx-auto mb-8 mt-4">
                <div class="relative">
                  {/* 배경 선 */}
                  <div class="absolute top-6 left-0 right-0 h-[2px] bg-gray-600 -z-10" />
                  
                  <div class="flex justify-between mb-2">
                    {selectedTeam() && teamResults.find(r => r.team === selectedTeam())?.event_result.map((result, index) => (
                      <button
                        onClick={() => setSelectedEvent(index)}
                        class={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors
                          ${result === 'success' 
                            ? 'bg-green-500 hover:bg-green-700' 
                            : 'bg-red-500 hover:bg-red-700'}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 이벤트 상세 정보 */}
              {selectedTeam() && selectedEvent() !== null && (
                <div class="bg-gray-700 p-5 rounded-lg max-w-2xl mx-auto">
                  <h3 class="text-xl mb-4">이벤트 {selectedEvent()! + 1} 상세 정보</h3>
                  
                  {/* 스탯 바들 */}
                  <div class="space-y-4 mb-8">
                    {[
                      { 
                        label: '배고픔', 
                        value: teamResults.find(r => r.team === selectedTeam())!.hunger[selectedEvent()!],
                        prevValue: selectedEvent()! > 0 ? teamResults.find(r => r.team === selectedTeam())!.hunger[selectedEvent()! - 1] : null,
                        getColor: (value: number) => {
                          if (value <= 30) return 'bg-green-500';
                          if (value <= 60) return 'bg-blue-500';
                          return 'bg-yellow-500';
                        }
                      },
                      { 
                        label: '목마름', 
                        value: teamResults.find(r => r.team === selectedTeam())!.thirst[selectedEvent()!],
                        prevValue: selectedEvent()! > 0 ? teamResults.find(r => r.team === selectedTeam())!.thirst[selectedEvent()! - 1] : null,
                        getColor: (value: number) => {
                          if (value <= 30) return 'bg-green-500';
                          if (value <= 60) return 'bg-blue-500';
                          return 'bg-yellow-500';
                        }
                      },
                      { 
                        label: '스트레스', 
                        value: teamResults.find(r => r.team === selectedTeam())!.stress[selectedEvent()!],
                        prevValue: selectedEvent()! > 0 ? teamResults.find(r => r.team === selectedTeam())!.stress[selectedEvent()! - 1] : null,
                        getColor: (value: number) => {
                          if (value <= 30) return 'bg-green-500';
                          if (value <= 60) return 'bg-blue-500';
                          return 'bg-yellow-500';
                        }
                      }
                    ].map(stat => (
                      <div>
                        <p class="mb-1">
                          {stat.label}: {stat.value}
                          {stat.prevValue !== null && (
                            <span class={`ml-2 ${stat.value > stat.prevValue ? 'text-red-500' : 'text-green-500'}`}>
                              {stat.value > stat.prevValue ? '+' : ''}{stat.value - stat.prevValue}
                            </span>
                          )}
                        </p>
                        <div class="w-full h-5 bg-gray-600 rounded-full overflow-hidden">
                          <div
                            class={`h-full rounded-full transform-gpu ${stat.getColor(stat.value)}`}
                            style={{
                              width: `${stat.value}%`,
                              'transition-property': 'width, background-color',
                              'transition-duration': '1000ms',
                              'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 필요 아이템 목록 */}
                  <div class="mt-8">
                    <h4 class="text-lg mb-3">필요했던 아이템:</h4>
                    <div class="space-y-3">
                      {selectedTeam() && selectedEvent() !== null && 
                        teamResults.find(r => r.team === selectedTeam())!.required_item[selectedEvent()!] ? (
                          <div class="bg-gray-600 p-3 rounded flex items-center gap-4">
                            <div class="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                              <img 
                                src={`/images/items/${teamResults.find(r => r.team === selectedTeam())!.required_item[selectedEvent()!]}.png`}
                                alt={teamResults.find(r => r.team === selectedTeam())!.required_item[selectedEvent()!]}
                                class="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h5 class="font-bold mb-1">
                                {getItemName(teamResults.find(r => r.team === selectedTeam())!.required_item[selectedEvent()!])}
                              </h5>
                              <p class="text-sm text-gray-300">
                                {getItemDescription(teamResults.find(r => r.team === selectedTeam())!.required_item[selectedEvent()!])}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div class="bg-gray-600 p-3 rounded">없음</div>
                        )
                      }
                    </div>
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