/**
 * Guns.lol Style Bio-Link Hub for fadimrak.xyz
 * Discord ID: 1263876356534702247
 * Real-time Discord Profile + Animated Avatar & Banner + Official Discord Badges
 */

const DISCORD_USER_ID = "1263876356534702247";

const PROFILE_DATA = {
  defaultUsername: "fadimrak",
  defaultHandle: "@fadimrak",
  discordUrl: `https://discord.com/users/${DISCORD_USER_ID}`,
  links: [
    {
      id: "github",
      title: "GitHub",
      url: "https://github.com/fadimrak",
      icon: "github"
    },
    {
      id: "steam",
      title: "Steam",
      url: "https://steamcommunity.com/profiles/76561199077362131/",
      icon: "steam"
    },
    {
      id: "roblox",
      title: "Roblox",
      url: "https://www.roblox.com/users/3366921991/profile",
      icon: "roblox"
    },
    {
      id: "mal",
      title: "MyAnimeList",
      url: "https://myanimelist.net/profile/fadimrak",
      icon: "mal"
    }
  ]
};

// Official Icons Registry
const SVG_ICONS = {
  github: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,

  steam: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 14.819C1.775 20.042 6.549 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zM7.544 14.852l-.565-.234c-.451.691-1.229 1.144-2.112 1.144-.122 0-.24-.01-.357-.027l2.257.933c.435-.443.712-1.038.777-1.816zm8.4-9.358c-1.884 0-3.414 1.53-3.414 3.416 0 1.884 1.53 3.414 3.414 3.414 1.885 0 3.416-1.53 3.416-3.414 0-1.886-1.531-3.416-3.416-3.416zm0 1.111c1.272 0 2.305 1.033 2.305 2.305s-1.033 2.305-2.305 2.305-2.305-1.033-2.305-2.305 1.033-2.305 2.305-2.305zm-7.488 9.537c-.779 0-1.411.633-1.411 1.411 0 .78.632 1.414 1.411 1.414.78 0 1.414-.634 1.414-1.414 0-.778-.634-1.411-1.414-1.411z"/></svg>`,

  roblox: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5.166 0L0 18.834 18.834 24 24 5.166 5.166 0zm9.467 14.127l-4.733-1.29 1.29-4.733 4.733 1.29-1.29 4.733z"/></svg>`,

  mal: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.341 0H4.659A4.659 4.659 0 0 0 0 4.659v14.682A4.659 4.659 0 0 0 4.659 24h14.682A4.659 4.659 0 0 0 24 19.341V4.659A4.659 4.659 0 0 0 19.341 0zM8.9 14.86h-1.61v-3.79l-1.07 1.83h-.51l-1.07-1.83v3.79H3V9.14h1.56l1.24 2.12 1.24-2.12H8.9v5.72zm5.77 0h-1.61l-.32-1.35h-1.25l-.32 1.35H9.52l1.62-5.72h1.86l1.67 5.72zm4.82 0h-3.41V9.14h1.56v4.32h1.85v1.4zm-6.28-2.67l-.42-1.85-.42 1.85h.84z"/></svg>`,

  discord: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,

  // Official Discord Nitro Badge
  nitroBadge: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19.78 3.01L14.77 11.7l3.66 1.57-7.46 7.72 1.4-6.49-3.57-1.57 10.98-9.92z" fill="url(#nitroGrad)"/><defs><linearGradient id="nitroGrad" x1="4.5" y1="2" x2="20" y2="21" gradientUnits="userSpaceOnUse"><stop stop-color="#F47B67"/><stop offset="0.5" stop-color="#EC428F"/><stop offset="1" stop-color="#8448FB"/></linearGradient></defs></svg>`,

  // Official HypeSquad Brilliance Badge (Coral / Red-Orange)
  hypesquadBrilliance: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M12 1L2 7.2v9.6L12 23l10-6.2V7.2L12 1z" fill="#F47B67"/><path d="M12 4.3L19.2 8 12 12.5 4.8 8 12 4.3z" fill="#FF9F89"/><path d="M12 12.5l7.2-4.5v4.3L12 16.8l-7.2-4.5V8l7.2 4.5z" fill="#E85D45"/><path d="M12 16.8l7.2-4.5v2.8L12 20.8l-7.2-5.7v-2.8l7.2 4.5z" fill="#D4422A"/></svg>`,

  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`
};

class App {
  constructor() {
    this.init();
  }

  init() {
    this.initTopography();
    this.renderInitialProfile();
    this.renderButtons();
    this.fetchDiscordProfile();
    this.initRealVisitorCounter();
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

  renderInitialProfile() {
    document.getElementById('profile-name').textContent = PROFILE_DATA.defaultUsername;
    document.getElementById('profile-handle').textContent = PROFILE_DATA.defaultHandle;
  }

  // Fetch live Discord user data (Animated avatar, banner, badges)
  async fetchDiscordProfile() {
    try {
      const res = await fetch(`https://japi.rest/discord/v1/user/${DISCORD_USER_ID}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const user = json.data;
          this.applyDiscordData(user);
          return;
        }
      }
    } catch (e) {
      console.log('Discord JAPI fetch error, trying direct avatar fallback', e);
    }

    // Fallback: Default avatar
    const avatarEl = document.getElementById('profile-avatar');
    if (avatarEl) {
      avatarEl.innerHTML = `
        <img src="https://cdn.discordapp.com/embed/avatars/5.png" alt="Discord Avatar" class="avatar-img">
        <span class="discord-status-dot status-online"></span>
      `;
    }
  }

  applyDiscordData(user) {
    // 1. Avatar
    const avatarEl = document.getElementById('profile-avatar');
    const avatarUrl = user.avatarURL || `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    if (avatarEl && avatarUrl) {
      avatarEl.innerHTML = `
        <img src="${avatarUrl}" alt="${user.username}" class="avatar-img">
        <span class="discord-status-dot status-online" title="Online"></span>
      `;
    }

    // 2. Banner
    const bannerEl = document.getElementById('profile-banner');
    if (bannerEl && user.bannerURL) {
      bannerEl.style.backgroundImage = `url('${user.bannerURL}')`;
      bannerEl.classList.add('has-banner');
    }

    // 3. Username
    const nameEl = document.getElementById('profile-name');
    const handleEl = document.getElementById('profile-handle');
    if (nameEl) nameEl.textContent = user.global_name || user.username || PROFILE_DATA.defaultUsername;
    if (handleEl) handleEl.textContent = `@${user.username || PROFILE_DATA.defaultUsername}`;

    // 4. Official Discord Badges
    const badgeContainer = document.getElementById('discord-badges');
    if (badgeContainer) {
      badgeContainer.innerHTML = `
        <div class="discord-badge-pill" title="Discord Nitro">
          ${SVG_ICONS.nitroBadge}
        </div>
        <div class="discord-badge-pill" title="HypeSquad Brilliance">
          ${SVG_ICONS.hypesquadBrilliance}
        </div>
        <a href="${PROFILE_DATA.discordUrl}" target="_blank" rel="noopener noreferrer" class="discord-tag-pill" title="Discord Profilini Aç">
          ${SVG_ICONS.discord}
          <span>${user.username}</span>
        </a>
      `;
    }
  }

  // Render Guns.lol Style Buttons
  renderButtons() {
    const container = document.getElementById('links-list');
    if (!container) return;

    container.innerHTML = PROFILE_DATA.links.map(link => `
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" 
         class="gunslol-btn">
        <div class="btn-content-left">
          <div class="btn-icon">
            ${SVG_ICONS[link.icon] || SVG_ICONS.github}
          </div>
          <span class="btn-title">${link.title}</span>
        </div>
        <div class="btn-arrow">
          ${SVG_ICONS.arrow}
        </div>
      </a>
    `).join('');
  }

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
