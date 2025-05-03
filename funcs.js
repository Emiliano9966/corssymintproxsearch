let links = [];
let currentTab = 0;
const linksPerPage = 5;

// API endpoints
const API_URL = '/api/links';

async function fetchLinks() {
  const res = await fetch(API_URL);
  links = await res.json();
  renderLinks();
}

async function submitLink() {
  const urlIn = document.getElementById("linkInput");
  const typeSel = document.getElementById("typeSelect");
  const customIn = document.getElementById("customTypeInput");
  const error = document.getElementById("errorMsg");
  const duplicateError = document.getElementById("duplicateErrorMsg");

  let url = urlIn.value.trim();
  let type = typeSel.value;

  if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
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

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, type })
    });

    if (res.status === 409) {
      duplicateError.classList.remove("hidden");
      return;
    }

    await fetchLinks();
    toggleForm();
    urlIn.value = '';
    customIn.value = '';
    typeSel.selectedIndex = 0;
    customIn.classList.add("hidden");
    error.classList.add("hidden");
    duplicateError.classList.add("hidden");

  } catch (err) {
    console.error(err);
  }
}

async function rate(index, direction) {
  const link = links[index];
  if (!link || link.voted) return;

  await fetch(API_URL, {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: link.url, direction })
  });

  link.voted = true;
  await fetchLinks();
}

function renderLinks() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const list = document.getElementById("linkList");
  const tabs = document.getElementById("tabs");

  const filteredLinks = links.filter(l =>
    l.url.toLowerCase().includes(search) ||
    l.type.toLowerCase().includes(search)
  );

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
        <button ${link.voted ? 'disabled' : ''} onclick="rate(${i}, 'up')">✔️ ${link.up}</button>
        <button ${link.voted ? 'disabled' : ''} onclick="rate(${i}, 'down')">❌ ${link.down}</button>
        <button onclick="copyToClipboard('${link.url}')">📋</button>
      </div>
    `;
    list.appendChild(div);
  });

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

// Utility Functions
function isValidURL(str) {
  const pattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/.*)?$/i;
  return pattern.test(str);
}

function copyToClipboard(txt) {
  navigator.clipboard.writeText(txt);
}

function switchTab(tabIndex) {
  currentTab = tabIndex;
  renderLinks();
}

function toggleForm() {
  document.getElementById("errorMsg").classList.add("hidden");
  document.getElementById("duplicateErrorMsg").classList.add("hidden");
  document.getElementById("addForm").classList.toggle("hidden");
}

function handleTypeChange(value) {
  document.getElementById("customTypeInput").classList.toggle("hidden", value !== "custom");
}

document.getElementById("searchInput").addEventListener("input", renderLinks);

fetchLinks(); // load initial data
