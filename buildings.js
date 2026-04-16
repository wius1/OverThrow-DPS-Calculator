const BUILDING_STORAGE_KEY = "overthrow_building_state_v3";
const STATS_FILE = "building_stats.txt";
const MAX_CORE_SLOTS = 10;

const CORE_TYPES = {
  income: { emoji: "✴️", name: "Ядро дохода" },
  capacity: { emoji: "✳️", name: "Ядро вместимости" },
  hp: { emoji: "❤️", name: "Ядро здоровья" },
  regen: { emoji: "♻️", name: "Ядро регенерации" }
};

const levelInput = document.getElementById("levelInput");
const levelRange = document.getElementById("levelRange");
const levelMinus = document.getElementById("levelMinus");
const levelPlus = document.getElementById("levelPlus");
const buildingError = document.getElementById("buildingError");

const boostsToggle = document.getElementById("boostsToggle");
const boostsGrid = document.getElementById("boostsGrid");

const farmBoost = document.getElementById("farmBoost");
const clanIncomeBoost = document.getElementById("clanIncomeBoost");
const clanDefenseBoost = document.getElementById("clanDefenseBoost");
const clanMultiplier = document.getElementById("clanMultiplier");

const farmBoostPreview = document.getElementById("farmBoostPreview");
const clanIncomeBoostPreview = document.getElementById("clanIncomeBoostPreview");
const clanDefenseBoostPreview = document.getElementById("clanDefenseBoostPreview");
const clanMultiplierPreview = document.getElementById("clanMultiplierPreview");

const buildingIcon = document.getElementById("buildingIcon");
const buildingName = document.getElementById("buildingName");
const buildingLevelTitle = document.getElementById("buildingLevelTitle");

const statIncome = document.getElementById("statIncome");
const statCapacity = document.getElementById("statCapacity");
const statRegen = document.getElementById("statRegen");
const statHp = document.getElementById("statHp");

const coresHeader = document.getElementById("coresHeader");
const coresNextUnlock = document.getElementById("coresNextUnlock");
const coresGrid = document.getElementById("coresGrid");
const coreTotalsList = document.getElementById("coreTotalsList");
const clearCoresBtn = document.getElementById("clearCoresBtn");

const coreModalBackdrop = document.getElementById("coreModalBackdrop");
const coreModalClose = document.getElementById("coreModalClose");
const coreCancelBtn = document.getElementById("coreCancelBtn");
const coreRemoveBtn = document.getElementById("coreRemoveBtn");
const coreSaveBtn = document.getElementById("coreSaveBtn");
const coreTypeGrid = document.getElementById("coreTypeGrid");
const coreLevelMinus = document.getElementById("coreLevelMinus");
const coreLevelPlus = document.getElementById("coreLevelPlus");
const coreLevelInput = document.getElementById("coreLevelInput");
const corePreview = document.getElementById("corePreview");

const buildingStats = new Map();

const BUILDING_TIERS = [
  { min: 1, max: 9, icon: "🌾", name: "Поле" },
  { min: 10, max: 19, icon: "🪵", name: "Лесопилка" },
  { min: 20, max: 29, icon: "🌳", name: "Роща" },
  { min: 30, max: 39, icon: "🪨", name: "Каменоломня" },
  { min: 40, max: 49, icon: "🧱", name: "Кирпичный завод" },
  { min: 50, max: 59, icon: "🛖", name: "Лачуга" },
  { min: 60, max: 69, icon: "🏚️", name: "Развалюха" },
  { min: 70, max: 79, icon: "🏠", name: "Дом" },
  { min: 80, max: 89, icon: "🏡", name: "Усадьба" },
  { min: 90, max: 99, icon: "🏘️", name: "Квартал" },
  { min: 100, max: 109, icon: "🏗️", name: "Стройплощадка" },
  { min: 110, max: 119, icon: "🏭", name: "Завод" },
  { min: 120, max: 129, icon: "🏢", name: "Офисный центр" },
  { min: 130, max: 130, icon: "❓", name: "???" }
];

let currentEditingCoreIndex = null;
let currentEditingCoreType = "income";

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";

  if (Math.abs(n) >= 1000000) {
    return `${(n / 1000000).toFixed(1)}М`;
  }

  if (Math.abs(n) >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }

  return n.toLocaleString("ru-RU");
}

