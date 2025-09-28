// Game Configuration
const CONFIG = {
    // Canvas settings
    CANVAS: {
        DEFAULT_WIDTH: 1200,
        DEFAULT_HEIGHT: 800,
        MIN_RENDER_DISTANCE: 400
    },
    
    // Game settings
    GAME: {
        FPS: 60,
        WAVE_ENEMIES_BASE: 10,
        WAVE_ENEMIES_INCREMENT: 5,
        ENEMY_SPAWN_RATE_BASE: 2000,
        ENEMY_SPAWN_RATE_DECREASE: 100,
        MIN_SPAWN_RATE: 500
    },
    
    // Player settings
    PLAYER: {
        SPEED: 3,
        HEALTH: 100,
        SIZE: 20
    },
    
    // AI Difficulty levels
    AI_DIFFICULTY: {
        EASY: {
            reactionTime: 1000,
            accuracy: 0.3,
            movementSpeed: 1,
            aggression: 0.5,
            intelligence: 0.3
        },
        MEDIUM: {
            reactionTime: 600,
            accuracy: 0.6,
            movementSpeed: 1.5,
            aggression: 0.7,
            intelligence: 0.6
        },
        HARD: {
            reactionTime: 300,
            accuracy: 0.8,
            movementSpeed: 2,
            aggression: 0.9,
            intelligence: 0.8
        },
        EXPERT: {
            reactionTime: 150,
            accuracy: 0.95,
            movementSpeed: 2.5,
            aggression: 1.0,
            intelligence: 1.0
        }
    }
};

// Persistent game data
const GAME_DATA = {
    gamesPlayed: 0,
    totalKills: 0,
    totalDeaths: 0,
    bestScore: 0,
    currentDifficulty: 'EASY',
    playerStats: {
        accuracy: 0.5,
        averageReactionTime: 500,
        preferredWeapons: {},
        movementPatterns: []
    }
};

// Load game data from localStorage
function loadGameData() {
    const saved = localStorage.getItem('battleRoyaleData');
    if (saved) {
        Object.assign(GAME_DATA, JSON.parse(saved));
    }
}

// Save game data to localStorage
function saveGameData() {
    localStorage.setItem('battleRoyaleData', JSON.stringify(GAME_DATA));
}

// Calculate current AI difficulty based on player performance
function calculateAIDifficulty() {
    const gamesPlayed = GAME_DATA.gamesPlayed;
    const killDeathRatio = GAME_DATA.totalKills / Math.max(1, GAME_DATA.totalDeaths);
    const bestScore = GAME_DATA.bestScore;
    
    if (gamesPlayed < 3) return 'EASY';
    if (killDeathRatio > 5 && bestScore > 500) return 'EXPERT';
    if (killDeathRatio > 3 && bestScore > 300) return 'HARD';
    if (killDeathRatio > 1.5 && bestScore > 150) return 'MEDIUM';
    return 'EASY';
}

// Initialize game data
loadGameData();
