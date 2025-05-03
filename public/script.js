// ─── Particles.js Initialization ─────────────────────────────────────────────
particlesJS('particles-js', {
  particles: {
    number: { value: 60 },
    color: { value: '#9c5eff' },
    shape: { type: 'circle' },
    opacity: { value: 0.5 },
    size: { value: 3 },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#9c5eff',
      opacity: 0.4,
      width: 1
    },
    move: { enable: true, speed: 2 }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: { enable: true, mode: 'grab' },
      onclick: { enable: true, mode: 'push' }
    },
    modes: {
      grab: { distance: 200, line_linked: { opacity: 0.5 } },
      push: { particles_nb: 4 }
    }
  }
});

// ─── ELEMENT REFS ─────────────────────────────────────────────────────────────
const searchInput       = document.getElementById('searchInput');
const linkInput         = document.getElementById('linkInput');
const typeSelect        = document.getElementById('typeSelect');
const customTypeInput   = document.getElementById('customTypeInput');
const errorMsg          = document.getElementById('errorMsg');
const duplicateErrorMsg = document.getElementById('duplicateErrorMsg');
const linkList          = document.getElementById('linkList');
const tabsContainer     = document.getElementById('tabs');
const addForm           = document.getElementById('addForm');

// ─── DATA STORAGE ─────────────────────────────────────────────────────────────
let links = [];

// ─── FORM TOGGLE & TYPE HANDLING ─────────────────────────────────────────────
function toggleForm() {
  errorMsg.classList.add('hidden');
  duplicateErrorMsg.classList.add('hidden');
  addForm.classList.toggle('hidden');
}

function handleTypeChange(value) {
  customTypeInput.classList.toggle('hidden', value !== 'custom');
}

// ─── VALIDATION ────────────────────────────────────────────────────────────────
function validateURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function isDuplicate(url) {
  return links.some(link => link.url === url);
}

// ─── SUBMIT NEW LINK ───────────────────────────────────────────────────────────
function submitLink() {
  const rawUrl = linkInput.value.trim();
  const url    = rawUrl.startsWith('http') ? rawUrl : 'http://' + rawUrl;
  let   type   = typeSelect.value === 'custom'
               ? customTypeInput.value.trim()
               : typeSelect.value;

  errorMsg.classList.add('hidden');
  duplicateErrorMsg.classList.add('hidden');

  if (!validateURL(url)) {
    errorMsg.textContent = 'Please enter a valid URL!';
    errorMsg.classList.remove('hidden');
    return;
  }

  if (!type || type === 'Select Type') {
    errorMsg.textContent = 'Please select a type!';
    errorMsg.classList.remove('hidden');
    return;
  }

  if (isDuplicate(url)) {
    duplicateErrorMsg.classList.remove('hidden');
    return;
  }

  links.push({ url, type, votes: { up: 0, down: 0 } });
  renderLinks();
  updateTabs();

  // reset form
  linkInput.value       = '';
  typeSelect.selectedIndex = 0;
  customTypeInput.value = '';
  addForm.classList.add('hidden');
}

// ─── RENDER LINKS ──────────────────────────────────────────────────────────────
function renderLinks(filter = '') {
  linkList.innerHTML = '';
  const filtered = links.filter(l =>
    l.url.toLowerCase().includes(filter.toLowerCase()) ||
    l.type.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach((link, idx) => {
    const item = document.createElement('div');
    item.className = 'link-item';

    item.innerHTML = `
      <div class="link-info">
        <div class="link-type">[${link.type}]</div>
        <a href="${link.url}" target="_blank">${link.url}</a>
      </div>
      <div class="rating">
        <button ${localStorage.getItem(link.url) ? 'disabled' : ''}
          onclick="rate(${idx}, 'up')">✔️ ${link.votes.up}</button>
        <button ${localStorage.getItem(link.url) ? 'disabled' : ''}
          onclick="rate(${idx}, 'down')">❌ ${link.votes.down}</button>
        <button onclick="copyToClipboard('${link.url}')">📋</button>
      </div>
    `;

    linkList.appendChild(item);
  });
}

// ─── UPDATE TABS ───────────────────────────────────────────────────────────────
function updateTabs() {
  const types = [...new Set(links.map(l => l.type))];
  tabsContainer.innerHTML = '';

  types.forEach(type => {
    const btn = document.createElement('button');
    btn.textContent = type;
    btn.onclick   = () => renderLinks(type);
    tabsContainer.appendChild(btn);
  });

  if (types.length > 1) {
    const allBtn = document.createElement('button');
    allBtn.textContent = 'All';
    allBtn.onclick     = () => renderLinks();
    tabsContainer.appendChild(allBtn);
  }
}

// ─── VOTING WITH ANTI-SPAM ────────────────────────────────────────────────────
function rate(index, direction) {
  const link = links[index];
  if (localStorage.getItem(link.url)) return;

  link.votes[direction]++;
  localStorage.setItem(link.url, 'voted');
  renderLinks(searchInput.value);
}

// ─── COPY TO CLIPBOARD ────────────────────────────────────────────────────────
function copyToClipboard(txt) {
  navigator.clipboard.writeText(txt);
}

// ─── LIVE SEARCH ──────────────────────────────────────────────────────────────
searchInput.addEventListener('input', e => renderLinks(e.target.value));

// ─── INITIAL RENDER ──────────────────────────────────────────────────────────
renderLinks();
