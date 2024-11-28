import { Component, createSignal } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import ky from "ky";

interface BagOption {
  id: number;
  image: string;
  alt: string;
  weightLimit: number;
  volumeLimit: number;
  bagWeight: number;
  description: string;
}

const BagSelect: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomCode = location.state?.roomCode || "UNKNOWN_ROOM";
  const currentTeamName = location.state?.teamName || "UNKNOWN_TEAM";
  const [selectedBagId, setSelectedBagId] = createSignal<number>(1);

  const bagOptions: BagOption[] = [
    {
      id: 1,
      image: "resource/militarybag.png",
      alt: "Military Backpack",
      weightLimit: 30,
      volumeLimit: 30,
      bagWeight: 5,
      description: "튼튼한 등산가방",
    },
    {
      id: 2,
      image: "resource/kidbag.png",
      alt: "Cute Backpack",
      weightLimit: 15,
      volumeLimit: 15,
      bagWeight: 1,
      description: "어린이용 책가방",
    },
    {
      id: 3,
      image: "resource/ecobag.png",
      alt: "Eco Tote Bag",
      weightLimit: 10,
      volumeLimit: 15,
      bagWeight: 0.5,
      description: "가벼운 에코백",
    },
  ];

  const handleBagSelect = (bagId: number) => {
    setSelectedBagId(bagId);
  };

  const handleContinue = async () => {
    const selectedBag = bagOptions[selectedBagId() - 1];
    if (!selectedBag) {
      alert("Please select a valid bag.");
      return;
    }
  
    try {
      // Make API call to select the bag
      console.log(selectedBagId())
      const response = await ky
        .post(`http://localhost:8000/player/room/${roomCode}/team/${currentTeamName}/select_bag?bag_number=${selectedBagId()}`).json<{message: string}>();
  
      console.log("API Response:", response);
      alert("가방이 성공적으로 선택되었습니다!");
  
      // Navigate to the bag creation screen
      navigate("/bagmake", {
        state: {
          roomCode,
          teamName: currentTeamName,
          selectedBag, // Pass the selected bag object
        },
      });
    } catch (error) {
      console.error("Error selecting bag:", error);
      alert("Failed to select bag. Please try again.");
    }
  };
  

  return (
    <div class="flex justify-center items-center min-h-screen bg-neutral-950 text-white font-sans">
      <div class="container text-center">
        <div class="mb-8">
          <p class="text-lg text-orange-500 font-sans">Room : {roomCode}</p>
          <div class="flex justify-center items-center mb-4">
            <img
              src="../../resource/logo_horizon.png"
              alt="Disaster.io Logo"
              class="h-20 w-auto"
            />
          </div>
          <h2 class="text-gray-200 text-2xl font-sans">생존 물품을 담을 가방을 선택해 주세요.</h2>
          <p class="text-orange-500 text-xl font-sans">YOU : {currentTeamName}</p>
        </div>

        <div class="flex flex-row items-center justify-center gap-5 text-lg">
          {bagOptions.map((bag) => (
            <div
              onClick={() => handleBagSelect(bag.id)}
              class={`flex flex-col cursor-pointer px-4 pt-0 pb-4 ${
                selectedBagId() === bag.id ? "ring-2 ring-white" : ""
              }`}
            >
              <img src={bag.image} alt={bag.alt} class="max-w-[200px] mb-3 mx-auto" />
              <div class="text-gray-200 text-left font-sans">
                <p class="mb font-sans">무게 한도 : {bag.weightLimit}kg</p>
                <p class="mb font-sans">부피 한도 : {bag.volumeLimit}L</p>
                <p class="mb font-sans">가방 무게 : {bag.bagWeight}kg</p>
                <p class="text-gray-200 font-sans">{bag.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          class="mt-8 px-10 py-2.5 bg-orange-500 text-xl font-bold text-black rounded cursor-pointer hover:bg-orange-600 transition-colors font-sans"
        >
          생존 가방 싸기
        </button>
      </div>
    </div>
  );
};

export default BagSelect;
