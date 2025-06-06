import { Component, For, createSignal, onMount } from 'solid-js';
import { itemOptions } from '../data/items';
import type { ItemOption } from '../data/items';
import { eventOptions } from '../data/events';
import type { EventOption } from '../data/events';
import { roomCode } from '../store';
import ky from 'ky';
import { useNavigate } from '@solidjs/router';

// Type Definitions
type Item = ItemOption & { img_path: string };
type InventoryItem = Item & { status: 'active' | 'used' };

interface TeamHealthSnapshot {
  teamName: string;
  health: number;
}
type EventResult = {
  eventId: number;
  eventName: string;
  eventDescription: string;
  eventScore: number;
  requirements: number[][];
  teamResults: TeamHealthSnapshot[];
};

const RESCUE_EVENT: EventOption = {
    id: 999,
    name: "RESCUE",
    description: "You have been rescued! The game is over.",
    requirements: [],
    score: 0
};

interface Team {
    id: number;
    name: string;
    inventory: InventoryItem[];
    health: number;
    lastEventResult: 'success' | 'failure' | null;
    status: 'active' | 'retired';
}

interface StatusBarProps {
    value: number;
    maxValue: number;
}

// Helper Functions & Components
const StatusBar: Component<StatusBarProps> = (props) => {
    const getBarColor = (value: number, maxValue: number) => {
      const percentage = (value / maxValue) * 100;
      if (percentage >= 65) return 'bg-green-600';
      if (percentage >= 30) return 'bg-yellow-600';
      return 'bg-red-600';
    };
  
    return (
      <div class="w-full bg-gray-400 rounded-full h-4">
        <div
          class={`${getBarColor(props.value, props.maxValue)} h-4 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold`}
          style={{ width: `${(props.value / props.maxValue) * 100}%` }}
        >
          {`${Math.round(props.value)}`}
        </div>
      </div>
    );
};

const allItems: Item[] = itemOptions.map(item => ({...item, img_path: `../../resource/${item.name}.png`}));

const generateRandomInventory = (): InventoryItem[] => {
    const inventory: InventoryItem[] = [];
    const numItems = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numItems; i++) {
        const item = allItems[Math.floor(Math.random() * allItems.length)];
        if(!inventory.find(it => it.id === item.id)) {
            inventory.push({ ...item, status: 'active' });
        }
    }
    return inventory;
}

const getFood = (inventory: InventoryItem[]) => inventory.filter(item => item.id >= 100 && item.id < 200);
const getDrinks = (inventory: InventoryItem[]) => inventory.filter(item => item.id >= 200 && item.id < 300);
const getOthers = (inventory: InventoryItem[]) => inventory.filter(item => item.id >= 300);

const getPassingItems = (inventory: InventoryItem[], requirements: number[][]): number[] | null => {
    const activeInventoryIds = new Set(inventory.filter(item => item.status === 'active').map(item => item.id));
    for (const requirementGroup of requirements) {
        if (requirementGroup.every(itemId => activeInventoryIds.has(itemId))) {
            return requirementGroup;
        }
    }
    return null;
}

const InventoryItemDisplay: Component<{item: InventoryItem}> = ({ item }) => {
    return (
        <div class="relative">
            <img
                src={item.img_path}
                alt={item.name}
                class={`h-10 w-10 object-contain bg-gray-700 rounded-md p-1 transition-all ${item.status === 'used' ? 'opacity-30' : ''}`}
            />
            {item.status === 'used' && (
                <div class="absolute inset-0 flex items-center justify-center">
                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
            )}
        </div>
    );
}

