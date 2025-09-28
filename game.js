// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'gameOver'
let gameRunning = false;

// Player object - will be initialized after Player class is defined
let player;

// Mouse position
let mouseX = 0;
let mouseY = 0;

// Arrays for game objects
let bullets = [];
let enemies = [];
let particles = [];
let powerUps = [];

// Game stats
let score = 0;
let wave = 1;
let enemiesSpawned = 0;
let enemiesKilled = 0;
let lastEnemySpawn = 0;
let enemySpawnRate = 2000; // milliseconds

// First-person camera
const camera = {
    x: 0,
    y: 0,
    angle: 0,
    fov: Math.PI / 3, // 60 degrees
    renderDistance: 500
};

// Responsive canvas setup
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const containerRect = container.getBoundingClientRect();
    
    // Set canvas size to match container
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;
    
    // Update camera render distance based on screen size
    camera.renderDistance = Math.max(400, Math.min(canvas.width, canvas.height) * 0.8);
}

// Initialize canvas size
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Realistic weapons database
const weapons = {
    pistol: {
        name: "Glock 17",
        damage: 35,
        fireRate: 300, // ms between shots
        ammo: 17,
        maxAmmo: 17,
        reloadTime: 2000,
        bulletSpeed: 8,
        accuracy: 0.95,
        range: 200,
        recoil: 0.1,
        type: "pistol"
    },
    rifle: {
        name: "AK-47",
        damage: 45,
        fireRate: 100,
        ammo: 30,
        maxAmmo: 30,
        reloadTime: 2500,
        bulletSpeed: 12,
        accuracy: 0.85,
        range: 400,
        recoil: 0.3,
        type: "rifle"
    },
    sniper: {
        name: "AWP Sniper",
        damage: 100,
        fireRate: 1500,
        ammo: 5,
        maxAmmo: 5,
        reloadTime: 3000,
        bulletSpeed: 20,
        accuracy: 0.98,
        range: 800,
        recoil: 0.8,
        type: "sniper"
    },
    shotgun: {
        name: "M1014 Shotgun",
        damage: 25,
        fireRate: 800,
        ammo: 8,
        maxAmmo: 8,
        reloadTime: 3000,
        bulletSpeed: 6,
        accuracy: 0.6,
        range: 100,
        recoil: 0.5,
        pellets: 8,
        type: "shotgun"
    }
};

// Input handling
const keys = {};
let mousePressed = false;

// Touch controls
let touchControls = {
    moveStick: { active: false, x: 0, y: 0, centerX: 0, centerY: 0 },
    lookArea: { active: false, x: 0, y: 0 },
    shootButton: { active: false },
    reloadButton: { active: false }
};

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', (e) => {
    mousePressed = true;
});

canvas.addEventListener('mouseup', (e) => {
    mousePressed = false;
});

// Touch event listeners
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if touch is on mobile controls
    if (isMobile) {
        handleTouchControls('start', x, y);
    } else {
        mousePressed = true;
        mouseX = x;
        mouseY = y;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (isMobile) {
        handleTouchControls('move', x, y);
    } else {
        mouseX = x;
        mouseY = y;
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (isMobile) {
        handleTouchControls('end', 0, 0);
    } else {
        mousePressed = false;
    }
});

