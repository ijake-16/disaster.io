import { createSignal } from 'solid-js';

function S2() {
    const [teamName, setTeamName] = createSignal('');

    const handleConnect = () => {
        window.location.href = '/waiting';
    };

    return (
        <div class="flex justify-center items-center h-screen bg-neutral-950 text-white">
            <div class="container text-center">
                <h1 class="font-sans Arial text-4xl mb-0">Disaster.io</h1>
                <div class="subtitle text-lg text-gray-400 mt-2 mb-8">
                    한국형 생존 대비 시뮬레이션
                </div>
                
                <div class="prompt text-lg mb-4">팀명을 정해주세요</div>
                <input 
                    class="team-name bg-gray-200 text-black w-64 p-2 mx-auto rounded font-bold" 
                    placeholder="꿈돌이와넙죽이" 
                    value={teamName()} 
                    onInput={(e) => setTeamName(e.currentTarget.value)} 
                />
                <div></div>
                
                <button 
                    class="connect-button bg-yellow-500 text-black py-2 px-8 mt-5 rounded" 
                    onClick={handleConnect}
                >
                    접속하기
                </button>
            </div>
        </div>
    );
}

export default S2; 