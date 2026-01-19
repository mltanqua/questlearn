const STORAGE_KEY = "questionlearn_demo_v1"; 

const DEFAULT_STATE = {
    points: 0, 
    level: 1, 
    title: "New Adventurer", 
    completedQuests: {}, // questId: true 
    ownedItems: {}, // itemId: true 
    equipped: { hat: null, outfit: null, aura: null, pet: null }
}; 

const QUESTS = [
    { id: "reading-check", name: "Reading Check", points: 20 }, 
    { id: "vocab-practice", name: "Vocabulary Practice", points: 15 },
    { id: "reflection", name: "Reflection Prompt", points: 10 },
]; 

const ITEMS = [
  { id: "wizard-hat", name: "Wizard Hat", slot: "hat", price: 35 },
  { id: "scholar-cape", name: "Scholar’s Cape", slot: "outfit", price: 60 },
  { id: "glow-aura", name: "Glow Aura", slot: "aura", price: 40 },
  { id: "tiny-orb", name: "Tiny Orb Familiar", slot: "pet", price: 0 }
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    return { ...structuredClone(DEFAULT_STATE), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  render();
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function completeQuest(questId) {
  const state = loadState();
  if (state.completedQuests[questId]) return; // only once

  const quest = QUESTS.find(q => q.id === questId);
  if (!quest) return;

  state.completedQuests[questId] = true;
  state.points += quest.points;

  saveState(state);
  render();
}

function buyItem(itemId) {
  const state = loadState();
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return;

  if (state.ownedItems[itemId]) return;
  if (state.points < item.price) return;

  state.points -= item.price;
  state.ownedItems[itemId] = true;
  state.equipped[item.slot] = itemId;

  saveState(state);
  render();
}

function equipItem(itemId) {
  const state = loadState();
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return;

  const isFree = item.price === 0;
  if (!isFree && !state.ownedItems[itemId]) return;

  state.equipped[item.slot] = itemId;
  saveState(state);
  render();
}

function renderQuests(state) {
  const list = document.getElementById("questList");
  if (!list) return;

  list.innerHTML = "";
  for (const q of QUESTS) {
    const li = document.createElement("li");

    const done = !!state.completedQuests[q.id];
    li.textContent = `${q.name} (+${q.points}) `;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = done ? "Completed" : "Complete";
    btn.disabled = done;
    btn.addEventListener("click", () => completeQuest(q.id));

    li.appendChild(btn);
    list.appendChild(li);
  }
}

function renderShop(state) {
  const list = document.getElementById("shopGrid");
  if (!list) return;

  list.innerHTML = "";
  for (const item of ITEMS.filter(i => i.price > 0)) {
    const li = document.createElement("li");

    const owned = !!state.ownedItems[item.id];
    const equipped = state.equipped[item.slot] === item.id;

    li.textContent = `${item.name} (${item.slot}) - ${owned ? "Owned" : item.price + " pts"} `;

    const btn = document.createElement("button");
    btn.type = "button";

    if (!owned) {
      btn.textContent = "Buy";
      btn.disabled = state.points < item.price;
      btn.addEventListener("click", () => buyItem(item.id));
    } else {
      btn.textContent = equipped ? "Equipped" : "Equip";
      btn.disabled = equipped;
      btn.addEventListener("click", () => equipItem(item.id));
    }

    li.appendChild(btn);
    list.appendChild(li);
  }
}

function renderWardrobe(state) {
  const list = document.getElementById("wardrobeGrid");
  if (!list) return;

  list.innerHTML = "";

  const available = ITEMS.filter(i => i.price === 0 || state.ownedItems[i.id]);
  for (const item of available) {
    const li = document.createElement("li");

    const equipped = state.equipped[item.slot] === item.id;
    li.textContent = `${item.name} (${item.slot}) `;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = equipped ? "Equipped" : "Equip";
    btn.disabled = equipped;
    btn.addEventListener("click", () => equipItem(item.id));

    li.appendChild(btn);
    list.appendChild(li);
  }
}

function renderEquipped(state) {
  const slots = ["hat", "outfit", "aura", "pet"];
  for (const slot of slots) {
    const el = document.getElementById(`equipped-${slot}`);
    if (!el) continue;

    const id = state.equipped[slot];
    if (!id) {
      el.textContent = "None";
      continue;
    }
    const item = ITEMS.find(i => i.id === id);
    el.textContent = item ? item.name : "Unknown";
  }
}

function render() {
  const state = loadState();

  setText("pointsValue", state.points);
  setText("levelValue", state.level);
  setText("titleValue", state.title);

  renderQuests(state);
  renderShop(state);
  renderWardrobe(state);
  renderEquipped(state);

  const resetBtn = document.getElementById("resetDemoBtn");
  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.dataset.bound = "1";
    resetBtn.addEventListener("click", resetDemo);
  }
}

document.addEventListener("DOMContentLoaded", render);
