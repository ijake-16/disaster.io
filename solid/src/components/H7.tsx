import { Component, createSignal, Show, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { team1Result, team2Result, setTeam1Result, setTeam2Result} from "../store";
import * as XLSX from "xlsx"; // Items.xlsx 처리를 위해 사용
import ky from "ky";
import { roomCode } from '../store';


  
interface EventData {
  name: string;
  img_path: string;
  description: string;
  tag: string;
  require_item: string;
  success: string;
  failure: string;
}

interface StatusBarProps {
  label: string;
  value: number;
  maxValue: number;
  id: string;
}

interface Result {
  team: string;
  used_item: string[];
  item_path: string[];
  event_result: string[];
  required_item: string[]; //각 이벤트에서 필요한 아이템 태그 저장
  hunger: number[];
  thirst: number[];
  stress: number[];
}

const csvData = `
name,img_path,description,tag,require_item,success,failure
hunger,../../resource/events/Hunger.png,배가 고프다.,hunger,food,-20,0
thirst,../../resource/events/Water.png,목이 마르다.,thirst,drink,-20,0
information,../../resource/events/Information.png,재난 정보가 있으면 더 수월하게 대처할 수 있겠지.,stress,info,-10,10
floor_is_lava,../../resource/events/Floorislava.png,슬리퍼를 신고 나왔는데 길가에 잔해가 너무 많아.,stress,shoes,-10,10
ouch,../../resource/events/Ouch.png,가족 중 누군가가 다쳤어.,stress,medical,0,20
rainy,../../resource/events/rain.png,비가 많이 오네.,stress,waterproof,0,20
`.trim();

// CSV 데이터를 파싱하고 정리하는 함수
const parseCSV = (csvData: string): Record<string, EventData> => {
  const lines = csvData.trim().split("\n");
  const headers = lines[0].split(",");
  const organizedData: Record<string, EventData> = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const rowData: EventData = {} as EventData;

    headers.forEach((header, index) => {
      rowData[header] = values[index];
    });

    organizedData[rowData.name] = rowData;
  }

  return organizedData;
};

// 무작위 이벤트 선택 함수
const selectRandomEvents = (
  data: Record<string, EventData>, 
  fixedEvents: string[], 
  randomCount: number
): EventData[] => {
  const selectedEvents: EventData[] = [];
  const allKeys = Object.keys(data);
  const remainingKeys = allKeys.filter((key) => !fixedEvents.includes(key));

  fixedEvents.forEach((key) => {
    const event = data[key];
    if (event) selectedEvents.push(event);
  });

  while (selectedEvents.length < fixedEvents.length + randomCount) {
    const randomIndex = Math.floor(Math.random() * remainingKeys.length);
    const randomKey = remainingKeys[randomIndex];
    const event = data[randomKey];

    if (event && !selectedEvents.includes(event)) {
      selectedEvents.push(event);
    }
  }

  for (let i = selectedEvents.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [selectedEvents[i], selectedEvents[randomIndex]] = [
      selectedEvents[randomIndex],
      selectedEvents[i]
    ];
  }

  return selectedEvents;
};


