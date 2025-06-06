export interface ItemOption {
    id: number;
    korName: string;
    name: string;
    weight: number;
    volume: number;
    description: string;
  }
  
  export const itemOptions: ItemOption[] = [
    {
      "id": 101,
      "korName": "참치캔",
      "name": "tuna",
      "weight": 0.5,
      "volume": 0.5,
      "description": "단백질이 풍부한 비상식량으로, 오랫동안 보관이 가능합니다."
    },
    {
      "id": 102,
      "korName": "라면",
      "name": "ramen",
      "weight": 0.5,
      "volume": 1.0,
      "description": "빠르게 조리 가능한 간편식이지만, 물과 열이 필요합니다."
    },
    {
      "id": 103,
      "korName": "과자",
      "name": "snacks",
      "weight": 0.5,
      "volume": 1.0,
      "description": "간단한 포만감을 주는 간식이지만, 영양가는 낮습니다."
    },
    {
      "id": 104,
      "korName": "비상 식량 바",
      "name": "Emergency Food Bar",
      "weight": 0.2,
      "volume": 0.3,
      "description": "고칼로리로 장기간 보존 가능한 비상용 식량입니다."
    },
    {
      "id": 105,
      "korName": "비상 식량 키트",
      "name": "Emergency Food Kit",
      "weight": 2.0,
      "volume": 4.0,
      "description": "다양한 비상 식량과 물이 포함된 종합 식량 키트입니다."
    },
    {
      "id": 201,
      "korName": "생수",
      "name": "water",
      "weight": 1.0,
      "volume": 1.0,
      "description": "생존에 필수적인 깨끗한 식수입니다."
    },
    {
      "id": 202,
      "korName": "이온 음료",
      "name": "Ionic Drink",
      "weight": 1.2,
      "volume": 0.8,
      "description": "수분과 전해질 섭취에 특화된 이온 음료입니다."
    },
    {
      "id": 203,
      "korName": "정수 알약",
      "name": "Water Purification Tablets",
      "weight": 0.1,
      "volume": 0.1,
      "description": "오염된 물을 마실 수 있게 정화해주는 휴대용 정수제입니다."
    },
    {
      "id": 301,
      "korName": "수건",
      "name": "towel",
      "weight": 0.5,
      "volume": 1.0,
      "description": "다용도로 활용 가능한 필수품으로, 청결 유지에 도움을 줍니다."
    },
    {
      "id": 302,
      "korName": "지퍼백",
      "name": "zipbags",
      "weight": 0.1,
      "volume": 0.1,
      "description": "음식과 중요한 물건들을 습기로부터 보호할 수 있는 유용한 수납도구입니다."
    },
    {
      "id": 303,
      "korName": "우의",
      "name": "raincoat",
      "weight": 2.0,
      "volume": 2.0,
      "description": "비와 습기로부터 몸을 보호하는 방수 의류입니다."
    },
    {
      "id": 304,
      "korName": "우산",
      "name": "umbrella",
      "weight": 1.0,
      "volume": 3.0,
      "description": "비를 피할 수 있지만, 강한 바람에는 취약합니다."
    },
    {
      "id": 305,
      "korName": "방수 문서 보관함",
      "name": "Waterproof Document Case",
      "weight": 0.3,
      "volume": 1.0,
      "description": "중요 서류를 물과 화재로부터 보호하는 특수 보관함입니다."
    },
    {
      "id": 311,
      "korName": "치약",
      "name": "paste",
      "weight": 0.5,
      "volume": 0.5,
      "description": "구강 위생을 유지하여 스트레스를 감소시키는 데 도움을 줍니다."
    },
    {
      "id": 312,
      "korName": "전동칫솔",
      "name": "ebrush",
      "weight": 0.5,
      "volume": 0.5,
      "description": "효율적인 양치질로 구강 위생을 관리할 수 있지만, 배터리가 필요합니다."
    },
    {
      "id": 313,
      "korName": "응급처치키트",
      "name": "firstaid",
      "weight": 3.0,
      "volume": 4.0,
      "description": "기본적인 부상을 치료할 수 있는 의료용품 세트입니다."
    },
    {
      "id": 314,
      "korName": "방독 마스크",
      "name": "Gas Mask",
      "weight": 0.5,
      "volume": 2.0,
      "description": "유해 가스와 미세 입자로부터 호흡기를 보호하는 안전 장비입니다."
    },
    {
      "id": 315,
      "korName": "응급 처치 매뉴얼",
      "name": "First Aid Manual",
      "weight": 0.3,
      "volume": 0.5,
      "description": "다양한 부상에 대한 응급 처치법이 설명된 휴대용 가이드북입니다."
    },
    {
      "id": 321,
      "korName": "믹스커피",
      "name": "coffee",
      "weight": 0.5,
      "volume": 0.5,
      "description": "카페인 섭취로 피로도를 감소시키고 정신을 맑게 해줍니다."
    },
    {
      "id": 322,
      "korName": "캔따개",
      "name": "opener",
      "weight": 0.5,
      "volume": 0.5,
      "description": "통조림을 열 수 있게 해주는 필수 도구입니다."
    },
    {
      "id": 331,
      "korName": "운동화",
      "name": "shoes",
      "weight": 1.0,
      "volume": 3.0,
      "description": "발을 보호하고 빠른 이동을 가능하게 하는 필수 아이템입니다."
    },
    {
      "id": 332,
      "korName": "바지",
      "name": "pants",
      "weight": 1.0,
      "volume": 2.0,
      "description": "체온 유지와 신체 보호에 도움을 주는 기본 의류입니다."
    },
    {
      "id": 333,
      "korName": "스웨터",
      "name": "sweater",
      "weight": 0.5,
      "volume": 2.0,
      "description": "추위를 막아주고 체온을 유지시켜주는 따뜻한 의류입니다."
    },
    {
      "id": 334,
      "korName": "점퍼",
      "name": "jumper",
      "weight": 2.0,
      "volume": 2.0,
      "description": "추위와 바람을 막아주는 실용적인 외투입니다."
    },
    {
      "id": 341,
      "korName": "라이터",
      "name": "lighter",
      "weight": 0.1,
      "volume": 0.1,
      "description": "불을 피울 수 있어 음식 조리나 야간 조명으로 활용 가능합니다."
    },
    {
      "id": 342,
      "korName": "랜턴",
      "name": "lantern",
      "weight": 3.0,
      "volume": 2.0,
      "description": "어둠을 밝혀주는 필수품이지만, 배터리가 필요합니다."
    },
    {
      "id": 343,
      "korName": "방수 성냥",
      "name": "Waterproof Matches",
      "weight": 0.1,
      "volume": 0.1,
      "description": "습한 환경에서도 불을 피울 수 있는 특수 제작된 성냥입니다."
    },
    {
      "id": 344,
      "korName": "손전등 헤드랜턴",
      "name": "Headlamp",
      "weight": 0.2,
      "volume": 0.3,
      "description": "양손을 자유롭게 사용할 수 있는 머리에 착용하는 조명 도구입니다."
    },
    {
      "id": 351,
      "korName": "라디오",
      "name": "radio",
      "weight": 3.0,
      "volume": 1.0,
      "description": "재난 정보와 뉴스를 실시간으로 수신할 수 있는 중요한 통신 도구입니다."
    },
    {
      "id": 352,
      "korName": "휴대폰",
      "name": "phone",
      "weight": 1.0,
      "volume": 0.5,
      "description": "통신과 정보 검색이 가능하지만, 배터리와 통신망이 필요합니다."
    },
    {
      "id": 353,
      "korName": "방재 가이드북",
      "name": "Disaster Guide",
      "weight": 0.5,
      "volume": 1.0,
      "description": "다양한 재난 상황별 대처법이 상세히 설명된 휴대용 가이드북입니다."
    },
    {
      "id": 354,
      "korName": "호루라기",
      "name": "Whistle",
      "weight": 0.1,
      "volume": 0.1,
      "description": "위험 상황에서 구조대에게 위치를 알릴 수 있는 필수 신호 도구입니다."
    },
    {
      "id": 355,
      "korName": "다용도 생존 도구",
      "name": "Multi-tool",
      "weight": 0.3,
      "volume": 0.2,
      "description": "칼, 가위, 드라이버 등 여러 도구가 결합된 휴대용 생존 도구입니다."
    },
    {
      "id": 356,
      "korName": "태양광 충전기",
      "name": "Solar Charger",
      "weight": 0.5,
      "volume": 1.0,
      "description": "태양 에너지로 전자기기를 충전할 수 있는 친환경 충전기입니다."
    },
    {
      "id": 357,
      "korName": "비상 사이렌",
      "name": "Emergency Siren",
      "weight": 0.2,
      "volume": 0.3,
      "description": "위험 상황에서 주변에 경고를 알리는 강력한 경보 장치입니다."
    },
    {
      "id": 358,
      "korName": "다목적 로프",
      "name": "Multi-purpose Rope",
      "weight": 0.5,
      "volume": 1.0,
      "description": "구조, 고정, 운반 등 다양한 용도로 활용 가능한 튼튼한 로프입니다."
    },
    {
      "id": 359,
      "korName": "방재 지도",
      "name": "Disaster Map",
      "weight": 0.2,
      "volume": 0.5,
      "description": "지역의 대피소와 위험 지역이 표시된 상세한 지도입니다."
    },
    {
      "id": 360,
      "korName": "방수 통신기",
      "name": "Waterproof Radio",
      "weight": 1.0,
      "volume": 1.5,
      "description": "물에 젖어도 작동하는 비상 통신용 라디오입니다."
    },
    {
      "id": 361,
      "korName": "생존 팔찌",
      "name": "Survival Bracelet",
      "weight": 0.1,
      "volume": 0.1,
      "description": "로프, 나침반 등 여러 생존 도구가 결합된 착용형 팔찌입니다."
    },
    {
      "id": 371,
      "korName": "침낭",
      "name": "sleepbag",
      "weight": 2.0,
      "volume": 3.0,
      "description": "야외에서도 안전하게 휴식을 취할 수 있게 해주는 침구입니다."
    },
    {
      "id": 372,
      "korName": "비상용 담요",
      "name": "Emergency Blanket",
      "weight": 0.2,
      "volume": 0.5,
      "description": "체온 유지에 효과적인 얇고 가벼운 특수 소재 담요입니다."
    },
    {
      "id": 373,
      "korName": "비상용 텐트",
      "name": "Emergency Tent",
      "weight": 1.5,
      "volume": 3.0,
      "description": "빠르게 설치 가능한 가벼운 비상 대피용 텐트입니다."
    },
    {
      "id": 381,
      "korName": "담배",
      "name": "cigs",
      "weight": 0.3,
      "volume": 0.5,
      "description": "스트레스를 일시적으로 해소시켜주지만, 건강에는 해로운 아이템입니다."
    },
    {
      "id": 382,
      "korName": "지갑",
      "name": "wallet",
      "weight": 0.5,
      "volume": 0.5,
      "description": "현금과 신분증을 보관할 수 있어 비상시에 유용합니다."
    }
  ];