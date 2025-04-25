// src/components/S7.tsx
import {
  Component,
  createSignal,
  onMount,
  onCleanup,
  For
} from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import {
  socket 
} from "../store";
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
const S7: Component = () => {
  /* ------------ 라우팅 파라미터 ------------ */
  const nav = useNavigate();
  const loc = useLocation();
  const roomCode = loc.state?.roomCode || "UNKNOWN";
  const teamName = loc.state?.teamName || "PLAYER";

  /* ------------ 상태 ------------ */
  const bagSnapshots = new Map<string, BagSnapshot>();
  const [teams, setTeams] = createSignal<TeamStatus[]>([]);
  const [readyTeams, setReadyTeams] = createSignal<string[]>([]);
  const ws = socket();

  const rebuildTeams = () => {
    const next = Array.from(bagSnapshots.entries()).map(([name, snap]) => {
      const { totalWeight, totalVolume, bagID, items } = snap;
      const bag = bagOptions.find((b) => b.id === bagID) || bagOptions[0];

      const mapped: TeamItem[] = Object.entries(items).map(
        ([item, cnt]) => ({
          image: `resource/${item}.png`,
          count: cnt,
        }),
      );

      return {
        name,
        items: mapped,
        backpackImage: bag.image,
        volumePercent: Math.min((totalVolume / bag.volumeLimit) * 100, 100),
        weightPercent: Math.min((totalWeight / bag.weightLimit) * 100, 100),
      };
    });
    setTeams(next);
  };

  /* ------------ WebSocket 연결 ------------ */
  onMount(() => {
      if (!ws) return;
      ws.send(JSON.stringify({ action: "fetch_room_bags" }));
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        setReadyTeams((prev) =>
          prev.includes(teamName) ? prev : [...prev, teamName]
        );
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
          case "ready_state": {
            // 해당 팀이 제출 완료했을 때
            const { readys } = msg.data as { readys: string[] };
            setReadyTeams(readys);
            rebuildTeams();
            break;
          }
          case "start_game":
            console.log("start_game message requested")
            nav("/simulinfo", { replace: true });
            break;
        }
      };

  });

  onCleanup(() => ws?.close());

  /* ------------ UI ------------ */
  return (
    <div class="flex justify-center items-center h-screen bg-neutral-950 text-white font-sans">
      <div class="container max-w-4xl mx-auto px-4">
        <div class="text-center mb-8">
          <p class="text-xl text-gray-200 mb-2">게임 대기 / Room {roomCode}</p>
          <img
            src="resource/logo.png"
            alt="Disaster.io Logo"
            class="h-24 w-auto mx-auto mb-4"
          />
          <p class="text-xl text-orange-400">YOUR TEAM : {teamName}</p>
        </div>

        <div class="flex justify-center gap-5 bg-gray-800 p-5 rounded-lg mb-8">
        <For each={teams()}>
        {team => {
          const isReady = readyTeams().includes(team.name);
          return (
            <div class="w-1/2 bg-gray-100 text-black p-4 rounded-lg">
              <h3 class="text-lg font-bold mb-4">{team.name}</h3>

              <div class="grid grid-cols-4 gap-1 bg-gray-800 p-2 rounded-lg mb-3">
                {team.items.map((it) => (
                  <div class="relative bg-gray-700 p-2 flex justify-center">
                    <img src={"../../"+it.image} alt="Item" class="w-10 h-10" />
                    <span class="absolute bottom-0.5 right-1 bg-orange-400 text-black text-xs px-1 rounded">
                      {it.count}
                    </span>
                  </div>
                ))}
              </div>

              <img
                src={team.backpackImage}
                alt="Bag"
                class="w-14 h-14 mx-auto mb-3"
              />

              <div class="flex gap-2">
                <div class="w-1/2 h-2.5 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-green-500"
                    style={`width:${team.volumePercent}%`}
                  />
                </div>
                <div class="w-1/2 h-2.5 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-green-500"
                    style={`width:${team.weightPercent}%`}
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

        <div class="text-center">
          <button class="bg-gray-500 text-black px-10 py-2.5 rounded text-lg font-bold cursor-default">
            대기중…
          </button>
        </div>
      </div>
    </div>
  );
};

export default S7;
