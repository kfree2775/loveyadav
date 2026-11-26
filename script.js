/* =========================================
   1. SLIDER & INPUT SYNCHRONIZATION
   ========================================= */
const ids = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2'];

ids.forEach(id => {
  const range = document.getElementById(id);
  const num = document.getElementById(id + '-num');

  range.addEventListener('input', () => {
    num.value = range.value;
    updateAll();
  });

  num.addEventListener('input', () => {
    let val = parseFloat(num.value);
    if (isNaN(val)) val = 0;
    range.value = Math.max(parseFloat(range.min), Math.min(parseFloat(range.max), val));
    updateAll();
  });
});

function setValues(vals) {
  ids.forEach(id => {
    document.getElementById(id).value = vals[id];
    document.getElementById(id + '-num').value = vals[id];
  });
  updateAll();
}

function applyPreset(type) {
  if (type === 'intersect') {
    setValues({ a1: 1, b1: 1, c1: -4, a2: 2, b2: -1, c2: -2 });
  } else if (type === 'parallel') {
    setValues({ a1: 1, b1: 2, c1: -4, a2: 2, b2: 4, c2: -12 });
  } else if (type === 'coincident') {
    setValues({ a1: 2, b1: 3, c1: -6, a2: 4, b2: 6, c2: -12 });
  }
}

/* =========================================
   2. MATH HELPERS & EQUATION FORMATTING
   ========================================= */
function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function formatRatio(num, den) {
  if (den === 0 && num === 0) return '0/0';
  if (den === 0) return 'Undefined';
  if (num === 0) return '0';
  if (Number.isInteger(num) && Number.isInteger(den)) {
    const sign = (num < 0) ^ (den < 0) ? -1 : 1;
    const g = gcd(num, den);
    const sNum = sign * (Math.abs(num) / g);
    const sDen = Math.abs(den) / g;
    return sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;
  }
  return (num / den).toFixed(2);
}

