// Smart Enemy AI Class
class SmartEnemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        
        // Get AI settings from adaptive system
        const aiSettings = adaptiveAI.getCurrentAISettings();
        
        // Apply AI settings
        this.speed = aiSettings.movementSpeed;
        this.health = aiSettings.health;
        this.maxHealth = this.health;
        this.damage = aiSettings.damage;
        this.reactionTime = aiSettings.reactionTime;
        this.accuracy = aiSettings.accuracy;
        this.aggression = aiSettings.aggression;
        this.intelligence = aiSettings.intelligence;
        
        // AI behavior states
        this.state = 'patrol'; // patrol, chase, attack, retreat, flank
        this.lastShot = 0;
        this.shootCooldown = 1000 + Math.random() * 1000;
        this.lastReaction = 0;
        this.targetAngle = 0;
        this.patrolTarget = { x: x, y: y };
        this.coverPosition = null;
        this.flankTarget = null;
        
        // Visual properties
        this.color = '#e74c3c';
        this.angle = 0;
        
        // AI memory
        this.playerLastPosition = { x: 0, y: 0 };
        this.playerVelocity = { x: 0, y: 0 };
        this.memory = [];
    }
    
    update() {
        // Update AI behavior
        this.updateAI();
        
        // Execute current behavior
        switch(this.state) {
            case 'patrol':
                this.patrol();
                break;
            case 'chase':
                this.chase();
                break;
            case 'attack':
                this.attack();
                break;
            case 'retreat':
                this.retreat();
                break;
            case 'flank':
                this.flank();
                break;
        }
        
        // Update shooting
        this.updateShooting();
        
        // Update memory
        this.updateMemory();
    }
    
    updateAI() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate player velocity for prediction
        this.playerVelocity.x = player.x - this.playerLastPosition.x;
        this.playerVelocity.y = player.y - this.playerLastPosition.y;
        this.playerLastPosition = { x: player.x, y: player.y };
        
        // State transitions based on distance and AI intelligence
        if (distance < 50 && this.aggression > 0.7) {
            this.state = 'attack';
        } else if (distance < 150) {
            if (this.intelligence > 0.6 && Math.random() < 0.3) {
                this.state = 'flank';
            } else {
                this.state = 'chase';
            }
        } else if (distance > 200) {
            this.state = 'patrol';
        }
        
        // Retreat if low health and intelligent
        if (this.health < this.maxHealth * 0.3 && this.intelligence > 0.5) {
            this.state = 'retreat';
        }
    }
    
    patrol() {
        // Move towards patrol target
        const dx = this.patrolTarget.x - this.x;
        const dy = this.patrolTarget.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 20) {
            // Choose new patrol target
            this.patrolTarget = {
                x: this.x + (Math.random() - 0.5) * 200,
                y: this.y + (Math.random() - 0.5) * 200
            };
        } else {
            this.moveTowards(this.patrolTarget.x, this.patrolTarget.y);
        }
    }
    
    chase() {
        // Predict player position based on velocity
        const predictedX = player.x + this.playerVelocity.x * 2;
        const predictedY = player.y + this.playerVelocity.y * 2;
        
        this.moveTowards(predictedX, predictedY);
    }
    
    attack() {
        // Move closer to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 30) {
            this.moveTowards(player.x, player.y);
        }
    }
    
    retreat() {
        // Move away from player
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const retreatX = this.x + (dx / distance) * 50;
            const retreatY = this.y + (dy / distance) * 50;
            this.moveTowards(retreatX, retreatY);
        }
    }
    
    flank() {
        // Try to flank the player
        if (!this.flankTarget) {
            // Calculate flank position
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const flankAngle = angle + (Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2);
            const flankDistance = 100;
            
            this.flankTarget = {
                x: player.x + Math.cos(flankAngle) * flankDistance,
                y: player.y + Math.sin(flankAngle) * flankDistance
            };
        }
        
        this.moveTowards(this.flankTarget.x, this.flankTarget.y);
        
        // Check if reached flank position
        const dx = this.flankTarget.x - this.x;
        const dy = this.flankTarget.y - this.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
            this.flankTarget = null;
        }
    }
    
    moveTowards(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
            this.angle = Math.atan2(dy, dx);
        }
    }
    
    updateShooting() {
        const now = Date.now();
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if should shoot based on reaction time and accuracy
        if (now - this.lastReaction > this.reactionTime && 
            now - this.lastShot > this.shootCooldown && 
            distance < 200) {
            
            // Calculate accuracy with AI accuracy factor
            const baseAccuracy = this.accuracy;
            const distancePenalty = Math.max(0, 1 - distance / 200);
            const finalAccuracy = baseAccuracy * distancePenalty;
            
            if (Math.random() < finalAccuracy) {
                this.shoot();
                this.lastShot = now;
            }
            
            this.lastReaction = now;
        }
    }
    
    shoot() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        
        // Add some inaccuracy based on AI accuracy
        const inaccuracy = (1 - this.accuracy) * 0.3;
        const finalAngle = angle + (Math.random() - 0.5) * inaccuracy;
        
        bullets.push(new Bullet(
            this.x + this.width/2,
            this.y + this.height/2,
            Math.cos(finalAngle) * 5,
            Math.sin(finalAngle) * 5,
            'enemy',
            this.damage,
            200,
            5
        ));
    }
    
    takeDamage(damage) {
        this.health -= damage;
        createBloodSplatter(this.x + this.width/2, this.y + this.height/2);
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        score += 10;
        enemiesKilled++;
        adaptiveAI.recordPlayerKill(); // Record kill for AI learning
        createExplosion(this.x + this.width/2, this.y + this.height/2);
        
        // Chance to drop power-up
        if (Math.random() < 0.3) {
            powerUps.push(new PowerUp(this.x + this.width/2, this.y + this.height/2));
        }
    }
    
    updateMemory() {
        // Store recent player positions for pattern recognition
        this.memory.push({
            x: player.x,
            y: player.y,
            time: Date.now()
        });
        
        // Keep only recent memory (last 5 seconds)
        this.memory = this.memory.filter(m => Date.now() - m.time < 5000);
    }
    
    draw() {
        // Calculate distance and angle from player for first-person rendering
        const dx = this.x - camera.x;
        const dy = this.y - camera.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > camera.renderDistance) return;
        
        const angle = Math.atan2(dy, dx) - camera.angle;
        const screenX = canvas.width / 2 + Math.tan(angle) * (canvas.width / 2);
        const screenY = canvas.height / 2;
        
        const size = Math.max(10, 100 - distance / 5);
        
        if (Math.abs(angle) > Math.PI / 2) return;
        
        this.drawFirstPersonEnemy(screenX, screenY, size, distance);
    }
    
    drawFirstPersonEnemy(screenX, screenY, size, distance) {
        ctx.save();
        ctx.translate(screenX, screenY);
        
        const scale = Math.max(0.3, 1 - distance / 300);
        ctx.scale(scale, scale);
        
        // Body color based on AI difficulty
        const difficulty = adaptiveAI.getDifficultyLevel();
        let bodyColor = '#e74c3c';
        if (difficulty === 'HARD' || difficulty === 'EXPERT') bodyColor = '#8b0000';
        if (difficulty === 'NIGHTMARE') bodyColor = '#4b0000';
        
        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-size/4, -size/2, size/2, size);
        
        // Head
        ctx.fillStyle = '#fdbcb4';
        ctx.beginPath();
        ctx.arc(0, -size/2 - size/4, size/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes - color based on intelligence
        const eyeColor = this.intelligence > 0.7 ? '#00ff00' : '#ff0000';
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(-size/8, -size/2 - size/4, size/12, 0, Math.PI * 2);
        ctx.arc(size/8, -size/2 - size/4, size/12, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms
        ctx.fillStyle = '#fdbcb4';
        ctx.fillRect(-size/3, -size/4, size/6, size/2);
        ctx.fillRect(size/4, -size/4, size/6, size/2);
        
        // Legs
        ctx.fillStyle = '#654321';
        ctx.fillRect(-size/6, size/2, size/8, size/3);
        ctx.fillRect(size/12, size/2, size/8, size/3);
        
        // Weapon
        ctx.fillStyle = '#654321';
        ctx.fillRect(size/4, -size/8, size/3, size/12);
        
        // Health bar
        const barWidth = size;
        const barHeight = 2;
        const barY = -size/2 - size/3;
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-barWidth/2, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(-barWidth/2, barY, (this.health / this.maxHealth) * barWidth, barHeight);
        
        ctx.restore();
    }
}
