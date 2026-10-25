const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = (u) => (/^https?:\/\//i.test(u) ? u : '#');
const chips = (arr) => (arr || []).map((s) => `<li>${esc(s)}</li>`).join('');

fetch('profile.json').then((r) => r.json()).then((p) => {
    document.title = `${p.name} | Portfolio`;
    $('name').textContent = p.name;
    $('tagline').textContent = p.tagline;
    $('bio').textContent = p.bio;
    $('interests').innerHTML = chips(p.interests);
    $('skills').innerHTML = chips(p.skills);

    $('education').innerHTML = (p.education || []).map((e) =>
        `<div class="card"><h3>${esc(e.school)}</h3><p>${esc(e.degree)}</p>` +
        `<p class="meta">${esc(e.period)}</p></div>`).join('');

    $('involvement').innerHTML = (p.involvement || []).map((i) =>
        `<div class="card"><h3>${esc(i.role)}</h3><p class="meta">${esc(i.org)}</p>` +
        `<p>${esc(i.note)}</p></div>`).join('');

    $('projects').innerHTML = (p.projects || []).map((x) =>
        `<div class="card project"><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p>` +
        (x.features ? `<ul>${x.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : '') +
        (x.tags ? `<ul class="chips tags">${chips(x.tags)}</ul>` : '') +
        (x.status ? `<p class="meta">${esc(x.status)}</p>` : '') +
        `<a href="${safe(x.link)}" target="_blank" rel="noopener">View project</a></div>`).join('');

    $('links').innerHTML = Object.entries(p.links || {}).map(([k, v]) =>
        `<a href="${safe(v)}" target="_blank" rel="noopener">${esc(k)}</a>`).join('');

    $('footer').textContent = `\u00A9 ${new Date().getFullYear()} ${p.name}`;
});