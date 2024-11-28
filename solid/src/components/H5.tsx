import { Component, createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { roomCode } from '../store';
import logoImage from '../../resource/logo_horizon.png';
import ky from "ky";

interface TeamItem {
  image: string;
  count: number;
}

interface TeamStatus {
  name: string;
  items: TeamItem[];
  backpackImage: string;
  volumePercent: number;
  weightPercent: number;
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

const SceneInfo: Component = () => {
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
          description: "그린다그리워현역시절사용하던휴가가방",
        },
        {
          id: 2,
          image: "../resource/kidbag.png",
          alt: "Cute Backpack",
          weightLimit: 15,
          volumeLimit: 15,
          bagWeight: 1,
          description: "우리아이술안주티니핑책가방",
        },
        {
          id: 3,
          image: "../resource/ecobag.png",
          alt: "Eco Tote Bag",
          weightLimit: 10,
          volumeLimit: 15,
          bagWeight: 0.5,
          description: "곧죽어도환경살려튼튼경제적에코백",
        },
      ];
  
  
      // Fetch team bags data from the API
      const teamBags = await ky
        .get(`http://localhost:8000/host/room/${currentroomCode}/bag_contents`)
        .json<Record<string, Record<string, number>>>();
  
  
      // Map the team data to create team statuses
      const teamStatuses = Object.entries(teamBags).map(([teamName, bagContents]) => {
        // Extract backpack details from the flattenedBagContents
        const { totalWeight, totalVolume, bagID, ...items } = bagContents;
  
        // Find the selected bag based on bagID
        const selectedBag = bagOptions.find((bag) => bag.id === bagID);
        if (!selectedBag) {
          console.error(`Bag with ID ${bagID} not found for team ${teamName}`);
          return null;
        }
  
        // Map items into a list with image and count
        const mappedItems = Object.entries(items).map(([itemName, count]) => ({
          image: `../../resource/${itemName}.png`, // Assume images are named after items
          count,
        }));
  
        // Calculate percentages
        const weightPercent = Math.min((totalWeight / (selectedBag.weightLimit)) * 100, 100);
        const volumePercent = Math.min((totalVolume / (selectedBag.volumeLimit)) * 100, 100);
  
        return {
          name: teamName,
          items: mappedItems,
          backpackImage: selectedBag.image,
          volumePercent,
          weightPercent,
        };
      }).filter(Boolean); // Filter out any null results
  
      setTeams(teamStatuses as TeamStatus[]);
    } catch (error) {
      console.log(teamBags, bagContents);
      console.error("Failed to fetch team data:", error);
      alert("Failed to fetch team data. Please try again.");
    }
  };
  
  // Fetch data on component mount
  onMount(() => {
    fetchTeamData();
    const interval = setInterval(fetchTeamData, 5000);

    return () => clearInterval(interval);
  });

  const handleSimulStart = async () => {
    try {
      await ky.post(`http://localhost:8000/host/room/${currentroomCode}/game_start_confirm`);
      console.log("Game simulation started for room code:", currentroomCode);
      window.location.href = '/host/simulinfo';
      // Optionally, redirect or update state after starting the simulation
    } catch (error) {
      console.error("Failed to start game simulation:", error);
    }
  };

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

              <div class="grid grid-cols-4 gap-1 p-2 bg-gray-700 rounded-lg">
                {team.items.map((item) => (
                  <div class="bg-gray-500 p-2 relative flex items-center justify-center">
                    <img src={item.image} alt="Item" class="w-10 h-10" />
                    <div class="absolute bottom-1 right-1 bg-orange-500 text-black px-1.5 rounded text-sm font-bold">
                      {item.count}
                    </div>
                  </div>
                ))}
                <div class="bg-gray-500 p-2"></div>
                <div class="bg-gray-500 p-2"></div>
              </div>

              <div class="mt-4">
                <img src={team.backpackImage} alt="Backpack" class="w-15 h-auto mx-auto" />
              </div>

              <div class="flex gap-2">
                <div class="w-[45%] h-3 bg-gray-500 rounded overflow-hidden mb-2">
                  <div class="h-full bg-green-500 transition-all duration-300" style={`width: ${team.volumePercent}%`}></div>
                </div>
                <div class="w-[45%] h-3 bg-gray-500 rounded overflow-hidden mb-2">
                  <div class="h-full bg-green-500 transition-all duration-300" style={`width: ${team.weightPercent}%`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div class="mt-5">
          <button 
            onClick={() => {
              handleSimulStart();
            }}
            class="bg-orange-500 text-black px-10 py-2.5 text-xl font-bold rounded-md hover:bg-orange-600"
          >
            가방 싸기 완료
          </button>
        </div>
      </div>
  );
};

export default SceneInfo;