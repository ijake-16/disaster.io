// src/components/S7.tsx
import {
  Component,
  createSignal,
  onMount,
  onCleanup,
} from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import {
  initSocket,
  socket as globalSocket,
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
type BagSnapshot = Record<string, number> & {
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
  const bagMap = new Map<string, BagSnapshot>();
  const [teams, setTeams] = createSignal<TeamStatus[]>([]);
  const readyTeams = new Set<string>();

  const rebuildTeams = () => {
    const next = Array.from(bagMap.entries()).map(([name, snap]) => {
      const { totalWeight, totalVolume, bagID, ...items } = snap;
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
    initSocket(roomCode, teamName, false, () => {
      const ws = globalSocket();
      if (!ws) return;

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);

        switch (msg.action) {
          case "initial_state": {
            Object.entries(msg.data.bags as Record<string, BagSnapshot>).forEach(
              ([t, snap]) => bagMap.set(t, snap),
            );
            rebuildTeams();
            break;
          }
          case "bag_sync": {
            console.log("bag_sync message requested")
            const { team, snapshot } = msg.data as {
              team: string;
              snapshot: BagSnapshot;
            };
            bagMap.set(team, snapshot);
            rebuildTeams();
            break;
          }
          case "update_bag_status":
            /* 준비 상태 텍스트 등 표시하고 싶으면 여기서 */
            console.log("update_bag_status message requested")
            const { team, status } = msg.data;
            if (status === "submitted") readyTeams.add(team); // readyTeams: Set<string>
            rebuildTeams(); 
            break;
          case "start_game":
            console.log("start_game message requested")
            nav("/simulinfo", { replace: true });
            break;
        }
      };
    });
  });

  onCleanup(() => globalSocket()?.close());

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
          {teams().map((team) => (
            <div class="w-1/2 bg-gray-100 text-black p-4 rounded-lg">
              <h3 class="text-lg font-bold mb-4">{team.name}</h3>

              <div class="grid grid-cols-4 gap-1 bg-gray-800 p-2 rounded-lg mb-3">
                {team.items.map((it) => (
                  <div class="relative bg-gray-700 p-2 flex justify-center">
                    <img src={it.image} alt="Item" class="w-10 h-10" />
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
            </div>
          ))}
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
