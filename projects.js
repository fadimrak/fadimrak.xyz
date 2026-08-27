/**
 * Projects Showcase Engine - fadimrak.xyz/projects
 * Proje: LoL Otokabul - Otoban
 */

// ==========================================
// 1. PROJELER LİSTESİ
// ==========================================
const PROJECTS_DATA = [
  {
    id: "lol-kabul-ban",
    title: "LoL Otokabul - Otoban",
    version: "v1.0.0",
    category: "League of Legends",
    description: "League of Legends maçlarını otomatik olarak kabul eden ve belirlediğiniz şampiyonu seçim aşamasında otomatik banlayan pratik masaüstü aracı.",
    features: [
      "Sıraya girdiğinizde maçı milisaniyeler içinde otomatik kabul eder",
      "Belirlediğiniz şampiyonu banlama aşamasında anında otomatik banlar",
      "Riot Client ile arka planda sorunsuz, güvenli ve minimum kaynak tüketimiyle çalışır",
      "Basit ve anlaşılır arayüz"
    ],
    screenshot: "", // Resim linki eklendiğinde tam ekran büyüteç (lightbox) ile açılır
    githubUrl: "https://github.com/fadimrak/lolkabul",
    rawDownloadUrl: "https://github.com/fadimrak/lolkabul/raw/main/LoL%20Otokabul-Otoban.exe",
    downloadFilename: "LoL Otokabul-Otoban.exe",
    tags: ["League of Legends", "LoL", "Otokabul", "Otoban", "Tool", "Windows", "EXE"]
  }
];

// ==========================================
// 2. PROJELER UYGULAMA MOTORU
// ==========================================
class ProjectsApp {
  constructor() {
    this.projects = PROJECTS_DATA;
    this.selectedCategory = "Tümü";
    this.searchQuery = "";
    this.init();
  }

  init() {
    this.initTopography();
    this.renderCategories();
    this.renderProjects();
    this.setupEvents();
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

  renderCategories() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    const categories = ["Tümü", ...new Set(this.projects.map(p => p.category))];

    container.innerHTML = categories.map(cat => `
      <button class="cat-pill ${cat === this.selectedCategory ? 'active' : ''}" data-cat="${cat}">
        ${cat}
      </button>
    `).join('');
  }

  renderProjects() {
    const container = document.getElementById('projects-grid');
    if (!container) return;

    const filtered = this.projects.filter(p => {
      const matchCat = this.selectedCategory === "Tümü" || p.category === this.selectedCategory;
      const matchSearch = p.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" x2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
          <h3>Aramanıza uygun proje bulunamadı</h3>
          <p>Farklı bir arama terimi deneyin.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(project => {
      const screenshotHtml = project.screenshot ? `
        <div class="card-screenshot-wrap" data-img="${project.screenshot}" data-title="${project.title}">
          <img src="${project.screenshot}" alt="${project.title} GUI" class="screenshot-img">
          <div class="screenshot-overlay">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" x2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
            <span>Ekran Görüntüsünü Büyüt</span>
          </div>
        </div>
      ` : `
        <div class="card-gui-placeholder">
          <div class="gui-window-bar">
            <span class="gui-dot dot-red"></span>
            <span class="gui-dot dot-yellow"></span>
            <span class="gui-dot dot-green"></span>
            <span class="gui-window-title">${project.title} - GUI</span>
          </div>
          <div class="gui-preview-inner">
            <div class="gui-mock-sidebar">
              <span class="mock-line"></span>
              <span class="mock-line short"></span>
              <span class="mock-line"></span>
            </div>
            <div class="gui-mock-main">
              <div class="mock-stat-box">
                <span class="mock-box-title">Client: Connected</span>
                <span class="mock-box-val">Active</span>
              </div>
              <div class="mock-code-box">
                <code>> LoL Client dinleniyor...</code>
                <code>> Otokabul: AÇIK | Otoban: AÇIK</code>
              </div>
            </div>
          </div>
        </div>
      `;

      const featuresHtml = project.features && project.features.length ? `
        <div class="project-features-box">
          <span class="features-heading">⚡ Ne İşe Yarar?</span>
          <ul class="features-list">
            ${project.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      ` : '';

      const tagsHtml = project.tags && project.tags.length ? `
        <div class="project-tags">
          ${project.tags.map(t => `<span class="p-tag">#${t}</span>`).join('')}
        </div>
      ` : '';

      return `
        <article class="project-card" data-id="${project.id}">
          
          <!-- GUI Ekran Görüntüsü / Mockup -->
          ${screenshotHtml}

          <!-- Kart İçeriği -->
          <div class="card-details">
            
            <div class="card-top-row">
              <div>
                <span class="card-category">${project.category}</span>
                <h2 class="card-title">${project.title}</h2>
              </div>
              <span class="card-version">${project.version}</span>
            </div>

            <p class="card-description">${project.description}</p>

            ${featuresHtml}
            ${tagsHtml}

            <!-- İndirme & Aksiyon Butonları -->
            <div class="card-actions-strip">
              
              <!-- Tek Tıkla GitHub Raw İndirme -->
              <button class="btn-download" data-raw="${project.rawDownloadUrl}" data-filename="${project.downloadFilename}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                <span>Tek Tıkla İndir (.exe)</span>
              </button>

              <!-- GitHub Repo -->
              <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary" title="GitHub Deposu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                <span>GitHub</span>
              </a>

              <!-- Raw Link Kopyala -->
              <button class="btn-icon-copy" data-copy="${project.rawDownloadUrl}" title="GitHub Raw İndirme Linkini Kopyala">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              </button>

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
      if (dlBtn) {
        const rawUrl = dlBtn.dataset.raw;
        const filename = dlBtn.dataset.filename || 'download.exe';
        this.triggerRawDownload(rawUrl, filename);
        return;
      }

      // 2. Raw Link Kopyala
      const copyBtn = e.target.closest('.btn-icon-copy');
      if (copyBtn) {
        const rawUrl = copyBtn.dataset.copy;
        this.copyToClipboard(rawUrl, '🔗 GitHub Raw indirme linki kopyalandı!');
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

  // GitHub Raw Dosyasını Tek Tıkla İndirme
  async triggerRawDownload(rawUrl, filename) {
    this.showToast(`⬇️ ${filename} indiriliyor...`);

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

      this.showToast(`✅ ${filename} başarıyla indirildi!`);
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
      this.showToast(`✅ ${filename} indirme başlatıldı!`);
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
