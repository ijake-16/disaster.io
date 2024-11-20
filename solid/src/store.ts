import { createSignal } from 'solid-js';

const [roomCode, setRoomCode] = createSignal<string | null>(null);

export { roomCode, setRoomCode }; 