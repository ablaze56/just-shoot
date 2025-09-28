// Player Avatar System
class PlayerAvatar {
    constructor() {
        this.avatar = {
            // Physical appearance
            skinColor: '#fdbcb4',
            hairColor: '#8b4513',
            eyeColor: '#000000',
            hairStyle: 'short', // short, long, bald, mohawk
            facialHair: 'none', // none, beard, mustache, goatee
            
            // Clothing
            shirtColor: '#2c3e50',
            pantsColor: '#34495e',
            shoesColor: '#000000',
            
            // Accessories
            hat: 'none', // none, cap, helmet, crown
            glasses: 'none', // none, sunglasses, regular
            
            // Stats
            level: 1,
            experience: 0,
            kills: 0,
            deaths: 0,
            playTime: 0
        };
        
        this.animations = {
            idle: 0,
            walking: 0,
            shooting: 0,
            reloading: 0
        };
        
        this.currentAnimation = 'idle';
    }
    
    // Draw player avatar in first-person view (reflection in mirror/water)
    drawAvatar() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.8; // Bottom of screen
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Draw avatar reflection
        this.drawAvatarBody();
        this.drawAvatarHead();
        this.drawAvatarClothing();
        this.drawAvatarAccessories();
        
        ctx.restore();
    }
    
    drawAvatarBody() {
        const { skinColor, shirtColor, pantsColor, shoesColor } = this.avatar;
        
        // Body (torso)
        ctx.fillStyle = shirtColor;
        ctx.fillRect(-15, -40, 30, 40);
        
        // Arms
        ctx.fillStyle = skinColor;
        ctx.fillRect(-20, -35, 8, 25);
        ctx.fillRect(12, -35, 8, 25);
        
        // Legs
        ctx.fillStyle = pantsColor;
        ctx.fillRect(-12, 0, 8, 25);
        ctx.fillRect(4, 0, 8, 25);
        
        // Shoes
        ctx.fillStyle = shoesColor;
        ctx.fillRect(-12, 25, 8, 8);
        ctx.fillRect(4, 25, 8, 8);
    }
    
    drawAvatarHead() {
        const { skinColor, hairColor, eyeColor, hairStyle, facialHair } = this.avatar;
        
        // Head
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(0, -50, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Hair
        ctx.fillStyle = hairColor;
        switch(hairStyle) {
            case 'short':
                ctx.beginPath();
                ctx.arc(0, -55, 10, 0, Math.PI);
                ctx.fill();
                break;
            case 'long':
                ctx.fillRect(-10, -55, 20, 15);
                break;
            case 'mohawk':
                ctx.fillRect(-3, -60, 6, 20);
                break;
            case 'bald':
                // No hair
                break;
        }
        
        // Eyes
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(-4, -52, 1.5, 0, Math.PI * 2);
        ctx.arc(4, -52, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Facial hair
        if (facialHair !== 'none') {
            ctx.fillStyle = hairColor;
            switch(facialHair) {
                case 'beard':
                    ctx.fillRect(-6, -40, 12, 8);
                    break;
                case 'mustache':
                    ctx.fillRect(-4, -42, 8, 3);
                    break;
                case 'goatee':
                    ctx.fillRect(-2, -40, 4, 6);
                    break;
            }
        }
    }
    
    drawAvatarClothing() {
        // Shirt details
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-15, -40, 30, 40);
        
        // Pants details
        ctx.strokeRect(-12, 0, 8, 25);
        ctx.strokeRect(4, 0, 8, 25);
    }
    
    drawAvatarAccessories() {
        const { hat, glasses } = this.avatar;
        
        // Hat
        if (hat !== 'none') {
            ctx.fillStyle = '#654321';
            switch(hat) {
                case 'cap':
                    ctx.fillRect(-8, -60, 16, 8);
                    break;
                case 'helmet':
                    ctx.fillStyle = '#c0c0c0';
                    ctx.beginPath();
                    ctx.arc(0, -55, 12, 0, Math.PI);
                    ctx.fill();
                    break;
                case 'crown':
                    ctx.fillStyle = '#ffd700';
                    ctx.fillRect(-10, -65, 20, 5);
                    // Crown points
                    for(let i = -8; i <= 8; i += 4) {
                        ctx.fillRect(i, -70, 2, 8);
                    }
                    break;
            }
        }
        
        // Glasses
        if (glasses !== 'none') {
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            if (glasses === 'sunglasses') {
                ctx.fillStyle = '#000000';
                ctx.fillRect(-8, -54, 6, 4);
                ctx.fillRect(2, -54, 6, 4);
                ctx.beginPath();
                ctx.moveTo(-2, -52);
                ctx.lineTo(0, -52);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(-4, -52, 3, 0, Math.PI * 2);
                ctx.arc(4, -52, 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(-1, -52);
                ctx.lineTo(1, -52);
                ctx.stroke();
            }
        }
    }
    
    // Draw avatar in third-person view (for other players to see)
    drawThirdPersonAvatar(x, y, angle) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Scale down for third-person view
        ctx.scale(0.8, 0.8);
        
        this.drawAvatarBody();
        this.drawAvatarHead();
        this.drawAvatarClothing();
        this.drawAvatarAccessories();
        
        ctx.restore();
    }
    
    // Customization methods
    setSkinColor(color) {
        this.avatar.skinColor = color;
    }
    
    setHairColor(color) {
        this.avatar.hairColor = color;
    }
    
    setHairStyle(style) {
        this.avatar.hairStyle = style;
    }
    
    setFacialHair(style) {
        this.avatar.facialHair = style;
    }
    
    setShirtColor(color) {
        this.avatar.shirtColor = color;
    }
    
    setPantsColor(color) {
        this.avatar.pantsColor = color;
    }
    
    setHat(hat) {
        this.avatar.hat = hat;
    }
    
    setGlasses(glasses) {
        this.avatar.glasses = glasses;
    }
    
    // Randomize avatar
    randomizeAvatar() {
        const skinColors = ['#fdbcb4', '#f4c2a1', '#d08b5b', '#8d5524'];
        const hairColors = ['#8b4513', '#000000', '#ffd700', '#ff69b4', '#ffffff'];
        const hairStyles = ['short', 'long', 'mohawk', 'bald'];
        const facialHairs = ['none', 'beard', 'mustache', 'goatee'];
        const shirtColors = ['#2c3e50', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'];
        const pantsColors = ['#34495e', '#2c3e50', '#8b4513', '#000000'];
        const hats = ['none', 'cap', 'helmet', 'crown'];
        const glasses = ['none', 'sunglasses', 'regular'];
        
        this.avatar.skinColor = skinColors[Math.floor(Math.random() * skinColors.length)];
        this.avatar.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
        this.avatar.hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
        this.avatar.facialHair = facialHairs[Math.floor(Math.random() * facialHairs.length)];
        this.avatar.shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
        this.avatar.pantsColor = pantsColors[Math.floor(Math.random() * pantsColors.length)];
        this.avatar.hat = hats[Math.floor(Math.random() * hats.length)];
        this.avatar.glasses = glasses[Math.floor(Math.random() * glasses.length)];
    }
    
    // Get avatar data for saving
    getAvatarData() {
        return { ...this.avatar };
    }
    
    // Load avatar data
    loadAvatarData(data) {
        this.avatar = { ...data };
    }
}

// Global avatar instance
const playerAvatar = new PlayerAvatar();
