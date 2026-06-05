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