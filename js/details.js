/*
 * 프로젝트 상세 패널의 2단계(구현 상세) 내용
 * ------------------------------------------------------------
 * 키는 data.js의 프로젝트 id, 배열 순서는 각 프로젝트 points 순서와 같습니다.
 * 출처: 2026 박정준 포트폴리오.pdf의 기능별 페이지(설계 의도 · 선택 이유와 한계)와
 *       InteReal/Troubleshooting_LightLeak.md
 *
 *   intent  : 설계 의도  [{ t: 제목, d: 설명 }]
 *   outcomes: 구현 결과  [문장]
 *   why     : 선택 이유와 한계
 *   figures : 구조도·화면 [{ src, caption }]
 */
window.PORTFOLIO_DETAILS = {
  overcooked2: [
    {
      figures: [{ src: "assets/img/oc-seq.jpg", caption: "Player(Client) → InteractionComp(Local) → Server(Authority) → Target 시퀀스" }],
      intent: [
        { t: "거리 기반 대상 선택", d: "Sphere Sweep으로 후보를 찾아 거리순으로 정렬하고, 가장 가까운 상호작용 대상만 하이라이트" },
        { t: "클라이언트와 서버의 역할 분리", d: "탐색과 하이라이트는 로컬에서 처리하고, 선택한 대상은 RPC로 전달해 서버가 유효성을 확인한 뒤 실행" },
        { t: "상태 기반 행동 결정", d: "아이템 소유 여부와 대상의 현재 상태로 집기 · 놓기 · 사용 · 재료 추가를 결정하도록 흐름 통합" },
      ],
      outcomes: [
        "여러 오브젝트가 인접해도 가장 가까운 대상을 일관되게 선택",
        "클라이언트는 요청, 서버는 최종 실행 — 플레이어 간 상태 불일치 가능성 감소",
        "현재 대상 · 진행 상태 · 종료 시점을 InteractionComponent 한 곳에서 관리",
        "새 조리 오브젝트를 연결할 때 캐릭터 코드 수정 범위 축소",
      ],
    },
    {
      figures: [{ src: "assets/img/d-oc-state.jpg", caption: "Raw → Chopped → Cooking → Cooked → Burnt 상태 전이와 Delegate 호출" }],
      intent: [
        { t: "서버 중심 상태 전환", d: "조리 진행도와 다음 상태를 서버에서 판정해 모든 플레이어가 같은 결과를 보도록 구성" },
        { t: "상태와 연출의 책임 분리", d: "Cook은 재료 상태를 바꾸고, SetAction은 애니메이션 · 사운드 · 이펙트만 처리" },
        { t: "이벤트 기반 피드백", d: "상태가 바뀌면 Delegate로 조리대와 UI가 필요한 연출을 갱신" },
      ],
      outcomes: [
        "조리 단계를 분리해 현재 상태와 다음 전환 조건을 명확하게 관리",
        "플레이어마다 다른 조리 결과가 나올 가능성 감소",
        "조리 로직을 고치지 않고 새 UI · 시각 피드백 연결 가능",
      ],
      why: "상태가 늘수록 규칙도 늘지만, 복잡한 조건문보다 현재 상태와 다음 상태를 명확하게 추적할 수 있어 FSM을 선택했습니다. 앞으로는 상태 전이 규칙을 데이터로 분리해 새 조리 단계를 추가할 때 코드 수정 범위를 더 줄일 수 있습니다.",
    },
    {
      figures: [{ src: "assets/img/d-oc-recipe.jpg", caption: "식재료 추가 → Recipe DataTable 조회 → 재료 대조 → 일치 판정" }],
      intent: [
        { t: "순서와 무관한 재료 대조", d: "레시피 재료 목록을 복사해 현재 재료와 일치하는 항목을 하나씩 지워, 넣은 순서와 관계없이 종류·상태가 모두 맞는지 확인" },
        { t: "데이터 기반 레시피 관리", d: "레시피별 조건문 대신 DataTable에서 필요한 재료와 완성 결과를 관리" },
        { t: "공통 데이터 조회 구조", d: "Subsystem과 DataLibrary로 레시피 데이터 초기화와 조회 경로를 통일" },
      ],
      outcomes: [
        "개별 레시피를 코드로 비교하지 않고 공통 검증 흐름으로 판정",
        "신규 레시피는 DataTable에서 조합과 결과만 추가",
        "조리대마다 직접 참조하지 않고 공통 조회 경로 사용",
      ],
      why: "재료를 집합이나 해시로 바꾸는 방법도 있지만, 한 요리의 재료 수가 적어 하나씩 지워가며 대조하는 단순한 방식으로도 충분했고 비교 과정을 눈으로 확인하기 쉬웠습니다. 레시피 수가 많아지면 재료 키로 미리 인덱싱하는 방식으로 바꿀 수 있습니다.",
    },
    {
      figures: [{ src: "assets/img/oc-sync.png", caption: "플레이어 외형 동기화" }],
      outcomes: [
        "Listen Server 다중 접속에서 플레이어 색상 · 외형이 간헐적으로 빠지던 문제 해소",
        "PlayerState와 Pawn이 모두 준비된 시점을 기준으로 초기화 순서 정리",
      ],
    },
  ],

  intereal: [
    {
      figures: [{ src: "assets/img/ir-json.jpg", caption: "Topology Contract v3.2 JSON → Runtime Geometry" }],
      intent: [
        { t: "도면 계약 선행 검증", d: "Schema Version · 단위 · 필수 walls · spaces 데이터를 먼저 검사한 뒤 생성 단계로 전달" },
        { t: "Unreal용 구조로 변환", d: "JSON을 바로 메시로 만들지 않고 좌표 · ID · 경계 정보를 다루기 쉬운 구조로 변환" },
        { t: "단계별 Geometry 생성", d: "기존 공간 정리 → 벽 → 바닥 → 천장 → 개구부 순서로 생성해 단계별 책임 분리" },
      ],
      outcomes: [
        "지원하는 도면 JSON에서 벽 · 바닥 · 천장 · 개구부를 런타임에 생성",
        "단위 · 축 변환을 파서에서 끝내 생성 코드가 같은 좌표 기준 사용",
        "생성 오브젝트를 공통 태그와 관리 배열로 추적해 다시 생성 가능",
      ],
      why: "여러 버전의 도면 형식을 동시에 허용하면 파서와 생성기의 분기가 늘어나므로, 최종 서버 계약인 v3.2를 엄격하게 처리하는 방식을 택했습니다.",
    },
    {
      figures: [{ src: "assets/img/ir-delta.jpg", caption: "Base 구조 위에 Interior Delta(가구 · 재질 · 조명)를 다시 적용" }],
      intent: [
        { t: "Base — 원본 건축 구조", d: "벽 · 공간 · 개구부처럼 도면에서 다시 생성할 수 있는 구조 데이터" },
        { t: "Interior Delta — 사용자 편집 상태", d: "가구 Transform과 배치, 표면 재질, 조명 및 Opening 상태를 별도로 관리" },
        { t: "ID · Tag 기반 상태 연결", d: "가구 ID와 생성된 Surface Tag로 저장된 상태를 Runtime Object에 다시 연결" },
      ],
      outcomes: [
        "도면 구조와 사용자 인테리어 상태를 서로 다른 데이터로 관리",
        "공간 재생성 후 Delta를 적용해 가구 · 재질 · 조명 복원",
        "새 편집 항목은 Base를 건드리지 않고 Delta에 확장",
      ],
      why: "구조와 편집 상태를 하나로 저장하면 원본 도면이 바뀔 때 복원 책임이 복잡해져 둘을 나눴습니다. 다만 현재 Delta는 최소 변경분이 아니라 편집 상태의 Snapshot이라, 복원은 단순하지만 편집 항목이 늘면 저장 데이터도 함께 커집니다.",
    },
    {
      figures: [{ src: "assets/img/d-ir-network.jpg", caption: "UI · ViewModel → Network Subsystem(HTTP / Mock) → Pipeline Manager → Generator · SaveManager" }],
      intent: [
        { t: "Network Subsystem — 데이터 통신", d: "GameInstanceSubsystem에서 HTTP GET · POST와 Mock Load · Save를 처리" },
        { t: "Pipeline Manager — 실행 단계 연결", d: "응답을 받으면 Base 공간 생성 → Interior Delta 적용 순서로 진행" },
        { t: "ViewModel · Delegate — UI 연결", d: "ViewModel이 요청과 상태를 관리하고 Delegate로 처리 결과를 전달" },
      ],
      outcomes: [
        "서버 응답과 로컬 JSON을 같은 데이터 구조와 Callback 흐름에서 처리",
        "Network는 통신, Pipeline은 월드 생성, ViewModel은 UI 상태로 역할 구분",
        "Mock JSON으로 서버 없이 공간 생성과 저장 · 복원 확인",
      ],
      why: "지금은 Callback과 Delegate로 실행 단계를 잇지만, Request ID · Cancel · Timeout · Retry와 이전 요청의 늦은 응답을 막는 기능은 보완이 필요합니다.",
    },
    {
      figures: [{ src: "assets/img/ir-edit.jpg", caption: "빛샘을 잡은 뒤의 실내 · 재질 편집 화면" }],
      intent: [
        { t: "그림자 편향 축소", d: "DirectionalLight의 Shadow Bias를 0.5 → 0.1로 낮춰 두께 없는 벽 모서리의 그림자 공백 제거" },
        { t: "Hidden Shadow 표준화", d: "SetRenderInMainPass(false)는 Lumen · VSM 계산에서 빠져 빛이 통과했기 때문에, 숨김 + bCastHiddenShadow 표준 플래그로 교체" },
        { t: "원인별 분리 검증", d: "Geometry · Z-Fighting · Shadow Precision · Visibility로 원인을 나눠 하나씩 확인" },
      ],
      outcomes: [
        "벽과 천장 · 바닥 경계의 빛샘 차단",
        "투명 처리한 천장으로 직사광선이 들어오던 현상 해소",
      ],
      why: "처음에는 Contact Shadow로 틈을 막았지만 화면 공간 기반이라 카메라를 움직이면 그림자가 지글거리는 아티팩트가 생겨 끄고, Bias와 Hidden Shadow 쪽으로 방향을 바꿨습니다.",
    },
  ],

  furi: [
    {
      figures: [{ src: "assets/img/d-gas-combo.jpg", caption: "Enhanced Input → Ability 활성 판정 → NotifyState 콤보 윈도우 → 다음 섹션 예약" }],
      intent: [
        { t: "활성 Ability 재입력 전달", d: "공격 중 입력을 새 Ability로 활성화하지 않고 AbilitySpecInputPressed로 현재 Ability에 전달" },
        { t: "NotifyState 기반 콤보 구간", d: "AnimNotifyState가 Combo.Start · Combo.End 이벤트를 보내 애니메이션과 입력 가능 구간을 일치" },
        { t: "몽타주 섹션 예약 제한", d: "열린 콤보 윈도우에서 다음 섹션을 한 번만 예약해 중복 입력 충돌 방지" },
      ],
      outcomes: [
        "최초 입력과 활성 중 재입력을 구분해 입력 처리 흐름 명확화",
        "몽타주 NotifyState 구간으로 콤보 입력 시간 관리",
        "P1 · P2가 같은 입력 · 몽타주 · Gameplay Event 구조 사용",
      ],
      why: "Local Predicted Ability로 입력 직후 몽타주를 재생해 반응성을 확보했지만, 지연 상황에서는 클라이언트와 서버의 타겟 판정이 달라질 수 있습니다.",
    },
    {
      figures: [{ src: "assets/img/d-gas-ctx.jpg", caption: "Skill DataAsset → Attack Ability → FFuriGameplayEffectContext → AttributeSet" }],
      intent: [
        { t: "Custom EffectContext", d: "FFuriGameplayEffectContext에 FFuriDamageInfo를 담고 AbilitySystemGlobals가 커스텀 Context를 생성" },
        { t: "Context와 수치의 역할 분리", d: "방어 · 무적 · 피격 반응은 Context로, 실제 데미지 수치는 SetByCaller로 Spec에 주입" },
        { t: "AttributeSet 중심 판정", d: "BasicAttributeSet의 Effect 처리 단계에서 DamageInfo를 읽어 방어 · 무적 · 체력 · 피격 반응을 공통 처리" },
      ],
      outcomes: [
        "공격 Ability가 만든 방어 · 무적 · 피격 정보를 Effect 처리 단계까지 전달",
        "공격 Ability가 대상의 피격 함수를 직접 호출하지 않음",
        "필요한 필드만 직렬화하는 커스텀 NetSerialize 적용 (enum → uint8, bool → 비트)",
      ],
    },
    {
      figures: [{ src: "assets/img/d-gas-skill.jpg", caption: "Ability GameplayTag → Skill DataAsset → 공통 GameplayEffect + SetByCaller" }],
      intent: [
        { t: "GameplayTag 기반 스킬 식별", d: "Ability의 GameplayTag로 DataAsset에서 현재 스킬의 SkillData 조회" },
        { t: "전투 로직과 수치 분리", d: "스킬 이름 · 아이콘 · 설명과 데미지 · 코스트 · 쿨타임을 FFuriSkillData에 함께 구성" },
        { t: "SetByCaller 수치 주입", d: "공통 Cost · Cooldown · Damage GameplayEffect로 Spec을 만들고 스킬별 수치를 전달" },
      ],
      outcomes: [
        "스킬 수치를 C++에 쓰지 않고 DataAsset에서 관리",
        "스킬마다 수치용 Effect를 만들지 않고 공통 Effect 재사용",
        "전투 수치와 UI 정보를 같은 SkillData에서 조회",
      ],
      why: "스킬마다 별도의 GameplayEffect를 두면 스킬 수가 늘수록 중복 에셋과 수정 지점이 늘어나, DataAsset + 공통 Effect 구조를 택했습니다.",
    },
  ],

  gearofthree: [
    {
      figures: [{ src: "assets/img/d-gears-team.jpg", caption: "TeamSide → IsHostile → Target Evaluator → StateTree(추적 · 공격 · 엄폐)" }],
      intent: [
        { t: "소속 판정과 행동 로직 분리", d: "TeamSide · IsHostile로 적대 관계를 판정하고, 공통 Evaluator와 Task를 적 · 아군이 함께 사용" },
        { t: "판단 주기로 탐색 비용 제어", d: "타깃 탐색과 행동 확인을 매 프레임 돌리지 않고 Evaluator와 Task에 다른 갱신 주기 적용" },
      ],
      outcomes: [
        "서로 다른 NPC가 같은 관계 판정과 타깃 탐색 흐름 공유",
        "새 NPC는 소속만 지정하면 기존 전투 AI 재사용",
      ],
      why: "고정된 탐색 주기로 반복 판단 횟수를 줄였지만, 대상 변경이 최대 탐색 주기만큼 늦어질 수 있습니다. 이번 전투에서는 즉각적인 반응보다 다수 NPC의 반복 탐색을 줄이는 쪽을 택했습니다.",
    },
    {
      figures: [{ src: "assets/img/d-gears-ai.jpg", caption: "StateTree 엄폐 판단 → EQS 후보 생성 · 평가 → 이동 → Crouch" }],
      intent: [
        { t: "Evaluator와 Task의 책임 분리", d: "Target Evaluator는 대상 선택, Chase · Attack · Cover Task는 실제 이동과 공격 담당" },
        { t: "판단 주기 제한", d: "타깃 갱신 1초, 주요 Task 판단 0.1초 단위로 제한" },
        { t: "EQS 기반 엄폐 선택", d: "Distance · Pathfinding · Trace 테스트로 이동 가능하고 시야를 가리는 후보 위치 평가" },
      ],
      outcomes: [
        "추격 · 공격 · 엄폐를 독립 Task로 분리해 판단 흐름 정리",
        "StateTree에서 EQS를 요청하고 선택 위치로 이동한 뒤 Crouch까지 연결",
      ],
    },
    {
      figures: [
        { src: "assets/img/gears-reflect.jpg", caption: "충돌 법선 기반 반사 R = P − 2(P·n)n" },
        { src: "assets/img/d-gears-pool.jpg", caption: "톱날 Actor 20개 사전 생성 → 활성화 → 반환 흐름" },
      ],
      intent: [
        { t: "충돌 법선 기반 반사", d: "충돌 직전 속도와 표면 법선으로 반사 방향을 계산하고, CCD로 빠른 톱날의 충돌 누락 방지, 반사 후 법선 방향 1cm 보정" },
        { t: "Actor Pool 재사용", d: "시작 시 톱날 20개를 만들어 두고 위치 · 방향 · 속도만 재설정, 부족할 때만 Pool 확장" },
      ],
      outcomes: [
        "충돌면에 따라 달라지는 반사 궤적",
        "이동 · 충돌 · 물리 속도 · Niagara Trail 초기화 흐름 통합",
        "생성 · 제거 반복을 활성화 · 반환 구조로 변경",
      ],
    },
  ],

  hunters: [
    {
      figures: [{ src: "assets/img/mh-shots.jpg", caption: "활 조준 · 콤보 · 보스 전투 · 유도 화살 · 환경 상호작용" }],
      outcomes: [
        "조준 · 차지 · 발사 로직을 캐릭터에서 분리한 Actor Component",
        "단계별 탄도 설정을 DataAsset으로 관리",
      ],
    },
    {
      figures: [{ src: "assets/img/d-mh-charge.jpg", caption: "입력 유지 시간 → 차지 단계 판정 → 단계별 속도 · 중력 → 발사" }],
      intent: [
        { t: "명확한 차지 피드백", d: "연속 수치 대신 3단계 차지를 적용해 플레이어가 결과를 예측할 수 있는 조작감 지향" },
        { t: "탄도 데이터 분리", d: "차지 계산과 화살 이동 로직을 나누고, 단계별 탄도 설정을 별도 데이터로 관리" },
      ],
      outcomes: [
        "차지 단계가 높을수록 속도는 증가, 중력 영향은 감소",
        "같은 조준 방향에서도 단계별로 다른 궤적",
        "사거리와 조작감을 독립적으로 조정",
      ],
      why: "3단계로 결과를 명확히 구분하고 값을 쉽게 조정했지만, 단계 경계에서 탄도가 급격하게 바뀔 수 있습니다. 다시 만든다면 단계 설정은 유지하되 구간 안에서 값을 보간해 세부 차지 시간도 반영하겠습니다.",
    },
    {
      figures: [{ src: "assets/img/d-mh-damage.jpg", caption: "AC_Bow → Damage Interface → Damage Struct → Enemy / Prop" }],
      intent: [
        { t: "데미지 정보 구조화", d: "데미지 수치와 타입을 Struct 하나로 묶어 항목이 늘어도 함수 인자 확장 최소화" },
        { t: "공격과 피격 책임 분리", d: "AC_Bow는 정보 생성 · 전달만, 체력 변경과 피드백은 대상이 직접 처리" },
      ],
      outcomes: [
        "적과 오브젝트가 같은 Interface 호출 흐름 사용",
        "활 컴포넌트가 대상 클래스나 체력 변수에 직접 접근하지 않음",
        "같은 Struct로 대상마다 다른 피격 반응 실행",
      ],
      why: "Interface와 Struct로 결합을 줄였지만, 새 데미지 항목을 추가하면 각 대상의 Interface 구현도 함께 확인해야 합니다. 다시 만든다면 데미지 타입별 처리 규칙을 데이터로 분리하고, 누락된 구현을 검증하는 공통 베이스를 두겠습니다.",
    },
  ],
};
