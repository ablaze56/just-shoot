// Adaptive AI System - Bots get smarter based on player performance
class AdaptiveAI {
    constructor() {
        this.gameStats = {
            playerKills: 0,
            playerDeaths: 0,
            playerAccuracy: 0,
            playerSurvivalTime: 0,
            playerDamageDealt: 0,
            playerDamageTaken: 0,
            gameStartTime: Date.now()
        };
        
        this.currentDifficulty = {
            reactionTime: 1500,      // How fast bots react (slower)
            accuracy: 0.2,           // How accurate bots are (less accurate)
            movementSpeed: 0.8,      // How fast bots move (slower)
            aggression: 0.3,         // How aggressive bots are (less aggressive)
            intelligence: 0.2,       // How smart bots are (less smart)
            health: 40,              // Bot health (less health)
            damage: 20               // Bot damage (less damage)
        };
        
        this.adaptationRate = 0.1; // How quickly AI adapts
    }
    
    // Update AI difficulty based on current game performance
    updateDifficulty() {
        const currentTime = Date.now();
        const survivalTime = (currentTime - this.gameStats.gameStartTime) / 1000;
        
        // Calculate performance metrics
        const killDeathRatio = this.gameStats.playerKills / Math.max(1, this.gameStats.playerDeaths);
        const damageRatio = this.gameStats.playerDamageDealt / Math.max(1, this.gameStats.playerDamageTaken);
        const survivalScore = Math.min(survivalTime / 60, 1); // Max at 1 minute
        
        // If player is doing well, make bots harder
        if (killDeathRatio > 2 && damageRatio > 1.5 && survivalScore > 0.3) {
            this.increaseDifficulty();
        }
        // If player is struggling, make bots easier
        else if (killDeathRatio < 0.5 || damageRatio < 0.5) {
            this.decreaseDifficulty();
        }
        
        // Gradually increase difficulty over time
        this.gradualIncrease();
    }
    
    increaseDifficulty() {
        // Make bots react faster
        this.currentDifficulty.reactionTime = Math.max(100, 
            this.currentDifficulty.reactionTime - (this.adaptationRate * 100));
        
        // Make bots more accurate
        this.currentDifficulty.accuracy = Math.min(0.95, 
            this.currentDifficulty.accuracy + (this.adaptationRate * 0.1));
        
        // Make bots move faster
        this.currentDifficulty.movementSpeed = Math.min(3, 
            this.currentDifficulty.movementSpeed + (this.adaptationRate * 0.2));
        
        // Make bots more aggressive
        this.currentDifficulty.aggression = Math.min(1.0, 
            this.currentDifficulty.aggression + (this.adaptationRate * 0.1));
        
        // Make bots smarter
        this.currentDifficulty.intelligence = Math.min(1.0, 
            this.currentDifficulty.intelligence + (this.adaptationRate * 0.1));
        
        // Give bots more health
        this.currentDifficulty.health = Math.min(100, 
            this.currentDifficulty.health + (this.adaptationRate * 5));
        
        // Give bots more damage
        this.currentDifficulty.damage = Math.min(50, 
            this.currentDifficulty.damage + (this.adaptationRate * 2));
    }
    
    decreaseDifficulty() {
        // Make bots react slower
        this.currentDifficulty.reactionTime = Math.min(2000, 
            this.currentDifficulty.reactionTime + (this.adaptationRate * 200));
        
        // Make bots less accurate
        this.currentDifficulty.accuracy = Math.max(0.1, 
            this.currentDifficulty.accuracy - (this.adaptationRate * 0.1));
        
        // Make bots move slower
        this.currentDifficulty.movementSpeed = Math.max(0.5, 
            this.currentDifficulty.movementSpeed - (this.adaptationRate * 0.2));
        
        // Make bots less aggressive
        this.currentDifficulty.aggression = Math.max(0.1, 
            this.currentDifficulty.aggression - (this.adaptationRate * 0.1));
        
        // Make bots less smart
        this.currentDifficulty.intelligence = Math.max(0.1, 
            this.currentDifficulty.intelligence - (this.adaptationRate * 0.1));
        
        // Give bots less health
        this.currentDifficulty.health = Math.max(25, 
            this.currentDifficulty.health - (this.adaptationRate * 5));
        
        // Give bots less damage
        this.currentDifficulty.damage = Math.max(15, 
            this.currentDifficulty.damage - (this.adaptationRate * 2));
    }
    
    gradualIncrease() {
        // Gradually increase difficulty over time regardless of performance
        const timeElapsed = (Date.now() - this.gameStats.gameStartTime) / 1000;
        const timeFactor = Math.min(timeElapsed / 300, 1); // Max increase after 5 minutes
        
        this.currentDifficulty.reactionTime *= (1 - timeFactor * 0.1);
        this.currentDifficulty.accuracy += timeFactor * 0.05;
        this.currentDifficulty.movementSpeed += timeFactor * 0.1;
        this.currentDifficulty.aggression += timeFactor * 0.05;
        this.currentDifficulty.intelligence += timeFactor * 0.05;
    }
    
    // Record player actions for AI learning
    recordPlayerKill() {
        this.gameStats.playerKills++;
        this.updateDifficulty();
    }
    
    recordPlayerDeath() {
        this.gameStats.playerDeaths++;
        this.updateDifficulty();
    }
    
    recordPlayerDamage(damage) {
        this.gameStats.playerDamageDealt += damage;
    }
    
    recordPlayerTookDamage(damage) {
        this.gameStats.playerDamageTaken += damage;
    }
    
    recordPlayerShot(accuracy) {
        this.gameStats.playerAccuracy = (this.gameStats.playerAccuracy + accuracy) / 2;
    }
    
    // Get current AI settings for bot creation
    getCurrentAISettings() {
        return { ...this.currentDifficulty };
    }
    
    // Reset for new game
    reset() {
        this.gameStats = {
            playerKills: 0,
            playerDeaths: 0,
            playerAccuracy: 0,
            playerSurvivalTime: 0,
            playerDamageDealt: 0,
            playerDamageTaken: 0,
            gameStartTime: Date.now()
        };
        
        // Start with slightly harder difficulty than last game
        this.currentDifficulty.reactionTime = Math.max(100, this.currentDifficulty.reactionTime - 50);
        this.currentDifficulty.accuracy = Math.min(0.95, this.currentDifficulty.accuracy + 0.05);
        this.currentDifficulty.movementSpeed = Math.min(3, this.currentDifficulty.movementSpeed + 0.1);
    }
    
    // Get difficulty level name for display
    getDifficultyLevel() {
        const avgDifficulty = (
            (1 - this.currentDifficulty.reactionTime / 2000) +
            this.currentDifficulty.accuracy +
            (this.currentDifficulty.movementSpeed / 3) +
            this.currentDifficulty.aggression +
            this.currentDifficulty.intelligence
        ) / 5;
        
        if (avgDifficulty < 0.3) return "EASY";
        if (avgDifficulty < 0.5) return "MEDIUM";
        if (avgDifficulty < 0.7) return "HARD";
        if (avgDifficulty < 0.9) return "EXPERT";
        return "NIGHTMARE";
    }
}

// Global adaptive AI instance
const adaptiveAI = new AdaptiveAI();