function clampLevel(value) {
  let n = Number(value);
  if (!Number.isFinite(n)) n = 1;
  n = Math.floor(n);
  if (n < 1) n = 1;
  if (n > 130) n = 130;
  return n;
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clampCoreLevel(value) {
  let n = Number(value);
  if (!Number.isFinite(n)) n = 0;
  n = Math.floor(n);
  if (n < 0) n = 0;
  if (n > 999) n = 999;
  return n;
}

function coreMultiplier(level) {
  return 1 + 0.49 * level;
}

function formatCoreMultiplier(level) {
  const value = coreMultiplier(level);
  const rounded = Math.floor(value * 100) / 100;
  return rounded % 1 === 0 ? String(rounded.toFixed(0)) : String(rounded.toFixed(2));
}

function getUnlockedCoreSlots(buildingLevel) {
  return Math.min(MAX_CORE_SLOTS, Math.floor((buildingLevel - 1) / 20) + 1);
}

function getNextCoreUnlockLevel(buildingLevel) {
  const unlocked = getUnlockedCoreSlots(buildingLevel);
  if (unlocked >= MAX_CORE_SLOTS) return null;
  return unlocked * 20;
}

function defaultCoreSlots() {
  return Array.from({ length: MAX_CORE_SLOTS }, () => null);
}

function saveState() {
  const state = {
    level: clampLevel(levelInput.value),
    boostsEnabled: boostsToggle.checked,
    farmBoost: farmBoost.value,
    clanIncomeBoost: clanIncomeBoost.value,
    clanDefenseBoost: clanDefenseBoost.value,
    clanMultiplier: clanMultiplier.value,
    cores: getSanitizedCoreState()
  };

  localStorage.setItem(BUILDING_STORAGE_KEY, JSON.stringify(state));
}

function loadSavedState() {
  const raw = localStorage.getItem(BUILDING_STORAGE_KEY);
  if (!raw) {
    return {
      level: 1,
      boostsEnabled: false,
      farmBoost: "0",
      clanIncomeBoost: "0",
      clanDefenseBoost: "0",
      clanMultiplier: "1",
      cores: defaultCoreSlots()
    };
  }

  try {
    const state = JSON.parse(raw);
    return {
      level: clampLevel(state.level),
      boostsEnabled: Boolean(state.boostsEnabled),
      farmBoost: state.farmBoost ?? "0",
      clanIncomeBoost: state.clanIncomeBoost ?? "0",
      clanDefenseBoost: state.clanDefenseBoost ?? "0",
      clanMultiplier: state.clanMultiplier ?? "1",
      cores: sanitizeLoadedCores(state.cores)
    };
  } catch {
    return {
      level: 1,
      boostsEnabled: false,
      farmBoost: "0",
      clanIncomeBoost: "0",
      clanDefenseBoost: "0",
      clanMultiplier: "1",
      cores: defaultCoreSlots()
    };
  }
}

let appState = loadSavedState();

function sanitizeLoadedCores(cores) {
  if (!Array.isArray(cores)) return defaultCoreSlots();

  const result = defaultCoreSlots();
  for (let i = 0; i < Math.min(MAX_CORE_SLOTS, cores.length); i++) {
    const core = cores[i];
    if (!core || !CORE_TYPES[core.type]) continue;
    result[i] = {
      type: core.type,
      level: clampCoreLevel(core.level)
    };
  }
  return result;
}

function getSanitizedCoreState() {
  return sanitizeLoadedCores(appState.cores);
}

function setError(message) {
  if (!message) {
    buildingError.style.display = "none";
    buildingError.textContent = "";
    return;
  }

  buildingError.style.display = "block";
  buildingError.textContent = message;
}

function getTierData(level) {
  return (
    BUILDING_TIERS.find(t => level >= t.min && level <= t.max) ||
    BUILDING_TIERS[BUILDING_TIERS.length - 1]
  );
}

function parseStatsText(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const re = /^(\d+)\s+lvl\s+-\s+income\s+(\d+)\s+-\s+capacity\s+(\d+)\s+-\s+hp_regen\s+(\d+)\s+-\s+max_hp\s+(\d+)$/;

  buildingStats.clear();

  for (const line of lines) {
    const match = line.match(re);
    if (!match) continue;

    const [, level, income, capacity, hp_regen, max_hp] = match;
    buildingStats.set(Number(level), {
      level: Number(level),
      income: Number(income),
      capacity: Number(capacity),
      hp_regen: Number(hp_regen),
      max_hp: Number(max_hp)
    });
  }
}

function updateBoostPreviews() {
  farmBoostPreview.textContent = String(num(farmBoost.value, 0));
  clanIncomeBoostPreview.textContent = String(num(clanIncomeBoost.value, 0));
  clanDefenseBoostPreview.textContent = String(num(clanDefenseBoost.value, 0));
  clanMultiplierPreview.textContent = String(num(clanMultiplier.value, 1));
}

function updateBoostVisibility() {
  boostsGrid.classList.toggle("visible", boostsToggle.checked);
}

function getCoreTotals() {
  const totals = {
    income: 1,
    capacity: 1,
    hp: 1,
    regen: 1
  };

  const grouped = {
    income: [],
    capacity: [],
    hp: [],
    regen: []
  };

  for (const core of appState.cores) {
    if (!core) continue;
    grouped[core.type].push(coreMultiplier(core.level));
  }

  for (const type of Object.keys(grouped)) {
    if (grouped[type].length === 0) {
      totals[type] = 1;
    } else {
      totals[type] = grouped[type].reduce((sum, value) => sum + value, 0);
    }
  }

  return totals;
}

function formatCoreMultiplierFromValue(value) {
  const floored = Math.floor(value * 100) / 100;
  return floored % 1 === 0 ? floored.toFixed(0) : floored.toFixed(2);
}

function renderCoreTotals() {
  const totals = getCoreTotals();
  const items = [];

  if (totals.income > 1) {
    items.push(`<div class="core-total-item"><span>✴️ Доход</span><strong>x${formatCoreMultiplierFromValue(totals.income)}</strong></div>`);
  }

  if (totals.capacity > 1) {
    items.push(`<div class="core-total-item"><span>✳️ Вместимость</span><strong>x${formatCoreMultiplierFromValue(totals.capacity)}</strong></div>`);
  }

  if (totals.hp > 1) {
    items.push(`<div class="core-total-item"><span>❤️ Здоровье</span><strong>x${formatCoreMultiplierFromValue(totals.hp)}</strong></div>`);
  }

  if (totals.regen > 1) {
    items.push(`<div class="core-total-item"><span>♻️ Реген</span><strong>x${formatCoreMultiplierFromValue(totals.regen)}</strong></div>`);
  }

  coreTotalsList.innerHTML = items.join("");
}

function renderCores(buildingLevel) {
  const unlocked = getUnlockedCoreSlots(buildingLevel);
  const nextUnlock = getNextCoreUnlockLevel(buildingLevel);

  coresHeader.innerHTML = `🔮 Ядра ${unlocked}/${MAX_CORE_SLOTS}`;
  coresNextUnlock.textContent = nextUnlock ? `(+1 на lv${nextUnlock})` : "(макс.)";

  coresGrid.innerHTML = "";

  for (let i = 0; i < MAX_CORE_SLOTS; i++) {
    const core = appState.cores[i];
    const slot = document.createElement("div");

    if (i < unlocked) {
      if (core) {
        slot.className = "core-slot installed";
        slot.innerHTML = `
          <div class="slot-emoji">${CORE_TYPES[core.type].emoji}</div>
          <div class="slot-level">lv.${core.level}</div>
          <div class="slot-mult">x${formatCoreMultiplier(core.level)}</div>
        `;
      } else {
        slot.className = "core-slot empty";
        slot.innerHTML = `<div class="slot-plus">+</div>`;
      }

      slot.addEventListener("click", () => openCoreModal(i));
    } else {
      slot.className = "core-slot locked";
      slot.innerHTML = `<div class="slot-plus">🔒</div>`;
    }

    coresGrid.appendChild(slot);
  }

  renderCoreTotals();
}

function openCoreModal(index) {
  currentEditingCoreIndex = index;
  const existing = appState.cores[index];

  currentEditingCoreType = existing?.type || "income";
  coreLevelInput.value = String(existing?.level ?? 0);

  updateCoreTypeButtons();
  updateCorePreview();
  coreModalBackdrop.classList.add("visible");
}

function closeCoreModal() {
  coreModalBackdrop.classList.remove("visible");
  currentEditingCoreIndex = null;
}

function updateCoreTypeButtons() {
  [...coreTypeGrid.querySelectorAll("[data-type]")].forEach(btn => {
    btn.classList.toggle("active", btn.dataset.type === currentEditingCoreType);
  });
}

function updateCorePreview() {
  const level = clampCoreLevel(coreLevelInput.value);
  const type = CORE_TYPES[currentEditingCoreType];
  corePreview.textContent = `${type.emoji} lv.${level} → x${formatCoreMultiplier(level)}`;
}

function saveCoreFromModal() {
  if (currentEditingCoreIndex == null) return;

  appState.cores[currentEditingCoreIndex] = {
    type: currentEditingCoreType,
    level: clampCoreLevel(coreLevelInput.value)
  };

  saveState();
  renderLevel(levelInput.value);
  closeCoreModal();
}

function removeCoreFromModal() {
  if (currentEditingCoreIndex == null) return;

  appState.cores[currentEditingCoreIndex] = null;

  saveState();
  renderLevel(levelInput.value);
  closeCoreModal();
}

function renderLevel(level) {
  const safeLevel = clampLevel(level);
  const stats = buildingStats.get(safeLevel);

  levelInput.value = String(safeLevel);
  levelRange.value = String(safeLevel);
  buildingLevelTitle.textContent = String(safeLevel);

  const tier = getTierData(safeLevel);
  buildingIcon.textContent = tier.icon;
  buildingName.textContent = tier.name;

  updateBoostPreviews();
  updateBoostVisibility();
  renderCores(safeLevel);

  if (!stats) {
    statIncome.textContent = "—";
    statCapacity.textContent = "—";
    statRegen.textContent = "—";
    statHp.textContent = "—";
    setError(`Для уровня ${safeLevel} нет данных в файле ${STATS_FILE}.`);
    appState.level = safeLevel;
    saveState();
    return;
  }

  const coreTotals = getCoreTotals();

  let income = stats.income * coreTotals.income;
  let capacity = stats.capacity * coreTotals.capacity;
  let hpRegen = stats.hp_regen * coreTotals.regen;
  let maxHp = stats.max_hp * coreTotals.hp;

  if (boostsToggle.checked) {
    const farm = num(farmBoost.value, 0);
    const incomeBoost = num(clanIncomeBoost.value, 0);
    const defenseBoost = num(clanDefenseBoost.value, 0);
    const multiplier = Math.max(1, num(clanMultiplier.value, 1));

    income = income * (1 + farm / 100) * (1 + incomeBoost / 100) * multiplier;
    maxHp = maxHp * (1 + defenseBoost / 100);
  }

  statIncome.textContent = `${formatNumber(income)}/ч`;
  statCapacity.textContent = formatNumber(capacity);
  statRegen.textContent = `${formatNumber(hpRegen)}/ч`;
  statHp.textContent = formatNumber(maxHp);

  setError("");
  appState.level = safeLevel;
  saveState();
}

async function loadStatsFile() {
  const response = await fetch(STATS_FILE, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Не удалось загрузить ${STATS_FILE}`);
  }
  const text = await response.text();
  parseStatsText(text);
}

function bindControls() {
  levelMinus.addEventListener("click", () => {
    renderLevel(clampLevel(Number(levelInput.value) - 1));
  });

  levelPlus.addEventListener("click", () => {
    renderLevel(clampLevel(Number(levelInput.value) + 1));
  });

  levelInput.addEventListener("input", () => {
    renderLevel(levelInput.value);
  });

  levelRange.addEventListener("input", () => {
    renderLevel(levelRange.value);
  });

  boostsToggle.addEventListener("change", () => {
    appState.boostsEnabled = boostsToggle.checked;
    renderLevel(levelInput.value);
  });

  [farmBoost, clanIncomeBoost, clanDefenseBoost, clanMultiplier].forEach(input => {
    input.addEventListener("input", () => {
      appState.farmBoost = farmBoost.value;
      appState.clanIncomeBoost = clanIncomeBoost.value;
      appState.clanDefenseBoost = clanDefenseBoost.value;
      appState.clanMultiplier = clanMultiplier.value;
      renderLevel(levelInput.value);
    });
  });

  [...coreTypeGrid.querySelectorAll("[data-type]")].forEach(btn => {
    btn.addEventListener("click", () => {
      currentEditingCoreType = btn.dataset.type;
      updateCoreTypeButtons();
      updateCorePreview();
    });
  });

  coreLevelMinus.addEventListener("click", () => {
    coreLevelInput.value = String(Math.max(0, clampCoreLevel(coreLevelInput.value) - 1));
    updateCorePreview();
  });

  coreLevelPlus.addEventListener("click", () => {
    coreLevelInput.value = String(clampCoreLevel(coreLevelInput.value) + 1);
    updateCorePreview();
  });

  coreLevelInput.addEventListener("input", () => {
    coreLevelInput.value = String(clampCoreLevel(coreLevelInput.value));
    updateCorePreview();
  });

  coreModalClose.addEventListener("click", closeCoreModal);
  coreCancelBtn.addEventListener("click", closeCoreModal);
  coreSaveBtn.addEventListener("click", saveCoreFromModal);
  coreRemoveBtn.addEventListener("click", removeCoreFromModal);

  coreModalBackdrop.addEventListener("click", (e) => {
    if (e.target === coreModalBackdrop) {
      closeCoreModal();
    }
  });

  clearCoresBtn.addEventListener("click", () => {
    appState.cores = defaultCoreSlots();
    saveState();
    renderLevel(levelInput.value);
  });
}

async function initBuildings() {
  bindControls();

  levelInput.value = String(appState.level);
  levelRange.value = String(appState.level);
  boostsToggle.checked = appState.boostsEnabled;
  farmBoost.value = appState.farmBoost;
  clanIncomeBoost.value = appState.clanIncomeBoost;
  clanDefenseBoost.value = appState.clanDefenseBoost;
  clanMultiplier.value = appState.clanMultiplier;

  try {
    await loadStatsFile();
    renderLevel(appState.level);
  } catch (err) {
    console.error(err);
    setError(`Ошибка загрузки стат: ${err.message}`);
    renderLevel(appState.level);
  }
}

initBuildings();
