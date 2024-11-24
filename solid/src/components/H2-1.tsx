import { Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { roomCode } from '../store'; // 글로벌 상태 임포트
import logoImage from '../../resource/logo.png';

const NoticeRoom: Component = () => {
  const navigate = useNavigate();
  const currentRoomCode = roomCode(); // 배열 구조 분해 할당으로 방 코드 가져오기

  return (
    <div class="min-h-screen bg-gray-800 text-white flex justify-center items-center">
      <div class="flex flex-col justify-center items-center w-[90%] max-w-[600px] p-5 bg-gray-700 rounded-lg shadow-lg">
        <div class="max-w-screen-xl mx-auto flex flex-col items-center">
          <img
            src={logoImage}
            alt="Disaster.io Logo"
            class="h-32 w-auto mb-2"
          />
        </div>
        
        <p class="text-lg text-gray-300 mb-8 max-w-[80%] leading-relaxed">
          화면 공유를 통해 다른 참가자들이 이 화면을 볼 수 있도록 설정하세요.
          아래의 방 코드로 참가자들이 입장할 수 있습니다.
        </p>

        <div class="text-6xl text-amber-500 font-bold py-5 px-10 bg-gray-800 border-3 border-amber-500 rounded-lg mb-5 tracking-widest">
          {currentRoomCode || '882910'} {/* 방 코드가 없으면 기본값 사용 */}
        </div>

        <div class="mt-5">
          <button
            onClick={() => navigate('/host/waiting')}
            class="bg-amber-500 text-black px-10 py-4 rounded font-bold text-xl hover:bg-amber-600 transition-colors"
          >
            다음으로
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeRoom;