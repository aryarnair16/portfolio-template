const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = (u) => (/^https?:\/\//i.test(u) ? u : '#');
const chips = (arr) => (arr || []).map((s) => `<li>${esc(s)}</li>`).join('');
const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Theme toggle */
const themeBtn = $('theme');
const updateThemeBtn = () => {
    const dark = root.dataset.theme === 'dark';
    themeBtn.textContent = dark ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
};
themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* ignore */ }
    updateThemeBtn();
});
updateThemeBtn();

/* Back to top */
const topBtn = $('top');
window.addEventListener('scroll', () => {
    topBtn.classList.toggle('show', window.scrollY > 400);
}, { passive: true });
topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
});

/* Scroll reveal */
const reveal = () => {
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
    }, { threshold: 0.08 });
    document.querySelectorAll('section, .card, .stat, .tl li').forEach((el) => {
        el.classList.add('reveal');
        io.observe(el);
    });
};

fetch('profile.json').then((r) => r.json()).then((p) => {
    document.title = `${p.name} | Portfolio`;
    $('name').textContent = p.name;
    $('tagline').textContent = p.tagline;
    $('bio').textContent = p.bio;
    $('interests').innerHTML = chips(p.interests);

    if (p.now) { $('now').textContent = p.now; } else { $('nowbox').hidden = true; }
    $('actions').innerHTML = p.resume
        ? `<a class="btn" href="${safe(p.resume)}" target="_blank" rel="noopener">Download resume</a>` : '';

    const skillCount = (p.skills || []).reduce((n, g) => n + (g.items || []).length, 0);
    const projects = (p.projects || []).length;
    const certs = (p.certificates || []).length;
    const acts = (p.involvement || []).length + (p.beyond || []).length;
    $('stats').innerHTML = [
        [projects, projects === 1 ? 'Project' : 'Projects'],
        [certs, 'Certificates & events'],
        [acts, 'Clubs & activities'],
        [skillCount, 'Skills & tools']
    ].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');

    $('skills').innerHTML = (p.skills || []).map((g) =>
        `<h3 class="group">${esc(g.group)}</h3><ul class="chips">${chips(g.items)}</ul>`).join('');

    $('projects').innerHTML = (p.projects || []).map((x) =>
        `<div class="card project">` +
        (x.image ? `<img class="shot" src="${esc(x.image)}" alt="Screenshot of ${esc(x.title)}">` : '') +
        `<h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p>` +
        (x.features ? `<details class="features"><summary>Show features (${x.features.length})</summary>` +
            `<ul>${x.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul></details>` : '') +
        (x.stack ? `<p class="meta">Built with:</p><ul class="chips tags">${chips(x.stack)}</ul>` : '') +
        (x.tags ? `<ul class="chips tags">${chips(x.tags)}</ul>` : '') +
        (x.status ? `<p class="meta">${esc(x.status)}</p>` : '') +
        `<a href="${safe(x.link)}" target="_blank" rel="noopener">View project</a></div>`).join('');

    $('certificates').innerHTML = (p.certificates || []).map((c) =>
        `<div class="card patch"><h3>${esc(c.title)}</h3><p class="meta">${esc(c.issuer)}</p>` +
        (c.date ? `<p>${esc(c.date)}</p>` : '') + `</div>`).join('');

    $('timeline').innerHTML = (p.timeline || []).map((t) =>
        `<li><span class="when">${esc(t.when)}</span><h3>${esc(t.title)}</h3>` +
        `<p class="meta">${esc(t.note)}</p></li>`).join('');

    $('education').innerHTML = (p.education || []).map((e) =>
        `<div class="card"><h3>${esc(e.school)}</h3><p>${esc(e.degree)}</p>` +
        `<p class="meta">${esc(e.period)}</p></div>`).join('');

    $('involvement').innerHTML = (p.involvement || []).map((i) =>
        `<div class="card"><h3>${esc(i.role)}</h3><p class="meta">${esc(i.org)}</p>` +
        `<p>${esc(i.note)}</p></div>`).join('');

    $('beyond').innerHTML = (p.beyond || []).map((b) =>
        `<div class="card"><h3><span aria-hidden="true">${esc(b.icon)}</span> ${esc(b.title)}</h3>` +
        `<p>${esc(b.text)}</p></div>`).join('');

    $('links').innerHTML = Object.entries(p.links || {}).map(([k, v]) =>
        `<a href="${safe(v)}" target="_blank" rel="noopener">${esc(k)}</a>`).join('');

    $('copy').textContent = `\u00A9 ${new Date().getFullYear()} ${p.name}`;
    reveal();
}).catch((err) => {
    console.error('Could not load profile.json', err);
    $('bio').textContent = 'Could not load profile data. Please refresh the page.';
});