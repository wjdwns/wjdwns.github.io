/*
 * 포트폴리오 콘텐츠 데이터
 * ------------------------------------------------------------
 * 사이트의 모든 문구·수치는 이 파일 하나에서 관리합니다.
 * Codex / ChatGPT에서 받은 답변으로 내용을 바꿀 때는 이 파일만 수정하면 됩니다.
 * "TODO" 표시는 아직 확인이 필요한 항목입니다.
 */
window.PORTFOLIO = {
  profile: {
    name: "박정준",
    nameEn: "Park JeongJun",
    role: "Unreal Engine Client Developer",
    headline: ["구조를 설계하고,", "지연과 변경에 강한 플레이를 만듭니다."],
    summary:
      "앱 프론트엔드부터 백엔드 인프라까지 프로덕트 전체 사이클을 운영해 본 시야로, Unreal Engine 5의 네트워크 게임플레이·GAS·AI 시스템을 설계합니다. AI 에이전트에게 작업을 맡기되, 결과는 빌드와 코드 리뷰로 직접 검증합니다.",
    email: "wjdwns3744@naver.com",
    github: "https://github.com/wjdwns",
    velog: "https://velog.io/@wjdwns/posts",
  },

  heroStats: [
    { value: "5", unit: "개", label: "UE5 팀 프로젝트", sub: "네트워크 · GAS · AI · 3D 자동화" },
    { value: "2년 2개월", unit: "", label: "실무 경력", sub: "케이업스튜디오 · 풀스택/앱" },
    { value: "1등", unit: "", label: "원티드 협업과정 최우수상", sub: "AI Agent × Unreal · 2026" },
    { value: "988", unit: "건", label: "Codex 작업 요청", sub: "39개 세션 · 도구 실행 10,100회" },
  ],

  skills: [
    { group: "Engine", items: ["Unreal Engine 5"] },
    { group: "Gameplay", items: ["GAS", "StateTree", "EQS", "Enhanced Input", "Animation BP", "Niagara"] },
    { group: "Network", items: ["Listen Server", "RPC · Replication", "Local Prediction", "NetSerialize"] },
    { group: "Language", items: ["C++", "Blueprint", "Java", "Kotlin", "Dart"] },
    { group: "Tools", items: ["Git", "GitHub", "Perforce", "Unreal Insights", "Jenkins"] },
    { group: "AI", items: ["Codex", "ChatGPT"] },
  ],

  filters: [
    { id: "all", label: "전체" },
    { id: "network", label: "네트워크" },
    { id: "gas", label: "GAS · 전투" },
    { id: "ai", label: "게임 AI" },
    { id: "pipeline", label: "툴 · 파이프라인" },
    { id: "data", label: "데이터 중심 설계" },
  ],

  projects: [
    {
      id: "overcooked2",
      no: "01",
      title: "OverCooked! 2 모작",
      tagline: "로컬에서 탐색하고, 서버에서 확정하는 협업 조리 멀티플레이",
      color: "#1f9d55",
      period: "2026.04 – 2026.05 (4주)",
      team: "3인 팀",
      stack: "Unreal Engine 5 · C++ · Listen Server",
      role: "Player · Interaction · Cooking/Table 시스템",
      tags: ["network", "data"],
      keywords: ["Listen Server", "Replication", "Subsystem", "DataTable"],
      cover: "assets/img/oc-cover.jpg",
      video: "https://youtu.be/1loOkpTWnko",
      result: "다중 플레이어의 상호작용 · 조리 상태 · 외형 동기화 흐름을 플레이 테스트로 검증",
      points: [
        {
          title: "로컬 탐색 + 서버 확정 InteractionComponent",
          problem: "밀집된 조리대에서 여러 오브젝트가 겹치면 의도와 다른 대상이 선택되고, 클라이언트 판정만 믿으면 상태가 어긋납니다.",
          solution: "Sphere Sweep으로 후보를 찾고 거리·시선 각도 가중치로 대상을 고른 뒤, 실제 상호작용은 RPC로 서버가 유효성을 검증해 확정합니다.",
          result: "대상 선택 안정성 개선, 상호작용 종료 책임을 컴포넌트 한 곳으로 모아 재사용 가능한 구조 확보.",
        },
        {
          title: "서버는 상태를, 클라이언트는 연출을",
          problem: "조리 진행과 애니메이션·사운드가 한곳에 섞이면 네트워크 환경에서 결과가 플레이어마다 달라질 수 있습니다.",
          solution: "Raw → Chopped → Cooking → Cooked → Burnt 상태 전이는 서버의 Cook이 결정하고, SetAction은 클라이언트 연출만 담당하도록 분리. 상태 변경은 Delegate로 UI에 전달.",
          result: "조리 결과의 일관성 확보, 새 연출을 추가해도 상태 로직은 수정하지 않는 구조.",
        },
        {
          title: "데이터 중심 레시피 판정",
          problem: "재료 투입 순서에 따라 같은 레시피가 다르게 판정되고, 레시피마다 조건 분기가 늘어났습니다.",
          solution: "재료 ID를 정렬해 조합을 정규화하고, DataTable → PrimaryDataAsset → GameInstanceSubsystem 경로로 레시피를 조회.",
          result: "레시피별 조건 분기 감소, 새 레시피는 DataTable에 추가만 하면 되는 구조.",
        },
        {
          title: "PlayerState · Pawn 준비 순서로 생긴 외형 오류 해결",
          problem: "PlayerState와 Pawn의 복제 도착 순서가 매번 달라 플레이어 색상이 간헐적으로 적용되지 않았습니다.",
          solution: "두 객체가 모두 준비된 시점에 외형을 적용하도록 초기화 순서를 재설계.",
          result: "Listen Server 다중 접속에서 외형 동기화 오류 해소.",
        },
      ],
      gallery: [
        { src: "assets/img/oc-hero.jpg", caption: "네트워크 역할별 오브젝트 상태 검증" },
        { src: "assets/img/oc-cook.jpg", caption: "재료·조리 도구 상호작용 / 외형 동기화" },
        { src: "assets/img/oc-seq.jpg", caption: "로컬 탐색 → 서버 확정 시퀀스 다이어그램" },
        { src: "assets/img/oc-ui.jpg", caption: "캐릭터 선택 · 결과 집계 UI" },
      ],
      aiUse: "Codex에 Git 작성자(jun) 기준으로 제 작업만 다시 정리하게 했습니다. 초안의 'RPC 66.58% 감소 · FPS 20% 향상'에는 계산식과 Unreal Insights 원본을 요구했고, 기준·개선 버전을 각 3회 직접 재측정한 뒤 근거가 부족한 수치는 포트폴리오에서 뺐습니다.",
    },
    {
      id: "intereal",
      no: "02",
      title: "InteReal",
      tagline: "외부 도면 JSON을 편집 가능한 3D 공간으로 자동 변환",
      color: "#2563eb",
      period: "2026.05 – 2026.07 (6주)",
      team: "7인 팀 (AI 3 · Unreal 4)",
      stack: "Unreal Engine 5 · C++ · HTTP · Geometry Script",
      role: "3D 자동화 파이프라인 · 네트워크 연결 · UI/ViewMode",
      award: "원티드 AI Agent × Unreal 협업과정 최우수상(1등)",
      tags: ["pipeline", "data", "network"],
      keywords: ["DynamicMesh", "Geometry Script", "HTTP · Mock", "Delegate"],
      cover: "assets/img/ir-hero.jpg",
      video: "https://youtu.be/Sd2ZA1hPX5g",
      result: "실제 도면 기반 3D 공간 생성·재생성 시연, 협업과정 최우수상(1등) 수상",
      points: [
        {
          title: "도면 JSON → Runtime Geometry",
          problem: "외부 도면은 mm 단위·자체 좌표계를 쓰고, 벽·공간·개구부는 ID 참조로만 연결됩니다. 잘못된 입력은 엉뚱한 메시를 만듭니다.",
          solution: "Schema Version·단위·필수 데이터를 먼저 검증하고 Unreal 좌표계(cm)로 정규화한 뒤, 벽 → 바닥 → 천장 → 개구부 순서로 DynamicMesh를 생성.",
          result: "Parsing · Normalization · Generation 책임이 분리되어 오류 발생 단계를 바로 구분할 수 있게 됨.",
        },
        {
          title: "Base와 Interior Delta 분리 저장",
          problem: "구조를 다시 생성하면 사용자가 배치한 가구·재질·조명 상태가 사라졌습니다.",
          solution: "원본 건축 구조는 Base, 사용자 편집은 Interior Delta로 분리하고 공통 ID-Tag로 Runtime Object와 다시 연결.",
          result: "Base 재생성 후에도 편집 상태 복원, 저장·복원 경로 통일.",
        },
        {
          title: "HTTP · Mock을 하나의 흐름으로",
          problem: "서버가 준비되지 않은 기간에도 Unreal 쪽 개발이 멈추지 않아야 했습니다.",
          solution: "Network Subsystem이 실서버 HTTP와 로컬 Mock JSON을 같은 인터페이스로 처리하고, Pipeline Manager가 Base 생성 → Delta 적용 순서를 Delegate로 관리.",
          result: "서버 없이도 개발 가능한 환경, 모듈별 책임 분리.",
        },
        {
          title: "빛샘(Light Leak) 문제 원인 분리",
          problem: "벽 이음매와 모서리에서 빛이 새어 공간 품질이 떨어졌습니다.",
          solution: "Geometry · Z-Fighting · Shadow Precision · Visibility로 원인을 나눠 검증하고 Wall Run 병합, Surface Overlap, VSM·TAA 설정, Hidden Shadow로 완화.",
          result: "원인별로 대응해 시연 품질 확보.",
        },
      ],
      gallery: [
        { src: "assets/img/ir-hero.jpg", caption: "편집 가능한 3D 인테리어 공간" },
        { src: "assets/img/ir-compare.jpg", caption: "원본 도면 데이터 → 3D 공간 자동 생성" },
        { src: "assets/img/ir-json.jpg", caption: "Topology Contract v3.2 JSON → Geometry" },
        { src: "assets/img/ir-delta.jpg", caption: "Base 구조와 Interior Delta 분리" },
        { src: "assets/img/ir-edit.jpg", caption: "인테리어 편집 · 재질 변경" },
      ],
      aiUse: "벽 구분, 천장 생성 위치, 빛샘 차단, Delta JSON 저장, 재질 저장 파이프라인처럼 문제를 Codex 세션 단위로 나눠 원인을 좁혔습니다(도구 실행 1,007회). 빌드는 UBT(Build.bat)로 확인하고, r.Shadow.Virtual 같은 설정은 제가 에디터에서 직접 테스트해 결과를 다시 전달했습니다. 바뀐 클래스는 무엇을 수정했는지 되물어 확인했습니다.",
    },
    {
      id: "furi",
      no: "03",
      title: "FURI 모작 · GAS Project",
      tagline: "GAS 기반 2인 네트워크 대전 액션",
      color: "#7c3aed",
      period: "2026.03 – 2026.04 (4주)",
      team: "2인 팀",
      stack: "Unreal Engine 5 · C++ · GAS · Listen Server",
      role: "P1 캐릭터·스킬 · 공통 GAS · 전투 UI/카메라",
      tags: ["gas", "network", "data"],
      keywords: ["Local Prediction", "EffectContext", "NetSerialize", "SetByCaller"],
      cover: "assets/img/gas-hero.jpg",
      video: "https://youtu.be/Xfxez2yIG-M",
      result: "100ms 지연 환경에서 전투 검증, DamageInfo 직렬화 48B → 8B",
      metric: { before: "48B", after: "8B", label: "DamageInfo 직렬화 크기 (NetSerialize 직접 측정)" },
      points: [
        {
          title: "InputTag + Gameplay Event 콤보",
          problem: "공격 중 들어온 입력을 매번 새 Ability로 처리하면 콤보가 끊기거나 중복 발동됩니다.",
          solution: "Local Predicted Ability로 반응성을 확보하고, AnimNotifyState(Combo.Start/End) 구간에서만 재입력을 받아 몽타주 섹션을 한 번만 예약.",
          result: "입력과 Ability 생명주기 연결, 중복 콤보 예약 방지, P1·P2가 같은 흐름 공유.",
        },
        {
          title: "Custom GameplayEffectContext",
          problem: "기본 Context로는 방어 가능 여부·무적 관통·피격 반응 같은 고유 데미지 정보를 AttributeSet까지 전달하기 어려웠습니다.",
          solution: "FFuriGameplayEffectContext에 DamageInfo를 담고, 수치는 SetByCaller로 Spec에 주입. 피격 판정은 AttributeSet에서 일괄 처리.",
          result: "공격자·피격 처리 결합도 감소, 커스텀 NetSerialize로 직렬화 크기 48B → 8B.",
        },
        {
          title: "DataAsset 기반 스킬 수치",
          problem: "스킬마다 GameplayEffect를 따로 만들면 수치 조정과 UI 데이터가 흩어집니다.",
          solution: "GameplayTag로 스킬을 식별해 DataAsset에서 데미지·코스트·쿨다운·아이콘을 조회하고, 공통 Effect에 SetByCaller로 주입.",
          result: "공통 GameplayEffect 재사용, 전투·UI 데이터 관리 통일.",
        },
      ],
      gallery: [
        { src: "assets/img/gas-hero.jpg", caption: "GAS 기반 콤보 전투" },
        { src: "assets/img/gas-shots.jpg", caption: "시네마틱 · HUD · 콤보 · 디버깅" },
        { src: "assets/img/gas-ns.jpg", caption: "콤보 윈도우 로그 · NetSerialize 48B → 8B" },
      ],
      aiUse: "검증 질문 12개를 담은 읽기 전용 분석 프롬프트로, EffectContext · NetSerialize · Local Prediction이 실제 코드 경로에서 쓰이는지 Git 작성자(jun) 기준으로 확인했습니다. '비트 단위 최적화 · 패킷 75%' 같은 근거 없는 표현은 뺐습니다.",
    },
    {
      id: "gearofthree",
      no: "04",
      title: "GearOfThree · Gears 5 모작",
      tagline: "StateTree·EQS 전투 AI와 물리 톱날 시스템",
      color: "#dc2626",
      period: "2026.02 – 2026.03 (4주)",
      team: "3인 팀",
      stack: "Unreal Engine 5 · C++ · StateTree · EQS",
      role: "적·아군 전투 AI · NPC 아키텍처 · 물리 톱날 · 맵/UI",
      tags: ["ai", "data"],
      keywords: ["StateTree", "EQS", "Actor Pool", "CCD"],
      cover: "assets/img/gears-hero.jpg",
      video: "https://youtu.be/IjFOWDw8AMk",
      result: "디버그 시각화와 인게임 전투로 타깃 판정 · 엄폐 선택 · 톱날 재사용 흐름 검증",
      points: [
        {
          title: "적·아군이 공유하는 타깃 판정",
          problem: "적과 아군이 같은 전투 공간에서 서로 다른 대상을 골라야 했고, 매 프레임 전체 탐색은 비용이 컸습니다.",
          solution: "TeamSide · IsHostile을 공통 NPC 계층에 두고, Target Evaluator는 1초, 주요 Task 판단은 0.1초 주기로 갱신.",
          result: "같은 StateTree 로직을 적·아군이 재사용, 반복 탐색 빈도 제한.",
        },
        {
          title: "EQS 엄폐 → 이동 → Crouch",
          problem: "단순 추적만으로는 전투가 단조롭고, 엄폐 위치를 고르는 기준이 없었습니다.",
          solution: "Distance · Pathfinding · Trace 테스트로 엄폐 후보를 평가하고, StateTree Task가 이동 후 Crouch/UnCrouch까지 연결.",
          result: "탐색 · 추적 · 공격 · 엄폐로 이어지는 전투 AI.",
        },
        {
          title: "충돌 법선 반사 + Actor Pool",
          problem: "빠른 톱날이 벽을 뚫거나, 발사할 때마다 Actor를 생성·파괴하는 비용이 있었습니다.",
          solution: "충돌 법선 기반 반사식 R = P − 2(P·n)n, CCD, 표면 밀어내기를 적용하고 톱날 20개를 사전 생성해 재사용.",
          result: "충돌면에 따라 다른 반사 궤적, 생성 → 반환 생명주기를 Pool에서 관리.",
        },
      ],
      gallery: [
        { src: "assets/img/gears-hero.jpg", caption: "공통 NPC 구조로 적·아군 행동 재사용" },
        { src: "assets/img/gears-shots.jpg", caption: "EQS 엄폐 탐색 · StateTree 디버깅 · Niagara 피드백" },
        { src: "assets/img/gears-reflect.jpg", caption: "충돌 법선 기반 반사" },
      ],
      aiUse: "담당 범위를 검증하는 분석 프롬프트로 Codex에 저장소를 읽기 전용 분석하게 했고, 팀원 구현과 제 구현을 구분했습니다. 근거가 없는 성능·메모리 수치는 넣지 않았습니다.",
    },
    {
      id: "hunters",
      no: "05",
      title: "Monster Hunter Wilds 모작",
      tagline: "Blueprint 기반 활 전투와 물리 탄도",
      color: "#1e3a8a",
      period: "2026.01 – 2026.02 (4주)",
      team: "3인 팀",
      stack: "Unreal Engine 5 · Blueprint",
      role: "활 시스템 · 모듈형 무기 컴포넌트 · 탄도 · 데미지 구조",
      tags: ["gas", "data"],
      keywords: ["Actor Component", "DataAsset", "Projectile", "Interface"],
      cover: "assets/img/mh-cover.jpg",
      video: "https://youtu.be/8WBqwhuAUGc",
      result: "조준 · 차지 · 발사 · 피격 흐름과 단계별 사거리 · 낙차 차이를 인게임으로 검증",
      points: [
        {
          title: "모듈형 무기 컴포넌트",
          problem: "활 로직이 캐릭터에 묶이면 무기 추가·교체가 어렵습니다.",
          solution: "조준 · 차지 · 발사 로직을 Actor Component로 분리하고, 단계별 탄도 설정은 DataAsset으로 관리.",
          result: "캐릭터와 무기 로직 분리, 코드 수정 없이 탄도 조정.",
        },
        {
          title: "3단계 차지 탄도",
          problem: "연속적인 차지 수치는 플레이어가 결과를 예측하기 어렵습니다.",
          solution: "입력 유지 시간을 3단계로 나눠 1단계 저속·고중력 → 3단계 고속·저중력으로 Projectile Movement 값을 변경.",
          result: "같은 조준에서도 단계별로 다른 사거리·낙차.",
        },
        {
          title: "Damage Struct + Interface",
          problem: "적과 오브젝트마다 피격 함수를 따로 호출하면 결합도가 높아집니다.",
          solution: "데미지 정보를 Struct 하나로 묶고 Blueprint Interface로 전달해 피격 대상이 각자 반응을 처리.",
          result: "적과 오브젝트의 피격 흐름 통합.",
        },
      ],
      gallery: [
        { src: "assets/img/mh-boss.jpg", caption: "보스 전투" },
        { src: "assets/img/mh-shots.jpg", caption: "인게임 화면 · Blueprint 데미지 로직 · 유도 화살 · 환경 상호작용" },
      ],
      aiUse: "ChatGPT와 조준 · 차지 · 애니메이션 · 투사체 · 포물선 경로 · 데미지를 어떻게 연결할지 논의해 기능을 단계별로 나누고 구현 순서를 정했습니다. Blueprint 프로젝트라 Codex 작업 기록은 없습니다.",
    },
  ],

  /* ------------------------------------------------------------
   * AI 활용
   * ------------------------------------------------------------ */
  ai: {
    lead: "ChatGPT로 문제를 분석하고 개발 방향을 구체화하며, Codex를 활용한 구현과 검증 과정에서 결과를 반복적으로 개선합니다. 첫 번째 답을 최종 결과로 보지 않습니다.",
    principles: [
      { k: "01", title: "분리해서 맡긴다", body: "AI 전용 Workspace에서 작업하게 해 검증되지 않은 변경이 실제 프로젝트에 닿지 않도록 합니다." },
      { k: "02", title: "근거로 검증한다", body: "빌드 성공, Changelist 단위 diff, Git 기록으로 확인되지 않은 내용은 반영하지 않습니다." },
      { k: "03", title: "판단은 내가 한다", body: "AI의 제안은 초안입니다. 프로젝트 구조와 규칙에 맞게 직접 수정한 코드만 Main에 올립니다." },
    ],

    tools: [
      {
        name: "ChatGPT",
        kind: "분석 · 설계 · 정리",
        tagline: "무엇을, 왜, 어떤 기준으로 할지 정하는 단계",
        delegate: [
          "오류 메시지 · 로그 · 엔진 버전을 주고 원인 후보 분석",
          "GAS · Prediction · 서버 권한 등 설계 대안 비교",
          "Codex에 넘길 작업 지시서 작성 (범위 · 검수 조건 · 재확인 항목)",
          "기술 문서 · 포트폴리오 구성, 모의 기술 면접",
        ],
        keep: ["대안 중 최종 선택", "요구사항에 맞지 않는 답은 재요청", "외부 공개 문장의 근거 확인"],
      },
      {
        name: "Codex",
        kind: "프로젝트 작업 · 검증",
        tagline: "실제 저장소에서 읽고, 고치고, 확인하는 단계",
        delegate: [
          "저장소 · Git 이력 읽기 전용 분석 → 담당 기능과 근거 정리",
          "코드 분석 · 기능 구현 · 리팩터링을 별도 Workspace에서 수행",
          "빌드 · 자동 검수 · 테스트 실행",
          "실패한 작업은 오류와 미완료 항목을 명시해 다시 지시",
        ],
        keep: ["설계 방향과 클래스 책임 결정", "변경 범위 리뷰 후 반영", "완료 보고만으로 완료 판정하지 않기"],
      },
    ],
    handoff: {
      title: "두 도구를 잇는 방식",
      steps: ["ChatGPT로 원인 분석", "작업 지시서 구체화", "Codex로 수정 · 검증", "결과 확인 후 재지시"],
      note: "예: NoWayOut 프로젝트에서 ChatGPT로 오류 원인을 검토하고 지시서를 다듬은 뒤, Codex에서 실제 수정과 자동 검수를 진행했습니다.",
    },
    extraTools: "3D 모델 초안 생성: Tripo AI · VARCO 3D",

    /* 토큰 절약 — 원칙 · 연구 근거([n]은 references 번호) · 내 기록에서 확인된 실천 */
    tokenSaving: {
      lead: "모델이 한 번에 집중할 수 있는 맥락은 유한합니다. 최근 연구와 공식 가이드가 공통으로 말하는 것은 '많이 넣기'가 아니라 '목표에 필요한 신호만 정확히 넣기'입니다.",
      items: [
        {
          title: "작업 하나에 대화 하나",
          research: "18개 모델을 평가한 연구에서, 입력이 길어질수록 단순한 작업에서도 성능이 불안정해졌습니다 [2]. Codex 공식 가이드도 '한 단위의 작업마다 대화 하나'를 권합니다 [1].",
          mine: "InteReal에서 벽 구분 · 천장 생성 · 빛샘 · Delta 저장 · 재질 저장을 각각 다른 세션으로 나눠, 이전 문제의 로그가 다음 작업의 맥락을 흐리지 않게 했습니다.",
          refs: [2, 1],
        },
        {
          title: "고정된 맥락은 앞에, 바뀌는 질문은 뒤에",
          research: "프롬프트 앞부분(prefix)이 같아야 캐시가 재사용되고, 캐시된 입력은 최대 95%까지 할인됩니다. 그래서 고정 지시와 참고 자료를 먼저, 바뀌는 내용을 마지막에 두라고 권합니다 [3].",
          mine: "한 세션에 프로젝트 문서와 코드 맥락을 먼저 쌓고, 이후에는 짧은 후속 요청으로 이어갔습니다. 기록상 Codex 입력 토큰의 약 96%가 캐시에서 처리됐습니다.",
          refs: [3],
          stat: "96%",
        },
        {
          title: "긴 지시는 파일로, 대화는 짧게",
          research: "모든 자료를 미리 넣지 말고 파일 경로 같은 가벼운 식별자만 두었다가 필요할 때 불러오는 just-in-time 방식이 효과적입니다 [4].",
          mine: "지시서 · 로그 · 프로파일링 CSV · 스크린샷은 첨부 파일로 넘기고(117건), 대화는 '다음', '진행해'처럼 짧게 이어갔습니다. 요청 길이의 중앙값은 38자입니다.",
          refs: [4],
          stat: "38자",
        },
        {
          title: "결과는 파일로 남겨 다음 세션에 넘기기",
          research: "에이전트가 맥락 바깥에 구조화된 노트를 저장하고 필요할 때 다시 불러오면, 긴 작업도 맥락 창 하나에 묶이지 않습니다 [4].",
          mine: "분석 결과를 정해진 파일 하나(PROJECT_SUMMARY.md 등)에 쓰게 하고, 다음 작업은 그 파일을 첨부해 '이 프로젝트에 적용해줘'로 시작했습니다. 같은 설명을 매번 다시 하지 않습니다.",
          refs: [4],
        },
        {
          title: "계획은 먼저, 실행은 확정된 범위만",
          research: "복잡하거나 모호한 작업은 코딩 전에 계획부터 세우게 하고, 범위가 좁은 작업에는 낮은 추론 강도를 쓰라고 권합니다 [1].",
          mine: "ChatGPT로 원인 분석과 작업 지시서를 먼저 다듬고, Codex에는 범위와 검수 조건이 확정된 작업만 넘겼습니다. 에이전트가 헤매며 쓰는 도구 호출을 줄이려는 의도입니다.",
          refs: [1],
        },
      ],
    },

    /* 프롬프트 설계 — 실제 분석 프롬프트(02_FURI_ANALYSIS_PROMPT.md 등)의 구조 */
    promptDesign: {
      lead: "Codex 공식 가이드가 권하는 네 요소(목표 · 맥락 · 제약 · 완료 조건) [1]에 증거 원칙과 출력 구조를 더한 제 템플릿입니다. FURI · GearOfThree · InteReal 분석에 같은 틀(360~450줄)을 재사용해, 프로젝트가 달라도 같은 형식의 결과를 받았습니다.",
      placement: "배치에도 이유가 있습니다. 바뀌지 않는 대상 · 권한은 맨 앞에 두어 캐시를 재사용하고 [3], 출력 구조와 마지막 검증은 맨 끝에 둡니다. 긴 문맥에서 모델은 처음과 끝의 정보를 가장 잘 활용하고 중간 정보는 놓치기 쉽기 때문입니다 [5].",
      blocks: [
        { tag: "목표", pos: "앞", what: "무엇을, 왜 하는지 한 문장으로", ex: "박정준이 실제로 구현한 기능을 코드·Git으로 검증해 포트폴리오 정보 추출", refs: [1] },
        { tag: "맥락", pos: "앞", what: "저장소 · 파일 · 오류 · 로그를 경로로 지정", ex: "로컬 저장소 경로, GitHub 주소, Git 작성자 jun", refs: [1, 4] },
        { tag: "제약 · 권한", pos: "앞", what: "하지 말아야 할 것을 먼저 못박기", ex: "읽기 전용 · 소스/에셋 수정, 빌드, 커밋, 푸시 금지", refs: [1] },
        { tag: "증거 원칙", pos: "중간", what: "사실 · 추정 · 확인 불가를 구분하게 하기", ex: "코드·Git 근거가 없으면 '확인 필요'로 표시", refs: [] },
        { tag: "검증 질문", pos: "중간", what: "확인할 주장을 질문 목록으로 쪼개기", ex: "EffectContext가 실제 경로에서 쓰이는가? NetSerialize가 호출되는가? … 12개", refs: [] },
        { tag: "출력 구조", pos: "끝", what: "결과 형식과 저장 위치를 미리 정의", ex: "17개 섹션 고정, 결과는 한 파일에만 작성", refs: [4] },
        { tag: "완료 조건", pos: "끝", what: "끝났다고 말할 수 있는 기준", ex: "'마지막 검증' 섹션, 추가로 물어볼 내용 따로 정리", refs: [1] },
      ],
      retry: "결과가 틀리면 '다시 해줘'가 아니라 무엇이 틀렸는지를 적어 재지시합니다. 예: '내 Git 작성자는 jun이야, 내 작업만 다시 작성해'. 같은 실수가 반복되면 규칙 자체를 고칩니다 [1].",
    },

    /* 사례 검증 — 2026-11-05, 이 사이트의 집계기(tools/codex-usage)를 실제로 만들며 측정 */
    caseStudy: {
      title: "기능 하나로 검증해 봤습니다: AI 사용량 자동 집계기",
      lead: "이 사이트의 'AI 사용로그' 탭을 매일 갱신하는 집계기를 실제로 만들었습니다. 제 방식(명세 → 구현 → 검증)을 그대로 AI 에이전트에 적용해 만들고, 같은 데이터를 명세 없이 탐색했던 첫 시도와 비교했습니다.",
      steps: [
        { k: "1", title: "탐색", body: "명세 없이 세션 기록을 직접 뒤지며 구조를 파악" },
        { k: "2", title: "명세화", body: "막혔던 지점을 규칙으로 정리해 프롬프트에 담음 (스트리밍 해제, 요청 필드, 자동 검토 세션 제외, 토큰 중복 제거, 공개 금지 항목, 정답값)" },
        { k: "3", title: "구현", body: "명세대로 집계기 파일을 한 번에 작성" },
        { k: "4", title: "검증", body: "정답값 대조 · 개인정보 검사 · 증분 실행 · 화면 확인 등 5가지 검사" },
      ],
      compare: {
        before: { label: "명세 없이 탐색", items: [
          { k: "도구 호출", v: "18회" },
          { k: "막힌 지점", v: "4번", note: "문자열 한도 초과로 중단, 요청 필드 오인으로 0건 집계, 정규식 오류, 검색 시간 초과" },
          { k: "정확도", v: "누락 발생", note: "압축되지 않은 200MB 세션 1개를 놓쳐 요청 49건(5%) · 도구 실행 1,291회(13%) 과소 집계" },
          { k: "재사용", v: "불가", note: "일회성 스크립트, 실행마다 전체 재분석" },
        ] },
        after: { label: "명세 작성 후 구현", items: [
          { k: "도구 호출", v: "12회", note: "구조 확인 3 · 작성 2 · 실행·대조 5 · 수정 2" },
          { k: "막힌 지점", v: "0번", note: "첫 실행에서 283개 파일 파싱 실패 0" },
          { k: "정확도", v: "정답 일치", note: "요청 988건 = 기존 938 + 누락 49 + 오늘 1, 도구 실행 오차 0.01%" },
          { k: "재사용", v: "매일 자동", note: "전체 6.4초 → 증분 0.0초, 개인정보 검사 0건" },
        ] },
      },
      lesson: "두 번째 시도는 첫 시도의 실패가 명세에 담겨 있었기 때문에 한 번에 끝났습니다. 이것이 제가 프롬프트를 파일로 쓰고 재사용하는 이유입니다. 또 하나, '정답값과 대조'를 완료 조건에 넣었기 때문에 첫 분석의 누락을 이번 검증에서 찾아냈습니다.",
      files: "tools/codex-usage/update.mjs · projects.json · README.md · register-task.ps1",
    },

    references: [
      { n: 1, title: "Codex Best practices", org: "OpenAI", year: "2026", url: "https://learn.chatgpt.com/guides/best-practices" },
      { n: 2, title: "Context Rot: How Increasing Input Tokens Impacts LLM Performance", org: "Chroma (Hong, Troynikov, Huber)", year: "2025", url: "https://research.trychroma.com/context-rot" },
      { n: 3, title: "Prompt caching", org: "OpenAI API Docs", year: "2026", url: "https://developers.openai.com/api/docs/guides/prompt-caching" },
      { n: 4, title: "Effective context engineering for AI agents", org: "Anthropic", year: "2025", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents" },
      { n: 5, title: "Lost in the Middle: How Language Models Use Long Contexts", org: "Liu et al., TACL", year: "2024", url: "https://arxiv.org/abs/2307.03172" },
    ],

    // ChatGPT 대화 기록 기반 정성 평가 (토큰 통계 아님)
    domains: [
      { name: "Unreal 설계 · 구현", level: 3, ex: "GAS 콤보 · EffectContext · Prediction, 활 전투 단계 분리" },
      { name: "디버깅 · 원인 분석", level: 3, ex: "플러그인 모듈 초기화 실패, 빌드 · RPC · 자동 테스트 오류" },
      { name: "AI 작업 지시 설계", level: 3, ex: "Codex 실행 프롬프트, 작업 범위 · 검수 기준 정의" },
      { name: "기술 문서 · 포트폴리오", level: 3, ex: "문제 → 구현 → 검증 구조로 프로젝트 설명 재구성" },
      { name: "CS 개념 학습", level: 2, ex: "렌더링 파이프라인, DFS/BFS의 게임 적용" },
      { name: "기술 면접 준비", level: 2, ex: "멀티플레이 · RPC · GAS 모의 압박 면접" },
      { name: "UI · 이미지 기획", level: 2, ex: "메뉴 공간을 고려한 16:9 배경 구도 지정" },
      { name: "Flutter · Android", level: 2, ex: "딥링크 · FCM 중복 실행 원인 분리" },
    ],

    habits: [
      { title: "문제를 구체적으로 정의", body: "오류 메시지, 로그, 엔진 버전, 재현 상황을 함께 줍니다." },
      { title: "대안을 비교", body: "어떤 방식이 왜 더 적합한지, 장단점과 적용 가능성을 묻습니다." },
      { title: "단계적으로 검증", body: "한 번의 답으로 끝내지 않고, 고친 뒤 결과를 다시 확인합니다." },
      { title: "결과를 비판적으로 평가", body: "요구사항과 다르면 이유를 짚어 명확하게 재수정을 요청합니다." },
      { title: "범위와 기준을 먼저 제시", body: "원본 유지, 기능 누락 금지, 실행 검증 같은 조건을 지시에 넣습니다." },
    ],

    rejections: [
      { title: "포트폴리오 문구 전면 수정", what: "AI가 쓴 듯한 일반적 문장과 근거 없는 성과 수치", decision: "실제 개발 과정과 측정 근거 중심으로 방향을 바꿈" },
      { title: "픽셀 캐릭터 결과물 거절", what: "원본 비율이 달라지고 픽셀 품질이 떨어진 의상 이미지", decision: "사용하지 않고, 원본 레이어 유지 · 크기 고정 조건을 명시해 재요청" },
      { title: "완료 보고를 그대로 믿지 않음", what: "일부만 수정된 채 '완료'로 보고된 Codex 작업", decision: "에셋 · 조명 · UI · 상호작용 검수 범위를 지정해 재검증 요구" },
    ],

    pipeline: [
      { step: "AI Workspace", sub: "격리", body: "AI 전용 Workspace에서 변경 작업. 기존 개발 코드와 범위 분리" },
      { step: "UBT Build · Run", sub: "자동 검증", body: "빌드 성공 여부와 주요 기능 실행 확인, 컨벤션 점검" },
      { step: "Changelist Review", sub: "변경 추적", body: "기능별 Changelist로 변경 파일과 범위를 분리해 원인 추적 가능하게" },
      { step: "Developer Review", sub: "직접 검토", body: "기존 코드와 비교, Side Effect 확인, 구조에 맞게 직접 수정" },
      { step: "Main Workspace", sub: "최종 반영", body: "검증을 통과하고 직접 수정한 코드만 반영" },
    ],

    usage: {
      // Codex 로컬 세션 기록(~/.codex/sessions)을 직접 집계. 자동 승인 검토(Guardian) 세션 244개는 제외.
      period: "2026.06.18 – 2026.11.05 · 활동일 84일",
      source: "Codex 로컬 세션 기록 283개를 읽기 전용으로 직접 집계",
      stats: [
        { label: "작업 세션", value: 39, unit: "개" },
        { label: "작업 요청", value: 988, unit: "건" },
        { label: "도구 실행", value: 10100, unit: "회" },
        { label: "코드 패치", value: 1019, unit: "회" },
      ],
      activity: [
        { label: "요청당 도구 실행", value: "약 10.2회", unit: "" },
        { label: "캐시 재사용률", value: "약 96%", unit: "" },
        { label: "자동 승인 검토", value: 244, unit: "회" },
        { label: "활동일", value: 84, unit: "일" },
      ],
      projects: [
        { name: "NoWayOut (UE5)", value: 272 },
        { name: "포트폴리오 · 지원서", value: 261 },
        { name: "Orbit · Ourbit (Flutter)", value: 174 },
        { name: "C++ FPS·TPS 학습", value: 85 },
        { name: "InteReal (UE5)", value: 83 },
        { name: "기타 실험 · 학습", value: 74 },
        { name: "OverCooked2 (UE5)", value: 39 },
      ],
      // ↓ 별도 사용량 대시보드(스크린샷) 수치. Codex 로컬 기록과 일치하지 않아 출처 확인 전까지 '확인 필요'로 표시.
      dashboardNote: "TODO: 별도 사용량 대시보드 수치 · 출처 확인 필요 (82일 · ~2026.10.24)",
      // 단계별 입력 토큰 (직무·단계별 표의 열 합계)
      stages: [
        { name: "조사", value: 181206897 },
        { name: "설계", value: 393243455 },
        { name: "구현·제작", value: 557380646 },
        { name: "검증", value: 285365125 },
        { name: "수정", value: 827188513 },
        { name: "기타", value: 20205710 },
      ],
      jobs: [
        { name: "게임플레이 프로그래밍", value: 1076572532, hours: "112시간 54분", days: 64 },
        { name: "개발 도구·자동화", value: 409100275, hours: "64시간 24분", days: 46 },
        { name: "게임 개발 기타", value: 406454084, hours: "41시간 4분", days: 33 },
        { name: "아트 자산 제작", value: 137730992, hours: "26시간 4분", days: 24 },
        { name: "UI 프로그래밍", value: 120072106, hours: "1시간 37분", days: 11 },
        { name: "기타", value: 107390819, hours: "15시간 9분", days: 15 },
        { name: "프로덕션·출시 운영", value: 4639976, hours: "3시간 40분", days: 10 },
        { name: "애니메이션 프로그래밍", value: 2626066, hours: "4시간 45분", days: 10 },
        { name: "사운드·음악", value: 3496, hours: "11시간 19분", days: 10 },
      ],
      insights: [
        { big: "10.2회", title: "요청 1건당 도구 실행", body: "988건의 요청이 10,100번의 명령 실행·파일 수정으로 이어졌습니다. 질문 하나가 아니라 '탐색 → 수정 → 빌드 확인' 단위로 맡깁니다." },
        { big: "96%", title: "맥락을 쌓아두고 재사용", body: "입력 토큰의 약 96%가 캐시에서 재사용됐습니다. 프로젝트 문서와 코드 맥락을 한 세션에 쌓아 두고 긴 작업을 이어갑니다." },
        { big: "3회씩", title: "수치는 다시 재본다", body: "OverCooked2 초안의 성능 수치에 계산식과 원본 트레이스를 요구하고, 기준·개선 버전을 각 3회 재측정했습니다." },
      ],
    },

    verification: {
      title: "확인되지 않은 문장은 지웠습니다",
      body: "포트폴리오를 정리할 때도 Codex에 읽기 전용 분석을 맡겨 초안의 주장을 하나씩 코드와 Git 기록에 대조했습니다. 근거가 없는 수치는 모두 빼고, 직접 측정하거나 시연한 내용만 남겼습니다.",
      cases: [
        { project: "FURI", before: "패킷 75% 절감, 판정 오차 제거", after: "단일 DamageInfo 직렬화 48B → 8B (직접 측정)" },
        { project: "OverCooked! 2", before: "RPC 66.58% 감소, 평균 FPS 20% 향상", after: "계산식·원본 트레이스 요구 → 기준/개선 각 3회 재측정 → 해당 수치 제외" },
        { project: "InteReal", before: "용량 대폭 절감, 모든 토폴로지 완전 지원", after: "실제 도면 기반 생성·재생성 과정 시연" },
        { project: "GearOfThree", before: "성능·메모리 수치 향상", after: "StateTree·EQS 디버그 시각화로 판정 흐름 검증" },
      ],
    },

    prompt: {
      title: "제가 쓰는 분석 프롬프트의 구조",
      caption: "실제 FURI 저장소 분석에 사용한 Codex 프롬프트를 요약했습니다.",
      blocks: [
        { tag: "대상", text: "로컬 저장소 경로 · GitHub 저장소 · 본인 계정" },
        { tag: "권한", text: "읽기 전용. 소스·에셋·Git 이력 수정, 빌드, 커밋, 푸시 금지" },
        { tag: "산출물", text: "결과는 FURI_PROJECT_ANALYSIS.md 한 파일에만 작성. 기존 파일이 있으면 근거로 재검증 후 갱신" },
        { tag: "검증 질문", text: "EffectContext가 실제로 사용되는가? NetSerialize가 네트워크 경로에서 호출되는가? 100ms 지연 테스트 근거가 있는가? … 12개" },
        { tag: "기여 구분", text: "각 기능이 단독 · 주도 · 공동 구현인지 Git 근거로 표시" },
      ],
    },
  },

  /* ------------------------------------------------------------ */
  career: [
    {
      org: "케이업스튜디오 (K-Up Studio)",
      role: "풀스택 · 앱 개발 · 정규직 (병역특례)",
      period: "2023.01 – 2025.02",
      items: [
        "Flutter 크로스플랫폼 앱 · OAuth 소셜 로그인 · Google Maps API 연동",
        "모바일 앱 ↔ 게임 엔진 간 데이터 통신 구조 설계, 실시간 상호작용 기능",
        "Spring Boot · Node.js API 서버, Redis 캐싱 · 스케줄러 기반 Batch 처리",
        "Jenkins CI/CD 자동화 배포 환경 구축",
      ],
    },
    {
      org: "원티드 포텐업 · AI Agent & 언리얼 개발자 협업 과정",
      role: "Unreal Engine 개발자",
      period: "2026.01 – 2026.07",
      items: ["UE5 팀 프로젝트 5개 수행", "최종 프로젝트 InteReal 최우수상(1등)"],
    },
    {
      org: "디프만 (Depromeet) · Fairer",
      role: "Android 개발 · 팀장/PM",
      period: "2022.03 – 2023.12",
      items: [
        "핵심 팀원 이탈 위기에서 팀장을 맡아 기술 스택 · 일정 · 갈등 조율",
        "코드 리뷰 · 기술 문서 문화 도입, AI 기반 회의록 요약 · 문서 초안 가이드 제작",
      ],
    },
    {
      org: "DIB (Diving Information Base)",
      role: "서비스 개발 · 공모전 프로젝트",
      period: "2023",
      items: [
        "관광·공공데이터 기반 다이빙 정보 서비스 개발",
        "외부 데이터 연동 및 사용자 기능 구현에 참여",
        "2023 관광데이터 활용 공모전 우수상 (한국관광공사 · 2023.11)",
      ],
    },
    {
      org: "BLINK",
      role: "Android 개발 · 사이드 프로젝트",
      period: "2023.12 – 2025.01",
      items: ["AI 기반 링크 자동 요약 · 아카이빙 서비스", "웹페이지 본문 추출 전처리 흐름 구현"],
    },
  ],

  education: [
    { title: "숭실대학교 소프트웨어학부", sub: "2019.02 – 2026.09 · 학점 3.68 / 4.5" },
  ],
  awards: [
    { title: "원티드 협업과정 최우수상 (1등)", sub: "원티드 · 2026.07" },
    { title: "DIB · 관광데이터 활용 공모전 우수상", sub: "한국관광공사 · 2023.11" },
  ],
  certs: [
    { title: "정보처리기사", sub: "2025.06" },
    { title: "TOEIC Speaking IH", sub: "2025.12" },
    { title: "ACP Premiere Pro", sub: "2025.06" },
  ],
};
