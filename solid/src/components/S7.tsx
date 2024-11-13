import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';

interface TeamStatus {
  name: string;
  items: {
    image: string;
    count: number;
  }[];
  backpackImage: string;
  healthPercent: number;
  energyPercent: number;
}

const S7: Component = () => {
  const navigate = useNavigate();

  const teams: TeamStatus[] = [
    {
      name: "정빈팀",
      items: [
        { image: "resource/snacks.png", count: 2 },
        { image: "resource/snacks.png", count: 4 }
      ],
      backpackImage: "resource/zipbags.png",
      healthPercent: 80,
      energyPercent: 60
    },
    {
      name: "카이스트에서 살아남기",
      items: [
        { image: "resource/snacks.png", count: 2 },
        { image: "resource/snacks.png", count: 1 }
      ],
      backpackImage: "resource/zipbags.png",
      healthPercent: 70,
      energyPercent: 50
    }
  ];

  const handleContinue = () => {
    navigate('/s8_simulinfo');
  };

  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white font-sans">
      <div class="container max-w-4xl mx-auto px-4">
        <div class="text-center mb-8">
          <p class="text-lg mb-2">게임 진행 완료</p>
          <h1 class="text-4xl mb-2">Disaster.io</h1>
          <div class="text-xl text-gray-400">GAME PLAY TIME OUT</div>
        </div>

        <div class="flex justify-center gap-5 bg-neutral-800 p-5 rounded-lg mb-8">
          {teams.map(team => (
            <div class="w-1/2 bg-gray-100 text-black p-4 rounded-lg">
              <h3 class="text-lg font-bold mb-4">{team.name} 팀 현황</h3>
              
              <div class="grid grid-cols-4 gap-2 bg-neutral-800 p-2 rounded-lg mb-4">
                {team.items.map(item => (
                  <div class="relative bg-neutral-700 p-2 flex items-center justify-center">
                    <img src={item.image} alt="Item" class="w-10 h-10" />
                    <div class="absolute bottom-1 right-1 bg-amber-500 text-black px-1.5 rounded text-sm font-bold">
                      {item.count}
                    </div>
                  </div>
                ))}
                <div class="bg-neutral-700 p-2"></div>
                <div class="bg-neutral-700 p-2"></div>
              </div>

              <div class="flex justify-center mb-4">
                <img src={team.backpackImage} alt="Backpack" class="w-16" />
              </div>

              <div class="flex gap-2">
                <div class="w-1/2 h-2.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" style={`width: ${team.healthPercent}%`}></div>
                </div>
                <div class="w-1/2 h-2.5 bg-neutral-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" style={`width: ${team.energyPercent}%`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div class="text-center">
          <button 
            onClick={handleContinue}
            class="bg-amber-500 text-black px-10 py-2.5 rounded text-lg font-bold hover:bg-amber-600 transition-colors"
          >
            시뮬레이션 준비 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default S7;