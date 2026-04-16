const BUILDING_STORAGE_KEY = "overthrow_building_level_v1";
const STATS_FILE = "building_stats.txt";

const levelInput = document.getElementById("levelInput");
const levelRange = document.getElementById("levelRange");
const levelMinus = document.getElementById("levelMinus");
const levelPlus = document.getElementById("levelPlus");
const buildingError = document.getElementById("buildingError");

const buildingIcon = document.getElementById("buildingIcon");
const buildingName = document.getElementById("buildingName");
const buildingLevelTitle = document.getElementById("buildingLevelTitle");

const statIncome = document.getElementById("statIncome");
const statCapacity = document.getElementById("statCapacity");
const statRegen = document.getElementById("statRegen");
const statHp = document.getElementById("statHp");

const buildingStats = new Map();

const BUILDING_TIERS = [
  [10, "🌾", "Поле"],
  [20, "🪵", "Лесопилка"],
  [30, "🌳", "Роща"],
  [40, "🪨", "Каменоломня"],
  [50, "🧱", "Кирпичный завод"],
  [60, "🛖", "Лачуга"],
  [70, "🏚️", "Развалюха"],
  [80, "🏠", "Дом"],
  [90, "🏡", "Усадьба"],
  [100, "🏘️", "Квартал"],
  [110, "🏗️", "Стройплощадка"],
  [120, "🏭", "Завод"],
  [130, "🏢", "Офисный центр"] // ← вот это
];

function formatNumber(value) {
  return Number(value).toLocaleString("ru-RU");
}

function clampLevel(value) {
  let n = Number(value);
  if (!Number.isFinite(n)) n = 1;
  n = Math.floor(n);
  if (n < 1) n = 1;
  if (n > 130) n = 130;
  return n;
}

function saveLevel(level) {
  localStorage.setItem(BUILDING_STORAGE_KEY, String(level));
}

function loadSavedLevel() {
  const raw = localStorage.getItem(BUILDING_STORAGE_KEY);
  return raw ? clampLevel(raw) : 1;
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
  const index = Math.floor(level / 10);
  const safeIndex = Math.min(index, BUILDING_TIERS.length - 1);
  const tier = BUILDING_TIERS[safeIndex];
  return {
    icon: tier[1],
    name: tier[2]
  };
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

function renderLevel(level) {
  const safeLevel = clampLevel(level);
  const stats = buildingStats.get(safeLevel);

  levelInput.value = String(safeLevel);
  levelRange.value = String(safeLevel);
  buildingLevelTitle.textContent = String(safeLevel);

  const tier = getTierData(safeLevel);
  buildingIcon.textContent = tier.icon;
  buildingName.textContent = tier.name;

  if (!stats) {
    statIncome.textContent = "—";
    statCapacity.textContent = "—";
    statRegen.textContent = "—";
    statHp.textContent = "—";
    setError(`Для уровня ${safeLevel} нет данных в файле ${STATS_FILE}.`);
    saveLevel(safeLevel);
    return;
  }

  statIncome.textContent = `${formatNumber(stats.income)}/ч`;
  statCapacity.textContent = formatNumber(stats.capacity);
  statRegen.textContent = `${formatNumber(stats.hp_regen)}/ч`;
  statHp.textContent = formatNumber(stats.max_hp);

  setError("");
  saveLevel(safeLevel);
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
}

async function initBuildings() {
  bindControls();

  try {
    await loadStatsFile();
    renderLevel(loadSavedLevel());
  } catch (err) {
    console.error(err);
    setError(`Ошибка загрузки стат: ${err.message}`);
    renderLevel(loadSavedLevel());
  }
}

initBuildings();
