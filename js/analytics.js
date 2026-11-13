/*
 * 방문 · 클릭 기록 (GoatCounter)
 *
 * - 쿠키를 쓰지 않고, 통계 대시보드는 계정 주인만 로그인해서 볼 수 있습니다.
 * - 탭(#home, #projects …)과 프로젝트 상세(#project-furi 등)를 각각 한 페이지로 기록합니다.
 * - 링크 · 버튼 클릭은 "click/어디/무엇" 이름의 이벤트로 기록합니다.
 *
 * 설정: GoatCounter 가입 후 받은 코드를 CODE에 넣으면 기록이 시작됩니다.
 *   예) https://parkjj.goatcounter.com → CODE = "parkjj"
 * 내 방문 제외: 사이트 주소 뒤에 ?me=1 을 붙여 한 번 접속하면 그 브라우저는 기록에서 빠집니다.
 *   (?me=0 으로 다시 포함)
 */
(() => {
  const CODE = "wjdwns";

  const params = new URLSearchParams(location.search);
  const store = (fn) => { try { return fn(); } catch { return null; } };
  if (params.has("me")) store(() => params.get("me") === "0" ? localStorage.removeItem("skipgc") : localStorage.setItem("skipgc", "t"));
  const isMe = store(() => localStorage.getItem("skipgc") === "t");
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:";
  const debug = isLocal || params.has("track-debug");
  const enabled = CODE && !isMe && !isLocal;

  const queue = [];
  const send = (hit) => {
    if (debug) console.info("[analytics]", hit.event ? "click" : "view", hit.path, hit.title || "");
    if (!enabled) return;
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count(hit);
    else queue.push(hit);
  };

  if (enabled) {
    window.goatcounter = { no_onload: true };
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${CODE}.goatcounter.com/count`;
    s.onload = () => queue.splice(0).forEach((h) => window.goatcounter.count(h));
    document.head.appendChild(s);
  }

  // 페이지(탭 · 프로젝트 상세) 기록 — 같은 화면을 연달아 세지 않음
  const TAB_NAMES = { home: "홈", projects: "프로젝트", career: "경력", blog: "블로그", ai: "AI 활용능력", "ai-log": "AI 사용로그" };
  let last = "";
  const view = () => {
    const hash = (location.hash || "#home").slice(1).split("/")[0] || "home";
    if (hash === last) return;
    last = hash;
    const proj = hash.startsWith("project-") && (window.PORTFOLIO?.projects || []).find((p) => p.id === hash.slice(8));
    send({ path: "/" + hash, title: proj ? `프로젝트 상세 · ${proj.title}` : TAB_NAMES[hash] || hash, referrer: document.referrer });
  };
  addEventListener("hashchange", view);
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", view);
  else view();

  // 클릭 기록 — 어디서(탭 또는 프로젝트) 무엇을 눌렀는지
  const clean = (t) => (t || "").replace(/\s+/g, " ").replace(/[↗▶→]/g, "").trim().slice(0, 60);
  const whereOf = (el) => {
    const card = el.closest(".pcase, .drawer, dialog");
    const title = card && card.querySelector("h2, h3");
    if (title) return clean(title.textContent);
    if (el.closest("header")) return "상단 메뉴";
    if (el.closest("footer")) return "하단";
    const view = el.closest("[data-view]");
    return view ? TAB_NAMES[view.dataset.view] || view.dataset.view : "기타";
  };
  document.addEventListener("click", (e) => {
    const el = e.target.closest("a, button, summary");
    if (!el) return;
    const what = clean(el.dataset.track || el.dataset.label || el.getAttribute("aria-label") || el.textContent) || "(아이콘)";
    const href = el.getAttribute("href") || "";
    send({ path: `click/${whereOf(el)}/${what}`, title: href.startsWith("http") ? href : href || el.tagName.toLowerCase(), event: true });
  }, { capture: true });
})();
