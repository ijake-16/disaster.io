import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import logoImage from '../../resource/logo.png';

const SceneInfo: Component = () => {
  const navigate = useNavigate();

  return (
    <div class="min-h-screen bg-gray-800 text-white flex flex-col items-center py-5">
      {/* Header */}
      <div class="max-w-screen-xl mx-auto flex flex-col items-center">
        <img
          src={logoImage}
          alt="Disaster.io Logo"
          class="h-32 w-auto mb-2"
        />
        <h1 class="text-lg">게임 플레이</h1>
      </div>

      {/* Game Status Container */}
      <div class="flex justify-center gap-5 w-4/5 max-w-[900px] bg-gray-700 p-5 rounded-lg">
        {/* Team 1 Status */}
        <TeamStatus 
          teamName="정빈팀 팀 현황"
          items={[
            { img: "resource/snacks.png", count: 2 },
            { img: "resource/snacks.png", count: 4 }
          ]}
          healthPercent={80}
          energyPercent={60}
        />

        {/* Team 2 Status */}
        <TeamStatus 
          teamName="카이스트에서 살아남기 팀 현황"
          items={[
            { img: "../../resource/snacks.png", count: 2 },
            { img: "../../resource/snacks.png", count: 1 }
          ]}
          healthPercent={70}
          energyPercent={50}
        />
      </div>

      {/* Button */}
      <div class="mt-5">
        <button 
          onClick={() => navigate('/host/simulinfo')}
          class="bg-orange-500 text-black px-10 py-2 text-lg font-bold rounded-md hover:bg-orange-600"
        >
          게임 완료
        </button>
      </div>
    </div>
  );
};

// TeamStatus Component
interface TeamStatusProps {
  teamName: string;
  items: { img: string; count: number; }[];
  healthPercent: number;
  energyPercent: number;
}

const TeamStatus: Component<TeamStatusProps> = (props) => {
  return (
    <div class="bg-gray-100 text-black p-4 rounded-lg w-[45%]">
      <h3 class="text-lg font-bold mb-3">{props.teamName}</h3>
      
      {/* Inventory Grid */}
      <div class="grid grid-cols-4 gap-1 p-2 bg-gray-800 rounded-lg">
        {props.items.map(item => (
          <div class="bg-gray-600 p-2 relative flex items-center justify-center">
            <img src={item.img} alt="Item" class="w-10 h-10" />
            <div class="absolute bottom-1 right-1 bg-orange-500 text-black px-1.5 rounded text-sm font-bold">
              {item.count}
            </div>
          </div>
        ))}
        {/* Empty slots */}
        {[...Array(4 - props.items.length)].map(() => (
          <div class="bg-gray-600 p-2" />
        ))}
      </div>

      {/* Backpack */}
      <div class="mt-2">
        <img src="../../resource/zipbags.png" alt="Backpack" class="w-15 h-auto mx-auto" />
      </div>

      {/* Status Bars */}
      <div class="flex justify-center gap-2 mt-2">
        <StatusBar percent={props.healthPercent} />
        <StatusBar percent={props.energyPercent} />
      </div>
    </div>
  );
};

// StatusBar Component
const StatusBar: Component<{ percent: number }> = (props) => {
  return (
    <div class="w-[45%] h-2.5 bg-gray-600 rounded overflow-hidden">
      <div 
        class="h-full bg-green-500 transition-all duration-300"
        style={{ width: `${props.percent}%` }}
      />
    </div>
  );
};

export default SceneInfo;