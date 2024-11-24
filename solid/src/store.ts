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

export { roomCode, updateRoomCode as setRoomCode }; 