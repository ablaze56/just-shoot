// Magic Items System - Masks and Swords with special abilities
class MagicItemSystem {
    constructor() {
        this.magicMasks = {
            shadowMask: {
                name: "Shadow Mask",
                description: "Become invisible for 5 seconds",
                icon: "🎭",
                color: "#4a4a4a",
                ability: "invisibility",
                duration: 5000,
                cooldown: 15000,
                rarity: "rare"
            },
            fireMask: {
                name: "Fire Mask",
                description: "Shoot fireballs that burn enemies",
                icon: "🔥",
                color: "#ff4500",
                ability: "fireball",
                damage: 60,
                burnDamage: 10,
                burnDuration: 3000,
                rarity: "epic"
            },
            iceMask: {
                name: "Ice Mask",
                description: "Freeze enemies in place",
                icon: "❄️",
                color: "#00bfff",
                ability: "freeze",
                freezeDuration: 4000,
                slowEffect: 0.3,
                rarity: "rare"
            },
            lightningMask: {
                name: "Lightning Mask",
                description: "Chain lightning between enemies",
                icon: "⚡",
                color: "#ffff00",
                ability: "lightning",
                chainCount: 3,
                damage: 40,
                rarity: "legendary"
            },
            healingMask: {
                name: "Healing Mask",
                description: "Regenerate health over time",
                icon: "💚",
                color: "#32cd32",
                ability: "regeneration",
                healPerSecond: 5,
                duration: 10000,
                rarity: "common"
            }
        };

        this.magicSwords = {
            flameSword: {
                name: "Flame Sword",
                description: "Melee weapon with fire damage",
                icon: "🔥⚔️",
                color: "#ff6347",
                damage: 80,
                range: 60,
                fireDamage: 15,
                fireDuration: 2000,
                swingSpeed: 800,
                rarity: "rare"
            },
            frostSword: {
                name: "Frost Sword",
                description: "Freezes enemies on hit",
                icon: "❄️⚔️",
                color: "#87ceeb",
                damage: 70,
                range: 60,
                freezeChance: 0.7,
                freezeDuration: 2000,
                swingSpeed: 1000,
                rarity: "rare"
            },
            lightningSword: {
                name: "Lightning Sword",
                description: "Chain lightning on hit",
                icon: "⚡⚔️",
                color: "#ffd700",
                damage: 90,
                range: 60,
                chainDamage: 30,
                chainCount: 2,
                swingSpeed: 600,
                rarity: "epic"
            },
            shadowSword: {
                name: "Shadow Sword",
                description: "Teleport behind enemies",
                icon: "🌑⚔️",
                color: "#2f2f2f",
                damage: 100,
                range: 80,
                teleportRange: 150,
                swingSpeed: 500,
                rarity: "legendary"
            },
            healingSword: {
                name: "Healing Sword",
                description: "Heals you when you hit enemies",
                icon: "💚⚔️",
                color: "#90ee90",
                damage: 60,
                range: 60,
                healAmount: 20,
                swingSpeed: 1200,
                rarity: "common"
            }
        };

        this.activeAbilities = [];
        this.itemCooldowns = {};
    }

    // Get random magic mask
    getRandomMask() {
        const masks = Object.keys(this.magicMasks);
        const randomMask = masks[Math.floor(Math.random() * masks.length)];
        return { ...this.magicMasks[randomMask], type: 'mask' };
    }

    // Get random magic sword
    getRandomSword() {
        const swords = Object.keys(this.magicSwords);
        const randomSword = swords[Math.floor(Math.random() * swords.length)];
        return { ...this.magicSwords[randomSword], type: 'sword' };
    }

