import { Component, createSignal, onMount } from "solid-js";
import * as XLSX from "xlsx";

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
  const [teamName] = createSignal("Team Name");
  const [timer, setTimer] = createSignal(150);
  const [currentWeight, setCurrentWeight] = createSignal(0);
  const [currentVolume, setCurrentVolume] = createSignal(0);
  const [q, setQ] = createSignal<Item[]>([]); // Queue for bag items
  const [selectedItem, setSelectedItem] = createSignal<Item | null>(null);
  const [quantity, setQuantity] = createSignal(1); // Number of items to add
  const [showModal, setShowModal] = createSignal(false);
  const [searchTerm, setSearchTerm] = createSignal("");

  const maxWeight = 100;
  const maxVolume = 100;

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
    alert("Time's up!");
  };

  // Add items to bag
  const addItemToBag = () => {
    const item = selectedItem();
    if (!item) return;

    const totalWeight = currentWeight() + item.weight * quantity();
    const totalVolume = currentVolume() + item.volume * quantity();

    if (totalWeight > maxWeight || totalVolume > maxVolume) {
      alert("Bag capacity exceeded!");
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
    setCurrentWeight((prev) => prev - item.weight);
    setCurrentVolume((prev) => prev - item.volume);
  };

  // Generate bag contents summary
  const getBagContents = () => {
    const bagContents = { items: {}, totalWeight: currentWeight(), totalVolume: currentVolume() };

    q().forEach((item) => {
      const name = item.korName;
      if (!bagContents.items[name]) {
        bagContents.items[name] = 0;
      }
      bagContents.items[name] += 1;
    });

    console.log("Bag Contents:", bagContents);
  };

  // Filtered items based on search
  const filteredItems = () => items().filter((item) => item.korName.toLowerCase().includes(searchTerm()));

  onMount(() => {
    readItemsFromExcel();
    startTimer();
  });

  return (
    <div class="max-w-[1500px] mx-auto p-5 text-white">
      {/* Header */}
      <header class="flex justify-between items-center mb-5">
        <h1 class="text-2xl">{teamName()}</h1>
          {/* Bag Summary Button */}
        <div class="flex justify-center mt-4">
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={getBagContents}
          >
            Log Bag Contents
          </button>
        </div>
        <div class="timer bg-green-500 w-12 h-12 rounded-full flex justify-center items-center text-xl font-bold">
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
            class="w-full p-2 rounded bg-neutral-700"
            onInput={(e) => setSearchTerm((e.target as HTMLInputElement).value.toLowerCase())}
          />
          <div class="grid grid-cols-3 gap-2 mt-4">
            {filteredItems().map((item) => (
              <div
                class="item bg-neutral-800 p-2 rounded cursor-pointer"
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
        <section class="bg-neutral-700 rounded-lg p-4">
          <div>Weight: {currentWeight()} / {maxWeight}</div>
          <div>Volume: {currentVolume()} / {maxVolume}</div>
          <div class="grid grid-cols-8 gap-2 mt-4">
            {q().map((item, index) => (
              <div class="item bg-neutral-800 p-2 rounded flex flex-col items-center relative">
                <button
                  class="absolute top-1 right-1 text-red-500"
                  onClick={() => removeItemFromBag(index)}
                >
                  ×
                </button>
                <img src={item.imgsource} alt={item.korName} class="w-16 h-16" />
                <span>{item.korName}</span>
              </div>
            ))}
          </div>
        </section>
      </main>



      {/* Modal */}
      {showModal() && (
        <div class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
          <div class="bg-neutral-800 p-5 rounded">
            <button class="text-right" onClick={() => setShowModal(false)}>×</button>
            <div class="text-center">
              <img src={selectedItem()?.imgsource} alt="" class="w-24 h-24" />
              <h3>{selectedItem()?.korName}</h3>
              <div>Weight: {selectedItem()?.weight}kg</div>
              <div>Volume: {selectedItem()?.volume}m³</div>
              <div class="flex items-center gap-4 mt-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={quantity()}
                  onInput={(e) => setQuantity(parseInt((e.target as HTMLInputElement).value))}
                />
                <span>{quantity()}</span>
              </div>
              <button onClick={addItemToBag} class="mt-4 bg-green-500 px-4 py-2 rounded text-white">
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default S6;
