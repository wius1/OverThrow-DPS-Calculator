const BUILDING_STORAGE_KEY = "overthrow_building_state_v2";
const STATS_FILE = "building_stats.txt";

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
  { min: 130, max: 130, icon: "🏦", name: "Банк" }
];

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

function saveState() {
  const state = {
    level: clampLevel(levelInput.value),
    boostsEnabled: boostsToggle.checked,
    farmBoost: farmBoost.value,
    clanIncomeBoost: clanIncomeBoost.value,
    clanDefenseBoost: clanDefenseBoost.value,
    clanMultiplier: clanMultiplier.value
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
      clanMultiplier: "1"
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
      clanMultiplier: state.clanMultiplier ?? "1"
    };
  } catch {
    return {
      level: 1,
      boostsEnabled: false,
      farmBoost: "0",
      clanIncomeBoost: "0",
      clanDefenseBoost: "0",
      clanMultiplier: "1"
    };
  }
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

  if (!stats) {
    statIncome.textContent = "—";
    statCapacity.textContent = "—";
    statRegen.textContent = "—";
    statHp.textContent = "—";
    setError(`Для уровня ${safeLevel} нет данных в файле ${STATS_FILE}.`);
    saveState();
    return;
  }

  let income = stats.income;
  let capacity = stats.capacity;
  let hpRegen = stats.hp_regen;
  let maxHp = stats.max_hp;

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
    renderLevel(levelInput.value);
  });

  [farmBoost, clanIncomeBoost, clanDefenseBoost, clanMultiplier].forEach(input => {
    input.addEventListener("input", () => {
      renderLevel(levelInput.value);
    });
  });
}

async function initBuildings() {
  bindControls();

  const saved = loadSavedState();
  levelInput.value = String(saved.level);
  levelRange.value = String(saved.level);
  boostsToggle.checked = saved.boostsEnabled;
  farmBoost.value = saved.farmBoost;
  clanIncomeBoost.value = saved.clanIncomeBoost;
  clanDefenseBoost.value = saved.clanDefenseBoost;
  clanMultiplier.value = saved.clanMultiplier;

  try {
    await loadStatsFile();
    renderLevel(saved.level);
  } catch (err) {
    console.error(err);
    setError(`Ошибка загрузки стат: ${err.message}`);
    renderLevel(saved.level);
  }
}

initBuildings();