    // Activate mask ability
    activateMaskAbility(mask, player) {
        const maskData = this.magicMasks[mask.name.toLowerCase().replace(/\s+/g, '')];
        if (!maskData) return;

        const cooldownKey = `mask_${mask.name}`;
        if (this.itemCooldowns[cooldownKey] && Date.now() - this.itemCooldowns[cooldownKey] < maskData.cooldown) {
            return; // Still on cooldown
        }

        this.itemCooldowns[cooldownKey] = Date.now();

        switch (maskData.ability) {
            case 'invisibility':
                this.activateInvisibility(player, maskData.duration);
                break;
            case 'fireball':
                this.activateFireball(player, maskData);
                break;
            case 'freeze':
                this.activateFreeze(player, maskData);
                break;
            case 'lightning':
                this.activateLightning(player, maskData);
                break;
            case 'regeneration':
                this.activateRegeneration(player, maskData);
                break;
        }
    }

    // Activate sword ability
    activateSwordAbility(sword, player, targetX, targetY) {
        const swordData = this.magicSwords[sword.name.toLowerCase().replace(/\s+/g, '')];
        if (!swordData) return;

        switch (swordData.name) {
            case 'Flame Sword':
                this.swingFlameSword(player, targetX, targetY, swordData);
                break;
            case 'Frost Sword':
                this.swingFrostSword(player, targetX, targetY, swordData);
                break;
            case 'Lightning Sword':
                this.swingLightningSword(player, targetX, targetY, swordData);
                break;
            case 'Shadow Sword':
                this.swingShadowSword(player, targetX, targetY, swordData);
                break;
            case 'Healing Sword':
                this.swingHealingSword(player, targetX, targetY, swordData);
                break;
        }
    }

    // Mask Abilities
    activateInvisibility(player, duration) {
        player.isInvisible = true;
        player.invisibilityEndTime = Date.now() + duration;
        
        // Add visual effect
        this.activeAbilities.push({
            type: 'invisibility',
            player: player,
            endTime: Date.now() + duration
        });
    }

    activateFireball(player, maskData) {
        const angle = Math.atan2(mouseY - (player.y + player.height/2), mouseX - (player.x + player.width/2));
        
        // Create fireball projectile
        bullets.push(new Fireball(
            player.x + player.width/2,
            player.y + player.height/2,
            Math.cos(angle) * 8,
            Math.sin(angle) * 8,
            'player',
            maskData.damage,
            maskData.burnDamage,
            maskData.burnDuration
        ));
    }