// Touch control handling
function handleTouchControls(action, x, y) {
    const moveStick = document.getElementById('moveStick');
    const lookArea = document.getElementById('lookArea');
    const shootButton = document.getElementById('shootButton');
    const reloadButton = document.getElementById('reloadButton');
    
    if (action === 'start') {
        // Check which control was touched
        if (isPointInElement(x, y, moveStick)) {
            touchControls.moveStick.active = true;
            const rect = moveStick.getBoundingClientRect();
            touchControls.moveStick.centerX = rect.left + rect.width / 2;
            touchControls.moveStick.centerY = rect.top + rect.height / 2;
        } else if (isPointInElement(x, y, lookArea)) {
            touchControls.lookArea.active = true;
        } else if (isPointInElement(x, y, shootButton)) {
            touchControls.shootButton.active = true;
            mousePressed = true;
        } else if (isPointInElement(x, y, reloadButton)) {
            touchControls.reloadButton.active = true;
            keys['r'] = true;
        }
    } else if (action === 'move') {
        if (touchControls.moveStick.active) {
            const dx = x - touchControls.moveStick.centerX;
            const dy = y - touchControls.moveStick.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 50;
            
            if (distance > maxDistance) {
                const angle = Math.atan2(dy, dx);
                touchControls.moveStick.x = Math.cos(angle) * maxDistance;
                touchControls.moveStick.y = Math.sin(angle) * maxDistance;
            } else {
                touchControls.moveStick.x = dx;
                touchControls.moveStick.y = dy;
            }
        }
        
        if (touchControls.lookArea.active) {
            mouseX = x;
            mouseY = y;
        }
    } else if (action === 'end') {
        touchControls.moveStick.active = false;
        touchControls.lookArea.active = false;
        touchControls.shootButton.active = false;
        touchControls.reloadButton.active = false;
        mousePressed = false;
        keys['r'] = false;
    }
}

function isPointInElement(x, y, element) {
    const rect = element.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const relativeX = x - (rect.left - canvasRect.left);
    const relativeY = y - (rect.top - canvasRect.top);
    
    return relativeX >= 0 && relativeX <= rect.width && 
           relativeY >= 0 && relativeY <= rect.height;
}

