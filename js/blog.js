/*
 * 블로그 탭: data/blog.json(tools/blog/update.mjs가 Velog에서 생성)을 카드로 보여줍니다.
 * 카드를 누르면 Velog 원문이 새 탭에서 열립니다.
 */
(() => {
  const $ = (s) => document.querySelector(s);
  const list = $("#posts");
  if (!list) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`; };
  const PAGE = 12;
  const VELOG = "https://velog.io/@wjdwns/posts";

  let posts = [];
  let tag = "all";
  let query = "";
  let shown = PAGE;

  const filterBar = $("#blogFilters");
  const search = $("#blogSearch");
  const more = $("#blogMore");
  const count = $("#blogCount");

  function filtered() {
    const q = query.trim().toLowerCase();
    return posts.filter((p) =>
      (tag === "all" || p.tags.includes(tag)) &&
      (!q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  function card(p) {
    const thumb = p.thumbnail
      ? `<img src="${esc(p.thumbnail)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
      : `<span class="post__ph" aria-hidden="true"><i>// post</i><b>${esc(p.title)}</b></span>`;
    return `
      <li class="post">
        <a href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${esc(p.title)} — Velog에서 읽기">
          <div class="post__thumb">${thumb}</div>
          <div class="post__body">
            <time class="post__date" datetime="${esc(p.date)}">${fmt(p.date)}</time>
            <h3 class="post__title">${esc(p.title)}</h3>
            ${p.summary ? `<p class="post__sum">${esc(p.summary)}</p>` : ""}
            <div class="post__foot">
              <span class="post__tags">${p.tags.slice(0, 3).map((t) => `<span>#${esc(t)}</span>`).join("")}</span>
              <span class="post__go" aria-hidden="true">↗</span>
            </div>
          </div>
        </a>
      </li>`;
  }

  function render() {
    const items = filtered();
    list.innerHTML = items.slice(0, shown).map(card).join("") ||
      `<li class="post post--empty"><p>조건에 맞는 글이 없습니다.</p></li>`;
    more.hidden = items.length <= shown;
    more.textContent = `더 보기 (${Math.min(PAGE, items.length - shown)}개 더 · 남은 ${items.length - shown}개)`;
    count.textContent = `${items.length}개 글${tag !== "all" ? ` · #${tag}` : ""}${query ? ` · "${query}"` : ""}`;
    // 썸네일을 못 불러오면 제목 카드로 대체
    list.querySelectorAll(".post__thumb img").forEach((img) => {
      img.addEventListener("error", () => {
        const t = img.closest(".post").querySelector(".post__title").textContent;
        img.replaceWith(Object.assign(document.createElement("span"), { className: "post__ph", innerHTML: `<i>// post</i><b>${esc(t)}</b>` }));
      }, { once: true });
    });
  }

  function renderFilters() {
    const freq = {};
    posts.forEach((p) => p.tags.forEach((t) => (freq[t] = (freq[t] || 0) + 1)));
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 8);
    filterBar.innerHTML = [["all", posts.length], ...top].map(([t, n]) =>
      `<button class="chip" type="button" data-tag="${esc(t)}" aria-pressed="${t === tag}">${t === "all" ? "전체" : "#" + esc(t)}<span class="count">${n}</span></button>`
    ).join("");
  }

  filterBar.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tag]");
    if (!b) return;
    tag = b.dataset.tag;
    shown = PAGE;
    filterBar.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b));
    render();
  });
  let t;
  search.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => { query = search.value; shown = PAGE; render(); }, 150);
  });
  more.addEventListener("click", () => { shown += PAGE; render(); });

  fetch("data/blog.json", { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((J) => {
      posts = (J.posts || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
      const lead = $("#blogLead");
      if (lead) lead.innerHTML = `Velog에 쓴 기술 글 <b>${posts.length}개</b>입니다. 카드를 누르면 원문으로 이동합니다. <a href="${VELOG}" target="_blank" rel="noopener">Velog에서 전체 보기 ↗</a>`;
      renderFilters();
      render();
    })
    .catch(() => {
      list.innerHTML = `<li class="post post--empty"><p>글 목록을 불러오지 못했습니다. <a href="${VELOG}" target="_blank" rel="noopener">Velog에서 보기 ↗</a></p></li>`;
      count.textContent = "";
    });
})();
