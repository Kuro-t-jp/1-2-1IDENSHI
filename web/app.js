/* ================================================================
   遺伝子とその変化 — Webアプリ JavaScript
   DNA Helix Animation | Mutation Lab | Quiz | Scroll Reveals
   ================================================================ */

'use strict';

// ── 完全コドン変換表（64コドン）──────────────────────────
const CODON_TABLE = {
  TTT:'Phe', TTC:'Phe', TTA:'Leu', TTG:'Leu',
  CTT:'Leu', CTC:'Leu', CTA:'Leu', CTG:'Leu',
  ATT:'Ile', ATC:'Ile', ATA:'Ile', ATG:'Met',
  GTT:'Val', GTC:'Val', GTA:'Val', GTG:'Val',
  TCT:'Ser', TCC:'Ser', TCA:'Ser', TCG:'Ser',
  CCT:'Pro', CCC:'Pro', CCA:'Pro', CCG:'Pro',
  ACT:'Thr', ACC:'Thr', ACA:'Thr', ACG:'Thr',
  GCT:'Ala', GCC:'Ala', GCA:'Ala', GCG:'Ala',
  TAT:'Tyr', TAC:'Tyr', TAA:'Stop',TAG:'Stop',
  CAT:'His', CAC:'His', CAA:'Gln', CAG:'Gln',
  AAT:'Asn', AAC:'Asn', AAA:'Lys', AAG:'Lys',
  GAT:'Asp', GAC:'Asp', GAA:'Glu', GAG:'Glu',
  TGT:'Cys', TGC:'Cys', TGA:'Stop',TGG:'Trp',
  CGT:'Arg', CGC:'Arg', CGA:'Arg', CGG:'Arg',
  AGT:'Ser', AGC:'Ser', AGA:'Arg', AGG:'Arg',
  GGT:'Gly', GGC:'Gly', GGA:'Gly', GGG:'Gly'
};

const BASE_COMPLEMENT = { A:'T', T:'A', G:'C', C:'G' };

// DNAを翻訳する（コドンリスト返却）
function translate(dna) {
  const result = [];
  for (let i = 0; i + 2 < dna.length; i += 3) {
    const codon = dna.slice(i, i + 3);
    const aa = CODON_TABLE[codon] || '???';
    result.push({ codon, aa });
    if (aa === 'Stop') break;
  }
  return result;
}

// ── DNAダブルヘリックス Canvas アニメーション ─────────────
class DNAHelix {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.time   = 0;
    this.raf    = null;
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this.resize();
    this.animate();
  }

  resize() {
    this.W = this.canvas.offsetWidth;
    this.H = this.canvas.offsetHeight;
    this.canvas.width  = this.W;
    this.canvas.height = this.H;
  }

  animate() {
    this.time += 0.006;
    this.draw();
    this.raf = requestAnimationFrame(() => this.animate());
  }

  drawStrand(cx, phase, opacityMul) {
    const { ctx, W, H } = this;
    const numBases  = 28;
    const helixR    = Math.min(W * 0.04, 50);
    const baseSpacing = H / numBases;
    const BASES = ['A','T','G','C'];
    const BC    = { A:'T', T:'A', G:'C', C:'G' };
    const COLORS = { A:'#EF4444', T:'#60A5FA', G:'#10B981', C:'#FBBF24' };

    // Collect 3D points
    const s1 = [], s2 = [];
    for (let i = 0; i < numBases; i++) {
      const t     = i / (numBases - 1);
      const angle = t * Math.PI * 5 + phase;
      const y     = t * H;
      const x1    = cx + Math.cos(angle) * helixR;
      const z1    = Math.sin(angle);
      const x2    = cx + Math.cos(angle + Math.PI) * helixR;
      const z2    = Math.sin(angle + Math.PI);
      const base  = BASES[i % 4];
      s1.push({ x: x1, y, z: z1, base });
      s2.push({ x: x2, y, z: z2, base: BC[base] });
    }

    // Backbone strands
    const drawBackbone = (pts, color) => {
      for (let i = 1; i < pts.length; i++) {
        const alpha = (0.25 + 0.45 * ((pts[i].z + 1) / 2)) * opacityMul;
        ctx.strokeStyle = color + Math.round(Math.min(alpha, 1) * 200).toString(16).padStart(2,'0');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pts[i-1].x, pts[i-1].y);
        ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
      }
    };
    drawBackbone(s1, '#10B981');
    drawBackbone(s2, '#60A5FA');

    // Base-pair rungs
    for (let i = 0; i < numBases; i++) {
      const midZ = (s1[i].z + s2[i].z) / 2;
      if (midZ > -0.2) {
        const alpha = (0.15 + 0.3 * Math.abs(midZ)) * opacityMul;
        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s1[i].x, s1[i].y);
        ctx.lineTo(s2[i].x, s2[i].y);
        ctx.stroke();
      }
    }

    // Nucleotide balls (sorted back-to-front)
    const allPts = [
      ...s1.map(p => ({ ...p })),
      ...s2.map(p => ({ ...p }))
    ].sort((a, b) => a.z - b.z);

    for (const p of allPts) {
      const depth = (p.z + 1) / 2;
      const r     = (2.5 + 4.5 * depth) * opacityMul;
      const alpha = (0.25 + 0.75 * depth) * opacityMul;
      const hex   = COLORS[p.base];
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = hex + Math.round(Math.min(alpha, 1) * 220).toString(16).padStart(2,'0');
      ctx.fill();
    }
  }

  draw() {
    const { ctx, W, H, time } = this;
    ctx.clearRect(0, 0, W, H);
    const isMobile = W < 600;
    if (isMobile) {
      this.drawStrand(W * 0.5, time, 0.9);
    } else {
      this.drawStrand(W * 0.18, time,        0.65);
      this.drawStrand(W * 0.50, time + 1.2,  1.0);
      this.drawStrand(W * 0.82, time + 2.4,  0.65);
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this._onResize);
  }
}

// ── Scroll Progress Bar ────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max * 100).toFixed(1) : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

// ── Scroll Reveal (IntersectionObserver) ──────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), idx * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => observer.observe(el));
}