// Player class for first-person view
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.speed = 3;
        this.health = 100;
        this.maxHealth = 100;
        this.angle = 0;
        this.weaponBob = 0;
        this.weaponBobSpeed = 0.3;
        this.recoil = 0;
        this.recoilRecovery = 0.05;
        
        // Weapon system
        this.currentWeapon = 'rifle';
        this.weapon = { ...weapons.rifle };
        this.lastShot = 0;
        this.isReloading = false;
        this.weaponSwitchCooldown = 0;
        
        // Magic items
        this.equippedMask = null;
        this.equippedSword = null;
        this.isInvisible = false;
        this.invisibilityEndTime = 0;
        this.lastSwordSwing = 0;
    }

    update() {
        // Update camera position
        camera.x = this.x;
        camera.y = this.y;
        
        // Update camera angle based on mouse
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const mouseAngle = Math.atan2(mouseY - centerY, mouseX - centerX);
        camera.angle = mouseAngle;
        this.angle = mouseAngle;

        // Movement with WASD or touch controls
        let moveX = 0;
        let moveY = 0;
        
        if (isMobile && touchControls.moveStick.active) {
            // Touch stick movement
            const stickX = touchControls.moveStick.x / 50; // Normalize
            const stickY = touchControls.moveStick.y / 50;
            
            moveX += stickX * this.speed;
            moveY += stickY * this.speed;
        } else {
            // Keyboard movement
            if (keys['w'] || keys['arrowup']) {
                moveX += Math.cos(this.angle) * this.speed;
                moveY += Math.sin(this.angle) * this.speed;
            }
            if (keys['s'] || keys['arrowdown']) {
                moveX -= Math.cos(this.angle) * this.speed;
                moveY -= Math.sin(this.angle) * this.speed;
            }
            if (keys['a'] || keys['arrowleft']) {
                moveX += Math.cos(this.angle - Math.PI/2) * this.speed;
                moveY += Math.sin(this.angle - Math.PI/2) * this.speed;
            }
            if (keys['d'] || keys['arrowright']) {
                moveX += Math.cos(this.angle + Math.PI/2) * this.speed;
                moveY += Math.sin(this.angle + Math.PI/2) * this.speed;
            }
        }

        // Update position
        this.x += moveX;
        this.y += moveY;

        // Keep player in bounds
        this.x = Math.max(50, Math.min(canvas.width - 50, this.x));
        this.y = Math.max(50, Math.min(canvas.height - 50, this.y));

        // Weapon bobbing
        if (moveX !== 0 || moveY !== 0) {
            this.weaponBob += this.weaponBobSpeed;
        }

        // Recoil recovery
        this.recoil = Math.max(0, this.recoil - this.recoilRecovery);

        // Weapon switching
        if (this.weaponSwitchCooldown > 0) {
            this.weaponSwitchCooldown--;
        } else {
            if (keys['1']) this.switchWeapon('pistol');
            if (keys['2']) this.switchWeapon('rifle');
            if (keys['3']) this.switchWeapon('sniper');
            if (keys['4']) this.switchWeapon('shotgun');
        }

        // Shooting
        if (mousePressed && !this.isReloading && this.weapon.ammo > 0) {
            const now = Date.now();
            if (now - this.lastShot > this.weapon.fireRate) {
                this.shoot();
                this.lastShot = now;
            }
        }

        // Reloading
        if (keys['r'] && !this.isReloading && this.weapon.ammo < this.weapon.maxAmmo) {
            this.reload();
        }

        // Magic item controls
        if (keys['q'] && this.equippedMask) {
            magicItemSystem.activateMaskAbility(this.equippedMask, this);
        }
        
        if (keys['e'] && this.equippedSword) {
            const now = Date.now();
            if (now - this.lastSwordSwing > this.equippedSword.swingSpeed) {
                magicItemSystem.activateSwordAbility(this.equippedSword, this, mouseX, mouseY);
                this.lastSwordSwing = now;
            }
        }
    }

    switchWeapon(weaponType) {
        if (weaponType !== this.currentWeapon) {
            this.currentWeapon = weaponType;
            this.weapon = { ...weapons[weaponType] };
            this.weaponSwitchCooldown = 500; // 0.5 second cooldown
        }
    }

    shoot() {
        if (this.weapon.ammo <= 0) return;

        // Add recoil
        this.recoil += this.weapon.recoil;
        
        // Calculate shooting angle with recoil and accuracy
        const accuracyOffset = (1 - this.weapon.accuracy) * (Math.random() - 0.5) * 0.3;
        const recoilOffset = this.recoil * (Math.random() - 0.5) * 0.2;
        const shootAngle = this.angle + accuracyOffset + recoilOffset;

        if (this.weapon.type === 'shotgun') {
            // Shotgun fires multiple pellets
            for (let i = 0; i < this.weapon.pellets; i++) {
                const pelletSpread = (Math.random() - 0.5) * 0.4;
                const pelletAngle = shootAngle + pelletSpread;
                
                bullets.push(new Bullet(
                    this.x,
                    this.y,
                    Math.cos(pelletAngle) * this.weapon.bulletSpeed,
                    Math.sin(pelletAngle) * this.weapon.bulletSpeed,
                    'player',
                    this.weapon.damage,
                    this.weapon.range,
                    this.weapon.bulletSpeed
                ));
            }
        } else {
            // Single bullet
            bullets.push(new Bullet(
                this.x,
                this.y,
                Math.cos(shootAngle) * this.weapon.bulletSpeed,
                Math.sin(shootAngle) * this.weapon.bulletSpeed,
                'player',
                this.weapon.damage,
                this.weapon.range,
                this.weapon.bulletSpeed
            ));
        }
        
        this.weapon.ammo--;
        createMuzzleFlash(this.x, this.y, shootAngle, this.weapon.type);
    }

    reload() {
        this.isReloading = true;
        setTimeout(() => {
            this.weapon.ammo = this.weapon.maxAmmo;
            this.isReloading = false;
        }, this.weapon.reloadTime);
    }

    takeDamage(damage) {
        this.health -= damage;
        // Create screen flash effect when player is hit
        createScreenFlash();
        if (this.health <= 0) {
            this.health = 0;
            gameOver();
        }
    }

    draw() {
        // Player is not drawn in first-person view, only the weapon
        this.drawWeapon();
    }
    
    drawWeapon() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Weapon bobbing effect
        const bobOffset = Math.sin(this.weaponBob) * 3;
        const recoilOffset = this.recoil * 10;
        
        ctx.save();
        ctx.translate(centerX + 20, centerY + 20 + bobOffset + recoilOffset);
        
        // Draw different weapons based on type
        switch(this.weapon.type) {
            case 'pistol':
                this.drawPistol();
                break;
            case 'rifle':
                this.drawRifle();
                break;
            case 'sniper':
                this.drawSniper();
                break;
            case 'shotgun':
                this.drawShotgun();
                break;
        }
        
        // Muzzle flash when shooting
        if (mousePressed && !this.isReloading && this.weapon.ammo > 0) {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(50, -2, 8, 4);
        }
        
        ctx.restore();
    }
    
    drawPistol() {
        // Pistol grip
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-8, 0, 6, 12);
        
        // Pistol body
        ctx.fillStyle = '#654321';
        ctx.fillRect(-2, -2, 20, 4);
        
        // Pistol barrel
        ctx.fillStyle = '#333';
        ctx.fillRect(18, -1, 8, 2);
        
        // Trigger guard
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-2, 2, 3, 0, Math.PI);
        ctx.stroke();
    }
    
    drawRifle() {
        // Rifle body
        ctx.fillStyle = '#654321';
        ctx.fillRect(-5, -3, 40, 6);
        
        // Rifle stock
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-15, -2, 10, 4);
        
        // Rifle barrel
        ctx.fillStyle = '#333';
        ctx.fillRect(35, -1, 15, 2);
        
        // Rifle scope
        ctx.fillStyle = '#000';
        ctx.fillRect(25, -5, 8, 3);
    }
    
    drawSniper() {
        // Sniper body
        ctx.fillStyle = '#654321';
        ctx.fillRect(-8, -4, 50, 8);
        
        // Sniper stock
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-20, -3, 12, 6);
        
        // Sniper barrel
        ctx.fillStyle = '#333';
        ctx.fillRect(42, -2, 20, 4);
        
        // Large scope
        ctx.fillStyle = '#000';
        ctx.fillRect(30, -8, 12, 6);
        ctx.fillStyle = '#444';
        ctx.fillRect(32, -6, 8, 2);
    }
    
    drawShotgun() {
        // Shotgun body
        ctx.fillStyle = '#654321';
        ctx.fillRect(-6, -4, 35, 8);
        
        // Shotgun stock
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-18, -3, 12, 6);
        
        // Shotgun barrel (wider)
        ctx.fillStyle = '#333';
        ctx.fillRect(29, -3, 12, 6);
        
        // Pump handle
        ctx.fillStyle = '#654321';
        ctx.fillRect(25, -6, 4, 2);
    }
}

