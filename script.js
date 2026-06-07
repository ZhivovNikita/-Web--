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

function renderHistory(history) {
  const historyBody = document.getElementById('history-body');
  if (!historyBody) return;
  historyBody.innerHTML = '';
  history.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${h.date}</td><td>${h.name}</td><td>${h.wpm}</td><td>${h.acc}%</td>`;
    historyBody.appendChild(tr);
  });
}

function togglePauseOverlay(show) {
  const overlay = document.getElementById('pause-overlay');
  if (overlay) {
    if (show) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
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

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);
document.getElementById('btn-pause').addEventListener('click', togglePause);

const inputEl = document.getElementById('typing-input');
inputEl.addEventListener('input', handleTyping);
inputEl.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); togglePause(); }});
inputEl.addEventListener('paste', e => e.preventDefault());

async function startGame() {
  resetGame();
  const diff = document.getElementById('difficulty').value;
  const text = await loadGameText(diff);
  if (!text) {
    document.getElementById('text-display').textContent = 'Ошибка загрузки текста';
    return;
  }
    gameState.text = text;
  renderText(text);
  inputEl.disabled = false;
  inputEl.focus();
  document.getElementById('btn-pause').disabled = false;
  document.getElementById('btn-start').style.display = 'none';
}

function handleTyping(e) {
  if (gameState.paused || gameState.finished) return;
  const val = e.target.value;
  if (!gameState.timer) {
    gameState.timer = setInterval(() => {
      gameState.elapsed++;
      document.getElementById('stat-time').textContent = `${gameState.elapsed}с`;
    }, 1000);
  }

  let correct = 0;
  for (let i = 0; i < val.length; i++) {
    if (val[i] === gameState.text[i]) correct++;
  }
  updateCharVisuals(val, gameState.text);

    const metrics = calculateMetrics(val.length, correct);
  document.getElementById('stat-wpm').textContent = metrics.wpm;
  document.getElementById('stat-acc').textContent = `${metrics.acc}%`;

  if (val.length >= gameState.text.length) finishGame(metrics);
}

function togglePause() {
  if (gameState.finished || !gameState.text) return;
  gameState.paused = !gameState.paused;
  if (gameState.paused) {
    clearInterval(gameState.timer);
    togglePauseOverlay(true);
    document.getElementById('btn-pause').textContent = '▶ Продолжить';
  } else {
    gameState.timer = setInterval(() => {
      gameState.elapsed++;
      document.getElementById('stat-time').textContent = `${gameState.elapsed}с`;
    }, 1000);
    togglePauseOverlay(false);
    document.getElementById('btn-pause').textContent = '⏸ Пауза';
    inputEl.focus();
  }
}

function finishGame(metrics) {
  gameState.finished = true;
  clearInterval(gameState.timer);
  inputEl.disabled = true;
  document.getElementById('btn-pause').disabled = true;
  document.getElementById('btn-pause').textContent = '⏸ Пауза';
  document.getElementById('btn-start').style.display = 'block';

  const result = { date: new Date().toLocaleDateString(), name: userSettings.name, wpm: metrics.wpm, acc: metrics.acc };
  history.unshift(result);
  if (history.length > 10) history.pop();
  localStorage.setItem('tt_history', JSON.stringify(history));

  renderHistory(history);
  updateBestWPM();
  document.getElementById('text-display').innerHTML += `<div style="margin-top:10px;color:var(--success);font-weight:bold;">✅ Тест завершён!</div>`;
}

function resetGame() {
  clearInterval(gameState.timer);
  gameState = { text: '', elapsed: 0, timer: null, paused: false, finished: false };
  inputEl.value = '';
  document.getElementById('stat-time').textContent = '0с';
  document.getElementById('stat-wpm').textContent = '0';
  document.getElementById('stat-acc').textContent = '100%';
  inputEl.disabled = true;
  document.getElementById('btn-pause').disabled = true;
  document.getElementById('btn-start').style.display = 'block';
  togglePauseOverlay(false);
  document.getElementById('text-display').textContent = 'Нажмите "Старт"...';
}
