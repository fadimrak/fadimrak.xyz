/**
 * Projects Showcase Engine - fadimrak.xyz/projects
 * Proje listesi data/projects.json dosyasından okunur (AiO tarafından yayımlanır).
 */

// ==========================================
// 1. YARDIMCILAR
// ==========================================
const PROJECTS_URL = 'data/projects.json';

// Metni HTML'e güvenle yerleştirir.
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[ch]));

// Yalnızca http(s) ve site içi göreli yollar kabul edilir.
const safeUrl = (value) => {
  const url = String(value ?? '').trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[a-z0-9][a-z0-9._\/-]*(\?[a-z0-9=&._-]*)?$/i.test(url)) return url;
  return '';
};

const GITHUB_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>';
const COPY_ICON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const LINK_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

// ==========================================
// 2. PROJELER UYGULAMA MOTORU
// ==========================================
class ProjectsApp {
  constructor() {
    this.projects = [];
    this.selectedCategory = "Tümü";
    this.searchQuery = "";
    this.init();
  }

  async init() {
    this.initTopography();
    this.setupEvents();
    try {
      const res = await fetch(PROJECTS_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.projects = (Array.isArray(data.projects) ? data.projects : [])
        .filter(p => p && p.id && p.title)
        .map((p, i) => ({ ...p, _i: i }))
        .sort((a, b) => (Number(!!b.featured) - Number(!!a.featured)) || ((a.order ?? a._i) - (b.order ?? b._i)));
    } catch (e) {
      console.error('Projeler yüklenemedi', e);
      this.renderMessage('Projeler şu an yüklenemedi', 'Lütfen sayfayı birazdan yenileyin.');
      return;
    }
    this.renderCategories();
    this.renderProjects();
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }

  initTopography() {
    const canvas = document.getElementById('topography-canvas');
    if (canvas && window.TopographyEngine) {
      new window.TopographyEngine(canvas, {
        lowColor: '#1E3A8A',
        midColor: '#3B82F6',
        highColor: '#93C5FD',
        speed: 0.35,
        morphAmount: 3.0,
        morphSpeed: 0.05,
        bands: 4.5,
        thickness: 0.015,
        scale: 1.0,
        glow: 0.5,
        contrast: 3.0,
        brightness: 1.0,
        grain: true,
        grainIntensity: 0.05,
        mouseInteraction: false
      });
    }
  }

  renderMessage(title, text) {
    const container = document.getElementById('projects-grid');
    if (!container) return;
    container.innerHTML = `
      <div class="empty-state">
        <h3>${esc(title)}</h3>
        <p>${esc(text)}</p>
      </div>
    `;
  }

  renderCategories() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    const categories = ["Tümü", ...new Set(this.projects.map(p => p.category).filter(Boolean))];

    container.innerHTML = categories.map(cat => `
      <button class="cat-pill ${cat === this.selectedCategory ? 'active' : ''}" data-cat="${esc(cat)}">
        ${esc(cat)}
      </button>
    `).join('');
  }

  renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const query = this.searchQuery.toLocaleLowerCase('tr').trim();
    const has = (v) => String(v ?? '').toLocaleLowerCase('tr').includes(query);
    const filtered = this.projects.filter(p => {
      const matchCat = this.selectedCategory === "Tümü" || p.category === this.selectedCategory;
      const matchSearch = !query || has(p.title) || has(p.description) || has(p.longDescription) ||
                          (p.features && p.features.some(has));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
          <h3>Aramanıza uygun proje bulunamadı</h3>
          <p>Farklı bir arama terimi deneyin.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(project => {
      const title = esc(project.title);
      const screenshot = safeUrl(project.screenshot);
      const github = safeUrl(project.githubUrl);
      const download = safeUrl(project.rawDownloadUrl);

      const screenshotHtml = screenshot ? `
        <div class="card-screenshot-wrap" data-img="${esc(screenshot)}" data-title="${title}">
          <img src="${esc(screenshot)}" alt="${title} Ekran Görüntüsü" class="screenshot-img" loading="lazy">
          <div class="screenshot-overlay">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            <span>Ekran Görüntüsünü Büyüt</span>
          </div>
        </div>
      ` : `
        <div class="card-gui-placeholder">
          <div class="gui-window-bar">
            <span class="gui-dot dot-red"></span>
            <span class="gui-dot dot-yellow"></span>
            <span class="gui-dot dot-green"></span>
            <span class="gui-window-title">${title}</span>
          </div>
          <div class="gui-preview-inner">
            <div class="gui-mock-sidebar">
              <span class="mock-line"></span>
              <span class="mock-line short"></span>
              <span class="mock-line"></span>
            </div>
            <div class="gui-mock-main">
              <div class="mock-stat-box">
                <span class="mock-box-title">Modül Durumu</span>
                <span class="mock-box-val">Aktif</span>
              </div>
              <div class="mock-code-box">
                <code>> Sistem hazır</code>
                <code>> Servisler çalışıyor</code>
              </div>
            </div>
          </div>
        </div>
      `;

      const featuresHtml = project.features && project.features.length ? `
        <div class="project-features-box">
          <span class="features-heading">Özellikler</span>
          <ul class="features-list">
            ${project.features.map(f => `<li>${esc(f)}</li>`).join('')}
          </ul>
        </div>
      ` : '';

      let actionButtonsHtml = '';
      if (download) {
        actionButtonsHtml = `
          <!-- Tek Tıkla İndirme -->
          <button class="btn-download" data-raw="${esc(download)}" data-filename="${esc(project.downloadFilename || '')}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            <span>Tek Tıkla İndir (.exe)</span>
          </button>

          ${github ? `
          <!-- GitHub Repo -->
          <a href="${esc(github)}" target="_blank" rel="noopener noreferrer" class="btn-secondary" title="GitHub Deposu">
            ${GITHUB_ICON}
            <span>GitHub</span>
          </a>` : ''}

          <!-- İndirme Linkini Kopyala -->
          <button class="btn-icon-copy" data-copy="${esc(download)}" title="İndirme Linkini Kopyala">
            ${COPY_ICON}
          </button>
        `;
      } else if (github) {
        actionButtonsHtml = `
          <!-- GitHub Repo (Primary) -->
          <a href="${esc(github)}" target="_blank" rel="noopener noreferrer" class="btn-download" style="text-decoration: none;">
            ${GITHUB_ICON}
            <span>GitHub Deposu</span>
          </a>

          <!-- Git Clone Kopyala -->
          <button class="btn-icon-copy" data-copy="${esc(`git clone ${github}.git`)}" title="Git Clone Komutunu Kopyala">
            ${COPY_ICON}
          </button>
        `;
      }

      const extraLinks = (Array.isArray(project.links) ? project.links : [])
        .filter(l => l && l.label && safeUrl(l.url))
        .map(l => `
          <a href="${esc(safeUrl(l.url))}" target="_blank" rel="noopener noreferrer" class="btn-secondary">
            ${LINK_ICON}
            <span>${esc(l.label)}</span>
          </a>
        `).join('');

      return `
        <article class="project-card" data-id="${esc(project.id)}" id="${esc(project.id)}">

          <!-- GUI Ekran Görüntüsü / Mockup -->
          ${screenshotHtml}

          <!-- Kart İçeriği -->
          <div class="card-details">

            <div class="card-top-row">
              <div>
                <span class="card-category">${esc(project.category)}</span>
                <h2 class="card-title">${title}</h2>
              </div>
              <div style="display: flex; gap: 6px;">
                ${project.status ? `<span class="card-version">${esc(project.status)}</span>` : ''}
                ${project.version ? `<span class="card-version">${esc(project.version)}</span>` : ''}
              </div>
            </div>

            <p class="card-description">${esc(project.description)}</p>
            ${project.longDescription ? `<p class="card-description">${esc(project.longDescription).replace(/\n/g, '<br>')}</p>` : ''}

            ${featuresHtml}

            <!-- İndirme & Aksiyon Butonları -->
            <div class="card-actions-strip">
              ${actionButtonsHtml}
              ${extraLinks}
            </div>

          </div>
        </article>
      `;
    }).join('');
  }

  setupEvents() {
    // Kategori Tıklamaları
    document.getElementById('category-pills')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-pill');
      if (!btn) return;
      this.selectedCategory = btn.dataset.cat;
      this.renderCategories();
      this.renderProjects();
    });

    // Arama Kutusu
    const searchInput = document.getElementById('project-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderProjects();
      });
    }

    // İndirme & Kopyalama & Lightbox
    document.getElementById('projects-grid')?.addEventListener('click', (e) => {
      // 1. Tek Tıkla İndir
      const dlBtn = e.target.closest('.btn-download');
      if (dlBtn && dlBtn.dataset.raw) {
        const rawUrl = dlBtn.dataset.raw;
        const filename = dlBtn.dataset.filename || 'download.exe';
        this.triggerRawDownload(rawUrl, filename);
        return;
      }

      // 2. Link / Metin Kopyala
      const copyBtn = e.target.closest('.btn-icon-copy');
      if (copyBtn) {
        const textToCopy = copyBtn.dataset.copy;
        const msg = textToCopy.startsWith('git clone')
          ? 'git clone komutu panoya kopyalandı.'
          : 'İndirme linki panoya kopyalandı.';
        this.copyToClipboard(textToCopy, msg);
        return;
      }

      // 3. Ekran Görüntüsü Büyütme
      const ssWrap = e.target.closest('.card-screenshot-wrap');
      if (ssWrap) {
        const imgUrl = ssWrap.dataset.img;
        const title = ssWrap.dataset.title;
        this.openLightbox(imgUrl, title);
      }
    });

    // Lightbox Kapatma
    document.querySelectorAll('.lightbox-backdrop, .lightbox-close').forEach(el => {
      el.addEventListener('click', () => this.closeLightbox());
    });
  }

  // GitHub Raw / Release / Dış Bağlantı İndirme
  async triggerRawDownload(rawUrl, filename) {
    if (rawUrl.includes('gofile.io') || rawUrl.includes('drive.google.com') || rawUrl.includes('mega.nz')) {
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
      this.showToast('İndirme sayfası açılıyor...');
      return;
    }

    this.showToast(`${filename} indiriliyor...`);

    try {
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      this.showToast(`${filename} başarıyla indirildi.`);
    } catch (e) {
      console.log('Direct blob download error, triggering fallback direct URL', e);
      // Fallback: Doğrudan URL indirmesi
      const a = document.createElement('a');
      a.href = rawUrl;
      a.download = filename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showToast(`${filename} indirme başlatıldı.`);
    }
  }

  openLightbox(imgUrl, title) {
    const modal = document.getElementById('image-lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');

    if (modal && img) {
      img.src = imgUrl;
      if (caption) caption.textContent = `${title} - Arayüz Ekran Görüntüsü (GUI)`;
      modal.classList.add('lightbox-active');
    }
  }

  closeLightbox() {
    const modal = document.getElementById('image-lightbox');
    if (modal) modal.classList.remove('lightbox-active');
  }

  copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(message);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast(message);
    });
  }

  showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('toast-show');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('toast-show');
    }, 2800);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ProjectsApp();
});
