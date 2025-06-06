export interface EventOption {
    id: number;
    name: string;
    description: string;
    requirements: number[][];
    score: number;
  }
  
  export const eventOptions: EventOption[] = [
    {
      "id": 1,
      "name": "hunger",
      "description": "배가 고프다.",
      "requirements": [
        [
          101,
          322
        ],
        [
          102
        ],
        [
          103
        ],
        [
          104
        ],
        [
          105
        ]
      ],
      "score": 20
    },
    {
      "id": 2,
      "name": "thurst",
      "description": "목이 마르다.",
      "requirements": [
        [
          201
        ],
        [
          202
        ],
        [
          203
        ]
      ],
      "score": 20
    },
    {
      "id": 3,
      "name": "where_are_others",
      "description": "가족들의 위치를 모르겠다.",
      "requirements": [
        [
          354
        ],
        [
          357
        ]
      ],
      "score": 20
    },
    {
      "id": 4,
      "name": "cover_mouth",
      "description": "먼지와 연기 때문에 숨을 쉬기 어렵다.",
      "requirements": [
        [
          201,
          301
        ],
        [
          314
        ]
      ],
      "score": 30
    },
    {
      "id": 5,
      "name": "winter_is_coming",
      "description": "너무 추운 것 같다.",
      "requirements": [
        [
          333
        ],
        [
          334
        ]
      ],
      "score": 20
    },
    {
      "id": 6,
      "name": "rainy",
      "description": "비가 많이 오고 있다.",
      "requirements": [
        [
          303
        ],
        [
          304
        ]
      ],
      "score": 20
    },
    {
      "id": 7,
      "name": "information",
      "description": "정보가 부족해 어디로 대피해야할지 모르겠다.",
      "requirements": [
        [
          351
        ],
        [
          352
        ],
        [
          353
        ],
        [
          359
        ]
      ],
      "score": 30
    },
    {
      "id": 8,
      "name": "ouch",
      "description": "가족 중 누군가가 다쳤다.",
      "requirements": [
        [
          313
        ],
        [
          315
        ]
      ],
      "score": 30
    },
    {
      "id": 9,
      "name": "privacy",
      "description": "개인 위생을 유지할 필요가 있어 보인다.",
      "requirements": [
        [
          311
        ],
        [
          312
        ]
      ],
      "score": 20
    },
    {
      "id": 10,
      "name": "sleep",
      "description": "너무 피곤해 잠을 자야할 것 같다.",
      "requirements": [
        [
          371
        ],
        [
          372
        ],
        [
          373
        ]
      ],
      "score": 20
    },
    {
      "id": 11,
      "name": "power_outage",
      "description": "전기가 완전히 끊겼다. 주변이 어두워지고 있다.",
      "requirements": [
        [
          341
        ],
        [
          342
        ],
        [
          343
        ],
        [
          344
        ]
      ],
      "score": 10
    },
    {
      "id": 12,
      "name": "injured_neighbor",
      "description": "이웃이 다쳐서 도움을 요청하고 있다.",
      "requirements": [
        [
          313
        ],
        [
          315
        ]
      ],
      "score": 20
    },
    {
      "id": 13,
      "name": "water_leak",
      "description": "대피 장소에 물이 새고 있다.",
      "requirements": [
        [
          301
        ],
        [
          302
        ],
        [
          303
        ],
        [
          304
        ],
        [
          305
        ]
      ],
      "score": 20
    }
  ];