// ── Codon Demo (Section 2) ─────────────────────────────────
const DEMO_DNA = 'ATGCGCATTGAGCTGTGA';
const DEMO_CODONS = [
  { codon:'ATG', aa:'Met（メチオニン）' },
  { codon:'CGC', aa:'Arg（アルギニン）' },
  { codon:'ATT', aa:'Ile（イソロイシン）' },
  { codon:'GAG', aa:'Glu（グルタミン酸）' },
  { codon:'CTG', aa:'Leu（ロイシン）' },
  { codon:'TGA', aa:'Stop（終止）' }
];
const BASE_BG = { A:'rgba(239,68,68,.22)', T:'rgba(96,165,250,.22)', G:'rgba(16,185,129,.22)', C:'rgba(251,191,36,.22)' };
const BASE_COLOR = { A:'#EF4444', T:'#60A5FA', G:'#10B981', C:'#FBBF24' };

function initCodonDemo() {
  const el = document.getElementById('codon-sequence');
  if (!el) return;
  el.innerHTML = DEMO_CODONS.map(({ codon, aa }) => {
    const bases = codon.split('').map(b =>
      `<div class="base" style="background:${BASE_BG[b]};color:${BASE_COLOR[b]}">${b}</div>`
    ).join('');
    const isStop = aa.includes('Stop');
    return `<div class="codon-unit">
      <div class="codon-bases">${bases}</div>
      <div class="codon-aa" style="${isStop ? 'color:var(--red-l)' : ''}">${aa}</div>
    </div>`;
  }).join('');
}

// Mini codon reference for lab
function initMiniCodonTable() {
  const el = document.getElementById('mini-codon-table');
  if (!el) return;
  const sample = [
    ['ATG','Met'], ['TAA','Stop'], ['TAG','Stop'], ['TGA','Stop'],
    ['GAA','Glu'], ['GTG','Val'], ['CGC','Arg'], ['ATT','Ile'],
    ['CTG','Leu'], ['TGG','Trp'], ['AAA','Lys'], ['GGG','Gly']
  ];
  el.innerHTML = sample.map(([c, a]) =>
    `<div class="mini-codon-entry"><span class="mini-codon-code">${c}</span><span>→ ${a}</span></div>`
  ).join('');
}

// ── SNP Demo (Section 6) ───────────────────────────────────
function initSNPDemo() {
  const seqA = document.getElementById('snp-seq-a');
  const seqB = document.getElementById('snp-seq-b');
  const tA   = document.getElementById('snp-trait-a');
  const tB   = document.getElementById('snp-trait-b');
  if (!seqA) return;

  const sequenceA = ['A','T','C','G','G','T','A','C','G','T'];
  const sequenceB = ['A','T','C','A','G','T','A','C','G','T'];
  const snpIdx    = 3; // position where they differ

  const renderSeq = (el, seq, highlight) => {
    el.innerHTML = seq.map((b, i) => {
      const isSnp = i === highlight;
      const base  = `snp-base base-${b.toLowerCase()}`;
      const style = `background:${BASE_BG[b]};color:${BASE_COLOR[b]}`;
      return `<div class="${base}${isSnp ? ' snp-highlight' : ''}" style="${isSnp ? '' : style}">${b}</div>`;
    }).join('');
  };

  renderSeq(seqA, sequenceA, snpIdx);
  renderSeq(seqB, sequenceB, snpIdx);
  if (tA) tA.textContent = `位置${snpIdx+1}: G → 通常タイプ`;
  if (tB) tB.textContent = `位置${snpIdx+1}: A → 薬感受性に影響`;
}

// ── Mutation Lab ───────────────────────────────────────────
let LAB_DNA      = 'ATGCGCATTGAGCTGTGA'.split('');
const LAB_ORIG   = 'ATGCGCATTGAGCTGTGA';
let labSelected  = -1;
let labHistory   = [];

function labGetProtein(dna) {
  return translate(dna.join(''));
}

function labRender() {
  const seqEl  = document.getElementById('lab-dna-seq');
  if (!seqEl) return;

  // DNA sequence
  let html = '';
  for (let i = 0; i < LAB_DNA.length; i++) {
    const b = LAB_DNA[i];
    const isSel = i === labSelected;
    const isDifferent = LAB_DNA.length !== LAB_ORIG.length ? i >= Math.min(labHistory.findIndex(h=>h.type!=='sub')*1+0,0) : LAB_ORIG[i] !== b;
    const style = `background:${BASE_BG[b]};color:${BASE_COLOR[b]}`;
    if (i > 0 && i % 3 === 0) html += `<span class="lab-codon-sep">|</span>`;
    html += `<span class="lab-base${isSel ? ' selected' : ''}${isDifferent ? ' mutated' : ''}"
              style="${isSel ? '' : style}"
              onclick="labSelect(${i})"
              title="位置 ${i+1}：${b}">${b}</span>`;
  }
  seqEl.innerHTML = html;

  // Protein helpers
  const codons     = labGetProtein(LAB_DNA);
  const origCodons = translate(LAB_ORIG);

  const aaChipHtml = (list, base) => list.map((c, i) => {
    const orig = base[i];
    const isStop       = c.aa === 'Stop';
    const isChanged    = orig && orig.aa !== c.aa;
    const isFrameshift = !orig;
    let cls = 'lab-aa-chip normal-aa';
    if (isStop)            cls = 'lab-aa-chip stop-aa';
    else if (isFrameshift) cls = 'lab-aa-chip shifted-aa';
    else if (isChanged)    cls = 'lab-aa-chip changed-aa';
    return `<span class="${cls}" title="${c.codon}">${c.aa}</span>`;
  }).join('');

  const origHtml = origCodons.map(c =>
    `<span class="lab-aa-chip ${c.aa==='Stop'?'stop-aa':'normal-aa'}" title="${c.codon}">${c.aa}</span>`
  ).join('');

  // Support both old (#lab-protein-seq) and new (#compare-*) display targets
  const protEl = document.getElementById('lab-protein-seq');
  if (protEl) protEl.innerHTML = aaChipHtml(codons, origCodons);

  const compOrig = document.getElementById('compare-original');
  const compCurr = document.getElementById('compare-current');
  if (compOrig) compOrig.innerHTML = origHtml;
  if (compCurr) compCurr.innerHTML = aaChipHtml(codons, origCodons);
}

