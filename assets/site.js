// Sitenin ortak parçaları: tema, arama, yerel kayıt, bildirim, sekmeler, sayfa altı.
// <head> içinde yüklenir; tema hemen uygulanır, geri kalanı sayfa hazır olunca çalışır.

(() => {
  const html = document.documentElement;
  let t = null;
  try { t = localStorage.getItem('theme'); } catch {}
  // Seçim yoksa: sayfanın kendi teması (data-native), o da yoksa sistem ayarı
  html.dataset.theme = t || html.dataset.native || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
})();

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
  if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.append(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

const site = {
  $: (s, el = document) => el.querySelector(s),
  $$: (s, el = document) => [...el.querySelectorAll(s)],
  esc: s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]),
  fmt: (n, d = 2) => Number(n).toLocaleString('tr-TR', { maximumFractionDigits: d }),
  // Türkçe harfleri sadeleştirip küçült (arama için)
  norm: s => String(s).toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, c => 'cgiosuaiu'['çğıöşüâîû'.indexOf(c)]),

  _scripts: {},
  load(src) {
    return this._scripts[src] ||= new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = () => { delete this._scripts[src]; fail(new Error('yüklenemedi: ' + src)); };
      document.head.append(s);
    });
  },
  dl(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  },
  // Dosya seçme alanı: tıkla ya da sürükle bırak. onFiles(File[]) çağrılır.
  drop(el, onFiles, { accept = '', multiple = false } = {}) {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept, multiple, hidden: true });
    el.after(input);
    el.tabIndex = 0; el.setAttribute('role', 'button');
    el.onclick = () => input.click();
    el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } };
    input.onchange = () => { if (input.files.length) onFiles([...input.files]); input.value = ''; };
    el.ondragover = e => { e.preventDefault(); el.classList.add('over'); };
    el.ondragleave = () => el.classList.remove('over');
    el.ondrop = e => { e.preventDefault(); el.classList.remove('over'); if (e.dataTransfer.files.length) onFiles([...e.dataTransfer.files]); };
  },

  // Çalışma serisi: bugünden (bugün boşsa dünden) geriye, süre ya da soru kaydı olan ardışık gün sayısı
  streak() {
    const sure = store.get('sure-log', {}), soru = store.get('soru-log', {});
    const has = d => (sure[d] || 0) > 0 || Object.values(soru[d] || {}).some(n => n > 0);
    const day = new Date(); let n = 0;
    if (!has(day.toLocaleDateString('sv'))) day.setDate(day.getDate() - 1);
    while (has(day.toLocaleDateString('sv'))) { n++; day.setDate(day.getDate() - 1); }
    return n;
  },

  theme() {
    const html = document.documentElement;
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    const m = document.querySelector('meta[name=theme-color]');
    if (m && !html.dataset.native) m.content = getComputedStyle(document.body).backgroundColor;
  },

  // Sekmeli sayfalar: <nav class="tabs"><a href="#x"> ve <section data-tab="x">
  tabs() {
    const secs = site.$$('[data-tab]');
    if (!secs.length) return;
    const links = site.$$('.tabs a');
    const show = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const cur = secs.find(s => s.dataset.tab === id) || secs[0];
      secs.forEach(s => s.hidden = s !== cur);
      links.forEach(a => a.getAttribute('href') === '#' + cur.dataset.tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
      site.$('.tabs a[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      cur.dispatchEvent(new Event('show'));
    };
    addEventListener('hashchange', show);
    show();
  },

  // Arama dizini: [başlık, adres, bölüm, ek kelimeler]
  index: [
    ['ana sayfa', '/', 'site', 'fadimrak'],
    ['oyunlar', '/games/', 'oyun', 'oyun portalı'],
    ['kelime', '/games/kelime/', 'oyun', 'wordle günlük bulmaca'],
    ['bağlantı', '/games/baglanti/', 'oyun', 'connections grup bulmaca'],
    ['şehir', '/games/sehir/', 'oyun', 'il harita worldle'],
    ['yıl', '/games/yil/', 'oyun', 'tarihte bugün'],
    ['hangisi daha?', '/games/kalabalik/', 'oyun', 'nüfus ülke il kalabalık'],
    ['ben robot değilim', '/games/robot/', 'oyun', 'captcha'],
    ['hayatın haftaları', '/games/hafta/', 'oyun', 'ömür hafta takvim'],
    ['YKS', '/yks/', 'yks', 'tyt ayt sınav geri sayım'],
    ['YKS geri sayım', '/yks/', 'yks', 'kaç gün kaldı sayaç'],
    ['konu listesi ve takip', '/yks/konular/', 'yks', 'tyt ayt konular konu takip özet pdf video'],
    ['konu özetleri', '/yks/konular/', 'yks', 'özet'],
    ['soru dağılımı', '/yks/dagilim/', 'yks', 'yıllara göre konu dağılım tablosu çıkmış'],
    ['matematik formülleri', '/yks/formuller/#matematik', 'yks', 'formül sayfası'],
    ['fizik formülleri', '/yks/formuller/#fizik', 'yks', 'formül sayfası'],
    ['kimya formülleri', '/yks/formuller/#kimya', 'yks', 'formül sayfası'],
    ['periyodik tablo', '/yks/periyodik/', 'yks', 'element kimya'],
    ['biyoloji kavram haritaları', '/yks/biyoloji/', 'yks', 'hücre kalıtım sistemler'],
    ['Türkçe dil bilgisi', '/yks/turkce/', 'yks', 'sözcük türleri cümle ögeleri yazım noktalama'],
    ['paragraf çözme teknikleri', '/yks/turkce/#paragraf', 'yks', 'ana fikir'],
    ['tarih kronolojisi', '/yks/tarih/', 'yks', 'zaman çizelgesi osmanlı inkılap'],
    ['coğrafya haritaları', '/yks/cografya/', 'yks', 'türkiye harita bölgeler maden tarım'],
    ['felsefe sözlüğü', '/yks/felsefe/', 'yks', 'kavramlar'],
    ['ücretsiz kaynaklar', '/yks/kaynaklar/', 'yks', 'meb ösym çıkmış sorular video playlist pdf'],
    ['şifreli PDF arşivi', '/yks/kasa/', 'yks', 'kasa staticrypt'],
    ['TYT net hesaplama', '/yks/hesap/#tyt', 'yks', 'net hesaplayıcı'],
    ['AYT net hesaplama', '/yks/hesap/#ayt', 'yks', 'net hesaplayıcı'],
    ['YKS puan hesaplama', '/yks/hesap/#puan', 'yks', 'obp diploma sayısal eşit ağırlık sözel dil'],
    ['hedefe kaç net lazım', '/yks/hesap/#hedef', 'yks', 'hedef puan'],
    ['kaç gün kaldı, günde kaç konu', '/yks/hesap/#gun', 'yks', 'hafta konu planı'],
    ['deneme kaydı ve net grafiği', '/yks/takip/#deneme', 'takip', 'deneme sınavı grafik'],
    ['çalışma süresi', '/yks/takip/#sure', 'takip', 'günlük süre kayıt'],
    ['soru sayısı takibi', '/yks/takip/#soru', 'takip', 'çözülen soru'],
    ['çalışma serisi', '/yks/takip/#seri', 'takip', 'streak gün serisi'],
    ['tekrar hatırlatıcı', '/yks/takip/#tekrar', 'takip', '1-7-30 aralıklı tekrar'],
    ['yanlış defteri', '/yks/takip/#yanlis', 'takip', 'fotoğraf etiket yanlış soru'],
    ['haftalık program', '/yks/takip/#program', 'takip', 'ders programı plan'],
    ['verileri dışa / içe aktar', '/yks/takip/#yedek', 'takip', 'yedek json cihaz değiştir'],
    ['araçlar', '/araclar/', 'araç', 'tüm araçlar'],
    ['pomodoro', '/araclar/calisma/#pomodoro', 'araç', 'zamanlayıcı odak'],
    ['kronometre', '/araclar/calisma/#kronometre', 'araç', 'süre ölçer'],
    ['geri sayım zamanlayıcısı', '/araclar/calisma/#sayac', 'araç', 'timer alarm'],
    ['beyaz gürültü, yağmur sesi', '/araclar/calisma/#ses', 'araç', 'ses odak kahverengi gürültü'],
    ['odak modu', '/araclar/calisma/#odak', 'araç', 'tam ekran sayaç'],
    ['bilgi kartları', '/araclar/kartlar/', 'araç', 'flashcard kart ezber'],
    ['not defteri', '/araclar/notlar/#notlar', 'araç', 'not'],
    ['yapılacaklar listesi', '/araclar/notlar/#yapilacaklar', 'araç', 'todo görev'],
    ['optik form', '/araclar/optik/', 'araç', 'cevap kağıdı deneme kontrol'],
    ['PDF birleştir', '/araclar/pdf/#birlestir', 'pdf', 'merge'],
    ['PDF böl', '/araclar/pdf/#bol', 'pdf', 'split ayır'],
    ['PDF sayfa sil', '/araclar/pdf/#sil', 'pdf', ''],
    ['PDF sayfa döndür', '/araclar/pdf/#dondur', 'pdf', 'rotate'],
    ['PDF sayfa sırala', '/araclar/pdf/#sirala', 'pdf', 'sürükle bırak düzen'],
    ['PDF\'e yazı ekle', '/araclar/pdf/#yazi', 'pdf', 'metin'],
    ['PDF\'e çizim', '/araclar/pdf/#ciz', 'pdf', 'işaretleme kalem'],
    ['PDF\'e imza', '/araclar/pdf/#imza', 'pdf', 'imzala'],
    ['PDF sayfa numarası', '/araclar/pdf/#numara', 'pdf', ''],
    ['PDF filigran', '/araclar/pdf/#filigran', 'pdf', 'watermark'],
    ['PDF şifrele', '/araclar/pdf/#sifrele', 'pdf', 'parola koru'],
    ['PDF sıkıştır', '/araclar/pdf/#sikistir', 'pdf', 'küçült boyut'],
    ['resimden PDF', '/araclar/pdf/#resimden', 'pdf', 'jpg png pdf çevir'],
    ['PDF\'ten resim', '/araclar/pdf/#resme', 'pdf', 'pdf jpg png çevir'],
    ['PDF sayfa çıkar', '/araclar/pdf/#cikar', 'pdf', 'extract'],
    ['PDF görüntüleyici', '/araclar/pdf/#goruntule', 'pdf', 'aç oku'],
    ['resim sıkıştır', '/araclar/resim/#sikistir', 'resim', 'küçült kalite'],
    ['resim boyutlandır', '/araclar/resim/#boyut', 'resim', 'resize'],
    ['resim kırp', '/araclar/resim/#kirp', 'resim', 'crop'],
    ['resim format çevir', '/araclar/resim/#cevir', 'resim', 'png jpg webp'],
    ['arka plan kaldır', '/araclar/resim/#arkaplan', 'resim', 'dekupe şeffaf'],
    ['taranmış belge efekti', '/araclar/resim/#tarama', 'resim', 'tarayıcı scan'],
    ['resimden yazı oku (OCR)', '/araclar/resim/#ocr', 'resim', 'metin tanıma tesseract'],
    ['bilimsel hesap makinesi', '/araclar/hesap/#bilimsel', 'hesap', 'hesap makinesi'],
    ['fonksiyon grafiği', '/araclar/hesap/#grafik', 'hesap', 'grafik çiz'],
    ['denklem çözücü', '/araclar/hesap/#denklem', 'hesap', 'kök'],
    ['matris hesaplayıcı', '/araclar/hesap/#matris', 'hesap', 'determinant ters'],
    ['birim çevirici', '/araclar/hesap/#birim', 'hesap', 'uzunluk ağırlık sıcaklık'],
    ['yüzde hesaplama', '/araclar/hesap/#yuzde', 'hesap', 'indirim zam'],
    ['ortalama ve not hesaplama', '/araclar/hesap/#ortalama', 'hesap', 'karne ağırlıklı ortalama'],
    ['taban dönüştürücü', '/araclar/hesap/#taban', 'hesap', 'ikilik onaltılık binary hex'],
    ['asal sayı, EBOB, EKOK', '/araclar/hesap/#asal', 'hesap', 'çarpanlar'],
    ['türev ve integral', '/araclar/hesap/#turev', 'hesap', 'analiz'],
    ['kelime ve karakter sayacı', '/araclar/yazi/#sayac', 'yazı', 'okuma süresi'],
    ['büyük / küçük harf', '/araclar/yazi/#harf', 'yazı', 'harf çevir'],
    ['metin karşılaştır', '/araclar/yazi/#fark', 'yazı', 'diff fark bul'],
    ['markdown editörü', '/araclar/yazi/#markdown', 'yazı', 'md'],
    ['yazım ve tekrar denetimi', '/araclar/yazi/#yazim', 'yazı', 'imla tekrar eden kelime'],
    ['okuma süresi', '/araclar/yazi/#sayac', 'yazı', ''],
    ['QR kod oluştur', '/araclar/qr/#uret', 'araç', 'karekod'],
    ['QR kod oku', '/araclar/qr/#oku', 'araç', 'karekod kamera'],
    ['şifre üretici', '/araclar/genel/#sifre', 'araç', 'parola'],
    ['döviz çevirici', '/araclar/genel/#doviz', 'araç', 'dolar euro kur'],
    ['hava durumu', '/araclar/genel/#hava', 'araç', 'sıcaklık'],
    ['saat dilimi çevirici', '/araclar/genel/#saat', 'araç', 'zaman dilimi'],
    ['tarih farkı', '/araclar/genel/#tarih', 'araç', 'iki tarih arası gün'],
    ['renk seçici', '/araclar/genel/#renk', 'araç', 'hex rgb hsl'],
    ['klavye hız testi', '/araclar/genel/#klavye', 'araç', 'yazma hızı'],
    ['kamera, mikrofon, ekran testi', '/araclar/genel/#cihaz', 'araç', 'webcam ölü piksel'],
    ['dosya boyutu çevirici', '/araclar/genel/#boyut', 'araç', 'mb gb kb'],
    ['telif hakları', '/telif/', 'site', 'lisans kaynak gizlilik'],
  ],
  _topics: null,
  async topics() {
    if (this._topics) return this._topics;
    try {
      const d = await (await fetch('/yks/konular.json')).json();
      this._topics = d.dersler.flatMap(s => s.konular.map(k => [k.ad, '/yks/konular/#' + s.id, s.sinav.toUpperCase() + ' ' + s.ad, '']));
    } catch { this._topics = []; }
    return this._topics;
  },

  search() {
    let dlg = site.$('dialog.sx');
    if (!dlg) {
      document.body.insertAdjacentHTML('beforeend', `<dialog class="sx" aria-label="sitede ara"><form method="dialog"><input type="search" placeholder="ara: pdf birleştir, türev, pomodoro…" aria-label="arama" autocomplete="off"><ul role="listbox"></ul><p><kbd>↑</kbd> <kbd>↓</kbd> seç · <kbd>Enter</kbd> aç · <kbd>Esc</kbd> kapat</p></form></dialog>`);
      dlg = site.$('dialog.sx');
      const input = site.$('input', dlg), ul = site.$('ul', dlg);
      let sel = 0, items = [];
      const render = async () => {
        const q = site.norm(input.value.trim());
        const words = q.split(/\s+/).filter(Boolean);
        const all = words.length ? site.index.concat(await site.topics()) : site.index.slice(0, 12);
        items = all.map(e => {
          const title = site.norm(e[0]), hay = title + ' ' + site.norm(e[2] + ' ' + e[3]);
          if (!words.every(w => hay.includes(w))) return null;
          return [e, title.startsWith(q) ? 0 : title.includes(q) ? 1 : 2];
        }).filter(Boolean).sort((a, b) => a[1] - b[1]).slice(0, 30).map(x => x[0]);
        sel = 0;
        ul.innerHTML = items.length ? items.map((e, i) => `<li role="option"><a href="${e[1]}" ${i ? '' : 'aria-selected="true"'}>${site.esc(e[0])}<small>${site.esc(e[2])}</small></a></li>`).join('') : '<li class="none">sonuç yok</li>';
      };
      const move = d => {
        const as = site.$$('a', ul); if (!as.length) return;
        as[sel]?.removeAttribute('aria-selected');
        sel = (sel + d + as.length) % as.length;
        as[sel].setAttribute('aria-selected', 'true'); as[sel].scrollIntoView({ block: 'nearest' });
      };
      input.oninput = render;
      input.onkeydown = e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); const a = site.$$('a', ul)[sel]; if (a) { dlg.close(); location.href = a.href; } }
      };
      ul.onclick = e => { if (e.target.closest('a')) dlg.close(); };
      dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
      render();
    }
    dlg.showModal();
    const input = site.$('input', dlg);
    input.select();
  },
};

