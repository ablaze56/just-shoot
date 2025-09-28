// Natural Terrain System
class TerrainSystem {
    constructor() {
        this.terrainElements = [];
        this.groundLevel = 0.7; // 70% down the screen
        this.initialized = false;
        // Don't generate terrain immediately - wait for canvas
    }
    
    generateTerrain() {
        // Wait for canvas to be available
        if (typeof canvas === 'undefined') {
            setTimeout(() => this.generateTerrain(), 100);
            return;
        }
        
        // Only generate terrain once
        if (this.initialized) return;
        this.initialized = true;
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const groundY = canvasHeight * this.groundLevel;
        
        // Generate trees
        for (let i = 0; i < 15; i++) {
            this.terrainElements.push(new Tree(
                Math.random() * canvasWidth,
                groundY,
                Math.random() * 30 + 20 // Random height
            ));
        }
        
        // Generate rocks
        for (let i = 0; i < 20; i++) {
            this.terrainElements.push(new Rock(
                Math.random() * canvasWidth,
                groundY,
                Math.random() * 15 + 10
            ));
        }
        
        // Generate grass patches
        for (let i = 0; i < 30; i++) {
            this.terrainElements.push(new GrassPatch(
                Math.random() * canvasWidth,
                groundY,
                Math.random() * 20 + 10
            ));
        }
        
        // Generate bushes
        for (let i = 0; i < 12; i++) {
            this.terrainElements.push(new Bush(
                Math.random() * canvasWidth,
                groundY,
                Math.random() * 25 + 15
            ));
        }
        
        // Generate flowers
        for (let i = 0; i < 25; i++) {
            this.terrainElements.push(new Flower(
                Math.random() * canvasWidth,
                groundY,
                Math.random() * 8 + 5
            ));
        }
    }
    
    update() {
        // Update terrain elements (wind effects, etc.)
        this.terrainElements.forEach(element => {
            if (element.update) {
                element.update();
            }
        });
    }
    
    draw() {
        // Draw ground first
        this.drawGround();
        
        // Draw terrain elements
        this.terrainElements.forEach(element => {
            element.draw();
        });
    }
    
    drawGround() {
        const groundY = canvas.height * this.groundLevel;
        
        // Main ground
        const gradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
        gradient.addColorStop(0, '#8FBC8F'); // Light green
        gradient.addColorStop(0.3, '#7BA05B'); // Medium green
        gradient.addColorStop(1, '#556B2F'); // Dark green
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
        
        // Add grass texture
        ctx.fillStyle = '#9ACD32';
        for (let i = 0; i < canvas.width; i += 3) {
            for (let j = groundY; j < canvas.height; j += 4) {
                if (Math.random() < 0.3) {
                    ctx.fillRect(i, j, 1, 2);
                }
            }
        }
        
        // Horizon line
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(canvas.width, groundY);
        ctx.stroke();
    }
    
    // Check collision with terrain elements
    checkCollision(x, y, width, height) {
        return this.terrainElements.some(element => {
            if (element.isCollidable) {
                return x < element.x + element.width &&
                       x + width > element.x &&
                       y < element.y + element.height &&
                       y + height > element.y;
            }
            return false;
        });
    }
}

// Tree class
class Tree {
    constructor(x, groundY, height) {
        this.x = x;
        this.y = groundY - height;
        this.width = height * 0.3;
        this.height = height;
        this.groundY = groundY;
        this.isCollidable = true;
        this.windOffset = Math.random() * Math.PI * 2;
        this.windSpeed = 0.02;
    }
    
    update() {
        this.windOffset += this.windSpeed;
    }
    
    draw() {
        const windSway = Math.sin(this.windOffset) * 2;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height);
        ctx.rotate(windSway * 0.1);
        
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-this.width/4, -this.height * 0.6, this.width/2, this.height * 0.6);
        
        // Tree leaves
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(0, -this.height * 0.4, this.width * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Tree leaves detail
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(windSway * 0.5, -this.height * 0.4, this.width * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Rock class
class Rock {
    constructor(x, groundY, size) {
        this.x = x;
        this.y = groundY - size;
        this.width = size;
        this.height = size;
        this.groundY = groundY;
        this.isCollidable = true;
        this.color = `hsl(${Math.random() * 30 + 20}, 20%, ${Math.random() * 20 + 40}%)`;
    }
    
    draw() {
        // Rock shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.groundY, this.width/2, this.width/4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock highlights
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x + this.width/3, this.y + this.height/3, this.width/4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Grass patch class
class GrassPatch {
    constructor(x, groundY, size) {
        this.x = x;
        this.y = groundY - size;
        this.width = size;
        this.height = size;
        this.groundY = groundY;
        this.isCollidable = false;
        this.windOffset = Math.random() * Math.PI * 2;
        this.windSpeed = 0.05;
    }
    
    update() {
        this.windOffset += this.windSpeed;
    }
    
    draw() {
        const windSway = Math.sin(this.windOffset) * 3;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.groundY);
        
        // Grass blades
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 8; i++) {
            const bladeX = (i - 4) * 3;
            const bladeHeight = this.height * (0.5 + Math.random() * 0.5);
            
            ctx.beginPath();
            ctx.moveTo(bladeX, 0);
            ctx.lineTo(bladeX + windSway * 0.3, -bladeHeight);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Bush class
class Bush {
    constructor(x, groundY, size) {
        this.x = x;
        this.y = groundY - size;
        this.width = size;
        this.height = size;
        this.groundY = groundY;
        this.isCollidable = true;
        this.windOffset = Math.random() * Math.PI * 2;
        this.windSpeed = 0.03;
    }
    
    update() {
        this.windOffset += this.windSpeed;
    }
    
    draw() {
        const windSway = Math.sin(this.windOffset) * 1.5;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height);
        ctx.rotate(windSway * 0.1);
        
        // Bush body
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(0, -this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bush details
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(windSway * 0.5, -this.height/2, this.width/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Flower class
class Flower {
    constructor(x, groundY, size) {
        this.x = x;
        this.y = groundY - size;
        this.width = size;
        this.height = size;
        this.groundY = groundY;
        this.isCollidable = false;
        this.windOffset = Math.random() * Math.PI * 2;
        this.windSpeed = 0.08;
        this.colors = ['#FF69B4', '#FFB6C1', '#FFA500', '#FFFF00', '#FF1493'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    
    update() {
        this.windOffset += this.windSpeed;
    }
    
    draw() {
        const windSway = Math.sin(this.windOffset) * 2;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.groundY);
        
        // Flower stem
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(windSway * 0.2, -this.height);
        ctx.stroke();
        
        // Flower petals
        ctx.fillStyle = this.color;
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const petalX = Math.cos(angle) * this.width/3 + windSway * 0.3;
            const petalY = Math.sin(angle) * this.width/3 - this.height;
            
            ctx.beginPath();
            ctx.arc(petalX, petalY, this.width/4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Flower center
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(windSway * 0.3, -this.height, this.width/6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Global terrain system - will be initialized when canvas is ready
let terrainSystem;

// Initialize terrain system when canvas is available
function initializeTerrainSystem() {
    if (!terrainSystem && typeof canvas !== 'undefined') {
        terrainSystem = new TerrainSystem();
        terrainSystem.generateTerrain();
    }
}
