// Visible Inventory System
class Inventory {
    constructor() {
        this.items = [];
        this.maxSlots = 20;
        this.isVisible = false;
        this.selectedSlot = 0;
        this.slotSize = 60;
        this.slotsPerRow = 5;
        this.inventoryX = 50;
        this.inventoryY = 50;
        this.itemTypes = {
            weapon: { color: '#8B4513', icon: '🔫' },
            mask: { color: '#4a4a4a', icon: '🎭' },
            sword: { color: '#c0c0c0', icon: '⚔️' },
            health: { color: '#ff0000', icon: '❤️' },
            ammo: { color: '#ffff00', icon: '🔫' },
            magic: { color: '#9b59b6', icon: '✨' }
        };
    }
    
    // Add item to inventory
    addItem(item) {
        if (this.items.length < this.maxSlots) {
            this.items.push({
                ...item,
                id: Date.now() + Math.random(),
                quantity: item.quantity || 1
            });
            return true;
        }
        return false;
    }
    
    // Remove item from inventory
    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    }
    
    // Get item by ID
    getItem(itemId) {
        return this.items.find(item => item.id === itemId);
    }
    
    // Toggle inventory visibility
    toggle() {
        this.isVisible = !this.isVisible;
    }
    
    // Show inventory
    show() {
        this.isVisible = true;
    }
    
    // Hide inventory
    hide() {
        this.isVisible = false;
    }
    
    // Update inventory
    update() {
        // Handle keyboard input for inventory
        if (this.isVisible) {
            // Number keys 1-9 for quick selection
            for (let i = 1; i <= 9; i++) {
                if (keys[i.toString()]) {
                    this.selectedSlot = i - 1;
                }
            }
            
            // Arrow keys for navigation
            if (keys['arrowleft'] && this.selectedSlot > 0) {
                this.selectedSlot--;
            }
            if (keys['arrowright'] && this.selectedSlot < this.maxSlots - 1) {
                this.selectedSlot++;
            }
            if (keys['arrowup'] && this.selectedSlot >= this.slotsPerRow) {
                this.selectedSlot -= this.slotsPerRow;
            }
            if (keys['arrowdown'] && this.selectedSlot < this.maxSlots - this.slotsPerRow) {
                this.selectedSlot += this.slotsPerRow;
            }
        }
    }
    
    // Draw inventory
    draw() {
        if (!this.isVisible) return;
        
        const rows = Math.ceil(this.maxSlots / this.slotsPerRow);
        const totalWidth = this.slotsPerRow * this.slotSize + (this.slotsPerRow - 1) * 5;
        const totalHeight = rows * this.slotSize + (rows - 1) * 5;
        
        // Draw inventory background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(this.inventoryX - 10, this.inventoryY - 10, totalWidth + 20, totalHeight + 20);
        
        // Draw inventory border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.inventoryX - 10, this.inventoryY - 10, totalWidth + 20, totalHeight + 20);
        
        // Draw inventory title
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('INVENTORY', this.inventoryX + totalWidth/2, this.inventoryY - 20);
        
        // Draw slots
        for (let i = 0; i < this.maxSlots; i++) {
            const row = Math.floor(i / this.slotsPerRow);
            const col = i % this.slotsPerRow;
            const x = this.inventoryX + col * (this.slotSize + 5);
            const y = this.inventoryY + row * (this.slotSize + 5);
            
            // Draw slot background
            ctx.fillStyle = i === this.selectedSlot ? '#4a90e2' : '#333333';
            ctx.fillRect(x, y, this.slotSize, this.slotSize);
            
            // Draw slot border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, this.slotSize, this.slotSize);
            
            // Draw item if exists
            if (i < this.items.length) {
                const item = this.items[i];
                this.drawItem(x, y, item);
            }
            
            // Draw slot number
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText((i + 1).toString(), x + 2, y + 15);
        }
        
        // Draw item details
        if (this.selectedSlot < this.items.length) {
            this.drawItemDetails();
        }
        
        // Draw instructions
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Press I to close | Use number keys to select | Arrow keys to navigate', 
                    this.inventoryX, this.inventoryY + totalHeight + 30);
    }
    
    // Draw individual item
    drawItem(x, y, item) {
        const type = this.itemTypes[item.type] || { color: '#ffffff', icon: '❓' };
        
        // Draw item background
        ctx.fillStyle = type.color;
        ctx.fillRect(x + 2, y + 2, this.slotSize - 4, this.slotSize - 4);
        
        // Draw item icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(type.icon, x + this.slotSize/2, y + this.slotSize/2 + 8);
        
        // Draw quantity if more than 1
        if (item.quantity > 1) {
            ctx.fillStyle = '#ffff00';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(item.quantity.toString(), x + this.slotSize - 2, y + this.slotSize - 2);
        }
        
        // Draw rarity border
        if (item.rarity) {
            const rarityColors = {
                common: '#808080',
                rare: '#0080ff',
                epic: '#8000ff',
                legendary: '#ff8000'
            };
            ctx.strokeStyle = rarityColors[item.rarity] || '#808080';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, this.slotSize, this.slotSize);
        }
    }
    
    // Draw item details
    drawItemDetails() {
        const item = this.items[this.selectedSlot];
        if (!item) return;
        
        const detailsX = this.inventoryX + 350;
        const detailsY = this.inventoryY;
        
        // Draw details background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(detailsX, detailsY, 250, 200);
        
        // Draw details border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(detailsX, detailsY, 250, 200);
        
        // Draw item name
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(item.name, detailsX + 10, detailsY + 25);
        
        // Draw item type
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.fillText(`Type: ${item.type}`, detailsX + 10, detailsY + 50);
        
        // Draw item description
        if (item.description) {
            ctx.fillStyle = '#aaaaaa';
            ctx.font = '12px Arial';
            const words = item.description.split(' ');
            let line = '';
            let y = detailsY + 80;
            
            for (let word of words) {
                const testLine = line + word + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > 230) {
                    ctx.fillText(line, detailsX + 10, y);
                    line = word + ' ';
                    y += 15;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, detailsX + 10, y);
        }
        
        // Draw item stats
        if (item.damage) {
            ctx.fillStyle = '#ff0000';
            ctx.fillText(`Damage: ${item.damage}`, detailsX + 10, detailsY + 120);
        }
        if (item.health) {
            ctx.fillStyle = '#00ff00';
            ctx.fillText(`Health: ${item.health}`, detailsX + 10, detailsY + 140);
        }
        if (item.ammo) {
            ctx.fillStyle = '#ffff00';
            ctx.fillText(`Ammo: ${item.ammo}`, detailsX + 10, detailsY + 160);
        }
        
        // Draw use button
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(detailsX + 10, detailsY + 170, 100, 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('USE', detailsX + 60, detailsY + 187);
    }
    
    // Use selected item
    useSelectedItem() {
        if (this.selectedSlot < this.items.length) {
            const item = this.items[this.selectedSlot];
            return this.useItem(item);
        }
        return false;
    }
    
    // Use item
    useItem(item) {
        switch (item.type) {
            case 'weapon':
                // Switch to weapon
                if (weaponSystem.weapons[item.weaponType]) {
                    player.currentWeapon = item.weaponType;
                    player.weapon = weaponSystem.getWeapon(item.weaponType);
                }
                break;
            case 'mask':
                // Equip mask
                player.equippedMask = item;
                break;
            case 'sword':
                // Equip sword
                player.equippedSword = item;
                break;
            case 'health':
                // Use health item
                player.health = Math.min(player.maxHealth, player.health + item.health);
                this.removeItem(item.id);
                break;
            case 'ammo':
                // Use ammo item
                player.weapon.ammo = Math.min(player.weapon.maxAmmo, player.weapon.ammo + item.ammo);
                this.removeItem(item.id);
                break;
        }
        return true;
    }
    
    // Get inventory data for saving
    getInventoryData() {
        return this.items.map(item => ({
            name: item.name,
            type: item.type,
            quantity: item.quantity,
            rarity: item.rarity,
            // Add other properties as needed
        }));
    }
    
    // Load inventory data
    loadInventoryData(data) {
        this.items = data.map(item => ({
            ...item,
            id: Date.now() + Math.random()
        }));
    }
}

// Global inventory instance
const inventory = new Inventory();
