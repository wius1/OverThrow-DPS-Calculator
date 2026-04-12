const rewardsData = [
  { level: 1, rewards: { gems: 5 } },
  { level: 2, rewards: { sparkles: 200 } },
  { level: 3, rewards: { gems: 5 } },
  { level: 4, rewards: { swirls: 200 } },
  { level: 5, rewards: { boxes: 3 } },
  { level: 6, rewards: { gems: 5 } },
  { level: 7, rewards: { sparkles: 300 } },
  { level: 8, rewards: { gems: 5 } },
  { level: 9, rewards: { swirls: 300 } },
  { level: 10, rewards: { gems: 15, boxes: 2 } },
  { level: 11, rewards: { gems: 5 } },
  { level: 12, rewards: { sparkles: 400 } },
  { level: 13, rewards: { orbs: 1 } },
  { level: 14, rewards: { swirls: 400 } },
  { level: 15, rewards: { boxes: 2 } },
  { level: 16, rewards: { gems: 5 } },
  { level: 17, rewards: { sparkles: 500 } },
  { level: 18, rewards: { gems: 5 } },
  { level: 19, rewards: { swirls: 500 } },
  { level: 20, rewards: { gems: 20, boxes: 2 } },
  { level: 21, rewards: { gems: 5 } },
  { level: 22, rewards: { sparkles: 500 } },
  { level: 23, rewards: { orbs: 1 } },
  { level: 24, rewards: { swirls: 500 } },
  { level: 25, rewards: { gems: 30, boxes: 3 } },
  { level: 26, rewards: { gems: 5 } },
  { level: 27, rewards: { sparkles: 500 } },
  { level: 28, rewards: { gems: 5 } },
  { level: 29, rewards: { swirls: 500 } },
  { level: 30, rewards: { gems: 25, gift: 1 } },
  { level: 31, rewards: { gems: 5 } },
  { level: 32, rewards: { sparkles: 600 } },
  { level: 33, rewards: { orbs: 1 } },
  { level: 34, rewards: { swirls: 600 } },
  { level: 35, rewards: { boxes: 2 } },
  { level: 36, rewards: { gems: 5 } },
  { level: 37, rewards: { sparkles: 600 } },
  { level: 38, rewards: { orbs: 1 } },
  { level: 39, rewards: { swirls: 600 } },
  { level: 40, rewards: { gems: 30, gift: 1 } },
  { level: 41, rewards: { gems: 8 } },
  { level: 42, rewards: { sparkles: 700 } },
  { level: 43, rewards: { orbs: 1 } },
  { level: 44, rewards: { swirls: 700 } },
  { level: 45, rewards: { boxes: 3 } },
  { level: 46, rewards: { gems: 8 } },
  { level: 47, rewards: { sparkles: 700 } },
  { level: 48, rewards: { orbs: 1 } },
  { level: 49, rewards: { swirls: 700 } },
  { level: 50, rewards: { gems: 250, gift: 2, orbs: 1 } },
  { level: 51, rewards: { gems: 8 } },
  { level: 52, rewards: { sparkles: 800 } },
  { level: 53, rewards: { orbs: 1 } },
  { level: 54, rewards: { swirls: 800 } },
  { level: 55, rewards: { boxes: 2 } },
  { level: 56, rewards: { gems: 8 } },
  { level: 57, rewards: { sparkles: 800 } },
  { level: 58, rewards: { orbs: 1 } },
  { level: 59, rewards: { swirls: 800 } },
  { level: 60, rewards: { gems: 40, gift: 1 } },
  { level: 61, rewards: { gems: 8 } },
  { level: 62, rewards: { sparkles: 900 } },
  { level: 63, rewards: { orbs: 1 } },
  { level: 64, rewards: { swirls: 900 } },
  { level: 65, rewards: { boxes: 3 } },
  { level: 66, rewards: { gems: 8 } },
  { level: 67, rewards: { sparkles: 900 } },
  { level: 68, rewards: { orbs: 1 } },
  { level: 69, rewards: { swirls: 900 } },
  { level: 70, rewards: { gems: 50, gift: 2 } },
  { level: 71, rewards: { gems: 8 } },
  { level: 72, rewards: { sparkles: 1000 } }
];

function formatRewards(rewardObj) {
  const parts = [];

  if (rewardObj.gems) parts.push(`💎${rewardObj.gems}`);
  if (rewardObj.sparkles) parts.push(`✨${rewardObj.sparkles}`);
  if (rewardObj.swirls) parts.push(`🌀${rewardObj.swirls}`);
  if (rewardObj.orbs) parts.push(`🔮x${rewardObj.orbs}`);
  if (rewardObj.boxes) parts.push(`📦x${rewardObj.boxes}`);
  if (rewardObj.gift) parts.push(`🎁x${rewardObj.gift}`);

  return parts.join(' ');
}

function renderTable() {
  const tableBody = document.getElementById('tableBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  rewardsData.forEach(item => {
    const tr = document.createElement('tr');

    const levelTd = document.createElement('td');
    levelTd.textContent = `${item.level} lvl`;

    const rewardsTd = document.createElement('td');
    rewardsTd.textContent = formatRewards(item.rewards);

    tr.appendChild(levelTd);
    tr.appendChild(rewardsTd);
    tableBody.appendChild(tr);
  });
}

function showError(message) {
  const errorBox = document.getElementById('errorBox');
  if (!errorBox) return;

  errorBox.style.display = 'block';
  errorBox.textContent = message;
}

function hideError() {
  const errorBox = document.getElementById('errorBox');
  if (!errorBox) return;

  errorBox.style.display = 'none';
  errorBox.textContent = '';
}

function calculateRange() {
  hideError();

  const startInput = document.getElementById('startLevel');
  const endInput = document.getElementById('endLevel');
  const summaryBox = document.getElementById('summaryBox');

  if (!startInput || !endInput || !summaryBox) return;

  const start = Number(startInput.value);
  const end = Number(endInput.value);

  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    showError('Введи начальный и конечный уровень.');
    return;
  }

  if (start < 1 || end < 1 || start > 72 || end > 72) {
    showError('Уровни должны быть от 1 до 72.');
    return;
  }

  if (start > end) {
    showError('Начальный уровень не может быть больше конечного.');
    return;
  }

  const totals = {
    gems: 0,
    sparkles: 0,
    swirls: 0,
    orbs: 0,
    boxes: 0,
    gift: 0
  };

  rewardsData.forEach(item => {
    if (item.level >= start && item.level <= end) {
      totals.gems += item.rewards.gems || 0;
      totals.sparkles += item.rewards.sparkles || 0;
      totals.swirls += item.rewards.swirls || 0;
      totals.orbs += item.rewards.orbs || 0;
      totals.boxes += item.rewards.boxes || 0;
      totals.gift += item.rewards.gift || 0;
    }
  });

  const parts = [];
  if (totals.gems) parts.push(`💎${totals.gems}`);
  if (totals.sparkles) parts.push(`✨${totals.sparkles}`);
  if (totals.swirls) parts.push(`🌀${totals.swirls}`);
  if (totals.orbs) parts.push(`🔮x${totals.orbs}`);
  if (totals.boxes) parts.push(`📦x${totals.boxes}`);
  if (totals.gift) parts.push(`🎁x${totals.gift}`);

  summaryBox.innerHTML = `
    <strong>Суммарные награды за уровни ${start}-${end}:</strong><br>
    ${parts.length ? parts.join(' ') : 'Нет наград'}
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderTable();
});
