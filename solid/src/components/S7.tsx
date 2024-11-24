import { Component, createSignal, onMount } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
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

const S7: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roomCode = location.state?.roomCode || "UNKNOWN_ROOM";

  const [teams, setTeams] = createSignal<TeamStatus[]>([]);

  const fetchTeamData = async () => {
    try {
      const bagOptions: BagOption[] = [
        {
          id: 1,
          image: "resource/militarybag.png",
          alt: "Military Backpack",
          weightLimit: 30,
          volumeLimit: 30,
          bagWeight: 5,
          description: "그린다그리워현역시절사용하던휴가가방",
        },
        {
          id: 2,
          image: "resource/kidbag.png",
          alt: "Cute Backpack",
          weightLimit: 15,
          volumeLimit: 15,
          bagWeight: 1,
          description: "우리아이술안주티니핑책가방",
        },
        {
          id: 3,
          image: "resource/ecobag.png",
          alt: "Eco Tote Bag",
          weightLimit: 10,
          volumeLimit: 15,
          bagWeight: 0.5,
          description: "곧죽어도환경살려튼튼경제적에코백",
        },
      ];
  
      // Fetch team bags data from the API
      const teamBags = await ky
        .get(`http://localhost:8000/host/room/${roomCode}/bag_contents`)
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
          image: `resource/${itemName}.png`, // Assume images are named after items
          count,
        }));
  
        // Calculate percentages
        const weightPercent = Math.min((totalWeight / (10 * selectedBag.weightLimit)) * 100, 100);
        const volumePercent = Math.min((totalVolume / (10 * selectedBag.volumeLimit)) * 100, 100);
  
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
  });

  const handleContinue = () => {
    navigate("/simulinfo");
  };

  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white font-sans">
      <div class="container max-w-4xl mx-auto px-4">
        <div class="text-center mb-8">
          <p class="text-xl text-gray-200 mb-2">게임 진행 완료</p>
          <div class="flex justify-center items-center mb-6">
            <img
              src="resource/logo.png"
              alt="Disaster.io Logo"
              class="h-32 w-auto"
            />
          </div>
          <div class="text-xl text-gray-300">GAME PLAY TIME OUT</div>
        </div>

        <div class="flex justify-center gap-5 bg-gray-800 p-5 rounded-lg mb-8">
          {teams().map((team) => (
            <div class="w-1/2 bg-gray-100 text-black p-4 rounded-lg">
              <h3 class="text-lg font-bold mb-4">{team.name} 팀 현황</h3>

              <div class="grid grid-cols-4 gap-2 bg-gray-800 p-2 rounded-lg mb-4">
                {team.items.map((item) => (
                  <div class="relative bg-gray-700 p-2 flex items-center justify-center">
                    <img src={item.image} alt="Item" class="w-10 h-10" />
                    <div class="absolute bottom-1 right-1 bg-orange-500 text-black px-1.5 rounded text-sm font-bold">
                      {item.count}
                    </div>
                  </div>
                ))}
                <div class="bg-gray-700 p-2"></div>
                <div class="bg-gray-700 p-2"></div>
              </div>

              <div class="flex justify-center mb-4">
                <img src={team.backpackImage} alt="Backpack" class="w-16" />
              </div>

              <div class="flex gap-2">
                <div class="w-1/2 h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" style={`width: ${team.volumePercent}%`}></div>
                </div>
                <div class="w-1/2 h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500" style={`width: ${team.weightPercent}%`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div class="text-center">
          <button
            onClick={handleContinue}
            class="bg-orange-500 text-black px-10 py-2.5 rounded text-lg font-bold hover:bg-orange-600 transition-colors"
          >
            시뮬레이션 준비 완료
          </button>
        </div>
      </div>
    </div>
  );
};

export default S7;
