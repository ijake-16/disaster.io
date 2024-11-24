import { Component, createSignal, Show, onMount } from 'solid-js';
import { team1Result, team2Result } from "../store";

interface EventData {
  name: string;
  img_path: string;
  description: string;
  tag: string;
  require_item: string;
  success: number;
  failure: number;
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
  hunger: number[];
  thirst: number[];
  stress: number[];
}

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
  const selectedEvents: EventData[] = []; // 선택된 이벤트들을 저장할 배열
  const allKeys = Object.keys(data); // 전체 데이터의 키 목록
  const remainingKeys = allKeys.filter((key) => !fixedEvents.includes(key)); // 고정된 이벤트 제외

  // 고정 이벤트 먼저 선택
  fixedEvents.forEach((key) => {
    const event = data[key];
    if (event) selectedEvents.push(event); // 해당 이벤트가 존재할 경우에만 추가
  });

  // 랜덤 이벤트를 선택
  while (selectedEvents.length < fixedEvents.length + randomCount) {
    const randomIndex = Math.floor(Math.random() * remainingKeys.length);
    const randomKey = remainingKeys[randomIndex];
    const event = data[randomKey]; // 해당 키에 대한 이벤트 데이터

    // 유효한 이벤트만 추가
    if (event && !selectedEvents.includes(event)) {
      selectedEvents.push(event);
    }
  }

  // 선택된 이벤트들을 무작위로 섞기
  for (let i = selectedEvents.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [selectedEvents[i], selectedEvents[randomIndex]] = [
      selectedEvents[randomIndex],
      selectedEvents[i]
    ];
  }

  return selectedEvents;
};

// 테스트용 CSV 데이터
const csvData = `
name,img_path,description,tag,require_item,success,failure
hunger,../../resource/events/hunger.png,배가 고프다.,hunger,food,-10,
thirst,../../resource/events/thirst.png,목이 마르다.,thirst,drink,-10,
information,../../resource/events/information.png,재난 정보가 있으면 더 수월하게 대처할 수 있겠지.,stress,info,-5,5
floor_is_lava,../../resource/events/floor_is_lava.png,슬리퍼를 신고 나왔는데 길가에 잔해가 너무 많아.,stress,shoes,-10,10
ouch,../../resource/events/ouch.png,가족 중 누군가가 다쳤어.,stress,medical,,15
rainy,../../resource/events/rainy.png,비가 많이 오네.,stress,waterproof,,10
`.trim();

const StatusBar: Component<StatusBarProps> = (props: { label: any; value: number; maxValue: number; id: any; }) => {
  return (
    <div class="mb-2">
      <div class="flex justify-between text-sm mb-1">
        <span>{props.label}</span>
        <span>{`${props.value/props.maxValue*100}%`}</span>
      </div>
      <div class="w-full bg-gray-400 rounded-full h-2.5">
        <div 
          id={props.id} 
          class="bg-blue-600 h-2.5 rounded-full" 
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
    console.error("Invalid props for TeamBox:", props);
    return <div>Invalid TeamBox Data</div>;
  }

  // 유효한 ID 생성 (공백, 특수문자 방지)
  const sanitizedTeamName = props.teamName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

  return (
    <div class="bg-gray-200 border rounded-lg pt-4 pl-4 pr-6 mb-4">
      <h2 class="text-xl font-bold">{props.teamName}</h2>

      <div class="flex items-center">
        <img
          src={result.item_path[props.index] || "/default-path.png"} // 기본 경로 추가
          alt={result.used_item[props.index] || "Unknown Item"} // 기본 alt 추가
          class="h-25 ml-2 mr-6"
        />

        <div class="flex-grow">
          <StatusBar
            label="배고픔"
            value={result.hunger[props.index]}
            maxValue={100}
            id={`hunger-bar-team-${sanitizedTeamName}`}
          />
          <StatusBar
            label="목마름"
            value={result.thirst[props.index]}
            maxValue={100}
            id={`thirst-bar-team-${sanitizedTeamName}`}
          />
          <StatusBar
            label="스트레스"
            value={result.stress[props.index]}
            maxValue={100}
            id={`stress-bar-team-${sanitizedTeamName}`}
          />
        </div>
      </div>
    </div>
  );
};

