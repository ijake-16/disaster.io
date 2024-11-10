import { createSignal } from 'solid-js';

function S2() {
    const [teamName, setTeamName] = createSignal('');

    const handleConnect = () => {
        window.location.href = 's3_waiting.html';
    };

    return (
        <div class="container" style={{ 'text-align': 'center' }}>
            <h1>Disaster.io</h1>
            <div class="subtitle">한국형 생존 대비 시뮬레이션</div>
            
            <div class="prompt">팀명을 정해주세요</div>
            <input 
                class="team-name" 
                placeholder="꿈돌이와넙죽이" 
                value={teamName()} 
                onInput={(e) => setTeamName(e.currentTarget.value)} 
            />
            <div></div>
            
            <button class="connect-button" onClick={handleConnect}>접속하기</button>
        </div>
    );
}

export default S2; 