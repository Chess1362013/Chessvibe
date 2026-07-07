/**
 * ============================================
 * CHESSVIBE GLOBAL STATE MANAGER
 * Strict global state management layer
 * Persistent across tab switches
 * ============================================
 */

class GameStateManager {
  constructor() {
    this.initializeState();
  }

  initializeState() {
    // Retrieve from localStorage or create new
    const savedState = localStorage.getItem('chessvibeState');
    
    if (savedState) {
      this.state = JSON.parse(savedState);
    } else {
      this.state = this.getDefaultState();
    }
  }

  getDefaultState() {
    return {
      // AUTHENTICATION
      isAuthenticated: false,
      currentUser: null,

      // PLAYER PROFILE
      profile: {
        username: 'Chess Player',
        email: '',
        bio: 'Welcome to ChessVibe',
        avatar: 'C',
        joinDate: new Date().toISOString(),
      },

      // RATINGS & RANKINGS
      ratings: {
        currentElo: 1200,
        ratingHistory: [1200],
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winStreak: 0,
        maxWinStreak: 0,
        lossStreak: 0,
        maxLossStreak: 0,
        drawStreak: 0,
      },

      // TITLE SYSTEM
      titles: {
        currentTitle: 'Unranked',
        unlockedTitles: [],
        eloThresholds: {
          'ST': 600,    // Sharp Tactician
          'BM': 1200,   // Board Master
          'CM': 1800,   // Candidate Master
          'GM': 2200,   // Grandmaster-In-Training
        }
      },

      // VIBE TOKENS & CURRENCY
      wallet: {
        vibeTokens: 0,
        accountLevel: 1,
        accountXP: 0,
        xpPerLevel: 1000,
      },

      // BATTLE PASS
      battlePass: {
        currentTier: 1,
        maxTier: 50,
        tierXP: 0,
        tierXPRequired: 500,
        rewards: ['Bronze Border'],
        dailyObjectives: [],
        completedToday: 0,
      },

      // GAMEPLAY SETTINGS
      gameSettings: {
        premoveEnabled: true,
        soundEnabled: true,
        dragSpeed: 2, // 1=Instant, 2=Smooth, 3=Cinematic
        boardTheme: 'classic',
        pieceStyle: 'neo-classic',
      },

      // MATCHING PREFERENCES
      matchingPrefs: {
        minRatingDiff: -50,
        maxRatingDiff: 50,
        strictConnection: false,
        colorPreference: 'random', // 'white', 'black', 'random'
      },

      // TIME CONTROL
      timeControl: {
        lastPreset: '5-3',
        baseMinutes: 5,
        incrementSeconds: 3,
      },

      // CARD COLLECTION
      cards: {
        collection: [],
        totalPulls: 0,
        activeChemistry: null,
      },

      // GAME HISTORY
      gameHistory: [],

      // PUZZLE STATS
      puzzleStats: {
        solvedPuzzles: 0,
        currentStreak: 0,
        maxStreak: 0,
        puzzleEloChange: 0,
      },

      // RUSH STATS
      rushStats: {
        bestScore: 0,
        lastScore: 0,
        totalAttempts: 0,
      },

      // SECURITY
      security: {
        twoFactorEnabled: false,
        emailVerified: false,
        usernameChangesLeft: 2,
        lastPasswordChange: null,
      },

      // LANGUAGE
      language: 'en',

      // SESSION TRACKING
      sessionCounter: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  // SAVE STATE TO LOCALSTORAGE
  saveState() {
    this.state.lastUpdated = new Date().toISOString();
    localStorage.setItem('chessvibeState', JSON.stringify(this.state));
    this.notifyListeners();
  }

  // GET STATE
  getState() {
    return this.state;
  }

  // UPDATE PROFILE
  updateProfile(updates) {
    this.state.profile = { ...this.state.profile, ...updates };
    this.saveState();
  }

  // UPDATE RATINGS
  updateRatings(updates) {
    this.state.ratings = { ...this.state.ratings, ...updates };
    this.checkTitleUnlock();
    this.saveState();
  }

  // CHECK & UNLOCK TITLES BASED ON ELO
  checkTitleUnlock() {
    const currentElo = this.state.ratings.currentElo;
    const thresholds = this.state.titles.eloThresholds;

    for (const [titleCode, threshold] of Object.entries(thresholds)) {
      if (currentElo >= threshold && !this.state.titles.unlockedTitles.includes(titleCode)) {
        this.state.titles.unlockedTitles.push(titleCode);
        // Set the highest unlocked title
        const titleNames = {
          'ST': '[ST] Sharp Tactician',
          'BM': '[BM] Board Master',
          'CM': '[CM] Candidate Master',
          'GM': '[GM] Grandmaster-In-Training'
        };
        this.state.titles.currentTitle = titleNames[titleCode];
      }
    }
  }

  // ADD GAME TO HISTORY
  addGameToHistory(gameData) {
    this.state.gameHistory.unshift({
      id: Date.now(),
      date: new Date().toISOString(),
      opponent: gameData.opponent || 'Anonymous',
      result: gameData.result, // 'win', 'loss', 'draw'
      resultType: gameData.resultType, // 'resignation', 'timeout', 'checkmate', etc
      timeFormat: gameData.timeFormat || 'Blitz 3+2',
      variant: gameData.variant || 'Standard',
      ratingDelta: gameData.ratingDelta || 0,
    });

    // Keep only last 100 games
    if (this.state.gameHistory.length > 100) {
      this.state.gameHistory.pop();
    }

    this.saveState();
  }

  // UPDATE WALLET
  updateWallet(updates) {
    this.state.wallet = { ...this.state.wallet, ...updates };
    this.saveState();
  }

  // ADD VIBE TOKENS
  addVibeTokens(amount) {
    this.state.wallet.vibeTokens += amount;
    this.saveState();
  }

  // DEDUCT VIBE TOKENS
  deductVibeTokens(amount) {
    if (this.state.wallet.vibeTokens >= amount) {
      this.state.wallet.vibeTokens -= amount;
      this.saveState();
      return true;
    }
    return false;
  }

  // UPDATE BATTLE PASS
  updateBattlePass(updates) {
    this.state.battlePass = { ...this.state.battlePass, ...updates };
    this.saveState();
  }

  // ADD CARD TO COLLECTION
  addCard(card) {
    this.state.cards.collection.push({
      id: `card-${Date.now()}`,
      ...card,
      acquiredDate: new Date().toISOString(),
    });
    this.state.cards.totalPulls++;
    this.saveState();
  }

  // SET ACTIVE CHEMISTRY
  setActiveChemistry(card) {
    this.state.cards.activeChemistry = card;
    this.saveState();
  }

  // UPDATE GAME SETTINGS
  updateGameSettings(updates) {
    this.state.gameSettings = { ...this.state.gameSettings, ...updates };
    this.saveState();
  }

  // UPDATE MATCHING PREFERENCES
  updateMatchingPrefs(updates) {
    this.state.matchingPrefs = { ...this.state.matchingPrefs, ...updates };
    this.saveState();
  }

  // UPDATE TIME CONTROL
  updateTimeControl(updates) {
    this.state.timeControl = { ...this.state.timeControl, ...updates };
    this.saveState();
  }

  // UPDATE PUZZLE STATS
  solvePuzzle(correct, eloReward) {
    if (correct) {
      this.state.puzzleStats.solvedPuzzles++;
      this.state.puzzleStats.currentStreak++;
      if (this.state.puzzleStats.currentStreak > this.state.puzzleStats.maxStreak) {
        this.state.puzzleStats.maxStreak = this.state.puzzleStats.currentStreak;
      }
      this.state.puzzleStats.puzzleEloChange += eloReward;
      this.state.ratings.currentElo += eloReward;
    } else {
      this.state.puzzleStats.currentStreak = 0;
    }
    this.checkTitleUnlock();
    this.saveState();
  }

  // SET LANGUAGE
  setLanguage(lang) {
    this.state.language = lang;
    this.saveState();
  }

  // AUTHENTICATE USER
  authenticate(user) {
    this.state.isAuthenticated = true;
    this.state.currentUser = user;
    this.saveState();
  }

  // LOGOUT
  logout() {
    this.state.isAuthenticated = false;
    this.state.currentUser = null;
    this.saveState();
  }

  // LISTENERS FOR STATE CHANGES
  listeners = [];

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // EXPORT STATE (for debugging)
  exportState() {
    return JSON.stringify(this.state, null, 2);
  }

  // CLEAR ALL DATA
  clearAll() {
    localStorage.removeItem('chessvibeState');
    this.state = this.getDefaultState();
    this.saveState();
  }
}

// GLOBAL INSTANCE
const gameState = new GameStateManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = gameState;
}
