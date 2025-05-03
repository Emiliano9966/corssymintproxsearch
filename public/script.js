// particles.js config
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

// Element references
const searchInput = document.getElementById('searchInput');
const linkInput = document.getElementById('linkInput');
const typeSelect = document.getElementById('typeSelect');
const customTypeInput = document.getElementById('customTypeInput');
const errorMsg = document.getElementById('errorMsg');
const duplicateErrorMsg = document.getElementById('duplicateErrorMsg');
const linkList = document.getElementById('linkList');
const tabs = document.getElementById('tabs');
const addForm = document.getElementById('addForm');

// Data
let links = [];

function toggleForm() {
  addForm.classList.toggle('hidden');
}

function handleTypeChange(value) {
  customTypeInput.classList.toggle('hidden', value !== 'custom');
}

function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isDuplicate(url) {
  return links.some(link => link.url === url);
}

function submitLink() {
  const url = linkInput.value.trim();
  const type = typeSelect.value === 'custom' ? customTypeInput.value.trim() : typeSelect.value;

  errorMsg.classList.add('hidden');
  duplicateErrorMsg.classList.add('hidden');

  if (!validateURL(url)) {
    errorMsg.classList.remove('hidden');
    return;
  }

  if (isDuplicate(url)) {
    duplicateErrorMsg.classList.remove('hidden');
    return;
  }

  const newLink = { url, type, status: '✅', votes: { good: 0, bad: 0 } };
  links.push(newLink);
  renderLinks();
  updateTabs();

  linkInput.value = '';
  customTypeInput.value = '';
  typeSelect.value = 'Select Type';
  addForm.classList.add('hidden');
}

function renderLinks(filter = '') {
  linkList.innerHTML = '';

  const filteredLinks = links.filter(link => link.url.toLowerCase().includes(filter.toLowerCase()));

  for (const link of filteredLinks) {
    const wrapper = document.createElement('div');
    wrapper.className = 'link';

    const a = document.createElement('a');
    a.href = link.url;
    a.textContent = link.url;
    a.target = '_blank';

    const typeTag = document.createElement('span');
    typeTag.className = 'type';
    typeTag.textContent = `[${link.type}]`;

    const status = document.createElement('span');
    status.className = 'status';
    status.textContent = link.status;

    const voteGood = document.createElement('button');
    voteGood.textContent = `✅ ${link.votes.good}`;
    voteGood.onclick = () => rate(link, 'good');

    const voteBad = document.createElement('button');
    voteBad.textContent = `❌ ${link.votes.bad}`;
    voteBad.onclick = () => rate(link, 'bad');

    wrapper.appendChild(typeTag);
    wrapper.appendChild(a);
    wrapper.appendChild(status);
    wrapper.appendChild(voteGood);
    wrapper.appendChild(voteBad);
    linkList.appendChild(wrapper);
  }
}

function updateTabs() {
  const types = [...new Set(links.map(l => l.type))];
  tabs.innerHTML = '';

  types.forEach(type => {
    const btn = document.createElement('button');
    btn.textContent = type;
    btn.onclick = () => renderLinks(type);
    tabs.appendChild(btn);
  });

  // Add "All" tab
  if (types.length > 1) {
    const all = document.createElement('button');
    all.textContent = 'All';
    all.onclick = () => renderLinks();
    tabs.appendChild(all);
  }
}

function rate(link, type) {
  const key = `voted-${link.url}`;

  if (localStorage.getItem(key)) return;

  link.votes[type]++;
  localStorage.setItem(key, true);
  renderLinks(searchInput.value);
}

// Filter as you type
searchInput.addEventListener('input', e => renderLinks(e.target.value));