window.labSelect = function(idx) {
  labSelected = idx;
  document.getElementById('btn-sub').disabled = false;
  document.getElementById('btn-ins').disabled = false;
  document.getElementById('btn-del').disabled = false;
  const hint = document.getElementById('lab-hint');
  if (hint) hint.textContent = `位置 ${idx+1}「${LAB_DNA[idx]}」を選択 → 変異を適用`;
  labRender();
};

window.labApply = function(type) {
  if (labSelected < 0) return;
  const pos     = labSelected;
  const origBase = LAB_DNA[pos];
  const BASES   = ['A','T','G','C'];

  const origTranslation = translate(LAB_DNA.join(''));
  let desc = '';

  if (type === 'sub') {
    // Pick a random different base
    const others = BASES.filter(b => b !== origBase);
    const newBase = others[Math.floor(Math.random() * others.length)];
    LAB_DNA[pos] = newBase;

    const newTranslation = translate(LAB_DNA.join(''));
    const codonIdx = Math.floor(pos / 3);
    const origAA = origTranslation[codonIdx]?.aa || '?';
    const newAA  = newTranslation[codonIdx]?.aa || '?';

    if (origAA === newAA) {
      showLabEffect('silent', `✅ 同義変異（サイレント変異）\n${origBase} → ${newBase}：アミノ酸は ${origAA} のまま変わらない（コドン縮重）`);
    } else if (newAA === 'Stop') {
      showLabEffect('nonsense', `🔴 ナンセンス変異\n${origBase} → ${newBase}：${origAA} → 終止コドン！ タンパク質合成が途中で停止。`);
    } else {
      showLabEffect('missense', `🟡 ミスセンス変異\n${origBase} → ${newBase}：${origAA} → ${newAA} に変化。機能への影響は変化したアミノ酸の位置による。`);
    }
    desc = `置換 位置${pos+1}: ${origBase}→${newBase}`;

  } else if (type === 'ins') {
    const newBase = BASES[Math.floor(Math.random() * 4)];
    LAB_DNA.splice(pos, 0, newBase);
    showLabEffect('frameshift', `🟣 フレームシフト変異（挿入）\n位置 ${pos+1} の前に「${newBase}」を挿入。\n以降のすべてのコドンがずれる！タンパク質が大きく変化。`);
    desc = `挿入 位置${pos+1}: +${newBase}`;
    labSelected = -1;

  } else if (type === 'del') {
    const deleted = LAB_DNA[pos];
    LAB_DNA.splice(pos, 1);
    showLabEffect('frameshift', `🟣 フレームシフト変異（欠失）\n位置 ${pos+1} の「${deleted}」を欠失。\n以降のすべてのコドンがずれる！`);
    desc = `欠失 位置${pos+1}: -${deleted}`;
    labSelected = -1;
  }

  labHistory.unshift({ type, desc });
  if (labHistory.length > 6) labHistory.pop();
  renderLabHistory();
  labRender();
  document.getElementById('btn-sub').disabled = labSelected < 0;
  document.getElementById('btn-ins').disabled = labSelected < 0;
  document.getElementById('btn-del').disabled = labSelected < 0;
};

window.labReset = function() {
  LAB_DNA     = LAB_ORIG.split('');
  labSelected = -1;
  labHistory  = [];
  document.getElementById('btn-sub').disabled = true;
  document.getElementById('btn-ins').disabled = true;
  document.getElementById('btn-del').disabled = true;
  const hint = document.getElementById('lab-hint');
  if (hint) hint.textContent = '塩基をクリックして選択 →';
  const eb = document.getElementById('lab-effect-box');
  if (eb) eb.style.display = 'none';
  renderLabHistory();
  labRender();
};

function showLabEffect(kind, text) {
  const el = document.getElementById('lab-effect-box');
  if (!el) return;
  el.className = `lab-effect-box ${kind}`;
  el.innerHTML = text.replace(/\n/g, '<br>');
  el.style.display = 'block';
}

function renderLabHistory() {
  const el = document.getElementById('lab-history');
  if (!el) return;
  if (labHistory.length === 0) { el.innerHTML = ''; return; }
  const typeIcon = { sub:'🔄', ins:'➕', del:'✂️' };
  el.innerHTML = `<div style="font-size:var(--f-xs);color:var(--text-m);margin-bottom:.3rem;">変異履歴：</div>` +
    labHistory.map(h => `<div class="history-entry">${typeIcon[h.type]} ${h.desc}</div>`).join('');
}

function initLab() {
  LAB_DNA = LAB_ORIG.split('');
  labRender();
}

