
(function(){

 // Game state
  const maxMap = { easy: 10, normal: 7, hard: 5 };
  let secret = null;
  let attemptsLeft = 0;
  let maxAttempts = 0;
  let history = [];
  let running = false;

  // These are the DOM elements
  const $ = id => document.getElementById(id);
  const guessInput = $('guessInput');
  const guessBtn = $('guessBtn');
  const feedback = $('feedback');
  const remaining = $('remaining');
  const last = $('last');
  const historyEl = $('history');
  const difficultySelect = $('difficulty');
  const restartBtn = $('restartBtn');
  const endMessage = $('endMessage');


  // Utility function For generating random number
  function rand() { return Math.floor(Math.random()*100) + 1; }


  // Start or restart the game
  function startGame() {
    const diff = difficultySelect.value || 'normal';
    maxAttempts = maxMap[diff] || 7;
    attemptsLeft = maxAttempts;
    secret = rand();
    history = [];
    running = true;
    feedback.textContent = '';
    last.textContent = '—';
    updateRemaining();
    historyEl.innerHTML = '';
    endMessage.classList.add('hidden');
    guessInput.disabled = false;
    guessBtn.disabled = false;
    guessInput.value = '';
    guessInput.focus();
    // small console hint for developer
    console.info('Secret number (dev):', secret);
    updateProgressBar();
  }


  // Update remaining attempts display
  function updateRemaining() {
    remaining.textContent = attemptsLeft + ' / ' + maxAttempts;
    updateProgressBar();
  }

  // Update progress bar width
  function updateProgressBar() {
    const bar = document.getElementById('progressBar');
    if (!bar) return;
    const pct = maxAttempts > 0 ? ((attemptsLeft / maxAttempts) * 100) : 0;
    // show remaining as percent
    bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  // Launch confetti animation
  function launchConfetti(count = 40) {
    const root = document.getElementById('confetti-root');
    if (!root) return;
    const colors = ['#EF4444','#F97316','#F59E0B','#10B981','#06B6D4','#6366F1','#EC4899'];
    for (let i=0;i<count;i++){
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random()*colors.length)];
      el.style.background = color;
      el.style.left = (Math.random()*100) + '%';
      el.style.top = (Math.random()*10 - 10) + 'vh';
      el.style.transform = `rotate(${Math.random()*360}deg)`;
      const dur = 2000 + Math.random()*2000;
      const delay = Math.random()*200;
      el.style.animation = `confetti-fall ${dur}ms linear ${delay}ms forwards`;
      el.style.borderRadius = (Math.random()>0.5? '2px' : '50%');
      root.appendChild(el);
      setTimeout(()=> { try{ root.removeChild(el); }catch(e){} }, dur + delay + 200);
    }
  }


  // Append guess history
  function appendHistory(val, hint) {
    const pill = document.createElement('div');
    pill.className = 'px-3 py-1 rounded-full text-sm bg-slate-100 border text-slate-700 shadow-sm';
    pill.textContent = `${val}: ${hint}`;
    historyEl.prepend(pill);
  }


  // End the game
  function end(win) {
    running = false;
    guessInput.disabled = true;
    guessBtn.disabled = true;
    endMessage.classList.remove('hidden');
    if (win) {
      endMessage.className = 'p-4 rounded-lg text-center text-white font-medium bg-emerald-500';
      endMessage.textContent = `You win! The number was ${secret}.`;
      // celebration
      launchConfetti(50);
    } else {
      endMessage.className = 'p-4 rounded-lg text-center text-white font-medium bg-rose-500';
      endMessage.textContent = `You lost, the number was ${secret}. Try again!`;
    }
  }

  // Show feedback message
  function showFeedback(msg, tone='info') {
    feedback.textContent = msg;
    feedback.className = '';
    const base = 'min-h-[40px] text-sm';
    if (tone === 'error') feedback.classList.add(...(base + ' text-rose-600').split(' '));
    else if (tone === 'success') feedback.classList.add(...(base + ' text-emerald-600').split(' '));
    else feedback.classList.add(...(base + ' text-slate-700').split(' '));
    feedback.classList.add('pop');
    setTimeout(()=> feedback.classList.remove('pop'), 140);
  }

  // Validate user guess
  function validateGuess(value) {
    if (value === '' || value === null) return { ok: false, msg: 'Please enter a number.' };
    const n = Number(value);
    if (!Number.isFinite(n) || Number.isNaN(n)) return { ok: false, msg: 'That is not a number.' };
    if (!Number.isInteger(n)) return { ok: false, msg: 'Please enter an integer.' };
    if (n < 1 || n > 100) return { ok: false, msg: 'Number must be between 1 and 100.' };
    return { ok: true, value: n };
  }

    // Handle a guess submission
  function onGuess() {
    if (!running) return;
    const raw = guessInput.value.trim();
    const v = validateGuess(raw);
    if (!v.ok) { showFeedback(v.msg, 'error'); return; }
    const num = v.value;
    attemptsLeft -= 1;
    updateRemaining();
    if (num === secret) {
      last.textContent = 'Correct';
      appendHistory(num, 'Correct');
      showFeedback('🎉 Correct! You guessed the number.', 'success');
      end(true);
      return;
    }

    if (num > secret) {
      last.textContent = 'Too high';
      appendHistory(num, 'Too high');
      showFeedback('Too high, try a smaller number.');
    } else {
      last.textContent = 'Too low';
      appendHistory(num, 'Too low');
      showFeedback('Too low, try a larger number.');
    }

    if (attemptsLeft <= 0) {
      end(false);
    }
  }

    // Event listeners
  guessBtn.addEventListener('click', onGuess);
  guessInput.addEventListener('keydown', e => { if (e.key === 'Enter') onGuess(); });
  restartBtn.addEventListener('click', startGame);
  difficultySelect.addEventListener('change', () => {
    startGame();
  });

  // Start the game on page load
  window.addEventListener('load', startGame);

})();
