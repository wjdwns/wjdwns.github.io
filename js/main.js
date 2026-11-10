const renderPortfolio = () => {
  const D = window.PORTFOLIO;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = new Intl.NumberFormat("ko-KR");
  // "TODO:" 로 시작하는 문구는 '확인 필요' 배지를 붙여 보여줍니다.
  const todo = (s) => {
    const t = String(s ?? "");
    const m = t.match(/^TODO:\s*/) || t.match(/\(TODO:[^)]*\)/);
    if (!m) return esc(t);
    return `<span class="todo">확인 필요</span>${esc(t.replace(/^TODO:\s*/, "").replace(/\s*\(TODO:[^)]*\)/, ""))}`;
  };
  const compact = (n) => {
    if (n >= 1e8) return (n / 1e8).toFixed(n >= 1e9 ? 1 : 2).replace(/\.0+$/, "") + "억";
    if (n >= 1e4) return Math.round(n / 1e4).toLocaleString("ko-KR") + "만";
    return nf.format(n);
  };
  const pct = (v, t) => ((v / t) * 100).toFixed(1) + "%";

  /* ---------------- Hero ---------------- */
  const P = D.profile;
  $("#heroRole").textContent = P.role;
  $("#heroTitle").innerHTML = P.headline.map((l, i) => `<span${i === 1 ? ' class="hl"' : ""}>${esc(l)}</span>`).join("");
  $("#heroSummary").textContent = P.summary;
  $("#heroLinks").innerHTML = [
    ["GitHub", P.github],
    ["Velog 기술 블로그", P.velog],
    [P.email, "mailto:" + P.email],
  ].map(([t, h]) => `<li><a href="${esc(h)}" ${h.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${esc(t)} ↗</a></li>`).join("");
  $("#heroStats").innerHTML = D.heroStats.map((s) => `
    <li class="stat">
      <span class="stat__label">${esc(s.label)}</span>
      <span class="stat__value">${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ""}</span>
      <span class="stat__sub">${esc(s.sub)}</span>
    </li>`).join("");

  $("#skills").innerHTML = D.skills.map((g) => `
    <div class="skillcol"><h3>${esc(g.group)}</h3><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");

  /* ---------------- Projects: 케이스 스터디 목록 (클릭 없이 핵심을 바로) ---------------- */
  const grid = $("#projectGrid");
  grid.className = "cases";
  grid.innerHTML = D.projects.map((p) => `
    <li class="pcase reveal" data-tags="${p.tags.join(" ")}">
      <a class="pcase__media" href="#project-${p.id}" aria-label="${esc(p.title)} 상세 보기">
        <img src="${p.cover}" alt="${esc(p.title)} 플레이 화면" loading="lazy" />
        ${p.award ? `<span class="pcase__award">${esc(p.award)}</span>` : ""}
      </a>
      <div class="pcase__body">
        <p class="pcase__eyebrow">Project ${esc(p.no)} · ${p.keywords.slice(0, 3).map(esc).join(" · ")}</p>
        <h3><a href="#project-${p.id}">${esc(p.title)}</a></h3>
        <p class="pcase__tag">${esc(p.tagline)}</p>
        <dl class="pcase__meta">
          <div><dt>기간</dt><dd>${esc(p.period)}</dd></div>
          <div><dt>팀</dt><dd>${esc(p.team)}</dd></div>
          <div><dt>담당</dt><dd>${esc(p.role)}</dd></div>
        </dl>
        <ol class="pcase__points" aria-label="핵심 구현">
          ${p.points.map((pt, k) => `<li><a href="#project-${p.id}/${k + 1}"><span>${String(k + 1).padStart(2, "0")}</span>${esc(pt.title)}</a></li>`).join("")}
        </ol>
        <p class="pcase__result"><b>성과</b>${esc(p.result)}</p>
        <div class="pcase__cta">
          <a class="btn btn--primary" href="#project-${p.id}">상세 보기</a>
          ${p.video ? `<a class="btn" href="${esc(p.video)}" target="_blank" rel="noopener">▶ 시연 영상</a>` : ""}
        </div>
      </div>
    </li>`).join("");

  const filterBar = $("#filters");
  filterBar.innerHTML = D.filters.map((f, i) => {
    const n = f.id === "all" ? D.projects.length : D.projects.filter((p) => p.tags.includes(f.id)).length;
    return `<button class="chip" type="button" data-filter="${f.id}" aria-pressed="${i === 0}">${esc(f.label)}<span class="count">${n}</span></button>`;
  }).join("");
  filterBar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    filterBar.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
    const f = b.dataset.filter;
    grid.querySelectorAll(".pcase").forEach((c) => {
      c.classList.toggle("is-hidden", f !== "all" && !c.dataset.tags.split(" ").includes(f));
    });
  });

  /* ---------------- 상세 패널: 한 단계, 모든 구현을 한 화면에 ---------------- */
  const drawer = $("#drawer");
  const body = $("#drawerBody");
  let current = -1;
  let currentPoint = -1; // 주소로 열린 구현 번호(라우팅 비교용)
  let lastFocus = null;
  const DET = window.PORTFOLIO_DETAILS || {};
  const detailOf = (id, k) => (DET[id] && DET[id][k]) || {};

  function renderProject(i) {
    const p = D.projects[i];
    current = i;
    const prev = D.projects[(i - 1 + D.projects.length) % D.projects.length];
    const next = D.projects[(i + 1) % D.projects.length];
    body.style.setProperty("--pc", p.color);
    body.innerHTML = `
      <div class="dhead">
        <span class="dhead__title" id="drawerTitle">${esc(p.no)} · ${esc(p.title)}</span>
        <div class="dhead__nav">
          <button class="iconbtn" type="button" data-step="-1" aria-label="이전 프로젝트: ${esc(prev.title)}">←</button>
          <button class="iconbtn" type="button" data-step="1" aria-label="다음 프로젝트: ${esc(next.title)}">→</button>
          <button class="iconbtn" type="button" data-close aria-label="닫기">✕</button>
        </div>
      </div>
      <div class="dsec">
        <div class="dintro">
          <button class="dintro__img" type="button" data-zoom="${p.cover}" data-cap="${esc(p.title)}" aria-label="대표 화면 크게 보기"><img src="${p.cover}" alt="${esc(p.title)} 대표 화면" /></button>
          <div class="dintro__text">
            <p class="eyebrow">Project ${esc(p.no)}${p.award ? " · " + esc(p.award) : ""}</p>
            <h2>${esc(p.title)}</h2>
            <p class="dintro__tag">${esc(p.tagline)}</p>
            <dl class="pcase__meta">
              <div><dt>기간</dt><dd>${esc(p.period)}</dd></div>
              <div><dt>팀</dt><dd>${esc(p.team)}</dd></div>
              <div><dt>기술</dt><dd>${esc(p.stack)}</dd></div>
              <div><dt>담당</dt><dd>${esc(p.role)}</dd></div>
            </dl>
            <div class="dactions">
              ${p.video ? `<a class="btn btn--primary" href="${esc(p.video)}" target="_blank" rel="noopener">▶ 시연 영상</a>` : ""}
              ${p.metric ? `<span class="dintro__metric"><s>${esc(p.metric.before)}</s> → <b>${esc(p.metric.after)}</b> <small>${esc(p.metric.label)}</small></span>` : ""}
            </div>
          </div>
        </div>

        <nav class="pjump" aria-label="핵심 구현 바로가기">
          ${p.points.map((pt, k) => `<button type="button" data-goto="${k}"><span>${String(k + 1).padStart(2, "0")}</span>${esc(pt.title)}</button>`).join("")}
        </nav>

        ${p.points.map((pt, k) => {
          const det = detailOf(p.id, k);
          const fig = det.figures?.[0];
          return `
          <section class="impl" id="impl-${k}" aria-labelledby="impl-${k}-t">
            <h3 class="impl__title" id="impl-${k}-t"><span>${String(k + 1).padStart(2, "0")}</span>${esc(pt.title)}</h3>
            <div class="psr psr--cards">
              <div><b>문제</b><span>${esc(pt.problem)}</span></div>
              <div><b>해결</b><span>${esc(pt.solution)}</span></div>
              <div><b>결과</b><span>${esc(pt.result)}</span></div>
            </div>
            ${fig || det.intent?.length ? `
            <div class="impl__grid ${fig ? "" : "impl__grid--one"}">
              ${fig ? `<button class="impl__fig" type="button" data-zoom="${fig.src}" data-cap="${esc(fig.caption)}">
                <img src="${fig.src}" alt="${esc(fig.caption)}" loading="lazy" /><span>${esc(fig.caption)}</span></button>` : ""}
              ${det.intent?.length ? `<div class="impl__points"><b>설계 포인트</b><ul>${det.intent.map((x) => `<li>${esc(x.t)}</li>`).join("")}</ul>
                ${det.why ? `<p class="impl__why"><b>한계</b>${esc(det.why)}</p>` : ""}</div>` : ""}
            </div>` : ""}
          </section>`;
        }).join("")}

        <h3 class="dh3">화면</h3>
        <div class="gallery ${p.id === "overcooked2" ? "gallery--overcooked" : ""}">
          ${p.gallery.map((g) => `
            <button type="button" data-zoom="${g.src}" data-cap="${esc(g.caption)}">
              <img src="${g.src}" alt="${esc(g.caption)}" loading="lazy" /><span>${esc(g.caption)}</span>
            </button>`).join("")}
        </div>

        <h3 class="dh3">이 프로젝트에서 AI를 쓴 방식</h3>
        <div class="aibox"><span class="aibox__icon">AI</span><p>${todo(p.aiUse)}</p></div>
      </div>`;
    currentPoint = -1;
    body.scrollTop = 0;
    try { history.replaceState(null, "", "#project-" + p.id); } catch (e) {}
  }

  function gotoPoint(k, smooth) {
    const el = body.querySelector(`#impl-${k}`);
    if (!el) return;
    const head = body.querySelector(".dhead")?.offsetHeight || 60;
    body.scrollTo({ top: el.offsetTop - head - 12, behavior: smooth ? "smooth" : "auto" });
  }

  function openProject(id, pointIndex = -1) {
    const i = D.projects.findIndex((p) => p.id === id);
    if (i < 0) return;
    if (!drawer.open) lastFocus = document.activeElement;
    renderProject(i);
    if (!drawer.open) drawer.showModal();
    document.body.style.overflow = "hidden";
    $(".dhead [data-close]", body)?.focus({ preventScroll: true });
    if (pointIndex >= 0 && D.projects[i].points[pointIndex]) {
      currentPoint = pointIndex;
      requestAnimationFrame(() => gotoPoint(pointIndex, false));
    }
  }
  function closeDrawer() { drawer.close(); }

  drawer.addEventListener("close", () => {
    document.body.style.overflow = "";
    currentPoint = -1;
    if (/^#project-/.test(location.hash)) { try { history.replaceState(null, "", "#projects"); } catch (e) {} }
    lastFocus?.focus?.();
  });
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) return closeDrawer(); // backdrop
    const step = e.target.closest("[data-step]");
    if (step) { renderProject((current + Number(step.dataset.step) + D.projects.length) % D.projects.length); $(".dhead [data-close]", body)?.focus(); return; }
    const go = e.target.closest("[data-goto]");
    if (go) return gotoPoint(Number(go.dataset.goto), true);
    if (e.target.closest("[data-close]")) return closeDrawer();
    const z = e.target.closest("[data-zoom]");
    if (z) openLightbox(z.dataset.zoom, z.dataset.cap);
  });
  drawer.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "ArrowRight") { renderProject((current + 1) % D.projects.length); $(".dhead [data-close]", body)?.focus(); }
    if (e.key === "ArrowLeft") { renderProject((current - 1 + D.projects.length) % D.projects.length); $(".dhead [data-close]", body)?.focus(); }
  });

  /* Lightbox */
  const lb = $("#lightbox");
  function openLightbox(src, cap) {
    $("#lightboxImg").src = src;
    $("#lightboxImg").alt = cap || "";
    $("#lightboxCap").textContent = cap || "";
    lb.showModal();
  }
  lb.addEventListener("click", () => lb.close());

  /* ---------------- AI ---------------- */
  const A = D.ai;
  $("#aiLead").textContent = A.lead;
  $("#principles").innerHTML = A.principles.map((p) => `
    <li class="principle reveal"><span class="principle__k">${esc(p.k)}</span><h4>${esc(p.title)}</h4><p>${esc(p.body)}</p></li>`).join("");

  $("#tools").innerHTML = A.tools.map((t) => `
    <article class="tool reveal">
      <div class="tool__head">
        <span class="tool__logo">${esc(t.name.slice(0, 2))}</span>
        <div><div class="tool__name">${esc(t.name)}</div><div class="tool__kind">${esc(t.kind)}</div></div>
      </div>
      <p class="tool__tagline">${esc(t.tagline)}</p>
      <div class="tool__cols">
        <div><h5>AI에게 맡기는 일</h5><ul>${t.delegate.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div class="keep"><h5>내가 직접 하는 일</h5><ul>${t.keep.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
      </div>
    </article>`).join("");

  if (A.handoff) {
    $("#handoff").innerHTML = `
      <div class="handoff__flow">
        <span class="handoff__title">${esc(A.handoff.title)}</span>
        <ol>${A.handoff.steps.map((s, i) => `<li><span>${i + 1}</span>${esc(s)}</li>`).join("")}</ol>
      </div>
      <p class="handoff__note">${esc(A.handoff.note)}${A.extraTools ? `<br/><span class="handoff__extra">그 외 · ${esc(A.extraTools)}</span>` : ""}</p>`;
  }
  $("#habits").innerHTML = (A.habits || []).map((h, i) => `
    <li class="habit reveal"><span class="habit__n">${String(i + 1).padStart(2, "0")}</span><div><h4>${esc(h.title)}</h4><p>${esc(h.body)}</p></div></li>`).join("");
  const lv = ["", "낮음", "중간", "높음"];
  $("#domains").innerHTML = (A.domains || []).map((d) => `
    <li class="domain">
      <div class="domain__top"><b>${esc(d.name)}</b><span class="dots" aria-label="비중 ${lv[d.level]}">${[1, 2, 3].map((k) => `<i class="${k <= d.level ? "on" : ""}"></i>`).join("")}<em>${lv[d.level]}</em></span></div>
      <p>${esc(d.ex)}</p>
    </li>`).join("");
  $("#rejects").innerHTML = (A.rejections || []).map((r) => `
    <li class="reject reveal">
      <h4>${esc(r.title)}</h4>
      <dl><div><dt>AI 결과</dt><dd>${esc(r.what)}</dd></div><div><dt>내 판단</dt><dd>${esc(r.decision)}</dd></div></dl>
    </li>`).join("");

  $("#pipeline").innerHTML = A.pipeline.map((s, i) => `
    <li class="pstep reveal"><span class="pstep__n">${String(i + 1).padStart(2, "0")}</span><h4>${esc(s.step)}</h4><span class="pstep__sub">${esc(s.sub)}</span><p>${esc(s.body)}</p></li>`).join("");

  /* Usage */
  const U = A.usage;
  $("#usageMeta").innerHTML = `${esc(U.period)} · ${todo(U.source)}`;
  $("#usageKpis").innerHTML = U.stats.map((k) => `
    <div class="kpi"><div class="kpi__label">${esc(k.label)}</div><div class="kpi__value">${nf.format(k.value)}<small>${esc(k.unit)}</small></div></div>`).join("");
  $("#stageNote").innerHTML = todo(U.dashboardNote);
  $("#usageActivity").innerHTML = U.activity.map((a) => `
    <div class="act"><span>${esc(a.label)}</span><b>${typeof a.value === "number" ? nf.format(a.value) + esc(a.unit) : esc(a.value)}</b></div>`).join("");

  const tip = $("#tooltip");
  const showTip = (e, html) => {
    tip.innerHTML = html; tip.hidden = false;
    const r = tip.getBoundingClientRect();
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14;
    if (y + r.height > innerHeight - 8) y = e.clientY - r.height - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  };
  const hideTip = () => { tip.hidden = true; };

  const stageTotal = U.stages.reduce((a, s) => a + s.value, 0);
  const emph = new Set(["검증", "수정"]);
  const stageBar = $("#stageBar");
  stageBar.setAttribute("aria-label", "작업 단계별 입력 토큰 비중: " + U.stages.map((s) => `${s.name} ${pct(s.value, stageTotal)}`).join(", "));
  stageBar.innerHTML = U.stages.map((s, i) => {
    const w = (s.value / stageTotal) * 100;
    return `<div class="stackbar__seg" style="flex:${w} 1 0;background:var(--s${i + 1})" data-i="${i}">${w > 11 ? `<em>${w.toFixed(0)}%</em>` : ""}</div>`;
  }).join("");
  stageBar.addEventListener("mousemove", (e) => {
    const seg = e.target.closest(".stackbar__seg"); if (!seg) return hideTip();
    const s = U.stages[seg.dataset.i];
    showTip(e, `<b>${esc(s.name)}</b><span>${nf.format(s.value)} 토큰 · ${pct(s.value, stageTotal)}</span>`);
  });
  stageBar.addEventListener("mouseleave", hideTip);
  $("#stageLegend").innerHTML = U.stages.map((s, i) => `
    <li class="${emph.has(s.name) ? "is-em" : ""}"><i style="background:var(--s${i + 1})"></i><span>${esc(s.name)}</span><b>${pct(s.value, stageTotal)}</b></li>`).join("");
  const vr = U.stages.filter((s) => emph.has(s.name)).reduce((a, s) => a + s.value, 0);
  $("#stageLegend").insertAdjacentHTML("afterend", `<p class="stage-note">검증 + 수정 = <b>${pct(vr, stageTotal)}</b> · 구현·제작 ${pct(U.stages.find((s) => s.name === "구현·제작").value, stageTotal)}보다 많습니다.</p>`);

  const projTotal = U.projects.reduce((a, j) => a + j.value, 0);
  const projMax = Math.max(...U.projects.map((j) => j.value));
  const jobBars = $("#jobBars");
  jobBars.innerHTML = U.projects.map((j, i) => `
    <li class="hbar" data-i="${i}" tabindex="0" aria-label="${esc(j.name)} ${j.value}건, ${pct(j.value, projTotal)}">
      <span class="hbar__name">${esc(j.name)}</span>
      <span class="hbar__track"><span class="hbar__fill" style="width:0" data-w="${(j.value / projMax) * 100}"></span></span>
      <span class="hbar__val">${nf.format(j.value)}</span>
    </li>`).join("");
  jobBars.addEventListener("mousemove", (e) => {
    const r = e.target.closest(".hbar"); if (!r) return hideTip();
    const j = U.projects[r.dataset.i];
    showTip(e, `<b>${esc(j.name)}</b><span>${nf.format(j.value)}건 · 전체 요청의 ${pct(j.value, projTotal)}</span>`);
  });
  jobBars.addEventListener("mouseleave", hideTip);

  if (U.daily?.length) {
    const days = U.daily.slice(-30);
    const max = Math.max(1, ...days.map((d) => d.requests));
    const cols = $("#dailyCols");
    $("#dailyPanel").hidden = false;
    cols.setAttribute("aria-label", `최근 ${days.length}일 Codex 요청 수, 최대 ${max}건`);
    cols.innerHTML = days.map((d, i) => `<span class="col" data-i="${i}" style="--h:${(d.requests / max) * 100}%"><i></i></span>`).join("");
    $("#dailyAxis").innerHTML = `<span>${esc(days[0].date.slice(5).replace("-", "."))}</span><span>최대 ${nf.format(max)}건</span><span>${esc(days.at(-1).date.slice(5).replace("-", "."))}</span>`;
    cols.addEventListener("mousemove", (e) => {
      const c = e.target.closest(".col"); if (!c) return hideTip();
      const d = days[c.dataset.i];
      showTip(e, `<b>${esc(d.date)}</b><span>요청 ${nf.format(d.requests)}건 · 도구 실행 ${nf.format(d.toolRuns)}회<br/>입력 ${compact(d.inputTokens)} · 캐시 ${compact(d.cachedInputTokens)}</span>`);
    });
    cols.addEventListener("mouseleave", hideTip);
  }

  $("#insights").innerHTML = U.insights.map((s) => `
    <li class="insight reveal"><div class="insight__big">${esc(s.big)}</div><h4>${esc(s.title)}</h4><p>${esc(s.body)}</p></li>`).join("");

  const V = A.verification;
  $("#verify").innerHTML = `
    <div><p class="eyebrow">Fact check</p><h3 style="margin-top:10px">${esc(V.title)}</h3><p>${esc(V.body)}</p></div>
    <div class="vcases">${V.cases.map((c) => `
      <div class="vcase reveal"><span class="vcase__p">${esc(c.project)}</span><span class="vcase__before">${esc(c.before)}</span><span class="vcase__arrow">→</span><span class="vcase__after">${esc(c.after)}</span></div>`).join("")}
    </div>`;

  // [n] 표기를 근거 자료 링크로 바꿉니다.
  const cite = (s) => esc(s).replace(/\[(\d)\]/g, (_, n) => `<a class="cite" href="#ref-${n}" aria-label="근거 자료 ${n}">${n}</a>`);
  const TS = A.tokenSaving;
  if (TS) {
    $("#tokenLead").textContent = TS.lead;
    $("#saves").innerHTML = TS.items.map((it, i) => `
      <li class="save reveal">
        <div class="save__head"><span class="save__n">${String(i + 1).padStart(2, "0")}</span><h4>${esc(it.title)}</h4>${it.stat ? `<span class="save__stat">${esc(it.stat)}</span>` : ""}</div>
        <div class="save__row"><b>연구 근거</b><p>${cite(it.research)}</p></div>
        <div class="save__row save__row--mine"><b>내 실천</b><p>${esc(it.mine)}</p></div>
      </li>`).join("");
  }
  const PD = A.promptDesign;
  if (PD) {
    $("#designLead").innerHTML = cite(PD.lead);
    $("#designPlacement").innerHTML = `<b>왜 이 순서인가</b>${cite(PD.placement)}`;
    $("#designRetry").innerHTML = `<b>틀렸을 때</b>${cite(PD.retry)}`;
    const posLabel = { "앞": "앞 · 고정", "중간": "중간", "끝": "끝 · 확인" };
    let lastPos = null;
    $("#anatomy").innerHTML = PD.blocks.map((b) => {
      const sep = b.pos !== lastPos ? `<li class="anat__pos anat__pos--${b.pos === "앞" ? "head" : b.pos === "끝" ? "tail" : "mid"}" aria-hidden="true">${posLabel[b.pos]}</li>` : "";
      lastPos = b.pos;
      return `${sep}<li class="anat">
        <span class="anat__tag">## ${esc(b.tag)}</span>
        <div class="anat__body"><b>${esc(b.what)}</b><span>${esc(b.ex)}</span></div>
        <span class="anat__refs">${b.refs.map((n) => `<a class="cite" href="#ref-${n}">${n}</a>`).join("")}</span>
      </li>`;
    }).join("");
  }
  const CS = A.caseStudy;
  if (CS) {
    const col = (side, cls) => `
      <div class="case__col ${cls}">
        <h5>${esc(side.label)}</h5>
        <dl>${side.items.map((it) => `<div><dt>${esc(it.k)}</dt><dd><b>${esc(it.v)}</b>${it.note ? `<span>${esc(it.note)}</span>` : ""}</dd></div>`).join("")}</dl>
      </div>`;
    $("#caseStudy").innerHTML = `
      <p class="eyebrow">Case study · 직접 만들며 측정</p>
      <h3 id="caseTitle">${esc(CS.title)}</h3>
      <p class="case__lead">${esc(CS.lead)}</p>
      <ol class="case__steps">${CS.steps.map((s) => `<li><span>${esc(s.k)}</span><div><b>${esc(s.title)}</b><p>${esc(s.body)}</p></div></li>`).join("")}</ol>
      <div class="case__compare">${col(CS.compare.before, "case__col--before")}<span class="case__vs" aria-hidden="true">→</span>${col(CS.compare.after, "case__col--after")}</div>
      <p class="case__lesson"><b>배운 점</b>${esc(CS.lesson)}</p>
      <p class="case__files">만든 파일 · <code>${esc(CS.files)}</code></p>`;
  }

  $("#refs").innerHTML = (A.references || []).map((r) => `
    <li id="ref-${r.n}"><span class="refs__n">${r.n}</span><div><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a><span>${esc(r.org)} · ${esc(r.year)}</span></div></li>`).join("");
  // 인용 번호 클릭 시 탭 전환 없이 해당 출처로 스크롤
  document.getElementById("ai").addEventListener("click", (e) => {
    const c = e.target.closest(".cite"); if (!c) return;
    e.preventDefault();
    const t = document.querySelector(c.getAttribute("href"));
    t?.scrollIntoView({ behavior: "smooth", block: "center" });
    t?.classList.add("is-flash"); setTimeout(() => t?.classList.remove("is-flash"), 1400);
  });

  /* ---------------- Career ---------------- */
  $("#timeline").innerHTML = D.career.map((c) => `
    <li class="tl reveal">
      <div class="tl__top"><h3>${esc(c.org)}</h3><span class="tl__period">${esc(c.period)}</span></div>
      <p class="tl__role">${esc(c.role)}</p>
      <ul>${c.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
    </li>`).join("");
  const fact = (list) => list.map((x) => `<li><b>${esc(x.title)}</b><span>${esc(x.sub)}</span></li>`).join("");
  $("#edu").innerHTML = fact(D.education);
  $("#awards").innerHTML = fact(D.awards);
  $("#certs").innerHTML = fact(D.certs);

  $("#contactActions").innerHTML = `
    <a class="btn btn--primary" href="mailto:${esc(P.email)}">✉ ${esc(P.email)}</a>
    <a class="btn" href="${esc(P.github)}" target="_blank" rel="noopener">GitHub ↗</a>
    <a class="btn" href="${esc(P.velog)}" target="_blank" rel="noopener">Velog ↗</a>`;

  /* ---------------- Behaviors ---------------- */
  // Theme
  const themeBtn = $("#themeToggle");
  themeBtn.addEventListener("click", () => {
    const root = document.documentElement;
    const isDark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  // Reveal + bar animation
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("is-in")));

  const fillBars = () => jobBars.querySelectorAll(".hbar__fill").forEach((f) => (f.style.width = f.dataset.w + "%"));
  if ("IntersectionObserver" in window) {
    const bo = new IntersectionObserver((en) => { if (en[0].isIntersecting) { fillBars(); bo.disconnect(); } });
    bo.observe(jobBars);
  } else fillBars();

  // Scroll progress
  const prog = $("#progress");
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------------- Tabs ---------------- */
  const tabs = [...document.querySelectorAll(".tab")];
  const views = [...document.querySelectorAll(".view")];
  const ids = tabs.map((t) => t.dataset.tab);
  $("#tabProjCount").textContent = D.projects.length;
  let activeTab = null;

  function showTab(id, { focus = false } = {}) {
    if (!ids.includes(id)) id = "home";
    const changed = activeTab !== id;
    activeTab = id;
    tabs.forEach((t) => {
      const on = t.dataset.tab === id;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      if (on) {
        if (focus) t.focus();
        t.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    });
    views.forEach((v) => (v.hidden = v.dataset.view !== id));
    if (changed) {
      document.documentElement.style.scrollBehavior = "auto";
      scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = "";
      document.title = `${id === "home" ? "" : tabs.find((t) => t.dataset.tab === id).dataset.label + " · "}박정준 · Unreal Engine Client Developer`;
    }
    onScroll();
  }

  // 주소(#home, #projects, #ai, #career, #project-<id>, #project-<id>/<구현 번호>)와 탭을 연동
  const route = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    const m = h.match(/^project-([^/]+)(?:\/(\d+))?$/);
    if (m) {
      showTab("projects");
      const k = m[2] ? Number(m[2]) - 1 : -1;
      if (D.projects[current]?.id !== m[1] || currentPoint !== k || !drawer.open) openProject(m[1], k);
      return;
    }
    if (drawer.open) drawer.close();
    showTab(h || "home");
  };
  addEventListener("hashchange", route);

  // 키보드: 좌우 화살표 / Home / End 로 탭 이동
  $("#tabs").addEventListener("keydown", (e) => {
    const i = ids.indexOf(activeTab);
    let n = null;
    if (e.key === "ArrowRight") n = (i + 1) % ids.length;
    if (e.key === "ArrowLeft") n = (i - 1 + ids.length) % ids.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = ids.length - 1;
    if (n === null) return;
    e.preventDefault();
    location.hash = ids[n];
    tabs[n].focus();
  });

  route();
};

