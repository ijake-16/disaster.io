// CSV 데이터를 파싱하고 정리하는 함수
function parseCSV(csvData) {
    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",");
    const organizedData = {};
  
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });
      organizedData[rowData["name"]] = rowData;
    }
  
    return organizedData;
  }
  
// 무작위 이벤트 선택 함수
function selectRandomEvents(data, fixedEvents, randomCount) {
    // 고정 이벤트 포함
    const selectedEvents = [...fixedEvents];
  
    // 모든 이벤트 키 가져오기
    const allKeys = Object.keys(data);
  
    // 고정 이벤트를 제외한 나머지 이벤트 키 가져오기
    const remainingKeys = allKeys.filter((key) => !fixedEvents.includes(key));
  
    // 나머지 중에서 랜덤으로 이벤트 선택
    while (selectedEvents.length < fixedEvents.length + randomCount) {
      const randomIndex = Math.floor(Math.random() * remainingKeys.length);
      const randomKey = remainingKeys[randomIndex];
  
      if (!selectedEvents.includes(randomKey)) {
        selectedEvents.push(randomKey);
      }
    }
  
    // 선택된 이벤트를 무작위로 섞기
    for (let i = selectedEvents.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [selectedEvents[i], selectedEvents[randomIndex]] = [
        selectedEvents[randomIndex],
        selectedEvents[i],
      ];
    }
    
    // 객체를 JSON 문자열로 변환하여 보기 쉽게 출력
    alert(JSON.stringify(selectedEvents, null, 2));
    // 섞인 이벤트 반환
    return selectedEvents.map((key) => data[key]);
}
  
// 테스트용 CSV 데이터
const csvData = `
name,description,tag,condition,require_item,success,failure
hunger,배가 고프다.,food,,food,hunger_down:x (음식 아이템에 따라 다를듯),None
thirst,목이 마르다.,drink,,food,hunger_down:x (음료 아이템에 따라 다를 듯),None
too_dark,전기가 들어오지 않아서 너무 어두운걸.,stress,,electronics,stress_down:10,itemtag_loss:electronics
floor_is_lava,슬리퍼를 신고 나왔는데 길가에 잔해가 너무 많아.,stress,,clothing,stress_down:10+hunger_down:10,stress_up:10+hunger_up:10
winter_is_coming,너무 추운 것 같아.,stress,,clothing,stress_down:10,stress_up:5
rainy,비가 많이 오네.,stress,,medical,None,time_up:10
information,재난 정보가 있으면 더 수월하게 대처할 수 있겠지.,time,,electronics,stress_down:5,stress_up:5
ouch,가족 중 누군가가 다쳤어.,stress,,medical,None,stress_up:15
`;
  
// 버튼 클릭 이벤트
document.getElementById("generateButton").addEventListener("click", function () {
    // CSV 데이터를 파싱
    const data = parseCSV(csvData);
  
    // 고정 이벤트 (1번째와 2번째 이벤트)
    const fixedEvents = ["hunger", "thirst"];
  
    // 총 3개의 임의 이벤트 추가 (5개로 만들기)
    const randomCount = 3;
  
    // 무작위로 선택된 이벤트 데이터
    const randomEvents = selectRandomEvents(data, fixedEvents, randomCount);
  
    // 결과 출력
    console.log("선택된 이벤트:", randomEvents);
});
  
  
//   // HTML에 버튼 추가 (테스트용)
//   document.body.innerHTML = `
//     <button id="generateButton">이벤트 생성</button>
//   `;