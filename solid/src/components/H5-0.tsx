import { Component, createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { roomCode } from '../store';
import logoImage from '../../resource/logo_horizon.png';
import ky from "ky";

interface TeamStatus {
  name: string;
  ready: boolean;
}

interface BagOption {
  id: number;
  image: string;
  alt: string;
  weightLimit: number;
  volumeLimit: number;
  bagWeight: number;
  description: string;
}

const ReadyInfo: Component = () => {
  const navigate = useNavigate();
  const currentroomCode = roomCode()

  const [teams, setTeams] = createSignal<TeamStatus[]>([]);

  const fetchTeamData = async () => {
    try {
      const bagOptions: BagOption[] = [
        {
          id: 1,
          image: "../resource/militarybag.png",
          alt: "Military Backpack",
          weightLimit: 30,
          volumeLimit: 30,
          bagWeight: 5,
          description: "튼튼 등산베낭",
        },
        {
          id: 2,
          image: "../resource/kidbag.png",
          alt: "Cute Backpack",
          weightLimit: 15,
          volumeLimit: 15,
          bagWeight: 1,
          description: "아동용 책가방",
        },
        {
          id: 3,
          image: "../resource/ecobag.png",
          alt: "Eco Tote Bag",
          weightLimit: 10,
          volumeLimit: 15,
          bagWeight: 0.5,
          description: "가벼운 에코백",
        },
      ];
    
      // Fetch team bags data from the API
      const teamBags = await ky
        .get(`http://localhost:8000/host/room/${currentroomCode}/bag_contents`)
        .json<Record<string, Record<string, number>>>();
  
      // Map the team data to create team statuses
      const teamStatuses = Object.entries(teamBags).map(([teamName, bagContents]) => {
        // Extract backpack details from the flattenedBagContents
        const { bagID } = bagContents;
  
        // Check if the bag is ready based on bagID
        const ready = bagOptions.some((bag) => bag.id === bagID);
  
        return {
          name: teamName,
          ready,
        };
      });
  
      setTeams(teamStatuses);
    } catch (error) {
      console.error("Failed to fetch team data:", error);
    }
  };
  
  // Fetch data on component mount
  onMount(() => {
    fetchTeamData();
    const interval = setInterval(fetchTeamData, 5000);

    return () => clearInterval(interval);
  });

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center py-5 font-sans">
      <div class="max-w-screen-xl mx-auto mt-2 flex flex-col items-center">
        <img
          src={logoImage}
          alt="Disaster.io Logo"
          class="h-16 w-auto mb-2"
        />
        <h1 class="text-2xl mb-4">게임 플레이</h1>
      </div>

      <div class="flex justify-center bg-gray-800 gap-5 w-4/5 max-w-[1100px] p-5 rounded-lg">
        {teams().map((team) => (
          <div class="bg-gray-200 text-black p-4 rounded-lg w-[50%]">
            <h3 class="text-xl font-bold mb-3">{team.name} 팀 현황</h3>
            <div class="mt-4">
              {team.ready ? "준비 완료" : "준비 중..."}
            </div>
          </div>
        ))}
      </div>

      <div class="mt-5">
        <button 
          onClick={() => navigate('/host/sceneinfo')}
          class="bg-orange-500 text-black px-10 py-2.5 text-xl font-bold rounded-md hover:bg-orange-600"
        >
          게임 완료
        </button>
      </div>
    </div>
  );
};

export default ReadyInfo;