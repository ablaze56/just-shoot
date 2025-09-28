// Weapons System
class WeaponSystem {
    constructor() {
        this.weapons = {
            pistol: {
                name: "Glock 17",
                damage: 35,
                fireRate: 400,
                ammo: 17,
                maxAmmo: 17,
                reloadTime: 2000,
                bulletSpeed: 5,
                accuracy: 0.95,
                range: 200,
                recoil: 0.1,
                type: "pistol"
            },
            rifle: {
                name: "AK-47",
                damage: 45,
                fireRate: 200,
                ammo: 30,
                maxAmmo: 30,
                reloadTime: 2500,
                bulletSpeed: 8,
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
                bulletSpeed: 12,
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
                bulletSpeed: 4,
                accuracy: 0.6,
                range: 100,
                recoil: 0.5,
                pellets: 8,
                type: "shotgun"
            }
        };
    }
    
    getWeapon(type) {
        return { ...this.weapons[type] };
    }
    
    getAllWeapons() {
        return Object.keys(this.weapons);
    }
}

// Global weapon system instance
const weaponSystem = new WeaponSystem();