const SimulationResult: Component = () => {
  const [selectedEvents, setSelectedEvents] = createSignal<EventData[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = createSignal(0);
  const maxEventIndex = 5; // Adjust based on the total number of events
  // const { team1Result, team2Result } = getTeamResult(); // 팀 결과 가져오기

  // Generate events when the component mounts
  onMount(() => {
    generateEvents();
  });

  const generateEvents = () => {
    const data = parseCSV(csvData);
    
    const fixedEvents = ["hunger", "thirst"]; // Fixed events (first and second events)
    const randomCount = 4; // Add 3 random events to make a total of 5
    const randomEvents = selectRandomEvents(data, fixedEvents, randomCount); // Randomly select event data
    
    setSelectedEvents(randomEvents); // Update selected events state

    console.log("선택된 이벤트 이름:", randomEvents.map(event => event.name));
    //alert(JSON.stringify(randomEvents.map(event => event.img_path), null, 2));
  };

  const handleNextEvent = () => {
    setCurrentEventIndex((prev) => (prev < maxEventIndex ? prev + 1 : prev));
  };

  return (
    <div class="min-h-screen bg-gray-800 container mx-auto p-4">
    {/*</div><div class="min-h-screen bg-gray-800 text-white flex flex-col items-center pt-5">*/}
      {/* Header */}
      <div class="mb-5 text-center text-white">
        <h1 class="text-4xl font-bold mb-2">Disaster.io</h1>
        <div class="text-lg">시뮬레이션 결과</div>
      </div>

      {/* Event&Teams Section */}
      <div class="w-full flex gap-x-6 items-stretch">
        {/* Event Section */}
        <div class="w-[40%] flex-1 bg-gray-200 shadow-md rounded-lg p-4 mb-4 flex flex-col">
          <h2 class="text-xl font-bold mb-4">{currentEventIndex() + 1}번째 이벤트 발생</h2>
          
          <div class="flex flex-col justify-center items-center">
            <img 
              src={selectedEvents()[currentEventIndex()]?.img_path || "../../resource/snacks.png"}
              alt="Action Icon" 
              class="h-40 mb-10" 
            />
            <p class="text-lg font-bold text-center">
              {selectedEvents()[currentEventIndex()]?.description || "이벤트를 로드 중..."}
            </p>
          </div>
        </div>

        {/* Teams Section */}
        <div class="w-[60%] flex flex-col gap-y-4">
          <TeamBox 
            teamName="팀1" 
            index={currentEventIndex()} // 현재 이벤트 인덱스에 따라 상태 변화
          />
          <TeamBox 
            teamName="팀2" 
            index={currentEventIndex()} // 현재 이벤트 인덱스에 따라 상태 변화
          />
        </div>
      </div>

      {/* Interactive Timeline */}
      <div class="my-4 flex justify-center">
        <div class="w-[99%] bg-gray-300 h-2 rounded-full relative flex items-center">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <button 
              class={`
                absolute w-5 h-5 rounded-full border-1.5 transition-all duration-300
                ${index === (currentEventIndex()+1)
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
          <div class="text-center text-gray-500 mt-12">
            마지막 이벤트입니다.
          </div>
        }
      >
        <div class="text-center">
          <button 
            class="bg-amber-500 text-black px-10 py-2.5 text-lg rounded-lg font-bold mt-4 hover:bg-amber-600 transition"
            onClick={handleNextEvent}
          >
            다음 이벤트
          </button>
        </div>
      </Show>
    </div>
  );
};

export default SimulationResult;
