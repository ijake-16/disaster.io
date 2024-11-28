# 가방으로 살아남기 (Surviving with a Bag)

💡  **가방으로 살아남기**는 게임 요소로 재난 교육의 효과를 높이는 **웹 기반 교육 게임**입니다. 재난 상황에서 생존 가방을 준비하고, 시뮬레이션을 통해 생존 전략을 테스트하고 피드백하는 단계로 구성되어 있습니다.

**💡 *Surviving with a Bag*** is a **web-based educational game** designed to enhance disaster education through gamification. It focuses on preparing survival bags, testing survival strategies through simulations, and providing feedback.

![logo_image.png](logo_image.png)

## 팀 소개 (Team Introduction)

### 팀원 (Team Members)
- **김정빈(Jungbin Kim)** - KAIST 전산학부 20학번
    - 팀장, 기획 및 개발 (Team Leader, Planning and Development)
    - ✉️ Mail: [jake16@kaist.ac.kr](mailto:jake16@kaist.ac.kr) | GitHub: ijake-16
- **윤지훈(Jihoon Yoon)** - KAIST 전기및전자공학부 20학번
    - 기획 및 개발 (Planning and Development) | GitHub: younjihoon
    - ✉️ Mail: [kjm10122@gmail.com](mailto:kjm10122@gmail.com)
- **김지민(Jimin Kim)** - KAIST 전산학부 21학번
    - 기획 및 개발 (Planning and Development) | GitHub: VVictorVV
    - ✉️ Mail: [jihoon9835@gmail.com](mailto:jihoon9835@gmail.com)
- **이재현(Jaehyeon Lee)** - KAIST 전산학부 22학번
    - 기획 및 개발 (Planning and Development) | GitHub: jaedungg
    - ✉️ Mail: [jh5323565@kaist.ac.kr](mailto:jh5323565@kaist.ac.kr) [jh5323565@gmail.com](mailto:jh5323565@gmail.com)
- **임자영(Jayeong Im)** - KAIST 산업디자인학과 22학번
    - 기획 및 디자인 (Planning and Design)
    - ✉️ Mail: [bagjay@kaist.ac](mailto:bagjay@kaist.ac) | GitHub: Gomchiiii
- **황보민석(Minseok Hwangbo)** - KAIST 전산학부 23학번
    - 기획 및 개발 (Planning and Development)
    - ✉️ Mail: [ecobrick@kaist.ac.kr](mailto:ecobrick@kaist.ac.kr) | GitHub: hwangbominseok

### 펠로우 및 멘토 (Fellow & Mentor)
- **Fellow : 더프라미스 김동훈 펠로우님** (Donghoon Kim @ The Promise): Organization Website
- **Mentor : 카카오페이 이상은 멘토님** (Sangeun Lee @ Kakaopay): 멘토 연락처 또는 링크

## 프로젝트 개요 (Project Overview)

 
### 문제 정의 (Problem Statement)

재난 안전 교육에 대한 인식이 부정적이고, 한국 상황에 맞는 효과적인 교육 자료가 부족함.

1. 한국의 재난 안전 교육이 ‘평상시의 사전 준비 → 재난 발생 시→ 복구 →  복구 후’의 4단계 중 재난 발생 시의 **응급 대응에 치중**되어 있으며, 재해 중 자연재해의 비중이 크지 않음.
2. 한국의 방재 교육은 일방적인 **강의식 전달**에 그치며, 대부분의 교육 자료가 교재나 동영상 위주로, **학습자 참여가 부족**하고 실질적인 대처 능력을 기르는 데에 한계가 있음.
3. 일본과 홍콩의 재해 교육 게임 프로그램이 재해에 대한 인식과 재난 대처에 대한 관심을 높이는 작용을 함 ⇒ **재미 요소를 이용한 재난 안전 교육**이 효과적일 것.

There is a negative perception of disaster safety education in Korea, and effective educational materials tailored to the local context are lacking.

1. Korea’s disaster safety education focuses primarily on emergency response during disasters while neglecting other phases such as preparedness, recovery, and post-recovery. Additionally, natural disasters account for a relatively small portion of disasters in Korea.
2. Korean disaster education relies heavily on one-way lectures, with most materials being textbooks or videos, which fail to engage participants and foster practical skills.
3. Disaster education programs in Japan and Hong Kong have proven effective in raising awareness and interest in disaster response through gamification, suggesting that incorporating fun elements into disaster safety education could be impactful.

### 해결책 (Solution)

- **목표**
    - **교육자가 효과적으로 방재 교육을 할 수 있도록 돕는 참여형 교육 콘텐츠**를 제공하는 플랫폼
- **첫번째 프로젝트**
    - 기존 오프라인 생존가방 보드게임의 장점을 활용하여, 이를 **디지털화한 온라인 게임**을 개발
        - 기존 솔루션
            
            생존가방 키트: 실제 재난 상황이 발생했을 때, 필요한 물품들을 빠르게 챙겨보는 연습. 교육자와 참여자가 함께 참여해서 몰입도를 높일 수 있다.
            <br>
            <img src="bagkit_img.png" alt="설명" style="width:50%; height:auto;">


        - 참고: 교육자가 게임을 호스팅하여 진행하고 피드백을 수집하는 방식
            - https://kahoot.com/
            - https://www.slido.com/
- **주요 기능**
    1. **방 생성 및 참여**: 사용자는 방을 생성하고, 방 코드로 다른 팀원들이 참여할 수 있습니다.
    2. **가방 선택**: 각 팀은 생존 가방을 선택하고, 필요한 아이템을 추가할 수 있습니다.
    3. **시뮬레이션:** 선택한 아이템을 기반으로 시뮬레이션을 진행하여 생존 전략을 테스트합니다.
    4. **결과 확인**: 시뮬레이션 결과를 확인하고, 각 팀의 상태를 모니터링할 수 있습니다.
    
