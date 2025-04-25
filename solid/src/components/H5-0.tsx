import { Component, createSignal, onMount, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  roomCode,
  socket,
} from "../store";
import logoImage from "../../resource/logo_horizon.png";
import { bagOptions } from "../data/bags";

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
type BagSnapshot = {
  items: Record<string, number>;
  totalWeight: number;
  totalVolume: number;
  bagID: number;
};

const SceneInfo: Component = () => {
  const navigate = useNavigate();
  const currentRoomCode = roomCode()!;
  const ws = socket();
  if (!ws) return null;

  const [teams, setTeams] = createSignal<TeamStatus[]>([]);
  const bagSnapshots = new Map<string, BagSnapshot>();
  const [readyTeams, setReadyTeams] = createSignal<string[]>([]);

  const rebuildTeams = () => {
    const next = Array.from(bagSnapshots.entries()).map(
      ([teamName, snap]) => {
        const { totalWeight, totalVolume, bagID, items } = snap;
        const bag = bagOptions.find((b) => b.id === bagID) || bagOptions[0];
        const mappedItems: TeamItem[] = Object.entries(items).map(
          ([itemName, cnt]) => ({
            image: `../../resource/${itemName}.png`,
            count: cnt,
          }),
        );
        return {
          name: teamName,
          items: mappedItems,
          backpackImage: bag.image,
          volumePercent: Math.min((totalVolume / bag.volumeLimit) * 100, 100),
          weightPercent: Math.min((totalWeight / bag.weightLimit) * 100, 100),
        };
      },
    );
    setTeams(next);
  };

  onMount(() => {
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        console.log(msg)
        switch (msg.action) {
          case "room_state": {
            // 초기 방 상태 수신
            const bags: Record<string, BagSnapshot> = msg.data.bags;
            Object.entries(bags).forEach(([team, snap]) =>
              bagSnapshots.set(team, snap),
            );
            rebuildTeams();
            break;
          }
          case "bag_updated": {
            // 개별 팀 스냅샷만 갱신
            const { team, snapshot } = msg.data as {
              team: string;
              snapshot: BagSnapshot;
            };
            bagSnapshots.set(team, snapshot);
            rebuildTeams();
            break;
          }
          case "submitted_bag": {
            // 해당 팀이 제출 완료했을 때
            const { team, status } = msg.data as {
              team: string;
              status: string;
            };
            setReadyTeams((prev) =>
              prev.includes(team) ? prev : [...prev, team]
            );
            rebuildTeams();
            break;
          }
          case "start_game": {
            // 호스트가 시작 신호를 보냈음을 서버가 다시 브로드캐스트
            navigate("/host/simulinfo");
            break;
          }
        }
      };
  });
  const allReady = () => {
    const names = teams().map((t) => t.name);
    const ready  = readyTeams();
    return names.length > 0 && names.every((n) => ready.includes(n));
  };
  const handleSimulStart = () => {
    // 호스트가 게임 시작
    ws.send(JSON.stringify({ action: "start_game" }));
    // (서버가 방 전체에 start_game 브로드캐스트)
  };

  return (
    <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center py-5 font-sans">
      <div class="max-w-screen-xl mx-auto mt-2 flex flex-col items-center">
        <img src={logoImage} alt="Logo" class="h-16 mb-2" />
        <h1 class="text-2xl mb-4">게임 플레이</h1>
      </div>

      <div class="flex justify-center bg-gray-800 gap-5 w-4/5 max-w-[1100px] p-5 rounded-lg">
        <For each={teams()}>
        {team => {
          const isReady = readyTeams().includes(team.name);
          console.log(readyTeams());
          return (
          <div class="bg-gray-200 text-black p-4 rounded-lg w-[50%]">
            <h3 class="text-xl font-bold mb-3">{team.name} 팀 현황</h3>
            <div class="grid grid-cols-4 gap-1 p-2 bg-gray-700 rounded-lg">
              {team.items.map((item) => (
                <div class="relative flex items-center justify-center bg-gray-500 p-2">
                  <img src={item.image} class="w-10 h-10" />
                  <div class="absolute bottom-1 right-1 bg-orange-400 text-black px-1.5 rounded text-sm font-bold">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
            <img src={"../../"+team.backpackImage} class="w-40 h-40 mx-auto mt-4" />
            <div class="flex gap-2 mt-4">
              <div class="w-[45%] h-3 bg-gray-500 rounded overflow-hidden">
                <div
                  class="h-full bg-green-500"
                  style={`width: ${team.volumePercent}%`}
                />
              </div>
              <div class="w-[45%] h-3 bg-gray-500 rounded overflow-hidden">
                <div
                  class="h-full bg-green-500"
                  style={`width: ${team.weightPercent}%`}
                />
              </div>
            </div>
            <div class="mt-2 text-center font-semibold">
                {isReady ? "준비 완료!" : "가방 싸는중..."}
              </div>
          </div>
        )}}
      </For>
      </div>

      <button
        onClick={handleSimulStart}
        disabled={!allReady()}
        class="mt-5 bg-orange-400 text-black px-10 py-2.5 text-xl font-bold rounded hover:bg-orange-500"
      >
        가방 싸기 완료
      </button>
    </div>
  );
};

export default SceneInfo;
