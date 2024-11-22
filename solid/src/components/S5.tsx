import { Component, createSignal } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

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

  const handleBagSelect = (bagId: number) => {
    setSelectedBagId(bagId);
  };

  const handleContinue = () => {
    navigate("/bagmake", {
      state: {
        roomCode,
        teamName: currentTeamName,
        selectedBagId: selectedBagId(),
      },
    });
  };

  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white font-sans">
      <div class="container text-center">
        <div class="mb-8">
          <p class="text-base text-amber-500">Room : {roomCode}</p>
          <h1 class="text-4xl mb-2">Disaster.io</h1>
          <h2 class="text-2xl mb-4">생존 물품을 담을 가방을 선택해 주세요.</h2>
          <p class="text-amber-500">YOU : {currentTeamName}</p>
        </div>

        <div class="flex justify-center gap-5 pt-5">
          {bagOptions.map((bag) => (
            <div
              onClick={() => handleBagSelect(bag.id)}
              class={`cursor-pointer p-4 ${
                selectedBagId() === bag.id ? "ring-2 ring-white" : ""
              }`}
            >
              <img src={bag.image} alt={bag.alt} class="w-full mb-3" />
              <div class="text-left">
                <p class="mb-1">무게 한도 : {bag.weightLimit}kg</p>
                <p class="mb-1">부피 한도 : {bag.volumeLimit}L</p>
                <p class="mb-1">가방 무게 : {bag.bagWeight}kg</p>
                <p class="text-gray-300">{bag.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          class="mt-5 px-5 py-2.5 bg-amber-500 text-black rounded cursor-pointer hover:bg-amber-600 transition-colors"
        >
          생존 가방 싸기
        </button>
      </div>
    </div>
  );
};

export default BagSelect;