    activateFreeze(player, maskData) {
        // Freeze all nearby enemies
        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                enemy.isFrozen = true;
                enemy.freezeEndTime = Date.now() + maskData.freezeDuration;
                enemy.speed *= maskData.slowEffect;
            }
        });
    }

    activateLightning(player, maskData) {
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nearestDistance && distance < 300) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            this.createLightningChain(player, nearestEnemy, maskData, 0);
        }
    }

    createLightningChain(source, target, maskData, chainCount) {
        if (chainCount >= maskData.chainCount) return;

        // Damage target
        target.takeDamage(maskData.damage);
        
        // Create lightning effect
        this.activeAbilities.push({
            type: 'lightning',
            startX: source.x + source.width/2,
            startY: source.y + source.height/2,
            endX: target.x + target.width/2,
            endY: target.y + target.height/2,
            endTime: Date.now() + 500
        });

        // Find next target for chain
        let nextTarget = null;
        let nextDistance = Infinity;
        
        enemies.forEach(enemy => {
            if (enemy === target) return;
            
            const dx = enemy.x - target.x;
            const dy = enemy.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nextDistance && distance < 150) {
                nextDistance = distance;
                nextTarget = enemy;
            }
        });

        if (nextTarget) {
            setTimeout(() => {
                this.createLightningChain(target, nextTarget, maskData, chainCount + 1);
            }, 200);
        }
    }

    activateRegeneration(player, maskData) {
        this.activeAbilities.push({
            type: 'regeneration',
            player: player,
            healPerSecond: maskData.healPerSecond,
            endTime: Date.now() + maskData.duration
        });
    }

    // Sword Abilities
    swingFlameSword(player, targetX, targetY, swordData) {
        const angle = Math.atan2(targetY - (player.y + player.height/2), targetX - (player.x + player.width/2));
        
        // Create flame sword swing
        this.activeAbilities.push({
            type: 'flameSword',
            player: player,
            angle: angle,
            damage: swordData.damage,
            range: swordData.range,
            fireDamage: swordData.fireDamage,
            fireDuration: swordData.fireDuration,
            endTime: Date.now() + 300
        });
    }

    swingFrostSword(player, targetX, targetY, swordData) {
        const angle = Math.atan2(targetY - (player.y + player.height/2), targetX - (player.x + player.width/2));
        
        this.activeAbilities.push({
            type: 'frostSword',
            player: player,
            angle: angle,
            damage: swordData.damage,
            range: swordData.range,
            freezeChance: swordData.freezeChance,
            freezeDuration: swordData.freezeDuration,
            endTime: Date.now() + 300
        });
    }

    swingLightningSword(player, targetX, targetY, swordData) {
        const angle = Math.atan2(targetY - (player.y + player.height/2), targetX - (player.x + player.width/2));
        
        this.activeAbilities.push({
            type: 'lightningSword',
            player: player,
            angle: angle,
            damage: swordData.damage,
            range: swordData.range,
            chainDamage: swordData.chainDamage,
            chainCount: swordData.chainCount,
            endTime: Date.now() + 300
        });
    }

    swingShadowSword(player, targetX, targetY, swordData) {
        // Teleport behind nearest enemy
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nearestDistance && distance < swordData.teleportRange) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            // Teleport behind enemy
            const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
            player.x = nearestEnemy.x - Math.cos(angle) * 40;
            player.y = nearestEnemy.y - Math.sin(angle) * 40;
            
            // Damage enemy
            nearestEnemy.takeDamage(swordData.damage);
            
            // Create teleport effect
            this.activeAbilities.push({
                type: 'shadowTeleport',
                startX: player.x,
                startY: player.y,
                endTime: Date.now() + 500
            });
        }
    }

    swingHealingSword(player, targetX, targetY, swordData) {
        const angle = Math.atan2(targetY - (player.y + player.height/2), targetX - (player.x + player.width/2));
        
        this.activeAbilities.push({
            type: 'healingSword',
            player: player,
            angle: angle,
            damage: swordData.damage,
            range: swordData.range,
            healAmount: swordData.healAmount,
            endTime: Date.now() + 300
        });
    }

    // Update active abilities
    update() {
        const now = Date.now();
        
        // Update invisibility
        if (player.isInvisible && now > player.invisibilityEndTime) {
            player.isInvisible = false;
        }

        // Update regeneration
        this.activeAbilities = this.activeAbilities.filter(ability => {
            if (ability.type === 'regeneration' && now < ability.endTime) {
                if (now % 1000 < 50) { // Heal every second
                    ability.player.health = Math.min(ability.player.maxHealth, 
                        ability.player.health + ability.healPerSecond);
                }
                return true;
            }
            return now < ability.endTime;
        });

        // Update frozen enemies
        enemies.forEach(enemy => {
            if (enemy.isFrozen && now > enemy.freezeEndTime) {
                enemy.isFrozen = false;
                enemy.speed = enemy.originalSpeed || enemy.speed;
            }
        });
    }

    // Draw active abilities
    draw() {
        this.activeAbilities.forEach(ability => {
            switch (ability.type) {
                case 'lightning':
                    this.drawLightning(ability.startX, ability.startY, ability.endX, ability.endY);
                    break;
                case 'shadowTeleport':
                    this.drawShadowTeleport(ability.startX, ability.startY);
                    break;
            }
        });
    }

    drawLightning(startX, startY, endX, endY) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Create jagged lightning effect
        const segments = 8;
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 20;
            const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 20;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawShadowTeleport(x, y) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Fireball projectile class
class Fireball {
    constructor(x, y, vx, vy, owner, damage, burnDamage, burnDuration) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.damage = damage;
        this.burnDamage = burnDamage;
        this.burnDuration = burnDuration;
        this.radius = 8;
        this.color = '#ff4500';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height;
    }
}

// Global magic item system
const magicItemSystem = new MagicItemSystem();
