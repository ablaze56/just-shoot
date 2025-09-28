// Magic Item Spawner and Collection System
class MagicItemSpawner {
    constructor() {
        this.spawnedItems = [];
        this.spawnChance = 0.15; // 15% chance when enemy dies
        this.maxItems = 5; // Maximum items on screen
        this.itemLifetime = 30000; // 30 seconds
    }

    // Spawn magic item at location
    spawnMagicItem(x, y) {
        if (this.spawnedItems.length >= this.maxItems) return;
        if (Math.random() > this.spawnChance) return;

        const itemType = Math.random() < 0.5 ? 'mask' : 'sword';
        let item;
        
        if (itemType === 'mask') {
            item = magicItemSystem.getRandomMask();
        } else {
            item = magicItemSystem.getRandomSword();
        }

        const magicItem = new MagicItem(x, y, item);
        this.spawnedItems.push(magicItem);
    }

    // Update all spawned items
    update() {
        const now = Date.now();
        
        this.spawnedItems = this.spawnedItems.filter(item => {
            // Remove expired items
            if (now - item.spawnTime > this.itemLifetime) {
                return false;
            }

            // Check collision with player
            const dx = player.x - item.x;
            const dy = player.y - item.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
                this.collectItem(item);
                return false;
            }

            return true;
        });
    }

    // Collect magic item
    collectItem(item) {
        if (item.itemData.type === 'mask') {
            player.equippedMask = item.itemData;
            createMagicEffect(item.x, item.y, '✨', '#ffd700');
        } else if (item.itemData.type === 'sword') {
            player.equippedSword = item.itemData;
            createMagicEffect(item.x, item.y, '⚔️', '#c0c0c0');
        }

        // Add to score
        score += 50;
    }

    // Draw all spawned items
    draw() {
        this.spawnedItems.forEach(item => {
            item.draw();
        });
    }
}

// Magic Item class
class MagicItem {
    constructor(x, y, itemData) {
        this.x = x;
        this.y = y;
        this.itemData = itemData;
        this.spawnTime = Date.now();
        this.pulse = 0;
        this.radius = 20;
    }

    update() {
        this.pulse += 0.1;
    }

    draw() {
        const pulseSize = this.radius + Math.sin(this.pulse) * 5;
        const alpha = 0.8 + Math.sin(this.pulse * 2) * 0.2;

        // Draw glow effect
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.itemData.color;
        ctx.shadowColor = this.itemData.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();

        // Draw item icon
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.itemData.icon, this.x, this.y + 5);

        // Draw rarity border
        const rarityColors = {
            common: '#808080',
            rare: '#0080ff',
            epic: '#8000ff',
            legendary: '#ff8000'
        };

        ctx.strokeStyle = rarityColors[this.itemData.rarity] || '#808080';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Magic effect creation
function createMagicEffect(x, y, icon, color) {
    for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10;
        const speed = Math.random() * 3 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        particles.push(new MagicParticle(x, y, vx, vy, color, icon, 30));
    }
}

// Magic particle class
class MagicParticle {
    constructor(x, y, vx, vy, color, icon, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.icon = icon;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 4 + 2;
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
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.icon, this.x, this.y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// Global magic spawner
const magicSpawner = new MagicItemSpawner();
