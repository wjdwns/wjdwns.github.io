/*
 * AI 활용능력 탭: 30초 요약 카드 + 목차(섹션 이동 · 현재 위치 표시)
 * 수치는 data.js(및 사용량 JSON이 반영된 값)에서 읽습니다. main.js가 렌더링을 마친 뒤 그립니다.
 */
(() => {
  const D = window.PORTFOLIO || {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = new Intl.NumberFormat("ko-KR");

  function renderSummary() {
    const box = $("#aiSummary");
    if (!box) return;
    const A = D.ai || {};
    const U = A.usage || {};
    const stat = (label) => (U.stats || []).find((s) => s.label === label);
    const req = stat("작업 요청");
    const tools = stat("도구 실행");
    const pipe = A.pipeline || [];
    const cs = A.caseStudy?.compare;
    const before = (k) => cs?.before.items.find((x) => x.k === k)?.v;
    const after = (k) => cs?.after.items.find((x) => x.k === k)?.v;
    const cases = A.verification?.cases || [];

    const items = [
      {
        big: `${pipe.length}단계`,
        label: "AI 코드 검증 파이프라인",
        desc: pipe.map((p) => p.step).join(" → "),
        go: "ai-s2", goLabel: "작업 방식 보기",
      },
      req && {
        big: `${nf.format(req.value)}건`,
        label: "Codex 작업 요청 (실제 기록)",
        desc: `${tools ? `도구 실행 ${nf.format(tools.value)}회 · ` : ""}${U.period || ""}`,
        href: "#ai-log", goLabel: "사용로그 보기",
      },
      cs && {
        big: `${before("도구 호출")?.replace("회", "")} → ${after("도구 호출")}`,
        label: "명세 기반 개발 · 도구 호출",
        desc: `막힌 지점 ${before("막힌 지점")} → ${after("막힌 지점")}, 검증 단계에서 기존 분석의 누락까지 발견`,
        go: "ai-s5", goLabel: "사례 보기",
      },
      cases.length && {
        big: `${cases.length}건`,
        label: "근거 없는 수치 제거",
        desc: "'패킷 75% 절감' 같은 미검증 주장을 직접 측정 · 시연한 내용으로 교체",
        go: "ai-s4", goLabel: "검증 보기",
      },
    ].filter(Boolean);

    box.innerHTML = items.map((x) => `
      <li class="aisum__item">
        <span class="aisum__label">${esc(x.label)}</span>
        <b class="aisum__big">${esc(x.big)}</b>
        <span class="aisum__desc">${esc(x.desc)}</span>
        ${x.href
          ? `<a class="aisum__go" href="${esc(x.href)}">${esc(x.goLabel)} →</a>`
          : `<button class="aisum__go" type="button" data-jump="${esc(x.go)}">${esc(x.goLabel)} →</button>`}
      </li>`).join("");
  }

  // 목차 · 요약 카드의 섹션 이동 (주소 해시를 바꾸면 탭 라우팅이 동작하므로 스크롤만)
  document.addEventListener("click", (e) => {
    const b = e.target.closest("#ai [data-jump]");
    if (!b) return;
    const t = document.getElementById(b.dataset.jump);
    if (!t) return;
    if (t.tagName === "DETAILS") t.open = true;
    const y = t.getBoundingClientRect().top + scrollY - (document.querySelector(".topbar")?.offsetHeight || 64) - 70;
    scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });

  // 현재 보고 있는 섹션을 목차에 표시
  const nav = $("#aiNav");
  if (nav && "IntersectionObserver" in window) {
    const btns = [...nav.querySelectorAll("[data-jump]")];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        btns.forEach((b) => b.classList.toggle("is-on", b.dataset.jump === en.target.id));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    btns.forEach((b) => { const s = document.getElementById(b.dataset.jump); if (s) io.observe(s); });
  }

  // main.js 렌더 이후(사용량 JSON 반영 후)에 요약을 그림
  const principles = $("#principles");
  if (principles && principles.children.length) renderSummary();
  else if (principles) {
    const mo = new MutationObserver(() => { if (principles.children.length) { mo.disconnect(); renderSummary(); } });
    mo.observe(principles, { childList: true });
  }
})();
