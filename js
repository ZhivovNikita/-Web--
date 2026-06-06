function renderText(text) {
  const display = document.getElementById('text-display');
  display.innerHTML = '';
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.className = 'char';
    display.appendChild(span);
  });
  display.children[0]?.classList.add('current');
}

function updateCharVisuals(typed, original) {
  const spans = document.getElementById('text-display').children;
  for (let i = 0; i < spans.length; i++) {
    spans[i].className = 'char';
    if (i < typed.length) {
      spans[i].classList.add(typed[i] === original[i] ? 'correct' : 'incorrect');
    } else if (i === typed.length) {
      spans[i].classList.add('current');
    }
  }
}

const userSettings = JSON.parse(localStorage.getItem('tt_user')) || { name: 'Студент', target: 50 };
document.getElementById('user-name').value = userSettings.name;
document.getElementById('target-wpm').value = userSettings.target;
document.getElementById('user-greeting').textContent = `Привет, ${userSettings.name}! Цель: ${userSettings.target} слов/мин`;

document.getElementById('user-form').addEventListener('submit', e => {
  e.preventDefault();
  userSettings.name = document.getElementById('user-name').value.trim() || 'Студент';
  userSettings.target = parseInt(document.getElementById('target-wpm').value) || 50;
  localStorage.setItem('tt_user', JSON.stringify(userSettings));
  document.getElementById('user-greeting').textContent = `Привет, ${userSettings.name}! Цель: ${userSettings.target} слов/мин`;
  alert('Настройки сохранены!');
});

function calculateMetrics(typedLen, correctLen) {
  if (gameState.elapsed === 0 || typedLen === 0) return { wpm: 0, acc: 100 };
  const mins = gameState.elapsed / 60;
  return {
    wpm: Math.round((typedLen / 5) / mins),
    acc: Math.round((correctLen / typedLen) * 100)
  };
}

const textsDB = [
  { level: 'easy', content: 'Кот сидел на окне и смотрел на птиц.' },
  { level: 'easy', content: 'Весна пришла рано. Трава позеленела, а птицы запели.' },
  { level: 'medium', content: 'Веб-разработка требует внимательности к деталям и логики.' },
  { level: 'medium', content: 'Программирование это не только код, но и умение решать задачи.' },
  { level: 'hard', content: 'Асинхронное программирование позволяет выполнять операции без блокировки потока.' },
  { level: 'hard', content: 'Оптимизация производительности включает кэширование и минификацию ресурсов.' }
];

async function loadGameText(difficulty) {
  // Имитация асинхронного запроса (требование по заданию)
  await new Promise(res => setTimeout(res, 200));
  const filtered = textsDB.filter(t => t.level === difficulty || difficulty === 'medium');
  return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)].content : null;
}

let gameState = { text: '', elapsed: 0, timer: null, paused: false, finished: false };
let history = JSON.parse(localStorage.getItem('tt_history')) || [];

function updateBestWPM() {
  const best = history.reduce((max, r) => r.wpm > max ? r.wpm : max, 0);
  document.getElementById('stat-best').textContent = best;
}
renderHistory(history);
updateBestWPM();

document.getElementById('theme-toggle').addEventListener('click', () => {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'light';
  html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-toggle').textContent = isDark ? '️ Светлая тема' : '🌙 Тёмная тема';
});
