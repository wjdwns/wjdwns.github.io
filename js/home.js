/*
 * 홈 화면 추가 블록: 핵심 역량 · 대표 프로젝트 · 최근 블로그 글
 * 내용은 data.js(home, projects)와 data/blog.json에서 가져옵니다.
 */
(() => {
  const D = window.PORTFOLIO || {};
  const H = D.home || {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* 핵심 역량 */
  const strengths = $("#strengths");
  if (strengths && H.strengths) {
    strengths.innerHTML = H.strengths.map((s, i) => `
      <li class="strength">
        <div class="strength__head"><span class="strength__key">${esc(s.key)}</span><span class="strength__no">${String(i + 1).padStart(2, "0")}</span></div>
        <h3>${esc(s.title)}</h3>
        <p class="strength__sub">${esc(s.sub)}</p>
        <p class="strength__body">${esc(s.body)}</p>
        <div class="strength__tags">${s.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
        <ul class="strength__ev" aria-label="${esc(s.title)} 근거">
          ${s.evidence.map((e) => `<li><a href="${esc(e.href)}"><i aria-hidden="true">↳</i>${esc(e.label)}</a></li>`).join("")}
        </ul>
      </li>`).join("");
  }

  /* 대표 프로젝트 */
  const featured = $("#featured");
  const p = (D.projects || []).find((x) => x.id === H.featured);
  if (featured && p) {
    featured.innerHTML = `
      <a class="featured__media" href="#project-${esc(p.id)}" aria-label="${esc(p.title)} 자세히 보기">
        <img src="${esc(p.cover)}" alt="${esc(p.title)} 대표 화면" loading="lazy" />
        ${p.award ? `<span class="featured__award">🏆 ${esc(p.award)}</span>` : ""}
      </a>
      <div class="featured__body">
        <div class="node__head" aria-hidden="true"><i class="pin"></i><span>PROJECT_${esc(p.no)}</span><em>${esc(p.team)}</em><i class="pin pin--out"></i></div>
        <div class="featured__text">
          <h3>${esc(p.title)}</h3>
          <p class="featured__tag">${esc(p.tagline)}</p>
          <dl class="featured__meta">
            <div><dt>기간</dt><dd>${esc(p.period)}</dd></div>
            <div><dt>담당</dt><dd>${esc(p.role)}</dd></div>
          </dl>
          <ol class="featured__points">
            ${p.points.map((pt, k) => `<li><a href="#project-${esc(p.id)}/${k + 1}"><span>${String(k + 1).padStart(2, "0")}</span>${esc(pt.title)}<i aria-hidden="true">›</i></a></li>`).join("")}
          </ol>
          <div class="featured__cta">
            <a class="btn btn--primary" href="#project-${esc(p.id)}">프로젝트 자세히 보기</a>
            ${p.video ? `<a class="btn" href="${esc(p.video)}" target="_blank" rel="noopener">▶ 시연 영상</a>` : ""}
          </div>
        </div>
      </div>`;
  }

  /* 최근 블로그 글 */
  const homePosts = $("#homePosts");
  if (homePosts) {
    const fmt = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`; };
    fetch("data/blog.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((J) => {
        const latest = (J.posts || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 3);
        homePosts.innerHTML = latest.map((x) => `
          <li class="post">
            <a href="${esc(x.url)}" target="_blank" rel="noopener" aria-label="${esc(x.title)} — Velog에서 읽기">
              <div class="post__thumb">${x.thumbnail
                ? `<img src="${esc(x.thumbnail)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
                : `<span class="post__ph" aria-hidden="true"><i>// post</i><b>${esc(x.title)}</b></span>`}</div>
              <div class="post__body">
                <time class="post__date" datetime="${esc(x.date)}">${fmt(x.date)}</time>
                <h3 class="post__title">${esc(x.title)}</h3>
                <div class="post__foot"><span class="post__tags">${(x.tags || []).slice(0, 2).map((t) => `<span>#${esc(t)}</span>`).join("")}</span><span class="post__go" aria-hidden="true">↗</span></div>
              </div>
            </a>
          </li>`).join("");
      })
      .catch(() => {
        homePosts.innerHTML = `<li class="post post--empty"><p><a href="#blog">블로그 탭에서 보기 →</a></p></li>`;
      });
  }
})();