// ── Quiz ──────────────────────────────────────────────────
const QUIZ_DATA = [
  {
    q: '1つの塩基が別の塩基に置き換わる突然変異を何というか？',
    opts: ['欠失（Deletion）', '挿入（Insertion）', '置換（Substitution）', '転座（Translocation）'],
    ans: 2,
    exp: '「置換（Substitution）」は1塩基が別の塩基に置き換わる変異。欠失・挿入はフレームシフトを起こし、転座は染色体レベルの変化。'
  },
  {
    q: 'フレームシフト変異が起きる原因として正しいものはどれか？',
    opts: ['1塩基の置換', '3の倍数個の欠失', '1塩基の挿入', 'コドン表の縮重'],
    ans: 2,
    exp: '3の倍数でない挿入・欠失がフレームシフトを引き起こす。3の倍数の変化では読み枠がずれない（コドン数が増減するのみ）。'
  },
  {
    q: '同義変異（サイレント変異）が起きる主な理由は？',
    opts: ['DNAが完全に修復されるから', 'コドン表に縮重（degeneracy）があるから', 'タンパク質が自己修復するから', 'mRNAがエラーを補正するから'],
    ans: 1,
    exp: 'コドン表の縮重により、64種のコドンが20種のアミノ酸をコードする。複数のコドンが同じアミノ酸を指定するため、一部の置換ではアミノ酸が変わらない。'
  },
  {
    q: 'SNP（一塩基多型）の正しい定義はどれか？',
    opts: ['1個人に特有の1塩基の変異', '集団の1%以上に見られる1塩基の違い', '必ず疾患を起こす塩基変異', 'タンパク質コード領域のみに見られる変異'],
    ans: 1,
    exp: 'SNP（Single Nucleotide Polymorphism）は「集団の1%以上に見られる1塩基の配列の違い」。ヒトゲノムには約1000万個のSNPがあり、個体差の主要な源。'
  },
  {
    q: '鎌状赤血球貧血症の原因となる変異の種類はどれか？',
    opts: ['フレームシフト変異', 'ミスセンス変異（1塩基置換）', 'ナンセンス変異', '染色体の転座'],
    ans: 1,
    exp: 'HBB遺伝子第6コドン GAG→GTG（Glu→Val）というミスセンス変異が原因。1塩基の変化で赤血球が鎌状になり、酸素運搬能が低下する。'
  },
  {
    q: 'ナンセンス変異が起きると、タンパク質にどんな影響が出るか？',
    opts: ['アミノ酸が1個変わる', '読み枠がずれて全アミノ酸が変わる', 'タンパク質が途中で合成停止する', 'タンパク質に影響はない'],
    ans: 2,
    exp: 'ナンセンス変異はアミノ酸コドン→終止コドン（TAA/TAG/TGA）への変換。リボソームが途中で停止するため短いタンパク質が生じ、機能不全になることが多い。'
  },
  {
    q: '染色体の一部が別の染色体に移動する変化を何というか？',
    opts: ['逆位（Inversion）', '重複（Duplication）', '欠失（Deletion）', '転座（Translocation）'],
    ans: 3,
    exp: '転座（Translocation）は染色体の一部が別の染色体に移動する変化。フィラデルフィア染色体（9番と22番の転座）による慢性骨髄性白血病が有名。'
  },
  {
    q: '木村資生の中立進化論（1968年）の主な主張は？',
    opts: [
      'すべての変異は有害で自然選択に除去される',
      '分子レベルの変化の多くは自然選択ではなく遺伝的浮動で広まる',
      '有利な変異のみが集団に固定される',
      '突然変異は環境に応じて方向性を持つ'
    ],
    ans: 1,
    exp: '木村資生は「多くの分子変化は有害でも有利でもない中立変異で、遺伝的浮動（確率的過程）で集団に広まる」と主張した。現代の分子進化学の基盤。'
  }
];

let quizResults = new Array(QUIZ_DATA.length).fill(null);

function initQuiz() {
  const area = document.getElementById('quiz-questions-area');
  if (!area) return;

  area.innerHTML = QUIZ_DATA.map((q, qi) => `
    <div class="quiz-question-block" id="qblock-${qi}">
      <div class="quiz-q-text">
        <span class="q-num">Q${qi + 1}.</span> ${q.q}
      </div>
      <div class="quiz-choices">
        ${q.opts.map((opt, ci) => `
          <button class="quiz-choice" id="qchoice-${qi}-${ci}" onclick="quizAnswer(${qi},${ci})">
            <span class="choice-letter">${'ABCD'[ci]}</span>
            ${opt}
          </button>
        `).join('')}
      </div>
      <div class="quiz-explanation" id="qexp-${qi}">💡 ${q.exp}</div>
    </div>
  `).join('');

  renderQuizDots();
  updateQuizScore();
}

window.quizAnswer = function(qi, ci) {
  const q = QUIZ_DATA[qi];
  if (quizResults[qi] !== null) return; // already answered

  const isCorrect = ci === q.ans;
  quizResults[qi] = isCorrect;

  // Disable all choices for this question
  for (let i = 0; i < q.opts.length; i++) {
    const btn = document.getElementById(`qchoice-${qi}-${i}`);
    if (btn) {
      btn.disabled = true;
      if (i === q.ans) btn.classList.add('correct-ans');
    }
  }
  const chosen = document.getElementById(`qchoice-${qi}-${ci}`);
  if (!isCorrect && chosen) chosen.classList.add('wrong-ans');

  // Show explanation
  const expEl = document.getElementById(`qexp-${qi}`);
  if (expEl) expEl.classList.add('show');

  renderQuizDots();
  updateQuizScore();

  // Check if all answered
  if (quizResults.every(r => r !== null)) {
    setTimeout(showQuizResult, 600);
  }
};

function renderQuizDots() {
  const dotsEl = document.getElementById('quiz-dots');
  if (!dotsEl) return;
  dotsEl.innerHTML = quizResults.map((r, i) => {
    let cls = 'quiz-dot';
    if (r === true)  cls += ' answered';
    if (r === false) cls += ' wrong';
    return `<div class="${cls}" title="Q${i+1}"></div>`;
  }).join('');
}

function updateQuizScore() {
  const correct = quizResults.filter(r => r === true).length;
  const el = document.getElementById('quiz-correct-count');
  if (el) el.textContent = correct;
}

function showQuizResult() {
  const resultArea = document.getElementById('quiz-result-area');
  if (!resultArea) return;

  const correct = quizResults.filter(r => r === true).length;
  const total   = QUIZ_DATA.length;
  const pct     = Math.round(correct / total * 100);
  const msg = pct >= 87 ? '🎉 完璧！' :
              pct >= 62 ? '👍 よくできました！' :
              '💪 もう一度復習してみよう！';

  resultArea.innerHTML = `
    <div class="quiz-final-score">${correct}<small style="font-size:2rem">/${total}</small></div>
    <div class="quiz-final-msg">${msg}（正答率 ${pct}%）</div>
    <div class="quiz-result-chips">
      ${quizResults.map((r, i) => `
        <span class="result-chip ${r ? 'ok' : 'fail'}">${r ? '✅' : '❌'} Q${i+1}</span>
      `).join('')}
    </div>
    <button style="margin-top:1.5rem;padding:.7rem 1.8rem;background:var(--green);color:white;border:none;border-radius:var(--r-sm);font-family:inherit;font-size:var(--f-md);font-weight:700;cursor:pointer;" onclick="quizRetry()">
      🔄 もう一度挑戦
    </button>
  `;
  resultArea.style.display = 'block';
  resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  if (pct >= 62) setTimeout(launchConfetti, 400);
}

