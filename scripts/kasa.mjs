// Şifreli PDF arşivi (/yks/kasa/) oluşturucu.
//
// 1. PDF'leri kasa-kaynak/pdf/ klasörüne koy. Alt klasörler başlık olur (ör. pdf/Matematik/Türev.pdf).
// 2. node scripts/kasa.mjs              -> kasa-kaynak/SIFRE.txt içindeki parolayı kullanır (yoksa üretir)
//    node scripts/kasa.mjs "yeni parola" -> parolayı değiştirir
// 3. yks/kasa/ klasörünü commit'le ve pushla.
//
// kasa-kaynak/ git'e girmez. PDF'ler AES-256-GCM ile tek tek şifrelenip yks/kasa/d/ içine yazılır;
// çözme anahtarı yalnızca StatiCrypt ile parolalanmış sayfanın içinde durur.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs';
import { randomBytes, createCipheriv, createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { join, relative, dirname, basename, sep } from 'node:path';

const SRC = 'kasa-kaynak', PDF = join(SRC, 'pdf'), OUT = join('yks', 'kasa'), DATA = join(OUT, 'd');
mkdirSync(PDF, { recursive: true });

const pwFile = join(SRC, 'SIFRE.txt');
let pw = process.argv[2];
if (!pw) pw = existsSync(pwFile) ? readFileSync(pwFile, 'utf8').trim() : randomBytes(12).toString('base64url');
writeFileSync(pwFile, pw + '\n');

const keyFile = join(SRC, 'anahtar.hex');
if (!existsSync(keyFile)) writeFileSync(keyFile, randomBytes(32).toString('hex'));
const key = Buffer.from(readFileSync(keyFile, 'utf8').trim(), 'hex');

const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.pdf$/i.test(f) ? [p] : []; });
rmSync(DATA, { recursive: true, force: true });
mkdirSync(DATA, { recursive: true });

const files = walk(PDF).sort().map(p => {
  const rel = relative(PDF, p).split(sep).join('/');
  const name = createHash('sha256').update(key).update(rel).digest('hex').slice(0, 20) + '.bin';
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key, iv);
  const body = Buffer.concat([iv, c.update(readFileSync(p)), c.final(), c.getAuthTag()]);
  writeFileSync(join(DATA, name), body);
  const dir = dirname(rel);
  return { ad: basename(rel).replace(/\.pdf$/i, ''), grup: dir === '.' ? '' : dir, dosya: name, boyut: statSync(p).size };
});

const page = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>şifreli arşiv · fadimrak</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<script src="/assets/site.js"><\/script>
<style>
  .f { display: flex; align-items: center; justify-content: space-between; gap: .7rem; padding: .7rem .9rem; border: 2px solid var(--line); border-radius: 12px; background: var(--card); margin-top: .5rem; }
  .f small { color: var(--muted); }
</style>
</head>
<body>
<header class="wide"><a class="back" href="/yks/">← YKS</a><h1>şifreli arşiv</h1><div class="acts"></div></header>
<main>
  <input id="q" type="search" placeholder="dosya ara" aria-label="dosya ara" style="width:100%">
  <div id="list"></div>
</main>
<script>
const FILES = ${JSON.stringify(files)};
const KEY = '${key.toString('hex')}';
const hex = h => new Uint8Array(h.match(/../g).map(x => parseInt(x, 16)));
let ck;
async function open(f, save) {
  toast('açılıyor…', 4000);
  ck ||= await crypto.subtle.importKey('raw', hex(KEY), 'AES-GCM', false, ['decrypt']);
  const buf = new Uint8Array(await (await fetch('d/' + f.dosya)).arrayBuffer());
  const pdf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, ck, buf.slice(12));
  const blob = new Blob([pdf], { type: 'application/pdf' });
  if (save) site.dl(blob, f.ad + '.pdf'); else { const u = URL.createObjectURL(blob); window.open(u, '_blank') || (location.href = u); }
}
function render() {
  const q = site.norm(site.$('#q').value.trim()), groups = {};
  FILES.filter(f => !q || site.norm(f.grup + ' ' + f.ad).includes(q)).forEach(f => (groups[f.grup] ||= []).push(f));
  site.$('#list').innerHTML = Object.entries(groups).map(([g, fs]) => (g ? '<h2 class="sec">' + site.esc(g) + '</h2>' : '') + fs.map(f =>
    '<div class="f"><div><b>' + site.esc(f.ad) + '</b><br><small>' + (f.boyut / 1048576).toFixed(1) + ' MB</small></div><div class="row"><button class="sm primary" data-i="' + FILES.indexOf(f) + '">aç</button><button class="sm" data-i="' + FILES.indexOf(f) + '" data-s="1">indir</button></div></div>').join('')).join('')
    || '<p class="muted">Henüz dosya yok.</p>';
}
site.$('#list').onclick = e => { const b = e.target.closest('[data-i]'); if (b) open(FILES[b.dataset.i], b.dataset.s).catch(() => toast('dosya açılamadı')); };
site.$('#q').oninput = render;
render();
<\/script>
</body>
</html>`;
writeFileSync(join(SRC, 'index.html'), page);

execSync(`npx --yes staticrypt@3.5.4 ${join(SRC, 'index.html')} -d ${OUT} --short --remember 30 -c ${join(SRC, 'staticrypt.json')}` +
  ' --template-title "şifreli arşiv · fadimrak" --template-instructions "Bu arşiv parolayla korunuyor." --template-button "aç"' +
  ' --template-placeholder "parola" --template-remember "beni hatırla" --template-error "parola yanlış"' +
  ' --template-toggle-show "parolayı göster" --template-toggle-hide "parolayı gizle"' +
  ' --template-color-primary "#8f5cf7" --template-color-secondary "#f6f0e4"',
  { stdio: 'inherit', env: { ...process.env, STATICRYPT_PASSWORD: pw } });

console.log(`\n${files.length} PDF şifrelendi -> ${OUT}/. Parola: ${pwFile}`);
