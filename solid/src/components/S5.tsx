import { Component, createSignal, onMount } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { socket } from "../store";
import { bagOptions } from "../data/bags";

const BagSelect: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomCode = location.state?.roomCode!;
  const currentTeamName = location.state?.teamName!;
  const [selectedBagId, setSelectedBagId] = createSignal<number>(bagOptions[0].id);

  let ws: WebSocket | null = null;

  onMount(() => {
    ws = socket();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("⚠️ WebSocket 연결이 유효하지 않습니다.");
      return;
    }
    // **초기 선택값 전송**
    ws.send(
      JSON.stringify({
        action: "select_bag",
        data: { team: currentTeamName, bagID: 1 },
      })
    );
  });

  const handleBagSelect = (bagId: number) => {
    setSelectedBagId(bagId);
    ws?.send(
      JSON.stringify({
        action: "select_bag",
        data: { team: currentTeamName, bagID: bagId },
      })
    );
  };

  const handleContinue = () => {
    navigate("/bagmake", {
      state: { roomCode, teamName: currentTeamName, selectedBag: bagOptions.find(b => b.id === selectedBagId())! },
    });
  };

  return (
    <div class="flex justify-center items-center min-h-screen bg-neutral-950 text-white font-sans">
      <div class="text-center">
        <p class="text-lg text-orange-400 mb-4">Room: {roomCode}</p>
        <h2 class="text-gray-200 text-2xl mb-2">생존 물품을 담을 가방을 선택해 주세요</h2>
        <p class="text-orange-400 mb-6">YOU: {currentTeamName}</p>

        <div class="flex gap-5">
          {bagOptions.map((bag) => (
            <div
              onClick={() => handleBagSelect(bag.id)}
              class={`cursor-pointer p-4 rounded-lg ${selectedBagId() === bag.id ? "ring-2 ring-white" : ""}`}
            >
              <h3 class="text-2xl mb-2">{bag.description}</h3>
              <img src={bag.image} alt={bag.alt} class="w-32 mx-auto mb-2"/>
              <p>무게 한도: {bag.weightLimit}kg</p>
              <p>부피 한도: {bag.volumeLimit}L</p>
              <p>가방 무게: {bag.bagWeight}kg</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          class="mt-8 bg-orange-400 text-black px-8 py-2 text-lg font-bold rounded hover:bg-orange-500"
        >
          생존 가방 싸기
        </button>
      </div>
    </div>
  );
};

export default BagSelect;