/* ---------------------------------------------------------
 * Codex 사용량 자동 데이터 (data/codex-usage.json)
 * tools/codex-usage 스크립트가 매일 생성합니다. 파일이 없거나
 * file:// 로 열어 fetch가 막히면 data.js 값을 그대로 씁니다.
 * --------------------------------------------------------- */
function applyCodexUsage(J) {
  const U = window.PORTFOLIO.ai.usage;
  const T = J.totals;
  const nf = new Intl.NumberFormat("ko-KR");
  const fmtDate = (s) => s.replaceAll("-", ".");
  U.period = `${fmtDate(J.range.from)} – ${fmtDate(J.range.to)} · 활동일 ${J.range.activeDays}일`;
  U.source = `Codex 로컬 세션 기록 자동 집계 · ${J.generatedAt.slice(0, 10)} 업데이트`;
  U.stats = [
    { label: "작업 세션", value: T.sessions, unit: "개" },
    { label: "작업 요청", value: T.requests, unit: "건" },
    { label: "도구 실행", value: T.toolRuns, unit: "회" },
    { label: "코드 패치", value: T.patches, unit: "회" },
  ];
  U.activity = [
    { label: "요청당 도구 실행", value: `약 ${(T.toolRuns / Math.max(1, T.requests)).toFixed(1)}회`, unit: "" },
    { label: "캐시 재사용률", value: `약 ${Math.round(T.cacheHitRate * 100)}%`, unit: "" },
    { label: "자동 승인 검토", value: T.guardianReviews, unit: "회" },
    { label: "활동일", value: J.range.activeDays, unit: "일" },
  ];
  if (J.projects?.length) U.projects = J.projects.map((p) => ({ name: p.name, value: p.requests }));
  if (J.stages?.length) {
    U.stages = J.stages.map((s) => ({ name: s.name, value: s.inputTokens }));
    U.dashboardNote = `Codex 기록 기준 · 도구 사용 패턴으로 단계 분류`;
  }
  U.daily = J.daily || [];
  const hero = window.PORTFOLIO.heroStats.find((h) => h.label === "Codex 작업 요청");
  if (hero) { hero.value = nf.format(T.requests); hero.sub = `${T.sessions}개 세션 · 도구 실행 ${nf.format(T.toolRuns)}회`; }
  const ins = window.PORTFOLIO.ai.usage.insights;
  if (ins[0]) { ins[0].big = `${(T.toolRuns / Math.max(1, T.requests)).toFixed(1)}회`; ins[0].body = `${nf.format(T.requests)}건의 요청이 ${nf.format(T.toolRuns)}번의 명령 실행·파일 수정으로 이어졌습니다. 질문 하나가 아니라 '탐색 → 수정 → 빌드 확인' 단위로 맡깁니다.`; }
  if (ins[1]) { ins[1].big = `${Math.round(T.cacheHitRate * 100)}%`; ins[1].body = `입력 토큰의 약 ${Math.round(T.cacheHitRate * 100)}%가 캐시에서 재사용됐습니다. 프로젝트 문서와 코드 맥락을 한 세션에 쌓아 두고 긴 작업을 이어갑니다.`; }
}

fetch("data/codex-usage.json", { cache: "no-store" })
  .then((r) => (r.ok ? r.json() : Promise.reject()))
  .then((J) => { try { if (J?.schemaVersion === 1) applyCodexUsage(J); } catch (e) { console.warn("codex-usage.json 적용 실패", e); } })
  .catch(() => {})
  .finally(renderPortfolio);
