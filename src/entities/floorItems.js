// Floor Items System - Items that spawn on the ground
class FloorItem {
    constructor(x, y, itemData) {
        this.x = x;
        this.y = y;
        this.itemData = itemData;
        this.width = 30;
        this.height = 30;
        this.collected = false;
        this.pulse = 0;
        this.glowIntensity = 0;
        this.pickupRange = 40;
        this.groundY = canvas.height * 0.7;
        
        // Ensure item is on the ground
        this.y = this.groundY - this.height;
    }
    
    update() {
        this.pulse += 0.1;
        this.glowIntensity = 0.5 + Math.sin(this.pulse) * 0.3;
        
        // Check if player is close enough to collect
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.pickupRange && !this.collected) {
            this.collected = true;
            this.collect();
        }
    }
    
    collect() {
        // Add to inventory
        if (inventory.addItem(this.itemData)) {
            // Create collection effect
            this.createCollectionEffect();
            // Remove from floor items array
            const index = floorItems.indexOf(this);
            if (index > -1) {
                floorItems.splice(index, 1);
            }
        }
    }
    
    createCollectionEffect() {
        // Create sparkle effect
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const speed = Math.random() * 3 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            particles.push(new Particle(
                this.x + this.width/2,
                this.y + this.height/2,
                vx, vy,
                '#ffd700',
                30
            ));
        }
    }
    
    draw() {
        if (this.collected) return;
        
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Draw glow effect
        ctx.save();
        ctx.shadowColor = this.getItemColor();
        ctx.shadowBlur = 20 * this.glowIntensity;
        
        // Draw item background
        ctx.fillStyle = this.getItemColor();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw item icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.getItemIcon(), centerX, centerY + 7);
        
        // Draw rarity border
        if (this.itemData.rarity) {
            ctx.strokeStyle = this.getRarityColor();
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        
        // Draw pickup indicator
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.pickupRange * 1.5) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '12px Arial';
            ctx.fillText('Press E to collect', centerX, this.y - 10);
        }
        
        ctx.restore();
    }
    
    getItemColor() {
        const colors = {
            weapon: '#8B4513',
            mask: '#4a4a4a',
            sword: '#c0c0c0',
            health: '#ff0000',
            ammo: '#ffff00',
            magic: '#9b59b6'
        };
        return colors[this.itemData.type] || '#ffffff';
    }
    
    getItemIcon() {
        const icons = {
            weapon: '🔫',
            mask: '🎭',
            sword: '⚔️',
            health: '❤️',
            ammo: '🔫',
            magic: '✨'
        };
        return icons[this.itemData.type] || '❓';
    }
    
    getRarityColor() {
        const colors = {
            common: '#808080',
            rare: '#0080ff',
            epic: '#8000ff',
            legendary: '#ff8000'
        };
        return colors[this.itemData.rarity] || '#808080';
    }
}

// Floor Item Spawner
class FloorItemSpawner {
    constructor() {
        this.spawnedItems = [];
        this.spawnChance = 0.2; // 20% chance when enemy dies
        this.maxItems = 8; // Maximum items on floor
        this.itemLifetime = 60000; // 60 seconds
    }
    
    // Spawn item on floor
    spawnItem(x, y, itemType = null) {
        if (this.spawnedItems.length >= this.maxItems) return;
        if (Math.random() > this.spawnChance) return;
        
        const itemData = this.generateItemData(itemType);
        const floorItem = new FloorItem(x, y, itemData);
        this.spawnedItems.push(floorItem);
    }
    
    // Generate random item data
    generateItemData(itemType = null) {
        const itemTypes = itemType ? [itemType] : ['weapon', 'mask', 'sword', 'health', 'ammo', 'magic'];
        const selectedType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        const items = {
            weapon: {
                name: "Assault Rifle",
                type: "weapon",
                weaponType: "rifle",
                rarity: "rare",
                description: "A powerful assault rifle with high damage and range."
            },
            mask: {
                name: "Shadow Mask",
                type: "mask",
                rarity: "epic",
                description: "Grants invisibility for a short time."
            },
            sword: {
                name: "Flame Sword",
                type: "sword",
                rarity: "rare",
                description: "A sword that burns enemies on contact."
            },
            health: {
                name: "Health Potion",
                type: "health",
                health: 50,
                quantity: 1,
                rarity: "common",
                description: "Restores 50 health points."
            },
            ammo: {
                name: "Ammo Pack",
                type: "ammo",
                ammo: 30,
                quantity: 1,
                rarity: "common",
                description: "Contains 30 rounds of ammunition."
            },
            magic: {
                name: "Magic Crystal",
                type: "magic",
                rarity: "legendary",
                description: "A mysterious crystal with unknown powers."
            }
        };
        
        return items[selectedType];
    }
    
    // Update all floor items
    update() {
        const now = Date.now();
        
        this.spawnedItems = this.spawnedItems.filter(item => {
            // Remove expired items
            if (now - item.spawnTime > this.itemLifetime) {
                return false;
            }
            
            item.update();
            return !item.collected;
        });
    }
    
    // Draw all floor items
    draw() {
        this.spawnedItems.forEach(item => {
            item.draw();
        });
    }
    
    // Clear all items
    clear() {
        this.spawnedItems = [];
    }
}

// Global floor item spawner
const floorItemSpawner = new FloorItemSpawner();