window.quizRetry = function() {
  quizResults = new Array(QUIZ_DATA.length).fill(null);
  document.getElementById('quiz-result-area').style.display = 'none';
  initQuiz();
};

// ── Smooth scroll for nav links ────────────────────────────
function initNavLinks() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 70; // navbar height
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ── Navbar scroll effect ───────────────────────────────────
function initNavbar() {
  const nav = document.getElementById('navbar');
  let last = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) nav.style.boxShadow = '0 4px 24px rgba(0,0,0,.4)';
    else        nav.style.boxShadow = 'none';
    last = y;
  }, { passive: true });
}

// ── Staggered section animations ──────────────────────────
function initSectionAnimations() {
  // Flow diagram nodes
  const dogmaNodes = document.querySelectorAll('.dogma-node');
  const nodeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = [...dogmaNodes].indexOf(e.target);
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }, idx * 150);
        nodeObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  dogmaNodes.forEach(n => {
    n.style.opacity = '0';
    n.style.transform = 'translateY(20px)';
    n.style.transition = 'opacity .6s ease, transform .6s ease';
    nodeObs.observe(n);
  });

  // Evolution steps
  const evoSteps = document.querySelectorAll('.evo-step');
  const evoObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = [...evoSteps].indexOf(e.target);
        setTimeout(() => {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateX(0)';
        }, idx * 100);
        evoObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  evoSteps.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateX(-20px)';
    s.style.transition = 'opacity .5s ease, transform .5s ease';
    evoObs.observe(s);
  });

  // Severity bars animate on reveal
  const sevBars = document.querySelectorAll('.severity-fill');
  const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Width is set inline — just trigger a reflow to animate
        const w = e.target.style.width;
        e.target.style.width = '0';
        setTimeout(() => { e.target.style.width = w; }, 100);
        barObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  sevBars.forEach(b => barObs.observe(b));
}

// ── Mutation card hover pulse ──────────────────────────────
function initMutCards() {
  document.querySelectorAll('.mut-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const type = card.dataset.type;
      // Subtle glow based on mutation type color
    });
  });
}