// Bullet class
class Bullet {
    constructor(x, y, vx, vy, owner) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.radius = 3;
        this.damage = 25;
        this.color = owner === 'player' ? '#f39c12' : '#e74c3c';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = 1 + Math.random() * 2;
        this.health = 50 + wave * 10;
        this.maxHealth = this.health;
        this.lastShot = 0;
        this.shootCooldown = 1000 + Math.random() * 1000;
        this.color = '#e74c3c';
        this.angle = 0;
    }

    update() {
        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
            this.angle = Math.atan2(dy, dx);
        }

        // Shooting
        const now = Date.now();
        if (now - this.lastShot > this.shootCooldown && distance < 200) {
            this.shoot();
            this.lastShot = now;
        }
    }

    shoot() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        bullets.push(new Bullet(
            this.x + this.width/2,
            this.y + this.height/2,
            Math.cos(angle) * 5,
            Math.sin(angle) * 5,
            'enemy'
        ));
    }

    takeDamage(damage) {
        this.health -= damage;
        // Create blood effect when hit
        createBloodSplatter(this.x + this.width/2, this.y + this.height/2);
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        score += 10;
        enemiesKilled++;
        createExplosion(this.x + this.width/2, this.y + this.height/2);
        
        // Chance to drop power-up
        if (Math.random() < 0.3) {
            powerUps.push(new PowerUp(this.x + this.width/2, this.y + this.height/2));
        }
        
        // Chance to drop magic item
        magicSpawner.spawnMagicItem(this.x + this.width/2, this.y + this.height/2);
    }

    draw() {
        // Calculate distance and angle from player
        const dx = this.x - camera.x;
        const dy = this.y - camera.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Don't render if too far away
        if (distance > camera.renderDistance) return;
        
        // Calculate angle relative to camera
        const angle = Math.atan2(dy, dx) - camera.angle;
        
        // Project to screen coordinates
        const screenX = canvas.width / 2 + Math.tan(angle) * (canvas.width / 2);
        const screenY = canvas.height / 2;
        
        // Calculate size based on distance
        const size = Math.max(10, 100 - distance / 5);
        
        // Don't render if behind player
        if (Math.abs(angle) > Math.PI / 2) return;
        
        // Draw enemy in first-person view
        this.drawFirstPersonEnemy(screenX, screenY, size, distance);
    }
    
    drawFirstPersonEnemy(screenX, screenY, size, distance) {
        ctx.save();
        ctx.translate(screenX, screenY);
        
        // Scale based on distance
        const scale = Math.max(0.3, 1 - distance / 300);
        ctx.scale(scale, scale);
        
        // Body (torso)
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(-size/4, -size/2, size/2, size);
        
        // Head
        ctx.fillStyle = '#fdbcb4';
        ctx.beginPath();
        ctx.arc(0, -size/2 - size/4, size/4, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, -size/2 - size/3, size/5, 0, Math.PI);
        ctx.fill();
        
        // Eyes - red/angry
        ctx.fillStyle = '#ff0000';
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
        
        // Weapon (pistol)
        ctx.fillStyle = '#654321';
        ctx.fillRect(size/4, -size/8, size/3, size/12);
        
        // Health bar above enemy
        const barWidth = size;
        const barHeight = 2;
        const barY = -size/2 - size/3;
        
        // Background
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-barWidth/2, barY, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(-barWidth/2, barY, (this.health / this.maxHealth) * barWidth, barHeight);
        
        ctx.restore();
    }
}

