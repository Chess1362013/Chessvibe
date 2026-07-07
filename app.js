/**
 * ============================================
 * CHESSVIBE - MAIN APPLICATION
 * Enterprise Chess Gaming Platform
 * ============================================
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', initializeApp);

let ratingChart;
let accuracyChart;
let resultsChart;
let openingsChart;

function initializeApp() {
  console.log('🚀 Initializing ChessVibe...');
  
  // Setup event listeners
  setupAuthenticationListeners();
  setupNavigationListeners();
  setupTimeControlListeners();
  setupSettingsListeners();
  setupPackShopListeners();
  setupStateSync();

  // Initialize UI
  updateAllUI();
  checkAuthenticationStatus();

  console.log('✅ ChessVibe Initialized Successfully');
}

// ============================================
// AUTHENTICATION
// ============================================

function setupAuthenticationListeners() {
  const loginToggle = document.getElementById('loginToggle');
  const signupToggle = document.getElementById('signupToggle');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginToggle) {
    loginToggle.addEventListener('click', () => {
      loginToggle.classList.add('active');
      signupToggle.classList.remove('active');
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
    });
  }

  if (signupToggle) {
    signupToggle.addEventListener('click', () => {
      signupToggle.classList.add('active');
      loginToggle.classList.remove('active');
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      // Mock authentication
      gameState.authenticate({
        email: email,
        username: email.split('@')[0],
      });

      showCalibrationPage();
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('signupUsername').value;
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;

      gameState.updateProfile({
        username: username,
        email: email,
        avatar: username.charAt(0).toUpperCase(),
      });

      gameState.authenticate({
        email: email,
        username: username,
      });

      showCalibrationPage();
    });
  }
}

function checkAuthenticationStatus() {
  if (!gameState.state.isAuthenticated) {
    showPage('auth');
  } else {
    showPage('arena');
  }
}

// ============================================
// CALIBRATION & BRACKET SELECTION
// ============================================

function showCalibrationPage() {
  showPage('calibration');
  setupBracketListeners();
}

function setupBracketListeners() {
  const brackets = document.querySelectorAll('.bracket-card');
  
  brackets.forEach(bracket => {
    const button = bracket.querySelector('.bracket-select-btn');
    if (button) {
      button.addEventListener('click', () => {
        const bracketType = bracket.dataset.bracket;
        selectBracket(bracketType);
      });
    }
  });
}

function selectBracket(bracketType) {
  const eloMap = {
    'beginner': 400,
    'intermediate': 800,
    'advanced': 1200,
    'pro': 1600,
  };

  const elo = eloMap[bracketType];
  gameState.updateRatings({
    currentElo: elo,
    ratingHistory: [elo],
  });

  // Give starter tokens
  gameState.addVibeTokens(500);

  showPage('arena');
  updateAllUI();
}

// ============================================
// NAVIGATION
// ============================================

function setupNavigationListeners() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const pageId = item.dataset.page;
      
      // Update active state
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Show page
      showPage(pageId);
      updateAllUI();
    });
  });
}

function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));

  const targetPage = document.querySelector(`[data-page-id="${pageId}"]`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

// ============================================
// TIME CONTROL & PLAY MATCH
// ============================================

function setupTimeControlListeners() {
  const presetButtons = document.querySelectorAll('.preset-btn');
  const baseMinutesInput = document.getElementById('baseMinutes');
  const incrementSecondsInput = document.getElementById('incrementSeconds');
  const ratingMinInput = document.getElementById('ratingMin');
  const ratingMaxInput = document.getElementById('ratingMax');

  // Preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset.split('-');
      const base = parseInt(preset[0]);
      const increment = parseInt(preset[1]);

      baseMinutesInput.value = base;
      incrementSecondsInput.value = increment;

      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      updateTimeDisplay();
      gameState.updateTimeControl({
        lastPreset: btn.dataset.preset,
        baseMinutes: base,
        incrementSeconds: increment,
      });
    });
  });

  // Custom inputs
  if (baseMinutesInput) {
    baseMinutesInput.addEventListener('change', updateTimeDisplay);
  }
  if (incrementSecondsInput) {
    incrementSecondsInput.addEventListener('change', updateTimeDisplay);
  }

  // Rating range sliders
  if (ratingMinInput) {
    ratingMinInput.addEventListener('input', () => {
      const minDisplay = document.getElementById('minDisplay');
      if (minDisplay) minDisplay.textContent = ratingMinInput.value;
      gameState.updateMatchingPrefs({ minRatingDiff: parseInt(ratingMinInput.value) });
    });
  }

  if (ratingMaxInput) {
    ratingMaxInput.addEventListener('input', () => {
      const maxDisplay = document.getElementById('maxDisplay');
      if (maxDisplay) maxDisplay.textContent = ratingMaxInput.value;
      gameState.updateMatchingPrefs({ maxRatingDiff: parseInt(ratingMaxInput.value) });
    });
  }

  console.log('✅ Time control listeners setup');
}

function updateTimeDisplay() {
  const baseMinutesInput = document.getElementById('baseMinutes');
  const incrementSecondsInput = document.getElementById('incrementSeconds');
  
  if (!baseMinutesInput || !incrementSecondsInput) return;

  const base = parseInt(baseMinutesInput.value);
  const increment = parseInt(incrementSecondsInput.value);

  const minutes = String(base).padStart(2, '0');
  const seconds = '00';

  const customBaseDisplay = document.getElementById('customBaseDisplay');
  const customIncrementDisplay = document.getElementById('customIncrementDisplay');
  const opponentBaseDisplay = document.getElementById('opponentBaseDisplay');
  const opponentIncrementDisplay = document.getElementById('opponentIncrementDisplay');

  if (customBaseDisplay) customBaseDisplay.textContent = `${minutes}:${seconds}`;
  if (customIncrementDisplay) customIncrementDisplay.textContent = increment;
  if (opponentBaseDisplay) opponentBaseDisplay.textContent = `${minutes}:${seconds}`;
  if (opponentIncrementDisplay) opponentIncrementDisplay.textContent = increment;

  gameState.updateTimeControl({
    baseMinutes: base,
    incrementSeconds: increment,
  });
}

// ============================================
// PACK SHOP
// ============================================

function setupPackShopListeners() {
  const openPackButtons = document.querySelectorAll('.open-pack-btn');

  openPackButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const packType = btn.dataset.packType;
      openPack(packType);
    });
  });
}

function openPack(packType) {
  const costs = {
    'bronze': 50,
    'silver': 100,
    'gold': 250,
  };

  const cost = costs[packType];

  if (gameState.deductVibeTokens(cost)) {
    showCardFlipAnimation();
    generatePackCards(packType);
  } else {
    alert('❌ Not enough Vibe Tokens! You need ' + cost + ' tokens.');
  }
}

function generatePackCards(packType) {
  const grandmasters = [
    { name: 'Gukesh 2026', ovr: 96, tct: 95, end: 93, opn: 97, blz: 94 },
    { name: 'Magnus Overlord', ovr: 98, tct: 98, end: 97, opn: 96, blz: 99 },
    { name: 'Pragg Elite', ovr: 92, tct: 91, end: 90, opn: 93, blz: 89 },
    { name: 'Alireza Rising', ovr: 90, tct: 89, end: 88, opn: 91, blz: 92 },
    { name: 'Arjun Prodigy', ovr: 85, tct: 84, end: 83, opn: 86, blz: 85 },
  ];

  const cardCounts = {
    'bronze': 3,
    'silver': 4,
    'gold': 5,
  };

  const cardCount = cardCounts[packType];

  setTimeout(() => {
    for (let i = 0; i < cardCount; i++) {
      const card = grandmasters[Math.floor(Math.random() * grandmasters.length)];
      gameState.addCard({
        ...card,
        rarity: packType,
      });
    }

    hideCardFlipAnimation();
    displayCardCollection();
    updateAllUI();
  }, 2000);
}

function showCardFlipAnimation() {
  const container = document.getElementById('cardFlipContainer');
  if (container) container.style.display = 'flex';
}

function hideCardFlipAnimation() {
  const container = document.getElementById('cardFlipContainer');
  if (container) container.style.display = 'none';
}

function displayCardCollection() {
  const collection = gameState.state.cards.collection;
  const cardsContainer = document.getElementById('cardsCollection');

  if (!cardsContainer) return;

  if (collection.length === 0) {
    cardsContainer.innerHTML = '<p style="text-align: center; color: #b0acaa;">No cards yet. Open packs to start collecting!</p>';
    return;
  }

  cardsContainer.innerHTML = collection.map(card => `
    <div style="background: linear-gradient(135deg, #${Math.floor(Math.random()*16777215).toString(16)}, #${Math.floor(Math.random()*16777215).toString(16)}); padding: 15px; border-radius: 8px; text-align: center; cursor: pointer; border: 2px solid rgba(129, 182, 76, 0.3);">
      <p style="font-weight: 700; font-size: 16px; color: white;">${card.name}</p>
      <p style="font-size: 12px; margin: 8px 0; color: rgba(255,255,255,0.9);">OVR: ${card.ovr}</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 11px; color: rgba(255,255,255,0.8);">
        <p>TCT: ${card.tct}</p>
        <p>END: ${card.end}</p>
        <p>OPN: ${card.opn}</p>
        <p>BLZ: ${card.blz}</p>
      </div>
    </div>
  `).join('');
}

// ============================================
// SETTINGS
// ============================================

function setupSettingsListeners() {
  // Username settings
  const saveUsernameBtn = document.getElementById('saveUsernameBtn');
  const usernameInput = document.getElementById('usernameInput');

  if (saveUsernameBtn) {
    saveUsernameBtn.addEventListener('click', () => {
      const newUsername = usernameInput.value.trim();
      if (newUsername.length > 0) {
        const changesLeft = gameState.state.security.usernameChangesLeft;
        if (changesLeft > 0) {
          gameState.updateProfile({ username: newUsername });
          gameState.state.security.usernameChangesLeft--;
          const changesLeftElem = document.getElementById('changesLeft');
          if (changesLeftElem) changesLeftElem.textContent = changesLeft - 1;
          alert('✅ Username updated!');
          updateAllUI();
        } else {
          alert('❌ No username changes left this week!');
        }
      }
    });
  }

  // Bio settings
  const saveBioBtn = document.getElementById('saveBioBtn');
  const bioTextarea = document.getElementById('bioTextarea');

  if (saveBioBtn) {
    saveBioBtn.addEventListener('click', () => {
      const newBio = bioTextarea.value.trim();
      gameState.updateProfile({ bio: newBio });
      alert('✅ Bio saved!');
      updateAllUI();
    });
  }

  // Gameplay settings
  const premoveToggle = document.getElementById('premoveToggle');
  if (premoveToggle) {
    premoveToggle.addEventListener('change', () => {
      gameState.updateGameSettings({ premoveEnabled: premoveToggle.checked });
    });
  }

  // Board theme
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      themeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gameState.updateGameSettings({ boardTheme: btn.dataset.theme });
    });
  });

  // Anti-Cheat Audit
  const auditBtn = document.getElementById('auditBtn');
  const auditBtnMini = document.getElementById('auditBtnMini');

  if (auditBtn) {
    auditBtn.addEventListener('click', () => {
      const auditResults = document.getElementById('auditResults');
      if (auditResults) {
        auditResults.style.display = auditResults.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  if (auditBtnMini) {
    auditBtnMini.addEventListener('click', () => {
      const miniAuditResults = document.getElementById('miniAuditResults');
      if (miniAuditResults) {
        miniAuditResults.style.display = miniAuditResults.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  // Language selector
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      gameState.setLanguage(e.target.value);
      updateLanguage(e.target.value);
    });
  }

  console.log('✅ Settings listeners setup');
}

function updateLanguage(language) {
  const translations = {
    'en': {
      'Main Arena': 'Main Arena',
      'Play Match': 'Play Match',
      'Pack Shop': 'Pack Shop',
    },
    'hinglish': {
      'Main Arena': 'मुख्य अखाड़ा',
      'Play Match': 'मैच खेलें',
      'Pack Shop': 'पैक की दुकान',
    }
  };

  console.log(`🌍 Language changed to: ${language}`);
}

// ============================================
// STATE SYNCHRONIZATION
// ============================================

function setupStateSync() {
  // Subscribe to state changes
  gameState.subscribe((newState) => {
    updateAllUI();
  });

  // Listen for storage changes (tab sync)
  window.addEventListener('storage', (e) => {
    if (e.key === 'chessvibeState') {
      gameState.initializeState();
      updateAllUI();
    }
  });

  console.log('✅ State synchronization setup');
}

// ============================================
// UI UPDATES
// ============================================

function updateAllUI() {
  updateProfileUI();
  updateRatingsUI();
  updateWalletUI();
  updateChartsUI();
  updateTitleUI();
  updateSettingsUI();
  updateCardCollectionUI();
  updateCoachFeedback();
}

function updateProfileUI() {
  const profile = gameState.state.profile;
  
  const profileUsername = document.getElementById('profileUsername');
  const profileBio = document.getElementById('profileBio');
  const profileAvatar = document.getElementById('profileAvatar');
  const profileTitle = document.getElementById('profileTitle');
  const usernameInput = document.getElementById('usernameInput');
  const bioTextarea = document.getElementById('bioTextarea');

  if (profileUsername) profileUsername.textContent = profile.username;
  if (profileBio) profileBio.textContent = profile.bio;
  if (profileAvatar) profileAvatar.textContent = profile.avatar;
  if (profileTitle) profileTitle.textContent = gameState.state.titles.currentTitle;
  if (usernameInput) usernameInput.placeholder = profile.username;
  if (bioTextarea) bioTextarea.value = profile.bio;
}

function updateRatingsUI() {
  const ratings = gameState.state.ratings;
  const totalGames = ratings.totalGames;
  const winRate = totalGames > 0 ? Math.round((ratings.wins / totalGames) * 100) : 0;

  const liveElo = document.getElementById('liveElo');
  const totalGamesElem = document.getElementById('totalGames');
  const winRateElem = document.getElementById('winRate');
  const levelXpElem = document.getElementById('levelXp');
  const battlePassTierElem = document.getElementById('battlePassTier');
  const winStreakElem = document.getElementById('winStreak');
  const lossStreakElem = document.getElementById('lossStreak');
  const drawStreakElem = document.getElementById('drawStreak');

  if (liveElo) liveElo.textContent = ratings.currentElo;
  if (totalGamesElem) totalGamesElem.textContent = totalGames;
  if (winRateElem) winRateElem.textContent = `${winRate}%`;
  if (levelXpElem) levelXpElem.textContent = gameState.state.wallet.accountXP;
  if (battlePassTierElem) battlePassTierElem.textContent = gameState.state.battlePass.currentTier;
  if (winStreakElem) winStreakElem.textContent = ratings.winStreak;
  if (lossStreakElem) lossStreakElem.textContent = ratings.lossStreak;
  if (drawStreakElem) drawStreakElem.textContent = ratings.drawStreak;
}

function updateTitleUI() {
  const title = gameState.state.titles.currentTitle;
  const titleBadge = document.getElementById('titleBadge');
  if (titleBadge) titleBadge.textContent = title;
}

function updateWalletUI() {
  const wallet = gameState.state.wallet;
  
  const vibeTokens = document.getElementById('vibeTokens');
  const accountLevel = document.getElementById('accountLevel');

  if (vibeTokens) vibeTokens.textContent = wallet.vibeTokens;
  if (accountLevel) accountLevel.textContent = wallet.accountLevel;
}

function updateChartsUI() {
  updateRatingChart();
}

function updateRatingChart() {
  const canvas = document.getElementById('ratingChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const history = gameState.state.ratings.ratingHistory;

  if (ratingChart) {
    ratingChart.destroy();
  }

  try {
    ratingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: history.map((_, i) => `Game ${i + 1}`),
        datasets: [{
          label: 'ELO Rating',
          data: history,
          borderColor: '#81b64c',
          backgroundColor: 'rgba(129, 182, 76, 0.1)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: { color: '#b0acaa' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#b0acaa' },
            grid: { color: 'rgba(129, 182, 76, 0.1)' }
          },
          x: {
            ticks: { color: '#b0acaa' },
            grid: { color: 'rgba(129, 182, 76, 0.1)' }
          }
        }
      }
    });
  } catch (e) {
    console.error('Chart error:', e);
  }
}

function updateSettingsUI() {
  const settings = gameState.state.gameSettings;
  const premoveToggle = document.getElementById('premoveToggle');
  if (premoveToggle) premoveToggle.checked = settings.premoveEnabled;
}

function updateCardCollectionUI() {
  displayCardCollection();
}

function updateCoachFeedback() {
  const state = gameState.state;
  const elo = state.ratings.currentElo;
  const gameCount = state.ratings.totalGames;

  let feedback = '';

  if (gameCount === 0) {
    feedback = '🎯 Welcome to ChessVibe! Play your first match to start improving.';
  } else if (elo < 600) {
    feedback = '📚 Focus on learning basic tactics and openings. Practice puzzles daily!';
  } else if (elo < 1200) {
    feedback = '⚔️ You\'re improving! Work on endgame positions and memorize key openings.';
  } else if (elo < 1800) {
    feedback = '🧠 Great progress! Study your games and analyze where you made mistakes.';
  } else {
    feedback = '👑 Master level strength! Keep challenging yourself with stronger opponents.';
  }

  const coachFeedback = document.getElementById('coachFeedback');
  if (coachFeedback) coachFeedback.textContent = feedback;
}

console.log('✅ ChessVibe App loaded successfully!');
