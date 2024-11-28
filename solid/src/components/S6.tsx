import { Component, createSignal, onMount } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import * as XLSX from "xlsx";
import ky from "ky";

interface Item {
  id: number;
  korName: string;
  name: string;
  weight: number;
  volume: number;
  description: string;
  imgsource: string;
}

const S6: Component = () => {
  const [items, setItems] = createSignal<Item[]>([]);

  const [timer, setTimer] = createSignal(150);
  const [currentWeight, setCurrentWeight] = createSignal(0);
  const [currentVolume, setCurrentVolume] = createSignal(0);
  const [q, setQ] = createSignal<Item[]>([]); // Queue for bag items
  const [selectedItem, setSelectedItem] = createSignal<Item | null>(null);
  const [quantity, setQuantity] = createSignal(1); // Number of items to add
  const [showModal, setShowModal] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");

  const location = useLocation();
  const navigate = useNavigate();
  const roomCode = location.state?.roomCode || "UNKNOWN_ROOM";
  const teamName = location.state?.teamName || "UNKNOWN_TEAM";
  const selectedBag = location.state?.selectedBag || {
    id: 1,
    weightLimit: 10,
    volumeLimit: 10,
    bagWeight: 0,
    description: "기본 가방 설명",
  };
  const maxWeight = selectedBag.weightLimit;
  const maxVolume = selectedBag.volumeLimit;
  const [istime, setistime] = createSignal(true);
  // Load items from Excel file
  const readItemsFromExcel = async () => {
    try {
      const response = await fetch("Items.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json<Item>(worksheet);

      const mappedItems = data.map((row, index) => ({
        id: index + 1,
        korName: row.korName || "",
        name: row.name || "",
        weight: parseFloat(row.weight) || 0,
        volume: parseFloat(row.volume) || 0,
        description: row.description || "",
        imgsource: `resource/${row.name}.png`,
      }));

      setItems(mappedItems);
    } catch (error) {
      console.error("Error reading Excel file:", error);
    }
  };

  // Timer logic
  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    if (istime == true){
      alert("Time's up!");
      setistime(false);
    }
  };

  // Add items to bag
  const addItemToBag = () => {
    const item = selectedItem();
    if (!item) return;

    const totalWeight = currentWeight() + item.weight * quantity();
    const totalVolume = currentVolume() + item.volume * quantity();

    if (totalWeight > maxWeight || totalVolume > maxVolume) {
      alert("가방에 더 이상 물건을 넣을 수 없습니다!");
      return;
    }

    // Add the selected quantity of items to the queue
    const newItems = Array(quantity()).fill(item);
    setQ((prev) => [...prev, ...newItems]);
    setCurrentWeight(totalWeight);
    setCurrentVolume(totalVolume);
    setShowModal(false);
  };

  // Remove item from bag
  const removeItemFromBag = (index: number) => {
    const item = q()[index];
    if (!item) return;

    setQ((prev) => prev.filter((_, i) => i !== index)); // Remove item at the given index
    setCurrentWeight((prev) => Number((prev - item.weight).toFixed(1)));
    setCurrentVolume((prev) => Number((prev - item.volume).toFixed(1)));
  };

  // Generate bag contents summary
  const getBagContents = async () => {
    const bagContents = { items: {}, totalWeight: Math.round(currentWeight()), totalVolume: Math.round(currentVolume()) };
  
    q().forEach((item) => {
      const name = item.name;
      if (!bagContents.items[name]) {
        bagContents.items[name] = 0;
      }
      bagContents.items[name] += 1;
    });
    const flattenedBagContents = {
      ...bagContents.items, // Flatten the items dictionary
      totalWeight: bagContents.totalWeight,
      totalVolume: bagContents.totalVolume,
      bagID: selectedBag.id,
    };
    try {
      // Make API call to submit bag contents
      
      console.log(bagContents.items)
      const response = await ky.post(`http://localhost:8000/player/room/${roomCode}/team/${teamName}/submit_bag`, {
        json: flattenedBagContents,
      }).json();
  
      console.log("API Response:", response);
      alert(response.message || "Bag contents submitted successfully!");
      setistime(false);
      // Navigate to the next scene
      navigate("/sceneinfo", {
        state: {
          roomCode,
          teamName: teamName,
          selectedBag, // Pass the selected bag object
          bagContents: bagContents,
        },
      });
    } catch (error) {
      console.error("Error submitting bag contents:", error);
      alert("Failed to submit bag contents. Please try again.");
    }
  
    console.log("Bag Contents:", bagContents);
  };
  

  // Filtered items based on search
  const filteredItems = () => items().filter((item) => item.korName.toLowerCase().includes(searchTerm()));

  onMount(() => {
    readItemsFromExcel();
    startTimer();
  });

  return (
    <div class="max-w-[1500px] mx-auto p-5 text-white bg-neutral-950 font-sans">
      {/* Header */}
      <div class="flex justify-center items-center">
        <img
          src="../../resource/logo_horizon.png"
          alt="Disaster.io Logo"
          class="h-20 w-auto"
        />
      </div>  
      <header class="flex justify-between items-center mx-1 mb-5">
        <h1 class="text-2xl">{teamName()}</h1>
        <div class="timer bg-green-500 w-12 h-12 rounded-full flex justify-center items-center text-xl font-sans">
          {timer()}
        </div>
      </header>

      {/* Main Content */}
      <main class="grid grid-cols-[300px_1fr] gap-5">
        {/* Inventory Section */}
        <section>
          <input
            type="text"
            placeholder="Search items..."
            class="w-full p-2 rounded bg-gray-700"
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value.toLowerCase())}
          />
          <div class="grid grid-cols-3 gap-2 mt-4">
            {filteredItems().map((item) => (
              <div
                class="flex flex-col item items-center text-center bg-gray-800 p-2 rounded cursor-pointer"
                onClick={() => {
                  setSelectedItem(item);
                  setQuantity(1);
                  setShowModal(true);
                }}
              >
                <img src={item.imgsource} alt={item.korName} class="w-16 h-16 mb-2" />
                <span>{item.korName}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bag Section */}
        <section class="bg-gray-700 rounded-lg p-4">
          <div class="text-lg flex gap-4">
            <div>Weight: {currentWeight()} / {maxWeight}</div>
            <div class="mt-1 w-[30%] ml-1 h-3 mr-2 bg-gray-600 rounded-full overflow-hidden">
              <div class="h-full bg-green-500" style={`width: ${currentWeight()/maxWeight*100}%`}></div>
            </div>
            <div>Volume: {currentVolume()} / {maxVolume}</div>
            <div class="mt-1 w-[30%] ml-1 h-3 bg-gray-600 rounded-full overflow-hidden">
              <div class="h-full bg-green-500" style={`width: ${currentVolume()/maxVolume*100}%`}></div>
            </div>
          </div>
          <div class="grid grid-cols-8 gap-2 mt-4">
            {q().map((item, index) => (
              <div class="item bg-gray-800 p-2 rounded flex flex-col items-center relative">
                <button
                  class="text-xl absolute top-1 right-3 text-red-500"
                  onClick={() => removeItemFromBag(index)}
                >
                  ×
                </button>
                <img src={item.imgsource} alt={item.korName} class="w-16 h-16 mb-2" />
                <span>{item.korName}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Log Bag Contents Button */}
      <div class="flex justify-center mt-4">
        <button
          class="mt-5 px-5 py-2.5 bg-orange-500 text-xl font-bold text-black rounded cursor-pointer hover:bg-orange-600 transition-colors font-sans"
          onClick={getBagContents}
        >
          가방 제출하기
        </button>
      </div>

      {/* Modal */}
      {showModal() && (
        <div class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div class="bg-gray-800 p-5 rounded font-sans relative">
            <button
              class="text-2xl font-bold absolute top-2 right-4"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <div class="text-center flex flex-col items-center">
              <img src={selectedItem()?.imgsource} alt="" class="my-2 w-32 h-32" />
              <div class="text-xl mb-2">
                {selectedItem()?.korName}         
              </div>
              <div class="text-lg">Weight: {selectedItem()?.weight}kg</div>
              <div class="text-lg">Volume: {selectedItem()?.volume}m³</div>
            </div>
            <div class="w-full flex justify-between items-center gap-4 mt-4">
              <input
                type="range"
                min="0"
                max="10"
                value={quantity()}
                onInput={(e) =>
                  setQuantity(parseInt((e.target as HTMLInputElement).value))
                }
              />
              <span>{quantity()}</span>
            </div>
            <button
              onClick={addItemToBag}
              class="text-lg mt-4 bg-green-500 px-5 py-2 rounded text-white font-sans"
            >
              가방에 추가하기
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default S6;
