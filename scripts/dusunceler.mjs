// dusunceler-kaynak/yazilar.html dosyasını şifreleyip dusunceler/yazilar.json'a yazar.
// Kullanım: node scripts/dusunceler.mjs <parola>
// Parola hiçbir yere kaydedilmez; kaynak klasör gitignore'da.
import { readFileSync, writeFileSync } from 'node:fs';
const pw = process.argv[2];
if (!pw) { console.error('kullanım: node scripts/dusunceler.mjs <parola>'); process.exit(1); }
const { subtle } = crypto, rnd = n => crypto.getRandomValues(new Uint8Array(n));
const salt = rnd(16), iv = rnd(12);
const base = await subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 600000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const ct = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, readFileSync('dusunceler-kaynak/yazilar.html')));
const b64 = a => Buffer.from(a).toString('base64');
writeFileSync('dusunceler/yazilar.json', JSON.stringify({ s: b64(salt), i: b64(iv), c: b64(ct) }));
console.log('dusunceler/yazilar.json yazıldı');
