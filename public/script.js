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
      grab: { distance: 200, line_linked: { opacity: 0.5 }},
      push: { particles_nb: 4 }
    }
  }
});


let links = [];
let currentTab = 0;
const linksPerPage = 5;

// Load links from localStorage if available
function loadLinks() {
  const storedLinks = localStorage.getItem('links');
  if (storedLinks) {
    links = JSON.parse(storedLinks);
  }
  renderLinks();
}

// Save links to localStorage
function saveLinks() {
  localStorage.setItem('links', JSON.stringify(links));
}

// Toggle Add Link Form
function toggleForm() {
  document.getElementById("errorMsg").classList.add("hidden");
  document.getElementById("duplicateErrorMsg").classList.add("hidden");
  document.getElementById("addForm").classList.toggle("hidden");
}

// Show/hide custom‐type input
function handleTypeChange(value) {
  document.getElementById("customTypeInput").classList.toggle("hidden", value !== "custom");
}

// URL validation
function isValidURL(str) {
  const pattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/.*)?$/i;
  return pattern.test(str);
}

// Check if link already exists
function isDuplicateLink(url) {
  return links.some(link => link.url === url);
}

// Submit new link
function submitLink() {
  const urlIn = document.getElementById("linkInput");
  const typeSel = document.getElementById("typeSelect");
  const customIn = document.getElementById("customTypeInput");
  const error = document.getElementById("errorMsg");
  const duplicateError = document.getElementById("duplicateErrorMsg");

  let url = urlIn.value.trim();
  let type = typeSel.value;

  if (isDuplicateLink(url)) {
    duplicateError.classList.remove("hidden");
    return;
  }

  if (!isValidURL(url)) {
    error.classList.remove("hidden");
    return;
  }

  if (type === "Select Type" || !type) {
    error.textContent = "Please select a type!";
    error.classList.remove("hidden");
    return;
  }

  if (type === "custom") {
    const c = customIn.value.trim();
    if (!c) {
      error.textContent = "Please enter your custom type!";
      error.classList.remove("hidden");
      return;
    }
    type = c;
  }

  links.push({ url, type, up: 0, down: 0, voted: false });
  urlIn.value = "";
  typeSel.selectedIndex = 0;
  customIn.value = "";
  customIn.classList.add("hidden");
  error.classList.add("hidden");
  duplicateError.classList.add("hidden");

  saveLinks();
  renderLinks();
  toggleForm();
}

// Render list & ratings
function renderLinks() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const list = document.getElementById("linkList");
  const tabs = document.getElementById("tabs");

  // Filter and paginate the links
  const filteredLinks = links.filter(l =>
    l.url.toLowerCase().includes(search) ||
    l.type.toLowerCase().includes(search)
  );

  // Determine which links to show on the current tab
  const startIndex = currentTab * linksPerPage;
  const endIndex = startIndex + linksPerPage;
  const linksToShow = filteredLinks.slice(startIndex, endIndex);

  list.innerHTML = "";
  linksToShow.forEach((link, i) => {
    const div = document.createElement("div");
    div.className = "link-item";
    div.innerHTML = `
      <div class="link-info">
        <div class="link-type">${link.type}</div>
        <div>${link.url}</div>
      </div>
      <div class="rating">
        <button ${link.voted ? 'disabled' : ''} onclick="rate(${i}, 'up')">
          ✔️ ${link.up}
        </button>
        <button ${link.voted ? 'disabled' : ''} onclick="rate(${i}, 'down')">
          ❌ ${link.down}
        </button>
        <button onclick="copyToClipboard('${link.url}')">📋</button>
      </div>
    `;
    list.appendChild(div);
  });

  // Handle tab creation
  const numTabs = Math.ceil(filteredLinks.length / linksPerPage);
  tabs.innerHTML = "";
  for (let i = 0; i < numTabs; i++) {
    const tab = document.createElement("button");
    tab.textContent = i + 1;
    tab.classList.toggle("active", i === currentTab);
    tab.onclick = () => switchTab(i);
    tabs.appendChild(tab);
  }
}

// Switch between tabs
function switchTab(tabIndex) {
  currentTab = tabIndex;
  renderLinks();
}

// Handle a vote
function rate(index, type) {
  if (links[index].voted) return;
  links[index][type === 'up' ? 'up' : 'down']++;
  links[index].voted = true;
  saveLinks();
  renderLinks();
}

// Copy link
function copyToClipboard(txt) {
  navigator.clipboard.writeText(txt);
}

// Live search
document.getElementById("searchInput")
  .addEventListener("input", renderLinks);

// Load saved links on page load
window.onload = loadLinks;