// Power-up class
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.type = Math.random() < 0.5 ? 'health' : 'ammo';
        this.color = this.type === 'health' ? '#27ae60' : '#3498db';
        this.pulse = 0;
    }

    update() {
        this.pulse += 0.1;
        
        // Check collision with player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius + player.width/2) {
            this.collect();
        }
    }

    collect() {
        if (this.type === 'health') {
            player.health = Math.min(player.maxHealth, player.health + 25);
        } else {
            player.ammo = Math.min(player.maxAmmo, player.ammo + 15);
        }
        
        // Remove from array
        const index = powerUps.indexOf(this);
        if (index > -1) {
            powerUps.splice(index, 1);
        }
    }

    draw() {
        const pulseSize = this.radius + Math.sin(this.pulse) * 3;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type === 'health' ? '❤️' : '🔫', this.x, this.y + 4);
    }
}

// Particle class for effects
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }

    draw() {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// Initialize player after all classes are defined
player = new Player(canvas.width / 2, canvas.height / 2);

// Effect functions
function createMuzzleFlash(x, y, angle) {
    // Main muzzle flash
    for (let i = 0; i < 8; i++) {
        const vx = Math.cos(angle) * (Math.random() * 4 + 3);
        const vy = Math.sin(angle) * (Math.random() * 4 + 3);
        particles.push(new Particle(x, y, vx, vy, '#ffff00', 8));
    }
    
    // Smoke particles
    for (let i = 0; i < 5; i++) {
        const vx = Math.cos(angle) * (Math.random() * 2 + 1);
        const vy = Math.sin(angle) * (Math.random() * 2 + 1);
        particles.push(new Particle(x, y, vx, vy, '#666666', 15));
    }
}

function createExplosion(x, y) {
    // Fire explosion
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = Math.random() * 6 + 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = Math.random() < 0.5 ? '#ff4500' : '#ff6347';
        particles.push(new Particle(x, y, vx, vy, color, 25));
    }
    
    // Smoke
    for (let i = 0; i < 10; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push(new Particle(x, y, vx, vy, '#696969', 30));
    }
}

function createBloodSplatter(x, y) {
    // Blood particles
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = Math.random() < 0.7 ? '#8b0000' : '#dc143c';
        particles.push(new Particle(x, y, vx, vy, color, 20));
    }
}

function createScreenFlash() {
    // Create a red screen flash effect
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Collision detection
function checkCollisions() {
    // Bullets vs enemies
    bullets.forEach((bullet, bulletIndex) => {
        if (bullet.owner === 'player') {
            enemies.forEach((enemy, enemyIndex) => {
                if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                    bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                    enemy.takeDamage(bullet.damage);
                    bullets.splice(bulletIndex, 1);
                }
            });
        } else if (bullet.owner === 'enemy') {
            if (bullet.x > player.x && bullet.x < player.x + player.width &&
                bullet.y > player.y && bullet.y < player.y + player.height) {
                player.takeDamage(bullet.damage);
                bullets.splice(bulletIndex, 1);
            }
        }
    });
}

