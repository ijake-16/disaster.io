import { Component, createSignal, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  roomCode,
  initSocket,
  socket as globalSocket,
} from "../store";
import logoImage from "../../resource/logo_horizon.png";
import { bagOptions, BagOption } from "../data/bags"; 

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

/* ----------------------------- 컴포넌트 ---------------------------- */
const SceneInfo: Component = () => {
  const navigate = useNavigate();
  const currentRoomCode = roomCode()!;      // store에 저장된 방 코드
  const hostName = "HOST";                  // 호스트 닉네임(원하는 값으로 교체)

  // 팀별 상태(UI 용)
  const [teams, setTeams] = createSignal<TeamStatus[]>([]);
  // 내부 스냅샷 임시 저장
  const bagSnapshots = new Map<string, BagSnapshot>();

  /* 스냅샷 → 화면 데이터 재구성 */
  const rebuildTeams = () => {
    const next = Array.from(bagSnapshots.entries()).map(
      ([teamName, snap]) => {
        const { totalWeight, totalVolume, bagID, ...items } = snap;
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

  /* ---------------------- 마운트 시 소켓 연결 --------------------- */
  onMount(() => {
    initSocket(currentRoomCode, hostName, true, () => {
      const ws = globalSocket();
      if (!ws) return;

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        switch (msg.action) {
          case "initial_state": {
            const bags: Record<string, BagSnapshot> = msg.data.bags;
            Object.entries(bags).forEach(([team, snap]) =>
              bagSnapshots.set(team, snap),
            );
            rebuildTeams();
            break;
          }
          case "bag_sync": {
            const { team, snapshot } = msg.data as {
              team: string;
              snapshot: BagSnapshot;
            };
            bagSnapshots.set(team, snapshot);
            rebuildTeams();
            break;
          }
          case "update_bag_status":
            /* 제출 완료 표시 등 필요하면 처리 */
            break;
        }
      };
    });

    onCleanup(() => globalSocket()?.close());
  });

  /* ------------------- 시뮬레이션 시작(호스트용) ------------------ */
  const handleSimulStart = () => {
    globalSocket()?.send(
      JSON.stringify({ action: "start_game", data: "confirm" }),
    );
    navigate("/host/simulinfo");
  };

  /* ------------------------------ UI ----------------------------- */
  return (
    <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center py-5 font-sans">
      <div class="max-w-screen-xl mx-auto mt-2 flex flex-col items-center">
        <img src={logoImage} alt="Disaster.io Logo" class="h-16 w-auto mb-2" />
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
                  <div class="absolute bottom-1 right-1 bg-orange-400 text-black px-1.5 rounded text-sm font-bold">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>

            <div class="mt-4">
              <img src={team.backpackImage} alt="Backpack" class="w-40 h-40 mx-auto" />
            </div>

            <div class="flex gap-2 mt-4">
              <div class="w-[45%] h-3 bg-gray-500 rounded overflow-hidden">
                <div class="h-full bg-green-500" style={`width: ${team.volumePercent}%`} />
              </div>
              <div class="w-[45%] h-3 bg-gray-500 rounded overflow-hidden">
                <div class="h-full bg-green-500" style={`width: ${team.weightPercent}%`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div class="mt-5">
        <button
          onClick={handleSimulStart}
          class="bg-orange-400 text-black px-10 py-2.5 text-xl font-bold rounded-md hover:bg-orange-500"
        >
          가방 싸기 완료
        </button>
      </div>
    </div>
  );
};

export default SceneInfo;
