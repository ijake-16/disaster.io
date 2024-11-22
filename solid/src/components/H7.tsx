import { Component, createSignal, Show, onMount } from 'solid-js';

interface EventData {
  name: string;
  description: string;
  tag: string;
  condition: string;
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
name,description,tag,condition,require_item,success,failure
hunger,배가 고프다.,food,,food,hunger_down:x (음식 아이템에 따라 다를듯),None
thirst,목이 마르다.,drink,,food,hunger_down:x (음료 아이템에 따라 다를 듯),None
floor_is_lava,슬리퍼를 신고 나왔는데 길가에 잔해가 너무 많아.,stress,,clothing,stress_down:10+hunger_down:10,stress_up:10+hunger_up:10
rainy,비가 많이 오네.,stress,,medical,None,time_up:10
information,재난 정보가 있으면 더 수월하게 대처할 수 있겠지.,time,,electronics,stress_down:5,stress_up:5
ouch,가족 중 누군가가 다쳤어.,stress,,medical,None,stress_up:15
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

const TeamBox: Component = () => {
  const [hunger, setHunger] = createSignal(0);
  const [thirst, setThirst] = createSignal(0);
  const [stress, setStress] = createSignal(0);

  return (
    <div class="bg-gray-200 border rounded-lg pt-4 pl-4 pr-6 mb-4">
      <h2 class="text-xl font-bold">지민핑</h2>
      
      <div class="flex items-center">
        <img 
          src="/resource/wallet.png" 
          alt="Backpack" 
          class="w-25 h-25 mr-4"
        />
        
        <div class="flex-grow">
          <StatusBar 
            label="배고픔" 
            value={hunger()} 
            maxValue={100} 
            id="hunger-bar-team1"
          />
          <StatusBar 
            label="목마름" 
            value={thirst()} 
            maxValue={100} 
            id="thirst-bar-team1"
          />
          <StatusBar 
            label="스트레스" 
            value={stress()} 
            maxValue={100} 
            id="stress-bar-team1"
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
    //alert(JSON.stringify(randomEvents.map(event => event.name), null, 2));

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
      <div class="flex gap-x-6 items-stretch">
        {/* Event Section */}
        <div class="flex-1 bg-gray-200 shadow-md rounded-lg p-4 mb-4 flex flex-col">
          <h2 class="text-xl font-bold mb-4">{currentEventIndex() + 1}번째 이벤트 발생</h2>
          
          <div class="flex flex-1 flex-col justify-center items-center">
            <img 
              src="/resource/snacks.png" 
              alt="Action Icon" 
              class="w-45 h-45 mb-16"
            />
            <p class="text-lg font-bold text-center">
              {selectedEvents()[currentEventIndex()]?.description || "이벤트를 로드 중..."}
            </p>
          </div>
        </div>

        {/* Teams Section */}
        <div class="flex-1 flex flex-col gap-y-1 shadow-md rounded-lg">
          <TeamBox />
          <TeamBox />
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
          <div class="text-center text-gray-500 mt-4">
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
