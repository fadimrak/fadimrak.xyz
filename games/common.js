// Oyunların ortak yardımcıları

// 2026-01-01'den bu yana geçen gün (yerel saat) — günlük bulmacaların numarası
function dayIndex() {
  const now = new Date();
  return Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(2026, 0, 1)) / 864e5);
}

// Tohumlu rastgele sayı (mulberry32): aynı gün herkese aynı bulmaca
function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// n. günün öğesi: liste her turda farklı sırayla karıştırılır, böylece hiç bitmez
function nthOf(list, n, salt = 1) {
  const len = list.length, cycle = Math.floor(n / len);
  return shuffle(list, rng(salt * 7919 + cycle))[((n % len) + len) % len];
}

const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

let toastTimer;
function toast(msg, ms = 1800) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.append(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}

async function share(text) {
  try {
    if (navigator.share && matchMedia('(pointer: coarse)').matches) await navigator.share({ text });
    else { await navigator.clipboard.writeText(text); toast('panoya kopyalandı'); }
  } catch {}
}

// Günlük / sınırsız mod seçici. onChange(mode) seçilince çağrılır; seçim hatırlanır.
function modeSwitch(el, key, onChange) {
  let mode = store.get(key + '-mode', 'daily');
  el.innerHTML = '<button data-m="daily">günlük</button><button data-m="free">sınırsız</button>';
  const paint = () => el.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
  el.querySelectorAll('button').forEach(b => b.onclick = () => {
    if (b.dataset.m === mode) return;
    mode = b.dataset.m; store.set(key + '-mode', mode); paint(); onChange(mode);
  });
  paint();
  onChange(mode);
}

// Konfeti (kutlama)
function confetti(n = 80) {
  const colors = ['#ff5a4e', '#ff9f1c', '#ffd23f', '#3bb273', '#4d7cfe', '#8f5cf7', '#ff6fae'];
  const c = document.createElement('canvas');
  c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99';
  c.width = innerWidth; c.height = innerHeight;
  document.body.append(c);
  const ctx = c.getContext('2d');
  const ps = Array.from({ length: n }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 200, y: innerHeight / 3,
    vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6,
    s: 6 + Math.random() * 6, c: colors[Math.floor(Math.random() * colors.length)]
  }));
  const t0 = performance.now();
  (function f() {
    ctx.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => { p.vy += .4; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += .1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
    if (performance.now() - t0 < 2500) requestAnimationFrame(f); else c.remove();
  })();
}

// Sayfa altı imza
document.body.insertAdjacentHTML('beforeend', '<footer class="site-foot">fadimrak tarafından yapılmıştır · <a href="/telif/">telif hakları</a></footer>');