const StatusBar: Component<StatusBarProps> = (props: { label: any; value: number; prevValue: number; maxValue: number; id: any; }) => {
  const getBarColor = (value: number) => {
    if (value <= 30) return 'bg-green-600';
    if (value <= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };
  const getResultColor = (value: number) => {
    if (value < 0) return 'text-green-600';
    return 'text-red-600';
  };  
  const getResultSign = (value: number) => {
    if (value <= 0) return '';
    return '+';
  };  

  return (
    <div class="mb-2 font-sans">
      <div class="flex text-base">
        <span>{`${props.label}:${props.value}`}</span> 
        <span 
          class={`${getResultColor(props.prevValue)} ml-1`}
        >{`${getResultSign(props.prevValue)}${props.prevValue == 0 ? '' : props.prevValue}`}</span>
      </div>
      <div class="w-full bg-gray-400 rounded-full h-2.5">
        <div 
          id={props.id} 
          class={`${getBarColor(props.value)} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${(props.value / props.maxValue) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

interface TeamBoxProps {
  teamName: string;
  index: number;
  teamResult: Result;
};

interface TeamBoxProps {
  teamName: string; // 팀 이름
  index: number; // 팀 인덱스
}

// 인벤토리 체크 함수
const checkInventory = (index: number, inventory: Record<string, number>, requiredItem: string, itemsData: Record<string, string>) => {
  const matchedItems: string[] = [];
  console.log("required item: ", requiredItem, " inventory: ", inventory);
  Object.entries(inventory).forEach(([item, count]) => {
    if (count > 0 && itemsData[item] === requiredItem) {
      matchedItems.push(item);
      console.log("matched!! ", matchedItems);
    }
  });

  return matchedItems;
};

const updateTeamResult = (
  index: number,
  team_number: number,
  event: EventData,
  matchedItems: string[],
  inventory: Record<string, number>
) => {
  const usedItem = matchedItems.length > 0 ? matchedItems[0] : null;
  const success = !!usedItem;
  console.log(`Updating team result for team ${team_number}`);

  // 아이템 사용 시 인벤토리에서 차감
  if (usedItem && inventory[usedItem] > 0) {
    inventory[usedItem]--;
  }

  // 상태 변화 계산
  const hungerChange =
    event.tag === "hunger"
      ? success
        ? parseInt(event.success)
        : parseInt(event.failure)
      : 0;
  const thirstChange =
    event.tag === "thirst"
      ? success
        ? parseInt(event.success)
        : parseInt(event.failure)
      : 0;
  const stressChange =
    event.tag === "stress"
      ? success
        ? parseInt(event.success)
        : parseInt(event.failure)
      : 0;

  // 팀에 따라 setTeam1Result 또는 setTeam2Result 사용
  const updateResult = team_number == 1 ? setTeam1Result : setTeam2Result;

  updateResult((prevResult) => {
    const lastHunger = prevResult.hunger[index - 1] || 0;
    const lastThirst = prevResult.thirst[index - 1] || 0;
    const lastStress = prevResult.stress[index - 1] || 0;

    return {
      ...prevResult,
      used_item: prevResult.used_item.map((item, idx) =>
        idx === index ? (usedItem || "None") : item
      ),
      item_path: prevResult.item_path.map((path, idx) =>
        idx === index ? (usedItem ? `../../resource/${usedItem}.png` : "") : path
      ),
      event_result: prevResult.event_result.map((result, idx) =>
        idx === index ? (success ? "success" : "failure") : result
      ),
      required_item: prevResult.required_item.map((reqItem, idx) =>
        idx === index ? event.require_item : reqItem
      ),
      hunger: prevResult.hunger.map((hunger, idx) =>
        idx === index
          ? Math.max(0, Math.min(100, lastHunger + hungerChange + 10))
          : hunger
      ),
      thirst: prevResult.thirst.map((thirst, idx) =>
        idx === index
          ? Math.max(0, Math.min(100, lastThirst + thirstChange + 10))
          : thirst
      ),
      stress: prevResult.stress.map((stress, idx) =>
        idx === index
          ? Math.max(0, Math.min(100, lastStress + stressChange + 5))
          : stress
      ),
    };
  });
};


const SimulationResult: Component = () => {
  const navigate = useNavigate();
  const [selectedEvents, setSelectedEvents] = createSignal<EventData[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = createSignal(0);
  const maxEventIndex = 5;

  // 팀별 인벤토리 상태 관리
  const [team1Inventory, setTeam1Inventory] = createSignal({});
  const [team2Inventory, setTeam2Inventory] = createSignal({});

  const [itemsData, setItemsData] = createSignal<Record<string, string>>({});
  


  const fetchTeamData = async () => {
    try {
      // Fetch team bags data from the API
      const teamBags = await ky
      .get(`http://localhost:8000/host/room/${roomCode()}/bag_contents`)
      .json<Record<string, Record<string, number>>>();

      // Map the team data to create team statuses
      const teamStatuses = Object.entries(teamBags).map(([teamName, bagContents]) => {
        // Extract backpack details from the flattenedBagContents
        const { totalWeight, totalVolume, bagID, ...items } = bagContents;

        console.log(teamName);

        return [teamName, items];
      }).filter(Boolean); // Filter out any null results
      
      setTeam1Result((prev) => ({...prev,  team: teamStatuses[0][0]}));
      setTeam2Result((prev) => ({...prev,  team: teamStatuses[1][0]}));
      setTeam1Inventory(teamStatuses[0][1]);
      setTeam2Inventory(teamStatuses[1][1]);
      
      console.log("team1 name: ", team1Result().team, ", team2 name: ", team2Result().team);
      console.log("team1 inventory: ", team1Inventory());
      console.log("team2 inventory: ", team2Inventory());
    } catch (error) {
      console.error("Failed to fetch team data:", error);
    }}

  onMount(() => {
    fetchTeamData();
    generateEvents();
    loadItemsData();
    console.log(selectedEvents())
  
    // 자동으로 모든 이벤트를 순차적으로 처리
    setTimeout(() => {
      processAllEvents();
      setCurrentEventIndex(0);
      }, 
      200);
  });
  
  const processAllEvents = () => {
    const totalEvents = selectedEvents().length;
    let currentIndex = 0;
  
    const processEvent = () => {
      if (currentIndex < totalEvents) {
        console.log("---------------------------------------");
        console.log("current event: ", currentIndex, selectedEvents()[currentIndex]);
        console.log("team1Inventory: ", team1Inventory());
        console.log("team2Inventory: ", team2Inventory());
        
        const currentEvent = selectedEvents()[currentIndex];
        const requiredItem = currentEvent.require_item;
        console.log("requiredItem: ", requiredItem);
        
        const team1MatchedItems = checkInventory(currentIndex, team1Inventory(), requiredItem, itemsData());
        const team2MatchedItems = checkInventory(currentIndex, team2Inventory(), requiredItem, itemsData());

        updateTeamResult(currentIndex, 1, currentEvent, team1MatchedItems, team1Inventory());
        updateTeamResult(currentIndex, 2, currentEvent, team2MatchedItems, team2Inventory());
        
        // console.log("updated result: ", team1Result());
        // console.log("updated result: ", team2Result());

        currentIndex++;
        setCurrentEventIndex(currentIndex);
  
        // 다음 이벤트 처리 (약간의 딜레이 추가로 비동기 실행 느낌 제공)
        setTimeout(processEvent, 10); // 10ms 딜레이 후 다음 이벤트로 이동
      }
      else setCurrentEventIndex(0);
    };
  
    processEvent();
  };  

  const loadItemsData = async () => {
    try {
      const response = await fetch("../../Items.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet) as Array<{ name: string; tag: string }>;

      const organizedData: Record<string, string> = {};
      data.forEach((row) => {
        organizedData[row.name] = row.tag;
      });

      setItemsData(organizedData);
    } catch (error) {
      console.error("Failed to load items data:", error);
    }
  };

  const generateEvents = () => {
    const data = parseCSV(csvData);
    const fixedEvents = ["hunger", "thirst"];
    const randomCount = 4;
    const randomEvents = selectRandomEvents(data, fixedEvents, randomCount);
    setSelectedEvents(randomEvents);
  };

  // "다음 이벤트" 버튼 클릭 시 동작 수정
  const nextEvent = () => {
    setCurrentEventIndex((prev) => {
      const nextIndex = prev < selectedEvents().length - 1 ? prev + 1 : prev;
      return nextIndex;
    });
  };

  return (
    <div class="min-h-screen bg-neutral-950 container mx-auto p-4 font-sans">
      {/* Header */}
      <div class="flex justify-center flex-col items-center mt-2">
        <img
          src="../../resource/logo_horizon.png"
          alt="Disaster.io Logo"
          class="h-16 w-auto"
        />
        <div class="mt-2 text-center text-white text-2xl mb-4">시뮬레이션 결과</div>
      </div>

      {/* Event&Teams Section */}
      <div class="w-[70%] flex mx-auto gap-x-6 items-stretch">
        {/* Event Section */}
        <div class="w-[40%] flex-1 bg-gray-800 shadow-md rounded-lg pt-2 pb-4 px-4 mb-2 flex flex-col">
          <h2 class="text-xl text-gray-200 font-bold mt-2 mb-2">{currentEventIndex() + 1}번째 이벤트 발생</h2>
          
          <div class="flex flex-col justify-center items-center">
          <img 
              src={selectedEvents()[currentEventIndex()]?.img_path || "../../resource/snacks.png"}
              alt="Action Icon" 
              class="h-50 my-6" 
            />
            <p class="text-lg text-gray-200 font-bold text-center">
              {selectedEvents()[currentEventIndex()]?.description || "이벤트를 로드 중..."}
            </p>
          </div>
        </div>

        {/* Teams Section */}
        <div class="w-[60%] flex flex-col gap-y-1">
          {/* team1 */}
          <div class="bg-gray-800 rounded-lg pt-2 py-4 pl-4 pr-6 mb-2 font-sans">
            <div class="flex justify-between items-center">
              <h2 class="text-xl text-gray-200 font-bold">{team1Result().team}</h2>
              
              <div class={`mt-1 px-3 pt-1 rounded-full text-base ${
                team1Result().event_result[currentEventIndex()] === 'success' ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}>
                {team1Result().event_result[currentEventIndex()] === 'success' ? "성공" : "실패"}
              </div>
            </div>

            <div class="flex items-center">
              <div class="flex flex-col text-base items-center ml-4 mr-8">
                <img
                  src={team1Result().item_path[currentEventIndex()] || "../../resource/none.png"}
                  alt={team1Result().used_item[currentEventIndex()] === "None" ? "아이템 없음" : team1Result().used_item[currentEventIndex()]}
                  class="h-20 w-20 object-contain mx-2 my-2"
                />
                <span class="text-sm text-gray-200">
                  {team1Result().used_item[currentEventIndex()] === "None" ? "아이템 없음" : `${team1Result().used_item[currentEventIndex()]} 사용`}
                </span>
              </div>

              <div class="flex-grow text-gray-200">
                <StatusBar
                  label="배고픔"
                  value={team1Result().hunger[currentEventIndex()]}
                  prevValue={team1Result().hunger[currentEventIndex()] - (team1Result().hunger[currentEventIndex()-1] || 0)}
                  maxValue={100}
                  id={`hunger-bar-team-${team1Result().team}`}
                />
                <StatusBar
                  label="목마름"
                  value={team1Result().thirst[currentEventIndex()]}
                  prevValue={team1Result().thirst[currentEventIndex()] - (team1Result().thirst[currentEventIndex()-1] || 0)}
                  maxValue={100}
                  id={`thirst-bar-team-${team1Result().team}`}
                />
                <StatusBar
                  label="스트레스"
                  value={team1Result().stress[currentEventIndex()]}
                  prevValue={team1Result().stress[currentEventIndex()] - (team1Result().stress[currentEventIndex()-1] || 0)}
                  maxValue={100}
                  id={`stress-bar-team-${team1Result().team}`}
                />
              </div>
            </div>
          </div>
          {/* team2 */}
          <div class="bg-gray-800 rounded-lg pt-2 py-4 pl-4 pr-6 mb-2 font-sans">
            <div class="flex justify-between items-center">
              <h2 class="text-xl text-gray-200 font-bold">{team2Result().team}</h2>
              
              <div class={`mt-1 px-3 pt-1 rounded-full text-base ${
                team2Result().event_result[currentEventIndex()] === 'success' ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}>
                {team2Result().event_result[currentEventIndex()] === 'success' ? "성공" : "실패"}
              </div>
            </div>

            <div class="flex text-gray-200 items-center">
              <div class="flex flex-col text-base items-center ml-4 mr-8">
                <img
                  src={team2Result().item_path[currentEventIndex()] || "../../resource/none.png"}
                  alt={team2Result().used_item[currentEventIndex()] === "None" ? "아이템 없음" : team2Result().used_item[currentEventIndex()]}
                  class="h-20 w-20 object-contain mx-2 my-2"
                />
                <span class="text-sm text-gray-200">
                  {team2Result().used_item[currentEventIndex()] === "None" ? "아이템 없음" : `${team2Result().used_item[currentEventIndex()]} 사용`}
                </span>
              </div>

              <div class="flex-grow text-gray-200">
                <StatusBar
                  label="배고픔"
                  value={team2Result().hunger[currentEventIndex()]}
                  prevValue={team2Result().hunger[currentEventIndex()] - (team2Result().hunger[currentEventIndex()-1] || 0)}
                  maxValue={100}
                  id={`hunger-bar-team-${team2Result().team}`}
                />
                <StatusBar
                  label="목마름"
                  value={team2Result().thirst[currentEventIndex()]}
                  prevValue={team2Result().thirst[currentEventIndex()] - (team2Result().thirst[currentEventIndex()-1] || 0)}
                  maxValue={100}
                  id={`thirst-bar-team-${team2Result().team}`}
                />
                <StatusBar
                  label="스트레스"
                  value={team2Result().stress[currentEventIndex()]}
                  prevValue={team2Result().stress[currentEventIndex()] - (team2Result().stress[currentEventIndex()-1] || 0)}
                  maxValue={100}
                  id={`stress-bar-team-${team2Result().team}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div class="my-4 flex justify-center">
        <div class="w-[68%] bg-gray-300 h-2 rounded-full relative flex mx-auto items-center">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <button 
              class={`
                absolute w-5 h-5 rounded-full border-1.5 transition-all duration-300
                ${index === (currentEventIndex() + 1)
                  ? 'bg-orange-400 border-orange-400 scale-125' 
                  : 'bg-gray-300 border-gray-300 hover:bg-orange-500'}
              `}
              style={{ 
                left: `${(index - 1) * 20}%`, 
                transform: 'translateX(-50%)' 
              }}
              onClick={() => setCurrentEventIndex(index-1)}
            />
          ))}
        </div>
      </div>

      {/* Conditional Next Event Button */}
      <Show
        when={currentEventIndex() < maxEventIndex}
        fallback={
          <div class="text-center">
            <button 
              class="bg-orange-400 text-black px-10 py-2.5 text-xl rounded-lg font-bold mt-4 hover:bg-orange-500 transition"
              onClick={() => navigate('/host/finalresult')}
            >
              최종 결과 확인
            </button>
          </div>
        }
      >
        <div class="text-center">
          <button 
            class="bg-orange-400 text-black px-10 py-2.5 text-xl rounded-lg font-bold mt-4 hover:bg-orange-500 transition"
            onClick={nextEvent}
          >
            다음 이벤트
          </button>
        </div>
      </Show>
    </div>
  );
};

export default SimulationResult;