// Arama penceresinin görünümü her sayfada aynı olsun diye burada
document.head.insertAdjacentHTML('beforeend', `<style>
dialog.sx{width:min(560px,calc(100vw - 32px));max-height:min(70vh,560px);margin:12vh auto auto;padding:0;border:2px solid var(--line,#333);border-radius:16px;background:var(--card,#111);color:var(--ink,#e6e6e6);box-shadow:6px 6px 0 var(--sh,#000);font-family:inherit;overflow:hidden}
dialog.sx::backdrop{background:rgba(0,0,0,.45)}
dialog.sx form{display:flex;flex-direction:column;max-height:inherit}
dialog.sx input{all:unset;box-sizing:border-box;width:100%;padding:1rem 1.1rem;font-size:1.05rem;border-bottom:2px solid var(--soft,#222)}
dialog.sx ul{list-style:none;margin:0;padding:.4rem;overflow:auto;flex:1}
dialog.sx a{display:flex;justify-content:space-between;gap:1rem;padding:.6rem .75rem;border-radius:10px;text-decoration:none;color:inherit}
dialog.sx a small{color:var(--muted,#888);white-space:nowrap}
dialog.sx a:hover,dialog.sx a[aria-selected]{background:var(--soft,#222)}
dialog.sx .none{padding:.75rem;color:var(--muted,#888)}
dialog.sx p{margin:0;padding:.55rem 1rem;font-size:.75rem;color:var(--muted,#888);border-top:2px solid var(--soft,#222)}
dialog.sx kbd{font:inherit;padding:0 .3rem;border:1px solid var(--muted,#555);border-radius:4px}
</style>`);

const SITE_ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  theme: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/></svg>',
};

document.addEventListener('DOMContentLoaded', () => {
  site.$$('.acts').forEach(el => el.innerHTML ||= `<button class="ib" data-act="search" aria-label="sitede ara" title="ara (Ctrl+K)">${SITE_ICONS.search}</button><button class="ib" data-act="theme" aria-label="açık / koyu tema" title="tema">${SITE_ICONS.theme}</button>`);
  if (!site.$('footer')) document.body.insertAdjacentHTML('beforeend', '<footer class="site-foot">fadimrak tarafından yapılmıştır · <a href="/telif/">telif hakları</a></footer>');
  site.tabs();
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  if (b.dataset.act === 'search') { e.preventDefault(); site.search(); }
  if (b.dataset.act === 'theme') { e.preventDefault(); site.theme(); }
});
addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
  if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) { e.preventDefault(); site.search(); }
});