- **Objective**
    Provide an interactive educational platform to help educators deliver effective disaster safety education.
- **First Project**
    Digitize the advantages of an existing offline survival bag board game by developing an online game.
- **Existing Solution:**
    *Survival Bag Kit* - An exercise where participants quickly gather essential items in a simulated disaster scenario. The interactive nature enhances engagement between educators and participants.
- **Reference Models:**
    - [Kahoot](https://kahoot.com/)
    - [Slido](https://www.slido.com/)
- **Key Features**
    1. **Room Creation and Participation**
        Users can create a room and invite team members via a code.
    2. **Bag Selection**
        Each team selects a survival bag and adds necessary items.
    3. **Simulation**
        Run simulations based on chosen items to test survival strategies.
    4. **Results**
        View simulation results and monitor each team’s status.
        
## 프로젝트 결과 (Project Outcomes)

### 데모 영상 (Demo Video)
<영상>

### 차별화 요소 (Differentiators)

- **콘텐츠 라이브러리**
    - 하나의 단순한 교육 자료가 아닌, 교육 콘텐츠의 라이브러리 역할을 하며 강사들에게 다양한 자료에 대한 높은 접근성을 제공함.
- **상호작용**
    - 강사, 교육 대상자, 그리고 콘텐츠 간의 지속적인 상호작용을 유도해 사용자들의 흥미를 이끌어내고 더 기억에 오래 남을 수 있도록 도움.
- **참여형 교육**
    - 단방향의 강의식 교육보다 더 전달력 높은 참여형 교육을 높은 퀄리티로 제공함.
    - 기존 교육에서 흥미 요소를 추가함.
- **기존 방재 교육의 한계 해결**
    - 온라인 게임으로 시공간 제약 없이 교육 가능.
    - 누구나 교육 자료로 활용할 수 있어 교육 전파 효과가 큼.
    

## 기대 효과 (Expected Benefits)


### 영향

- **재난 교육의 효과 증가**: 쉽게 흥미를 느낄 수 있는 게임으로 교육 내용을 효과적으로 전달합니다.
- **온라인 재난 교육 콘텐츠 증가**: 제작된 플랫폼에 높은 품질의 온라인 재난 교육 콘텐츠를 개제할 수 있습니다.

### 확장 가능성

- **멀티플레이 모드**
    여러 명의 플레이어가 동시에 재난 상황에서 협력하여 가방을 꾸리고 생존 계획을 세우는 모드 추가 가능.
    
- **다양한 시나리오 업데이트**
    전 세계의 다양한 재난 상황을 기반으로 새로운 시나리오를 지속적으로 추가하여 교육 효과를 극대화.

### Impact
- Enhances the effectiveness of disaster education by delivering lessons through engaging games.
- Increases the availability of high-quality online disaster education content on the platform.

### Scalability
- **Multiplayer Mode**
    A mode where multiple players collaborate to pack survival bags and create survival plans in disaster scenarios.
    
- **New Scenarios**
    Continually update scenarios based on various global disaster situations to maximize educational outcomes.


## 설치 및 실행 방법 (Installation and Setup)

### Visit the Start Page

Start page link: [https://localhost:8080/](https://localhost:8080/)
1. **Clone the Repository**
    
    git clone https://github.com/ijake-16/disaster.io.git
    
    cd disaster.io
    
2. **Download Docker**
    
    **🖥️ [Download Docker here](https://www.docker.com/)**
    
3. **Run the App with Docker**
    
    docker-compose up —build
    
4. **Access the Start Page**
    
    **Visit: [https://localhost:8080/](https://localhost:8080/)**


## 개발 환경 (Development Environment)

### 프론트엔드 개발
- **언어:** TypeScript
- **프레임워크:** React Native

### 프론트엔드 개발
- **언어**: JavaScript
- **프레임워크**: SolidJS

### 백엔드 개발
- **언어**: Python
- **프레임워크**: FastAPI

### 기타
- Axios, Ky (HTTP Client), XLSX(Data)

### 버전 관리
- Git branch 사용: PR 기반의 프로세스를 적용. Notion을 통해 이슈 확인 및 프로젝트 버전 관리.

### 협업 및 커뮤니케이션
- **일정 관리**: Notion에서 Kanban과 Calender 위젯으로 일정 관리. Todo Page를 만들어 작업 분배 및 진행 현황 확인.
- **이슈 관리**: Notion을 바탕으로 GitHub 이슈 작성 및 관리.
- 🛠️  Notion page link: [https://www.notion.so/7f309ba38db1464aa59cc1dd7ab897d7](https://www.notion.so/7f309ba38db1464aa59cc1dd7ab897d7?pvs=21)

### **Frontend Development**
- **Language:** JavaScript
- **Framework:** SolidJS

### **Backend Development**
- **Language:** Python
- **Framework:** FastAPI

### **Other Tools**
- Axios, Ky (HTTP Client), XLSX (Data Handling)

### **Version Control**
- **Git Branching:** A pull request-based workflow.
- **Issue Management:** Managed via Notion, with GitHub for specific issues.

### **Collaboration and Communication**
- **Schedule Management:** Use Notion’s Kanban boards and calendar widgets for task tracking and scheduling.
- **Issue Management:** Draft and manage GitHub issues through Notion.
- 🛠️  Notion page link: [https://www.notion.so/7f309ba38db1464aa59cc1dd7ab897d7](https://www.notion.so/7f309ba38db1464aa59cc1dd7ab897d7?pvs=21)