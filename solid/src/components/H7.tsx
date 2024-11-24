import { Component, createSignal, Show, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { team1Result, team2Result} from "../store";
import * as XLSX from "xlsx"; // Items.xlsx 처리를 위해 사용

/////////////////////////////////////////////// 팀 이름 입력
team1Result().team = "팀1"
team2Result().team = "팀2"

  
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
hunger,../../resource/events/hunger.png,배가 고프다.,hunger,food,-10,0
thirst,../../resource/events/thirst.png,목이 마르다.,thirst,drink,-10,0
information,../../resource/events/information.png,재난 정보가 있으면 더 수월하게 대처할 수 있겠지.,stress,info,-5,5
floor_is_lava,../../resource/events/floor_is_lava.png,슬리퍼를 신고 나왔는데 길가에 잔해가 너무 많아.,stress,shoes,-10,10
ouch,../../resource/events/ouch.png,가족 중 누군가가 다쳤어.,stress,medical,0,15
rainy,../../resource/events/rainy.png,비가 많이 오네.,stress,waterproof,0,10
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


const StatusBar: Component<StatusBarProps> = (props: { label: any; value: number; maxValue: number; id: any; }) => {
  const getBarColor = (value: number) => {
    if (value <= 30) return 'bg-green-600';
    if (value <= 60) return 'bg-yellow-600';
    return 'bg-red-600';
    };

  return (
    <div class="mb-2 font-sans">
      <div class="flex text-sm mb-1">
        <span>{`${props.label}: ${props.value}`}</span>
        {/* <span class="text-red-500">{`${props.value}`}</span> */}
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

const TeamBox: Component<TeamBoxProps> = (props: {teamName: string, index: number}) => {
  const result = props.teamName === team1Result().team ? team1Result() : team2Result();
  
  // props 검증 (안전하게 디버깅)
  if (!result || props.index < 0 || props.index >= result.hunger.length) {
    console.log("이게 왜이러지....");
    console.error("Invalid props for TeamBox:", props);
    return <div>Invalid TeamBox Data</div>;
  }

  // 유효한 ID 생성 (공백, 특수문자 방지)
  const sanitizedTeamName = props.teamName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  
  // 현재 이벤트의 결과 상태 표시
  const eventResult = result.event_result[props.index];
  const usedItem = result.used_item[props.index];
  console.log("result === success", eventResult === 'success');
  return (
    <div class="bg-gray-200 border rounded-lg py-4 pl-4 pr-6 mb-4 font-sans">
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-xl font-bold">{props.teamName}</h2>
        
        <div class={`mt-1 px-3 py-1 rounded-full text-sm ${
          eventResult === 'success' ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
        }`}>
          {eventResult === 'success' ? "성공" : "실패"}
        </div>
      </div>

      <div class="flex items-center">
        <div class="flex flex-col items-center mr-6">
          <img
            src={result.item_path[props.index] || "../../resource/none.png"}
            alt={usedItem === "None" ? "사용 아이템 없음" : usedItem}
            class="h-20 w-20 object-contain ml-2 mb-2"
          />
          <span class="text-sm text-gray-600">
            {usedItem === "None" ? "사용 아이템 없음" : `${usedItem} 사용`}
          </span>
        </div>

        <div class="flex-grow">
          <StatusBar
            label="배고픔"
            value={result.hunger[props.index]}
            // prevValue={result.hunger[props.index] - (result.hunger[props.index-1] || 0)}
            maxValue={100}
            id={`hunger-bar-team-${sanitizedTeamName}`}
          />
          <StatusBar
            label="목마름"
            value={result.thirst[props.index]}
            // prevValue={result.hunger[props.index] - (result.hunger[props.index-1] || 0)}
            maxValue={100}
            id={`thirst-bar-team-${sanitizedTeamName}`}
          />
          <StatusBar
            label="스트레스"
            value={result.stress[props.index]}
            // prevValue={result.hunger[props.index] - (result.hunger[props.index-1] || 0)}
            maxValue={100}
            id={`stress-bar-team-${sanitizedTeamName}`}
          />
        </div>
      </div>
    </div>
  );
};

// 인벤토리 체크 함수
const checkInventory = (index: number, inventory: Record<string, number>, requiredItem: string, itemsData: Record<string, string>) => {
  const matchedItems: string[] = [];

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
  teamResult: Result,
  event: EventData,
  matchedItems: string[],
  inventory: Record<string, number>
) => {
  const usedItem = matchedItems.length > 0 ? matchedItems[0] : null;
  const success = !!usedItem;

  // 아이템 사용 시 인벤토리에서 차감
  if (usedItem && inventory[usedItem] > 0) {
    inventory[usedItem]--;
  }

  // 상태 변화 계산
  const hungerChange = event.tag === "hunger" ? 
    (success ? parseInt(event.success) : parseInt(event.failure)) : 0;
  const thirstChange = event.tag === "thirst" ? 
    (success ? parseInt(event.success) : parseInt(event.failure)) : 0;
  const stressChange = event.tag === "stress" ? 
    (success ? parseInt(event.success) : parseInt(event.failure)) : 0;

  // 결과 업데이트
  teamResult.used_item[index] = (usedItem || "None");
  teamResult.item_path[index] = (
    usedItem ? `../../resource/${usedItem}.png` : ""
  );
  teamResult.event_result[index] = (success ? "success" : "failure");
  teamResult.required_item[index] = (event.require_item);

  // 이전 상태값 가져오기
  const lastHunger = teamResult.hunger[index- 1] || 0;
  const lastThirst = teamResult.thirst[index - 1] || 0;
  const lastStress = teamResult.stress[index - 1] || 0;

  // 새로운 상태값 계산 및 저장
  teamResult.hunger[index] = (
    Math.max(0, Math.min(100, lastHunger + hungerChange + 10))
  );
  teamResult.thirst[index] = (
    Math.max(0, Math.min(100, lastThirst + thirstChange + 10))
  );
  teamResult.stress[index] = (
    Math.max(0, Math.min(100, lastStress + stressChange + 5))
  );
  console.log("last status:", lastHunger, lastThirst, lastStress);
  console.log("status change: ", hungerChange, thirstChange, stressChange);
  console.log("updated status:", lastHunger + hungerChange + 10, lastThirst + thirstChange + 10, lastStress + stressChange + 10);
};

const SimulationResult: Component = () => {
  const navigate = useNavigate();
  const [selectedEvents, setSelectedEvents] = createSignal<EventData[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = createSignal(0);
  const maxEventIndex = 5;

  // 팀별 인벤토리 상태 관리
  const [team1Inventory, setTeam1Inventory] = createSignal({
    "pants": 1, "water": 4, "lantern": 1, "tuna": 3
  });
  const [team2Inventory, setTeam2Inventory] = createSignal({
    "pants": 1, "water": 4, "lantern": 1, "tuna": 3
  });

  const [itemsData, setItemsData] = createSignal<Record<string, string>>({});

  onMount(() => {
    generateEvents();
    loadItemsData();
  
    // 자동으로 모든 이벤트를 순차적으로 처리
    processAllEvents();
    setCurrentEventIndex(0);
  });
  
  const processAllEvents = () => {
    const totalEvents = selectedEvents().length;
    let currentIndex = 0;
  
    const processEvent = () => {
      if (currentIndex < totalEvents) {
        console.log("---------------------------------------");
        console.log("current event: ", currentIndex, selectedEvents()[currentIndex]);
        console.log("team1Inventory: ", team1Inventory());
        
        const currentEvent = selectedEvents()[currentIndex];
        const requiredItem = currentEvent.require_item;
        console.log("requiredItem: ", requiredItem);
        
        const team1MatchedItems = checkInventory(currentIndex, team1Inventory(), requiredItem, itemsData());
        const team2MatchedItems = checkInventory(currentIndex, team2Inventory(), requiredItem, itemsData());
  
        updateTeamResult(currentIndex, team1Result(), currentEvent, team1MatchedItems, team1Inventory());
        updateTeamResult(currentIndex, team2Result(), currentEvent, team2MatchedItems, team2Inventory());
        
        console.log("updated result: ", team1Result());

        currentIndex++;
        setCurrentEventIndex(currentIndex);
  
        // 다음 이벤트 처리 (약간의 딜레이 추가로 비동기 실행 느낌 제공)
        setTimeout(processEvent, 10); // 10ms 딜레이 후 다음 이벤트로 이동
      }
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

  return (
    <div class="min-h-screen bg-neutral-950 container mx-auto p-4 font-sans">
      {/* Header */}
      <div class="flex justify-center flex-col items-center mb-6">
        <img
          src="../../resource/logo_horizon.png"
          alt="Disaster.io Logo"
          class="h-16 w-auto"
        />
        <div class="mt-4 text-center text-white text-2xl">시뮬레이션 결과</div>
      </div>

      {/* Event&Teams Section */}
      <div class="w-full flex gap-x-6 items-stretch">
        {/* Event Section */}
        <div class="w-[45%] flex-1 bg-gray-200 shadow-md rounded-lg p-4 mb-4 flex flex-col">
          <h2 class="text-xl font-bold mb-4">{currentEventIndex() + 1}번째 이벤트 발생</h2>
          
          <div class="flex flex-col justify-center items-center">
            <img 
              src={selectedEvents()[currentEventIndex()]?.img_path || "../../resource/snacks.png"}
              alt="Action Icon" 
              class="h-40 my-10" 
            />
            <p class="text-lg font-bold text-center">
              {selectedEvents()[currentEventIndex()]?.description || "이벤트를 로드 중..."}
            </p>
          </div>
        </div>

        {/* Teams Section */}
        <div class="w-[55%] flex flex-col gap-y-4">
          <TeamBox teamName={team1Result().team} index={currentEventIndex()}/> 
          <TeamBox teamName={team2Result().team} index={currentEventIndex()}/>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div class="my-4 flex justify-center">
        <div class="w-[99%] bg-gray-300 h-2 rounded-full relative flex items-center">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <button 
              class={`
                absolute w-5 h-5 rounded-full border-1.5 transition-all duration-300
                ${index === (currentEventIndex() + 1)
                  ? 'bg-amber-500 border-amber-500 scale-125' 
                  : 'bg-gray-300 border-gray-300 hover:bg-amber-600'}
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
              class="bg-amber-500 text-black px-10 py-2.5 text-lg rounded-lg font-bold mt-4 hover:bg-amber-600 transition"
              onClick={() => navigate('/host/finalresult')}
            >
              최종 결과 확인
            </button>
          </div>
        }
      >
        <div class="text-center">
          <button 
            class="bg-amber-500 text-black px-10 py-2.5 text-lg rounded-lg font-bold mt-4 hover:bg-amber-600 transition"
            onClick={setCurrentEventIndex((prev) => (prev < maxEventIndex ? prev + 1 : prev))}
          >
            다음 이벤트
          </button>
        </div>
      </Show>
    </div>
  );
};

export default SimulationResult;