// Main Component
const SimulationResult: Component = () => {
  const [teams, setTeams] = createSignal<Team[]>([]);
  const [eventDeck, setEventDeck] = createSignal<EventOption[]>([]);
  const [drawnEvent, setDrawnEvent] = createSignal<EventOption | null>(null);
  const [gameEnded, setGameEnded] = createSignal(false);
  const [history, setHistory] = createSignal<EventResult[]>([]);
  const navigate = useNavigate();

  const fetchTeamData = async () => {
    try {
        const teamBags = await ky
            .get(`/api/host/room/${roomCode()}/bag_contents`)
            .json<Record<string, { items: Record<string, number> }>>();

        const allItemsByIdMap = new Map(allItems.map(item => [item.id, item]));

        const teamArray = Object.entries(teamBags).map(([teamName, bagContents]) => {
            const inventory: InventoryItem[] = [];
            if (bagContents && bagContents.items) {
                for (const [itemId, count] of Object.entries(bagContents.items)) {
                    const itemInfo = allItemsByIdMap.get(parseInt(itemId, 10));
                    if (itemInfo && typeof count === 'number') {
                        for(let i = 0; i < count; i++) {
                            inventory.push({ ...itemInfo, status: 'active' });
                        }
                    }
                }
            }
            return {
                id: Math.random(),
                name: teamName,
                inventory,
                health: 100,
                lastEventResult: null,
                status: 'active' as const
            };
        });
        setTeams(teamArray);
    } catch (error) {
        console.error("Failed to fetch team data, using mock data as fallback:", error);
        setTeams(Array.from({ length: 4 }, (_, i) => ({
            id: i + 1,
            name: `Team ${i + 1}`,
            inventory: generateRandomInventory(),
            health: 100,
            lastEventResult: null,
            status: 'active' as const
        })));
    }
  };

  const initializeEventDeck = () => {
    const normalEvents = [...eventOptions].sort(() => Math.random() - 0.5);
    const rescueIndex = normalEvents.length >= 8 ? 
        Math.floor(Math.random() * (normalEvents.length - 8 + 1)) + 8 :
        normalEvents.length;
    normalEvents.splice(rescueIndex, 0, RESCUE_EVENT);
    setEventDeck(normalEvents);
  }

  const drawEvent = () => {
    if (gameEnded() || eventDeck().length === 0) return;

    const [nextEvent, ...remaining] = eventDeck();
    setDrawnEvent(nextEvent);
    setEventDeck(remaining);

    if (nextEvent.name === "RESCUE") {
      setGameEnded(true);
      return;
    }

    setTeams(prevTeams => {
        const updated = prevTeams.map(team => {
            if (team.status === 'retired') return team;

            const passingItemGroup = getPassingItems(team.inventory, nextEvent.requirements);
            const success = passingItemGroup !== null;
            
            const healthChange = success 
                ? nextEvent.score * (Math.random() * 0.2 + 0.9)
                : -nextEvent.score * (Math.random() * 0.2 + 0.4);

            const newHealth = Math.max(0, Math.min(200, team.health + healthChange));

            let newInventory = team.inventory;
            if (success && passingItemGroup) {
                const consumedItemIds = new Set(passingItemGroup);
                newInventory = team.inventory.map(item => 
                    consumedItemIds.has(item.id) ? { ...item, status: 'used' } : item
                );
            }

            return {
                ...team,
                health: newHealth,
                inventory: newInventory,
                lastEventResult: success ? 'success' : 'failure',
                status: newHealth === 0 ? 'retired' : team.status
            };
        });

        setHistory(prev => [
            ...prev,
            {
                eventId: nextEvent.id,
                eventName: nextEvent.name,
                eventDescription: nextEvent.description,
                eventScore: nextEvent.score,
                requirements: nextEvent.requirements,
                teamResults: updated.map(t => ({
                    teamName: t.name,
                    health: t.health
                }))
            }
        ]);
        return updated;
    });
  };

  onMount(async () => {
    await fetchTeamData();
    initializeEventDeck();
  });

  return (
    <div class="min-h-screen bg-neutral-950 container flex flex-col mx-auto p-4 font-sans">
      <div class="flex justify-center flex-col items-center mt-2">
        <img src="../../resource/logo_horizon.png" alt="Disaster.io Logo" class="h-16 w-auto" />
        <div class="mt-2 text-center text-white text-2xl mb-4">시뮬레이션 결과</div>
      </div>

      <div class="w-[80%] mx-auto">
        <div class="grid grid-cols-2 gap-6">
            <For each={teams()}>
            {(team) => (
                <div class={`bg-gray-800 rounded-lg p-4 font-sans flex flex-col justify-between min-h-48 border-4 transition-all ${team.lastEventResult === 'success' && team.status === 'active' ? 'border-green-500' : team.lastEventResult === 'failure' && team.status === 'active' ? 'border-red-500' : 'border-transparent'} ${team.status === 'retired' ? 'filter blur-sm grayscale' : ''}`}>
                    <div>
                        <div class="flex justify-between items-center">
                            <h2 class="text-xl text-gray-200 font-bold mb-2">{team.name}</h2>
                            {team.status === 'retired' ? (
                                <span class="px-2 py-1 rounded-md text-sm font-bold bg-gray-600 text-white">Retired</span>
                            ) : team.lastEventResult && (
                                <span class={`px-2 py-1 rounded-md text-sm font-bold ${team.lastEventResult === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {team.lastEventResult.charAt(0).toUpperCase() + team.lastEventResult.slice(1)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div class="flex-grow space-y-2">
                        <div class="flex flex-wrap gap-2">
                            <For each={getFood(team.inventory)}>{(item) => <InventoryItemDisplay item={item} />}</For>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <For each={getDrinks(team.inventory)}>{(item) => <InventoryItemDisplay item={item} />}</For>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <For each={getOthers(team.inventory)}>{(item) => <InventoryItemDisplay item={item} />}</For>
                        </div>
                    </div>
                    <div class="mt-4">
                        <StatusBar value={team.health} maxValue={200} />
                    </div>
                </div>
            )}
            </For>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center">
          <div class="flex items-center space-x-4">
            <div class="relative w-48 h-64">
                <For each={eventDeck()}>
                    {(_, index) => (
                        <div class="absolute w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 border-4 border-gray-900 rounded-lg shadow-2xl flex justify-center items-center"
                             style={{transform: `translateX(${index() * 2}px) translateY(${index() * -1}px)`, "z-index": index()}}>
                            <img src="../../resource/logo.png" alt="Card Back" class="w-2/3 opacity-40" />
                        </div>
                    )}
                </For>
            </div>
            <button onClick={drawEvent} class="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 disabled:bg-gray-500" disabled={gameEnded() || eventDeck().length === 0}>
              Draw Event
            </button>
            {drawnEvent() && (
                <div class="w-48 h-64 bg-gray-700 text-white p-4 rounded-lg shadow-lg flex flex-col justify-between">
                    <h3 class="text-lg font-bold">{drawnEvent()!.name}</h3>
                    <p>{drawnEvent()!.description}</p>
                    <p class="text-sm font-bold text-yellow-400">Score: {drawnEvent()!.score}</p>
                </div>
            )}
          </div>
          {gameEnded() && (
            <>
                <div class="mt-4 text-2xl text-green-400 font-bold">
                    You have been rescued!
                </div>
                <button
                class="mt-4 bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600"
                onClick={() => navigate('/host/finalresult', { state: { history: history() } })}
                >
                최종 결과 보기
                </button>
            </>
          )}
      </div>
    </div>
  );
};

export default SimulationResult;
