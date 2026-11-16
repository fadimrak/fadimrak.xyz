// dusunceler-kaynak/yazilar.html dosyasını şifreleyip dusunceler/yazilar.json'a yazar.
// Kullanım: node scripts/dusunceler.mjs <parola>
// Anahtar: Argon2id (bellek-zor, GPU ile toplu denemeyi pahalılaştırır) → AES-256-GCM.
// Parola hiçbir yere kaydedilmez; kaynak klasör gitignore'da.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { argon2id } = createRequire(import.meta.url)('../dusunceler/argon2.min.js'); // hash-wasm 4.12.0, MIT
const pw = process.argv[2];
if (!pw) { console.error('kullanım: node scripts/dusunceler.mjs <parola>'); process.exit(1); }
const P = { m: 262144, t: 3, p: 1 }; // 256 MiB bellek, 3 tur
const rnd = n => crypto.getRandomValues(new Uint8Array(n)), salt = rnd(16), iv = rnd(12);
const raw = await argon2id({ password: pw, salt, memorySize: P.m, iterations: P.t, parallelism: P.p, hashLength: 32, outputType: 'binary' });
const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt']);
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, readFileSync('dusunceler-kaynak/yazilar.html')));
const b64 = a => Buffer.from(a).toString('base64');
writeFileSync('dusunceler/yazilar.json', JSON.stringify({ kdf: 'argon2id', ...P, s: b64(salt), i: b64(iv), c: b64(ct) }));
console.log('dusunceler/yazilar.json yazıldı');
