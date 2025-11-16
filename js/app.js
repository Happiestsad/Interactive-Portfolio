// Simple portfolio script
async function fetchProjects() {
  const res = await fetch('projects.json');
  return res.json();
}

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k.startsWith('data-')) e.setAttribute(k, v);
    else e[k] = v;
  });
  children.flat().forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

function renderProjectCard(p) {
  const card = el('article', { class: 'bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition' },
    el('img', { src: p.screenshot, alt: p.title, class: 'rounded h-44 w-full object-cover mb-3' }),
    el('h4', { class: 'font-semibold mb-1' }, p.title),
    el('p', { class: 'text-sm text-slate-600 mb-3' }, p.description),
    el('div', { class: 'flex items-center justify-between' },
      el('div', { class: 'text-xs text-slate-500' }, p.tags.join(' • ')),
      el('div', { class: 'flex gap-2' },
        el('button', { class: 'px-3 py-1 border rounded text-sm', onclick: () => openModal(p) }, 'View'),
        el('a', { class: 'px-3 py-1 bg-slate-100 rounded text-sm', href: p.repo, target: '_blank' }, 'Repo')
      )
    )
  );
  return card;
}

function populateTagFilter(projects) {
  const set = new Set();
  projects.forEach(p => p.tags.forEach(t => set.add(t)));
  const sel = document.getElementById('tagFilter');
  Array.from(set).sort().forEach(tag => {
    const opt = el('option', { value: tag }, tag);
    sel.appendChild(opt);
  });
}

function updateCount(n) {
  document.getElementById('count').textContent = n;
}

function openModal(p) {
  const modal = document.getElementById('projectModal');
  document.getElementById('modalTitle').textContent = p.title;
  document.getElementById('modalDesc').textContent = p.description;
  document.getElementById('modalImage').src = p.screenshot;
  const links = document.getElementById('modalLinks');
  links.innerHTML = '';
  if (p.live) links.appendChild(el('a', { href: p.live, target: '_blank', class: 'px-3 py-1 border rounded' }, 'Live'));
  if (p.repo) links.appendChild(el('a', { href: p.repo, target: '_blank', class: 'px-3 py-1 border rounded' }, 'Repo'));
  document.getElementById('modalTags').textContent = 'Tags: ' + (p.tags || []).join(', ');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('projectModal');
  modal.style.display = 'none';
  modal.classList.add('hidden');
}

function filterAndRender(projects) {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const tag = document.getElementById('tagFilter').value;
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '';
  let filtered = projects.filter(p => {
    const matchesQuery = !q || (p.title + ' ' + p.description + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q);
    const matchesTag = !tag || (p.tags || []).includes(tag);
    return matchesQuery && matchesTag;
  });
  updateCount(filtered.length);
  filtered.forEach(p => grid.appendChild(renderProjectCard(p)));
}

(async function init() {
  const projects = await fetchProjects();
  populateTagFilter(projects);
  filterAndRender(projects);

  document.getElementById('search').addEventListener('input', () => filterAndRender(projects));
  document.getElementById('tagFilter').addEventListener('change', () => filterAndRender(projects));
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') closeModal();
  });

  // Basic contact form behaviour (static)
  document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // For demo: show a message (integrate with Formspree/Netlify later)
    document.getElementById('contactStatus').textContent = 'Thanks! (This is a demo contact form)';
    this.reset();
  });
})();