// ── Keyboard navigation ────────────────────────────────────
function initKeyboard() {
  const sections = ['#hero','#basics','#mutations','#lab','#classification','#snp','#evolution','#quiz','#summary'];
  let currentSection = 0;
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      currentSection = Math.min(currentSection + 1, sections.length - 1);
      document.querySelector(sections[currentSection])?.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      currentSection = Math.max(currentSection - 1, 0);
      document.querySelector(sections[currentSection])?.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// ── Codon Builder (Section 2) ──────────────────────────────
const BASE_CYCLE = { A:'T', T:'G', G:'C', C:'A' };
let builderBases = ['A','T','G'];

const AA_JP = {
  Met:'メチオニン（開始コドン）', Stop:'終止コドン ⚠️ 合成停止！', Phe:'フェニルアラニン',
  Leu:'ロイシン', Ile:'イソロイシン', Val:'バリン（疎水性 — 鎌状赤血球に関与）', Ser:'セリン', Pro:'プロリン',
  Thr:'トレオニン', Ala:'アラニン', Tyr:'チロシン', His:'ヒスチジン', Gln:'グルタミン',
  Asn:'アスパラギン', Lys:'リジン', Asp:'アスパラギン酸', Glu:'グルタミン酸',
  Cys:'システイン', Trp:'トリプトファン（唯一の1コドン）', Arg:'アルギニン', Gly:'グリシン（最小）',
};

const AA_PROP = {
  Met:'start', Stop:'stop',
  Phe:'hydrophobic', Leu:'hydrophobic', Ile:'hydrophobic', Val:'hydrophobic',
  Pro:'special',    Trp:'hydrophobic', Ala:'hydrophobic',
  Gly:'special',    Ser:'polar',       Thr:'polar',   Cys:'polar',
  Tyr:'polar',      Asn:'polar',       Gln:'polar',
  Asp:'negative',   Glu:'negative',
  Lys:'positive',   Arg:'positive',    His:'positive',
};
const PROP_LABEL = {
  'start':'🟢 開始コドン', 'stop':'🔴 終止コドン',
  'hydrophobic':'🟡 疎水性', 'polar':'🔵 極性（親水性）',
  'negative':'🟠 負電荷', 'positive':'🟣 正電荷', 'special':'⚪ 特殊',
};
const PROP_COLOR = {
  'start':'#10B981', 'stop':'#EF4444', 'hydrophobic':'#F59E0B',
  'polar':'#60A5FA', 'negative':'#FB923C', 'positive':'#A78BFA', 'special':'#94A3B8',
};
// センス鎖 → アンチセンス鎖（相補）
const DNA_COMPLEMENT = { A:'T', T:'A', G:'C', C:'G' };
// センス鎖 → mRNA（T→U のみ、他は同じ）
const DNA_TO_MRNA = { A:'A', T:'U', G:'G', C:'C' };
// 塩基対ラベル
const PAIR_LABEL   = { A:'A-T', T:'T-A', G:'G-C', C:'C-G' };

function renderBuilder() {
  const slotsEl  = document.getElementById('builder-slots');
  const tmplEl   = document.getElementById('builder-template-slots');
  const mrnaEl   = document.getElementById('builder-mrna-slots');
  const pairEl   = document.getElementById('builder-pair-line');
  if (!slotsEl) return;

  // センス鎖（クリック可能）
  slotsEl.innerHTML = builderBases.map((b, i) =>
    `<div class="builder-slot" style="background:${BASE_BG[b]};color:${BASE_COLOR[b]}"
          onclick="builderCycle(${i})" title="クリックで塩基変更">
       <span class="slot-pos">${i+1}</span>${b}
     </div>`
  ).join('');

  // 塩基対ライン（‖ 記号）
  if (pairEl) {
    pairEl.innerHTML = builderBases.map(b =>
      `<div class="pair-symbol">‖</div>`
    ).join('');
  }

  // アンチセンス鎖（センス鎖の相補）
  if (tmplEl) {
    tmplEl.innerHTML = builderBases.map(b => {
      const t = DNA_COMPLEMENT[b];
      return `<div class="template-slot" style="background:${BASE_BG[t]};color:${BASE_COLOR[t]}">${t}</div>`;
    }).join('');
  }

  // 転写矢印（↓ を塩基ごとに）
  const arrowEl = document.getElementById('transcription-arrows');
  if (arrowEl) {
    arrowEl.innerHTML = builderBases.map(() =>
      `<div class="transcription-arrow-symbol">↓</div>`
    ).join('');
  }

  // mRNA（アンチセンス鎖の相補 = センス鎖と同配列、T→U）
  if (mrnaEl) {
    mrnaEl.innerHTML = builderBases.map(b => {
      const m = DNA_TO_MRNA[b];
      const tmpl = DNA_COMPLEMENT[b]; // 鋳型の塩基（mRNAのもとの相手）
      return `<div class="mrna-slot" style="background:${BASE_BG[tmpl]}33;color:${BASE_COLOR[tmpl]};border:1px dashed ${BASE_COLOR[tmpl]}66">${m}</div>`;
    }).join('');
  }

  const codon = builderBases.join('');
  const mrnaCodon = codon.split('').map(b => DNA_TO_MRNA[b]).join('');
  const hint = document.getElementById('builder-current-codon');
  const mrnaHint = document.getElementById('builder-mrna-codon');
  if (hint) hint.textContent = codon;
  if (mrnaHint) mrnaHint.textContent = mrnaCodon;

  const aa = CODON_TABLE[codon] || '???';
  const prop = AA_PROP[aa] || 'special';
  const propColor = PROP_COLOR[prop] || 'var(--text-s)';
  const nameEl = document.getElementById('builder-aa-name');
  const jpEl   = document.getElementById('builder-aa-jp');
  const propEl = document.getElementById('builder-aa-prop');
  if (nameEl) { nameEl.textContent = aa; nameEl.style.color = propColor; }
  if (jpEl)   jpEl.textContent = AA_JP[aa] || '';
  if (propEl) { propEl.textContent = PROP_LABEL[prop] || ''; propEl.style.background = propColor + '22'; propEl.style.color = propColor; propEl.style.borderColor = propColor + '55'; }
}

window.builderCycle = function(i) {
  builderBases[i] = BASE_CYCLE[builderBases[i]];
  // Flash animation
  const slotsEl = document.getElementById('builder-slots');
  if (slotsEl) {
    const slots = slotsEl.querySelectorAll('.builder-slot');
    if (slots[i]) { slots[i].style.transform = 'scale(1.3)'; setTimeout(() => slots[i].style.transform = '', 200); }
  }
  renderBuilder();
};

window.builderSet = function(codon) {
  builderBases = codon.split('');
  renderBuilder();
};

function initCodonBuilder() { builderBases = ['A','T','G']; renderBuilder(); }

// ── Frameshift Animator ────────────────────────────────────
const FS_ORIG_DNA = 'ATGCGCATTGAGCTGTGA';
let fsDNA = FS_ORIG_DNA.split('');

function renderFsAnim() {
  const dispEl   = document.getElementById('fs-anim-display');
  const protEl   = document.getElementById('fs-anim-protein');
  const noteEl   = document.getElementById('fs-anim-note');
  if (!dispEl) return;

  let html = '';
  fsDNA.forEach((b, i) => {
    if (i > 0 && i % 3 === 0) html += `<span class="fs-bracket">|</span>`;
    const isNew = FS_ORIG_DNA[i] !== b || fsDNA.length !== FS_ORIG_DNA.length;
    html += `<span class="fs-base${isNew && fsDNA.length !== FS_ORIG_DNA.length ? ' fs-base-new' : ''}"
                  style="background:${BASE_BG[b]};color:${BASE_COLOR[b]}">${b}</span>`;
  });
  dispEl.innerHTML = html;

  if (protEl) {
    const codons     = translate(fsDNA.join(''));
    const origCodons = translate(FS_ORIG_DNA);
    protEl.innerHTML = codons.map((c, i) => {
      const isStop    = c.aa === 'Stop';
      const isChanged = !origCodons[i] || origCodons[i].aa !== c.aa;
      let cls = 'fs-aa';
      if (isStop)    cls += ' fs-aa-stop';
      else if (isChanged) cls += ' fs-aa-changed';
      return `<span class="${cls}">${c.aa}</span>`;
    }).join('<span class="fs-arrow">→</span>');
  }

  if (noteEl) {
    const diff = fsDNA.length - FS_ORIG_DNA.length;
    if (diff === 0) noteEl.textContent = '✅ 読み枠が正常です（アミノ酸の順序は変わらない）';
    else if (diff > 0) noteEl.textContent = `⚡ ${diff}塩基挿入 → フレームシフト発生！変異点以降のアミノ酸がすべて変わる`;
    else noteEl.textContent = `⚡ ${Math.abs(diff)}塩基欠失 → フレームシフト発生！変異点以降のアミノ酸がすべて変わる`;
  }
}

window.fsAnimInsert = function() {
  const BASES = ['A','T','G','C'];
  const pos = Math.floor(Math.random() * (fsDNA.length - 3)) + 3;
  fsDNA.splice(pos, 0, BASES[Math.floor(Math.random() * 4)]);
  renderFsAnim();
};
window.fsAnimDelete = function() {
  if (fsDNA.length <= 4) { fsAnimReset(); return; }
  const pos = Math.floor(Math.random() * (fsDNA.length - 3)) + 3;
  fsDNA.splice(pos, 1);
  renderFsAnim();
};
window.fsAnimReset = function() { fsDNA = FS_ORIG_DNA.split(''); renderFsAnim(); };
function initFrameshiftAnimator() { fsDNA = FS_ORIG_DNA.split(''); renderFsAnim(); }

// ── Lab Presets ────────────────────────────────────────────
window.labPreset = function(type) {
  // Reset first
  LAB_DNA     = LAB_ORIG.split('');
  labSelected = -1;
  labHistory  = [];
  document.getElementById('btn-sub').disabled = true;
  document.getElementById('btn-ins').disabled = true;
  document.getElementById('btn-del').disabled = true;
  const eb = document.getElementById('lab-effect-box');
  if (eb) eb.style.display = 'none';

  if (type === 'sickle') {
    // GAA(Glu) @ pos 9-11 → GTA(Val): change pos 10 A→T
    LAB_DNA[10] = 'T';
    showLabEffect('missense',
      `🩸 鎌状赤血球プリセット\n位置11（第4コドン2番目）: A→T（GAG→GTG: Glu→Val）\n実際のHBB遺伝子第6コドン変異と同じパターン。\nたった1塩基でヘモグロビンが凝集・鎌状変形！\nマラリア地域ではヘテロ接合体が有利（自然選択の実例）`);
    labHistory.unshift({ type:'sub', desc:'プリセット：鎌状赤血球 A→T (GAG→GTG: Glu→Val)' });
  } else if (type === 'frameshift') {
    LAB_DNA.splice(6, 0, 'T'); // insert T before 3rd codon
    showLabEffect('frameshift',
      `⚡ フレームシフトプリセット\n位置7に「T」を挿入 → 以降のコドンがすべてずれる！\n変異点以降のアミノ酸が全て変わり、タンパク質機能が失われることが多い`);
    labHistory.unshift({ type:'ins', desc:'プリセット：フレームシフト +T(位置7)' });
  }
  renderLabHistory();
  labRender();
};

// ── SNP Shuffle ────────────────────────────────────────────
const SNP_EXAMPLES = [
  { seqA:['A','T','C','G','G','T','A','C','G','T'], seqB:['A','T','C','A','G','T','A','C','G','T'], snpIdx:3,
    traitA:'位置4: G → 通常タイプ', traitB:'位置4: A → 薬物代謝に影響（CYP2D6）' },
  { seqA:['G','C','A','T','T','G','C','A','A','G'], seqB:['G','C','A','T','T','A','C','A','A','G'], snpIdx:5,
    traitA:'位置6: G → 乳がんリスク標準', traitB:'位置6: A → BRCA1関連SNP' },
  { seqA:['A','A','T','G','C','C','A','G','T','C'], seqB:['A','A','T','G','C','T','A','G','T','C'], snpIdx:5,
    traitA:'位置6: C → ラクターゼ持続型', traitB:'位置6: T → 乳糖不耐症リスク上昇' },
  { seqA:['T','G','G','C','A','G','T','T','A','C'], seqB:['T','G','G','C','A','A','T','T','A','C'], snpIdx:5,
    traitA:'位置6: G → 血圧正常型', traitB:'位置6: A → 高血圧リスク上昇' },
];
let currentSNPIdx = 0;

function renderSNPDemo(ex) {
  const seqA = document.getElementById('snp-seq-a');
  const seqB = document.getElementById('snp-seq-b');
  const tA   = document.getElementById('snp-trait-a');
  const tB   = document.getElementById('snp-trait-b');
  if (!seqA) return;
  const renderSeq = (el, seq, hi) => {
    el.innerHTML = seq.map((b, i) => {
      const isSnp = i === hi;
      return `<div class="snp-base base-${b.toLowerCase()}${isSnp?' snp-highlight':''}"
                   style="${isSnp?'':'background:'+BASE_BG[b]+';color:'+BASE_COLOR[b]}">${b}</div>`;
    }).join('');
  };
  renderSeq(seqA, ex.seqA, ex.snpIdx);
  renderSeq(seqB, ex.seqB, ex.snpIdx);
  if (tA) tA.textContent = ex.traitA;
  if (tB) tB.textContent = ex.traitB;
}

window.snpShuffle = function() {
  currentSNPIdx = (currentSNPIdx + 1) % SNP_EXAMPLES.length;
  const wrap = document.querySelector('.snp-persons');
  if (wrap) {
    wrap.style.opacity = '0'; wrap.style.transform = 'translateY(8px)'; wrap.style.transition = 'all .2s';
    setTimeout(() => {
      renderSNPDemo(SNP_EXAMPLES[currentSNPIdx]);
      wrap.style.opacity = '1'; wrap.style.transform = '';
    }, 220);
  } else {
    renderSNPDemo(SNP_EXAMPLES[currentSNPIdx]);
  }
};

// ── Evolution Simulator ────────────────────────────────────
let evoRunning  = false;
let evoInterval = null;
let evoHistory  = [];
let evoMutantFreq = 0.10;
let evoGeneration = 0;
const EVO_N = 200; // effective population size
const EVO_MAX_GENS = 60;

function getEvoParams() {
  const s = parseFloat(document.getElementById('sel-slider')?.value ?? '0.05');
  const f = parseInt(document.getElementById('init-freq-slider')?.value ?? '10') / 100;
  return { s, initFreq: f };
}

function evoStep() {
  const { s } = getEvoParams();
  const p = evoMutantFreq;
  const wBar = (1 - p) + p * (1 + s);
  const pSel = (p * (1 + s)) / wBar;
  // Binomial drift
  let count = 0;
  for (let i = 0; i < EVO_N; i++) if (Math.random() < pSel) count++;
  evoMutantFreq = count / EVO_N;
  evoGeneration++;
  evoHistory.push(evoMutantFreq);
}

function updateEvoDisplay() {
  const mutPct  = Math.round(evoMutantFreq * 100);
  const normPct = 100 - mutPct;
  const mutBar  = document.getElementById('evo-mutant-bar');
  const normBar = document.getElementById('evo-normal-bar');
  const mutPctEl  = document.getElementById('evo-mutant-pct');
  const normPctEl = document.getElementById('evo-normal-pct');
  const genEl     = document.getElementById('evo-gen-num');
  if (mutBar)  mutBar.style.width  = mutPct  + '%';
  if (normBar) normBar.style.width = normPct + '%';
  if (mutPctEl)  mutPctEl.textContent  = mutPct  + '%';
  if (normPctEl) normPctEl.textContent = normPct + '%';
  if (genEl)     genEl.textContent     = evoGeneration;
  drawEvoChart();
  if (evoMutantFreq <= 0 || evoMutantFreq >= 1 || evoGeneration >= EVO_MAX_GENS) {
    evoStop();
    const noteEl = document.getElementById('evo-sim-note');
    if (noteEl) {
      if (evoMutantFreq <= 0)             noteEl.textContent = '🔴 変異型が集団から消滅（遺伝的浮動）';
      else if (evoMutantFreq >= 1)        noteEl.textContent = '🟢 変異型が集団に固定！自然選択の勝利';
      else noteEl.textContent = `第${evoGeneration}世代終了。変異型: ${mutPct}%`;
    }
  }
}

function drawEvoChart() {
  const canvas = document.getElementById('evo-chart');
  if (!canvas) return;
  const W = canvas.parentElement?.offsetWidth || canvas.offsetWidth || 400;
  const H = 140;
  if (canvas.width !== W) canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1].forEach(f => {
    const y = H - f * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  });
  // Labels
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '10px "Space Grotesk", monospace';
  [['100%', 8], ['50%', H / 2 + 4], ['0%', H - 2]].forEach(([t, y]) => ctx.fillText(t, 4, y));
  if (evoHistory.length < 2) return;
  const maxG = Math.max(evoHistory.length, 10);
  // Mutant line (gold)
  ctx.beginPath();
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 2.5;
  evoHistory.forEach((f, i) => {
    const x = (i / (maxG - 1)) * W;
    const y = H - f * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
  // Fill
  ctx.lineTo((evoHistory.length - 1) / (maxG - 1) * W, H);
  ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = 'rgba(245,158,11,0.12)'; ctx.fill();
  // Normal line (blue, inverted)
  ctx.beginPath();
  ctx.strokeStyle = '#60A5FA'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
  evoHistory.forEach((f, i) => {
    const x = (i / (maxG - 1)) * W;
    const y = H - (1 - f) * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke(); ctx.setLineDash([]);
}

function evoStop() {
  evoRunning = false;
  clearInterval(evoInterval); evoInterval = null;
  const btn = document.getElementById('evo-run-btn');
  if (btn) btn.textContent = '▶ シミュレーション実行';
}

window.evoRunToggle = function() {
  if (evoRunning) {
    evoStop();
  } else {
    if (evoGeneration >= EVO_MAX_GENS || evoMutantFreq <= 0 || evoMutantFreq >= 1) window.evoReset();
    evoRunning = true;
    const btn = document.getElementById('evo-run-btn');
    if (btn) btn.textContent = '⏸ 一時停止';
    evoInterval = setInterval(() => { evoStep(); updateEvoDisplay(); }, 80);
  }
};

window.evoReset = function() {
  evoStop();
  const { initFreq } = getEvoParams();
  evoMutantFreq = initFreq; evoGeneration = 0; evoHistory = [initFreq];
  const mutPct = Math.round(initFreq * 100);
  const el = (id) => document.getElementById(id);
  if (el('evo-mutant-bar'))  el('evo-mutant-bar').style.width  = mutPct + '%';
  if (el('evo-normal-bar'))  el('evo-normal-bar').style.width  = (100 - mutPct) + '%';
  if (el('evo-mutant-pct'))  el('evo-mutant-pct').textContent  = mutPct + '%';
  if (el('evo-normal-pct'))  el('evo-normal-pct').textContent  = (100 - mutPct) + '%';
  if (el('evo-gen-num'))     el('evo-gen-num').textContent     = '0';
  const noteEl = el('evo-sim-note');
  if (noteEl) noteEl.textContent = '← スライダーで選択係数と初期頻度を調整してから実行しよう';
  drawEvoChart();
};

function initEvoSim() {
  const { initFreq } = getEvoParams();
  evoMutantFreq = initFreq; evoHistory = [initFreq];
  drawEvoChart();
}

// ── Hero Counter Animation ─────────────────────────────────
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el      = entry.target;
      const target  = parseFloat(el.dataset.target);
      const isFloat = el.dataset.float === 'true';
      const dur     = 2000;
      const start   = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const val = target * eased;
        el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString('ja-JP');
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString('ja-JP');
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}

// ── Confetti ───────────────────────────────────────────────
function launchConfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  const colors = ['#10B981','#F59E0B','#EF4444','#8B5CF6','#60A5FA','#FCD34D','#34D399'];
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    const size = Math.random() * 9 + 5;
    el.style.cssText = `
      left:${Math.random() * 100}%;
      top:-${size + 10}px;
      width:${size}px;
      height:${size * (Math.random() > 0.5 ? 1 : 1.8)}px;
      background:${colors[Math.floor(Math.random() * colors.length)]};
      border-radius:${Math.random() > 0.4 ? '50%' : '2px'};
      animation-delay:${(Math.random() * 0.6).toFixed(2)}s;
      animation-duration:${(Math.random() * 1.8 + 1.2).toFixed(2)}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
}

// ── Main init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // DNA Canvas
  const canvas = document.getElementById('dna-canvas');
  if (canvas) new DNAHelix(canvas);

  // Core features
  initScrollProgress();
  initReveal();
  initNavLinks();
  initNavbar();
  initSectionAnimations();

  // Content
  initCodonDemo();
  initCodonBuilder();
  initFrameshiftAnimator();
  initMiniCodonTable();
  renderSNPDemo(SNP_EXAMPLES[0]);
  initLab();
  initEvoSim();
  initQuiz();
  initCounterAnimation();
  initMutCards();
  initKeyboard();

  // Keyboard shortcut hint
  console.log('%c遺伝子とその変化 🧬', 'color:#10B981;font-size:16px;font-weight:bold');
  console.log('%cキーボード：↑↓ または PageUp/PageDown でセクション移動', 'color:#94A3B8');
});