// Enemy spawning
function spawnEnemies() {
    const now = Date.now();
    if (now - lastEnemySpawn > enemySpawnRate && enemies.length < 10 + wave * 2) {
        // Spawn enemy at random edge
        let x, y;
        const side = Math.floor(Math.random() * 4);
        
        switch (side) {
            case 0: // Top
                x = Math.random() * canvas.width;
                y = -25;
                break;
            case 1: // Right
                x = canvas.width + 25;
                y = Math.random() * canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * canvas.width;
                y = canvas.height + 25;
                break;
            case 3: // Left
                x = -25;
                y = Math.random() * canvas.height;
                break;
        }
        
        enemies.push(new Enemy(x, y));
        lastEnemySpawn = now;
        enemiesSpawned++;
    }
}

// Game functions
function startGame() {
    gameState = 'playing';
    gameRunning = true;
    startScreen.style.display = 'none';
    
    // Reset game state
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = player.maxHealth;
    player.ammo = player.maxAmmo;
    player.isReloading = false;
    
    bullets = [];
    enemies = [];
    particles = [];
    powerUps = [];
    
    score = 0;
    wave = 1;
    enemiesSpawned = 0;
    enemiesKilled = 0;
    
    gameLoop();
}

function gameOver() {
    gameState = 'gameOver';
    gameRunning = false;
    finalScoreElement.textContent = `Final Score: ${score}`;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    gameOverScreen.style.display = 'none';
    startGame();
}

function updateUI() {
    document.getElementById('health').textContent = `❤️ ${Math.max(0, Math.floor(player.health))}`;
    document.getElementById('ammo').textContent = `🔫 ${player.weapon.ammo}${player.isReloading ? ' (Reloading...)' : ''}`;
    document.getElementById('score').textContent = `Score: ${score}`;
    
    let weaponInfo = `${player.weapon.name}`;
    if (player.equippedMask) {
        weaponInfo += ` | ${player.equippedMask.icon} ${player.equippedMask.name}`;
    }
    if (player.equippedSword) {
        weaponInfo += ` | ${player.equippedSword.icon} ${player.equippedSword.name}`;
    }
    document.getElementById('weaponInfo').textContent = weaponInfo;
}

// Draw first-person background
function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8FBC8F';
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
    
    // Horizon line
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.7);
    ctx.lineTo(canvas.width, canvas.height * 0.7);
    ctx.stroke();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw first-person background
    drawBackground();
    
    // Update game objects
    player.update();
    
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.isOffScreen()) {
            bullets.splice(index, 1);
        }
    });
    
    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.health <= 0) {
            enemies.splice(index, 1);
        }
    });
    
    particles.forEach((particle, index) => {
        particle.update();
        if (particle.isDead()) {
            particles.splice(index, 1);
        }
    });
    
    powerUps.forEach(powerUp => {
        powerUp.update();
    });
    
    // Update magic systems
    magicItemSystem.update();
    magicSpawner.update();
    
    // Game logic
    checkCollisions();
    spawnEnemies();
    updateUI();
    
    // Check for wave completion
    if (enemiesKilled >= 10 + wave * 5) {
        wave++;
        enemiesKilled = 0;
        enemySpawnRate = Math.max(500, enemySpawnRate - 100);
    }
    
    // Draw everything
    player.draw();
    bullets.forEach(bullet => bullet.draw());
    enemies.forEach(enemy => enemy.draw());
    particles.forEach(particle => particle.draw());
    powerUps.forEach(powerUp => powerUp.draw());
    
    // Draw magic items and effects
    magicSpawner.draw();
    magicItemSystem.draw();
    
    // Draw wave info
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Wave: ${wave}`, 20, canvas.height - 20);
    ctx.fillText(`Enemies: ${enemies.length}`, 20, canvas.height - 50);
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
window.addEventListener('load', () => {
    // Game is ready to start
});