function formatEquation(a, b, c) {
  let parts = [];
  if (a !== 0) {
    parts.push(a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`);
  }
  if (b !== 0) {
    const sign = b > 0 ? (parts.length ? ' + ' : '') : (parts.length ? ' - ' : '-');
    const absB = Math.abs(b);
    parts.push(sign + (absB === 1 ? 'y' : `${absB}y`));
  }
  if (c !== 0) {
    const sign = c > 0 ? (parts.length ? ' + ' : '') : (parts.length ? ' - ' : '-');
    parts.push(sign + Math.abs(c));
  }
  if (parts.length === 0) return '0 = 0';
  return parts.join('') + ' = 0';
}

function cleanNum(n) {
  const rounded = Math.round(n * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/* =========================================
   3. LIVE GRAPH RENDERING & RATIO ANALYSIS
   ========================================= */
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

function updateAll() {
  const a1 = parseFloat(document.getElementById('a1-num').value) || 0;
  const b1 = parseFloat(document.getElementById('b1-num').value) || 0;
  const c1 = parseFloat(document.getElementById('c1-num').value) || 0;
  const a2 = parseFloat(document.getElementById('a2-num').value) || 0;
  const b2 = parseFloat(document.getElementById('b2-num').value) || 0;
  const c2 = parseFloat(document.getElementById('c2-num').value) || 0;

  document.getElementById('eq1-text').textContent = formatEquation(a1, b1, c1);
  document.getElementById('eq2-text').textContent = formatEquation(a2, b2, c2);

  document.getElementById('ratio-a').textContent = formatRatio(a1, a2);
  document.getElementById('ratio-b').textContent = formatRatio(b1, b2);
  document.getElementById('ratio-c').textContent = formatRatio(c1, c2);

  const lineBadge = document.getElementById('line-type-badge');
  const sysBadge = document.getElementById('system-type-badge');
  const solDetails = document.getElementById('solution-details');

  const line1Valid = !(a1 === 0 && b1 === 0);
  const line2Valid = !(a2 === 0 && b2 === 0);

  let status = 'invalid';
  let intersectPt = null;

  if (!line1Valid || !line2Valid) {
    lineBadge.textContent = 'Invalid Equation';
    lineBadge.className = 'status-pill tag-red';
    sysBadge.textContent = 'a and b cannot both be 0';
    sysBadge.className = 'status-pill tag-red';
    solDetails.innerHTML = '<strong>Tip:</strong> Set at least one of <em>a</em> or <em>b</em> to a non-zero number to form a line.';
  } else {
    const D = a1 * b2 - a2 * b1;
    const Dx = b1 * c2 - b2 * c1;
    const Dy = c1 * a2 - c2 * a1;

    if (Math.abs(D) > 1e-9) {
      status = 'intersect';
      const x = Dx / D;
      const y = Dy / D;
      intersectPt = { x, y };

      lineBadge.textContent = 'Intersecting Lines (a₁/a₂ ≠ b₁/b₂)';
      lineBadge.className = 'status-pill tag-green';
      sysBadge.textContent = 'Consistent • Unique Solution';
      sysBadge.className = 'status-pill tag-green';
      solDetails.innerHTML = `<strong>Exact Crossing Point:</strong> (x, y) = <strong>(${cleanNum(x)}, ${cleanNum(y)})</strong>`;
    } else if (Math.abs(Dx) <= 1e-9 && Math.abs(Dy) <= 1e-9) {
      status = 'coincident';
      lineBadge.textContent = 'Coincident Lines (a₁/a₂ = b₁/b₂ = c₁/c₂)';
      lineBadge.className = 'status-pill tag-purple';
      sysBadge.textContent = 'Consistent • Infinitely Many Solutions';
      sysBadge.className = 'status-pill tag-purple';
      solDetails.innerHTML = '<strong>Overlap:</strong> Both equations represent the exact same line—every point on the line is a solution.';
    } else {
      status = 'parallel';
      lineBadge.textContent = 'Parallel Lines (a₁/a₂ = b₁/b₂ ≠ c₁/c₂)';
      lineBadge.className = 'status-pill tag-red';
      sysBadge.textContent = 'Inconsistent • No Solution';
      sysBadge.className = 'status-pill tag-red';
      solDetails.innerHTML = '<strong>No Crossing:</strong> Both lines have the same slope and never meet.';
    }
  }

  drawGraph(a1, b1, c1, a2, b2, c2, status, intersectPt);
}

function drawGraph(a1, b1, c1, a2, b2, c2, status, intersectPt) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const range = 10; // -10 to +10 on both axes
  const stepX = width / (range * 2);
  const stepY = height / (range * 2);
  const originX = width / 2;
  const originY = height / 2;

  const toPxX = x => originX + x * stepX;
  const toPxY = y => originY - y * stepY;

  ctx.clearRect(0, 0, width, height);

  // Grid lines
  ctx.lineWidth = 1;
  for (let i = -range; i <= range; i++) {
    ctx.strokeStyle = i === 0 ? '#64748b' : '#e2e8f0';
    ctx.lineWidth = i === 0 ? 2 : 1;

    // Vertical grid line
    ctx.beginPath();
    ctx.moveTo(toPxX(i), 0);
    ctx.lineTo(toPxX(i), height);
    ctx.stroke();

    // Horizontal grid line
    ctx.beginPath();
    ctx.moveTo(0, toPxY(i));
    ctx.lineTo(width, toPxY(i));
    ctx.stroke();

    // Axis numbers (every 2 units)
    if (i !== 0 && i % 2 === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i, toPxX(i), originY + 14);
      ctx.textAlign = 'right';
      ctx.fillText(i, originX - 6, toPxY(i) + 4);
    }
  }

  // Axis labels
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('X', width - 12, originY - 8);
  ctx.fillText('Y', originX + 14, 14);

  function plotLine(a, b, c, color, dashed) {
    if (a === 0 && b === 0) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = dashed ? 3.5 : 4;
    if (dashed) ctx.setLineDash([10, 8]);

    ctx.beginPath();
    if (Math.abs(b) > 1e-9) {
      const yStart = (-a * (-range) - c) / b;
      const yEnd = (-a * range - c) / b;
      ctx.moveTo(toPxX(-range), toPxY(yStart));
      ctx.lineTo(toPxX(range), toPxY(yEnd));
    } else {
      const xConst = -c / a;
      ctx.moveTo(toPxX(xConst), toPxY(-range));
      ctx.lineTo(toPxX(xConst), toPxY(range));
    }
    ctx.stroke();
    ctx.restore();
  }

  // Plot Line 1 (Blue) and Line 2 (Red; dashed if coincident so both are visible)
  plotLine(a1, b1, c1, '#2563eb', false);
  plotLine(a2, b2, c2, '#dc2626', status === 'coincident');

  // Plot Intersection Dot if inside visible grid
  if (status === 'intersect' && intersectPt) {
    const px = toPxX(intersectPt.x);
    const py = toPxY(intersectPt.y);

    if (px >= -20 && px <= width + 20 && py >= -20 && py <= height + 20) {
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#059669';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      const label = `(${cleanNum(intersectPt.x)}, ${cleanNum(intersectPt.y)})`;
      ctx.font = 'bold 12px sans-serif';
      const textW = ctx.measureText(label).width;
      const boxX = Math.min(Math.max(px + 10, 8), width - textW - 16);
      const boxY = Math.max(py - 26, 8);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, textW + 12, 22, 6);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(label, boxX + 6, boxY + 15);
    }
  }
}

window.addEventListener('resize', updateAll);

/* =========================================
   4. 5-QUESTION INTERACTIVE QUIZ
   ========================================= */
const quizData = [
  {
    eqs: "2x + 3y - 8 = 0<br>4x + 6y - 16 = 0",
    options: [
      "Coincident & Consistent (Infinitely many solutions)",
      "Parallel & Inconsistent (No solution)",
      "Intersecting & Consistent (Unique solution)"
    ],
    answer: 0,
    explanation: "Here a₁/a₂ = 2/4 = 1/2, b₁/b₂ = 3/6 = 1/2, and c₁/c₂ = -8/-16 = 1/2. All three ratios are equal, so the lines overlap completely!"
  },
  {
    eqs: "x + 2y - 4 = 0<br>2x + 4y - 12 = 0",
    options: [
      "Intersecting & Consistent (Unique solution)",
      "Parallel & Inconsistent (No solution)",
      "Coincident & Consistent (Infinitely many solutions)"
    ],
    answer: 1,
    explanation: "a₁/a₂ = 1/2 and b₁/b₂ = 2/4 = 1/2, but c₁/c₂ = -4/-12 = 1/3. Since a₁/a₂ = b₁/b₂ ≠ c₁/c₂, the lines are parallel and never meet."
  },
  {
    eqs: "5x - 4y + 8 = 0<br>7x + 6y - 9 = 0",
    options: [
      "Parallel & Inconsistent (No solution)",
      "Coincident & Consistent (Infinitely many solutions)",
      "Intersecting & Consistent (Unique solution)"
    ],
    answer: 2,
    explanation: "a₁/a₂ = 5/7 while b₁/b₂ = -4/6 = -2/3. Because a₁/a₂ ≠ b₁/b₂, the lines cross at one exact point."
  },
  {
    eqs: "3x + 2y = 5<br>2x - 3y = 7",
    options: [
      "Consistent (Lines intersect at 1 point)",
      "Inconsistent (Lines are parallel)",
      "Dependent & Coincident"
    ],
    answer: 0,
    explanation: "a₁/a₂ = 3/2 and b₁/b₂ = -2/3. Since the ratios are unequal, they intersect at a single point, making the system Consistent."
  },
  {
    eqs: "6x - 3y + 10 = 0<br>2x - y + 9 = 0",
    options: [
      "Intersecting & Consistent",
      "Parallel & Inconsistent",
      "Coincident & Consistent"
    ],
    answer: 1,
    explanation: "a₁/a₂ = 6/2 = 3 and b₁/b₂ = -3/-1 = 3, but c₁/c₂ = 10/9. Equal slopes with different intercepts mean Parallel & Inconsistent!"
  }
];

let currentQ = 0;
let score = 0;
let answered = false;

function loadQuestion() {
  answered = false;
  const q = quizData[currentQ];
  document.getElementById('quiz-progress').textContent = `Question ${currentQ + 1} of ${quizData.length}`;
  document.getElementById('quiz-score').textContent = `Score: ${score} / ${quizData.length}`;
  document.getElementById('quiz-eqs').innerHTML = q.eqs;
  document.getElementById('quiz-prompt').textContent = "Identify the line behavior and consistency:";

  const optionsContainer = document.getElementById('quiz-options');
  optionsContainer.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(idx, btn);
    optionsContainer.appendChild(btn);
  });

  const feedback = document.getElementById('quiz-feedback');
  feedback.style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
}

function selectAnswer(selectedIdx, clickedBtn) {
  if (answered) return;
  answered = true;

  const q = quizData[currentQ];
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(b => (b.disabled = true));

  const feedback = document.getElementById('quiz-feedback');
  feedback.style.display = 'block';

  if (selectedIdx === q.answer) {
    score++;
    clickedBtn.classList.add('correct');
    feedback.style.background = '#d1fae5';
    feedback.style.color = '#065f46';
    feedback.innerHTML = `✅ Spot on! ${q.explanation}`;
  } else {
    clickedBtn.classList.add('wrong');
    buttons[q.answer].classList.add('correct');
    feedback.style.background = '#fee2e2';
    feedback.style.color = '#991b1b';
    feedback.innerHTML = `❌ Not quite. ${q.explanation}`;
  }

  document.getElementById('quiz-score').textContent = `Score: ${score} / ${quizData.length}`;
  const nextBtn = document.getElementById('next-btn');
  nextBtn.style.display = 'inline-block';
  nextBtn.textContent = currentQ === quizData.length - 1 ? 'See Final Score' : 'Next Question →';
}

function nextQuestion() {
  currentQ++;
  if (currentQ < quizData.length) {
    loadQuestion();
  } else {
    showFinalResults();
  }
}

function showFinalResults() {
  const box = document.getElementById('quiz-box');
  let message = score === 5
    ? "Perfect score! You've mastered Consistent and Inconsistent linear equations."
    : score >= 3
    ? "Great job! Try experimenting with the graph playground above to lock in the ratio rules."
    : "Good try! Use the 3 preset buttons in the playground above to see how each ratio works, then try again.";

  box.innerHTML = `
    <div style="text-align:center; padding: 16px 0;">
      <h3 style="font-size: 1.6rem; margin-bottom: 10px;">Quiz Complete!</h3>
      <p style="font-size: 1.3rem; font-weight: 800; color: #2563eb; margin-bottom: 12px;">
        Your Score: ${score} out of ${quizData.length}
      </p>
      <p style="color: #64748b; max-width: 500px; margin: 0 auto 24px;">${message}</p>
      <button class="btn btn-primary" onclick="restartQuiz()">Play Quiz Again</button>
    </div>
  `;
}

function restartQuiz() {
  currentQ = 0;
  score = 0;
  const box = document.getElementById('quiz-box');
  box.innerHTML = `
    <div class="quiz-top">
      <span id="quiz-progress"></span>
      <span id="quiz-score"></span>
    </div>
    <div class="quiz-equations" id="quiz-eqs"></div>
    <div class="quiz-question-text" id="quiz-prompt"></div>
    <div class="options-list" id="quiz-options"></div>
    <div class="quiz-feedback" id="quiz-feedback"></div>
    <div class="quiz-actions">
      <button class="btn btn-primary" id="next-btn" style="display:none;" onclick="nextQuestion()">Next Question →</button>
    </div>
  `;
  loadQuestion();
}

// Initialize playground and quiz on load
updateAll();
loadQuestion();
