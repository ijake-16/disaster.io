import { createSignal } from 'solid-js';

const LOCAL_STORAGE_KEY = 'roomCode';

// Function to get room code from local storage
const getRoomCodeFromStorage = () => {
  return localStorage.getItem(LOCAL_STORAGE_KEY) || null;
};

// Function to set room code in local storage
const setRoomCodeInStorage = (code: string | null) => {
  if (code) {
    localStorage.setItem(LOCAL_STORAGE_KEY, code);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

// Initialize roomCode from local storage
const [roomCode, setRoomCode] = createSignal<string | null>(getRoomCodeFromStorage());

const updateRoomCode = (code: string | null) => {
  setRoomCodeInStorage(code);
  setRoomCode(code);
};

interface Result1 {
  team: string;
  used_item: string[];
  item_path: string[];
  event_result: string[];
  required_item: string[]; //각 이벤트에서 필요한 아이템 태그 저장
  hunger: number[];
  thirst: number[];
  stress: number[];
}

interface Result2 {
  team: string;
  used_item: string[];
  item_path: string[];
  event_result: string[];
  required_item: string[]; //각 이벤트에서 필요한 아���템 태그 저장
  hunger: number[];
  thirst: number[];
  stress: number[];
}

const initialResult1: Result1 = {
  team:"team1",
  used_item: Array(6).fill(""),
  item_path: Array(6).fill(""),
  event_result: Array(6).fill(""),
  required_item: Array(6).fill(""), //각 이벤트에서 필요한 아이템 태그 저장
  hunger: Array(6).fill(0),
  thirst: Array(6).fill(0),
  stress: Array(6).fill(0),
};

const initialResult2: Result2 = {
  team:"team2",
  used_item: Array(6).fill(""),
  item_path: Array(6).fill(""),
  event_result: Array(6).fill(""),
  required_item: Array(6).fill(""), //각 이벤트에서 필요한 아이템 태그 저장
  hunger: Array(6).fill(0),
  thirst: Array(6).fill(0),
  stress: Array(6).fill(0),
};

export const [team1Result, setTeam1Result] = createSignal<Result1>({ ...initialResult1 });
export const [team2Result, setTeam2Result] = createSignal<Result2>({ ...initialResult2 });

export { roomCode, updateRoomCode as setRoomCode };

// 아이템 정보 인터페이스 추가
interface ItemInfo {
  name: string;
  korName: string;
  description: string;
}

// 아이템 태그별 매핑 데이터와 상세 정보 추가
export const [itemTagMapping, setItemTagMapping] = createSignal<Record<string, string[]>>({
  'drink': [],
  'food': [],
  'medical': [],
  'info': [],
  'shoes': [],
  'waterproof': []
});

export const [itemDetails, setItemDetails] = createSignal<Record<string, ItemInfo>>({}); 