// Avatar Customization Interface
class AvatarCustomizer {
    constructor() {
        this.isOpen = false;
        this.currentTab = 'appearance';
        this.customizationOptions = {
            skinColors: ['#fdbcb4', '#f4c2a1', '#d08b5b', '#8d5524'],
            hairColors: ['#8b4513', '#000000', '#ffd700', '#ff69b4', '#ffffff'],
            hairStyles: ['short', 'long', 'mohawk', 'bald'],
            facialHairs: ['none', 'beard', 'mustache', 'goatee'],
            shirtColors: ['#2c3e50', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'],
            pantsColors: ['#34495e', '#2c3e50', '#8b4513', '#000000'],
            hats: ['none', 'cap', 'helmet', 'crown'],
            glasses: ['none', 'sunglasses', 'regular']
        };
    }
    
    // Open customization menu
    open() {
        this.isOpen = true;
        this.createCustomizationUI();
    }
    
    // Close customization menu
    close() {
        this.isOpen = false;
        this.removeCustomizationUI();
    }
    
    // Create customization UI
    createCustomizationUI() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'avatarCustomizer';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // Create customization panel
        const panel = document.createElement('div');
        panel.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 15px;
            max-width: 80%;
            max-height: 80%;
            overflow-y: auto;
            color: white;
            font-family: Arial, sans-serif;
        `;
        
        panel.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 20px;">🎭 Customize Your Avatar</h2>
            
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <button class="tab-btn" data-tab="appearance" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">Appearance</button>
                <button class="tab-btn" data-tab="clothing" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">Clothing</button>
                <button class="tab-btn" data-tab="accessories" style="padding: 10px 20px; background: #f39c12; color: white; border: none; border-radius: 5px; cursor: pointer;">Accessories</button>
            </div>
            
            <div id="customization-content"></div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button id="randomize-avatar" style="padding: 10px 20px; background: #9b59b6; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">🎲 Randomize</button>
                <button id="save-avatar" style="padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">💾 Save</button>
                <button id="close-customizer" style="padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">❌ Close</button>
            </div>
        `;
        
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        
        // Add event listeners
        this.addEventListeners();
        this.updateContent();
    }
    
    // Add event listeners
    addEventListeners() {
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTab = e.target.dataset.tab;
                this.updateContent();
                this.updateTabButtons();
            });
        });
        
        // Action buttons
        document.getElementById('randomize-avatar').addEventListener('click', () => {
            playerAvatar.randomizeAvatar();
            this.updateContent();
        });
        
        document.getElementById('save-avatar').addEventListener('click', () => {
            this.saveAvatar();
            this.close();
        });
        
        document.getElementById('close-customizer').addEventListener('click', () => {
            this.close();
        });
    }
    
    // Update tab buttons
    updateTabButtons() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.style.background = btn.dataset.tab === this.currentTab ? '#2c3e50' : '#95a5a6';
        });
    }
    
    // Update content based on current tab
    updateContent() {
        const content = document.getElementById('customization-content');
        
        switch(this.currentTab) {
            case 'appearance':
                content.innerHTML = this.getAppearanceContent();
                break;
            case 'clothing':
                content.innerHTML = this.getClothingContent();
                break;
            case 'accessories':
                content.innerHTML = this.getAccessoriesContent();
                break;
        }
        
        // Re-add event listeners for new content
        this.addContentEventListeners();
    }
    
    // Get appearance customization content
    getAppearanceContent() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div>
                    <h3>Skin Color</h3>
                    <div class="color-options">
                        ${this.customizationOptions.skinColors.map(color => 
                            `<div class="color-option" data-type="skinColor" data-value="${color}" style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; display: inline-block; margin: 5px; cursor: pointer; border: 3px solid ${color === playerAvatar.avatar.skinColor ? '#fff' : 'transparent'};"></div>`
                        ).join('')}
                    </div>
                </div>
                
                <div>
                    <h3>Hair Color</h3>
                    <div class="color-options">
                        ${this.customizationOptions.hairColors.map(color => 
                            `<div class="color-option" data-type="hairColor" data-value="${color}" style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; display: inline-block; margin: 5px; cursor: pointer; border: 3px solid ${color === playerAvatar.avatar.hairColor ? '#fff' : 'transparent'};"></div>`
                        ).join('')}
                    </div>
                </div>
                
                <div>
                    <h3>Hair Style</h3>
                    <div class="option-buttons">
                        ${this.customizationOptions.hairStyles.map(style => 
                            `<button class="option-btn" data-type="hairStyle" data-value="${style}" style="padding: 8px 16px; margin: 5px; background: ${style === playerAvatar.avatar.hairStyle ? '#2c3e50' : '#95a5a6'}; color: white; border: none; border-radius: 5px; cursor: pointer;">${style}</button>`
                        ).join('')}
                    </div>
                </div>
                
                <div>
                    <h3>Facial Hair</h3>
                    <div class="option-buttons">
                        ${this.customizationOptions.facialHairs.map(style => 
                            `<button class="option-btn" data-type="facialHair" data-value="${style}" style="padding: 8px 16px; margin: 5px; background: ${style === playerAvatar.avatar.facialHair ? '#2c3e50' : '#95a5a6'}; color: white; border: none; border-radius: 5px; cursor: pointer;">${style}</button>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get clothing customization content
    getClothingContent() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div>
                    <h3>Shirt Color</h3>
                    <div class="color-options">
                        ${this.customizationOptions.shirtColors.map(color => 
                            `<div class="color-option" data-type="shirtColor" data-value="${color}" style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; display: inline-block; margin: 5px; cursor: pointer; border: 3px solid ${color === playerAvatar.avatar.shirtColor ? '#fff' : 'transparent'};"></div>`
                        ).join('')}
                    </div>
                </div>
                
                <div>
                    <h3>Pants Color</h3>
                    <div class="color-options">
                        ${this.customizationOptions.pantsColors.map(color => 
                            `<div class="color-option" data-type="pantsColor" data-value="${color}" style="background: ${color}; width: 40px; height: 40px; border-radius: 50%; display: inline-block; margin: 5px; cursor: pointer; border: 3px solid ${color === playerAvatar.avatar.pantsColor ? '#fff' : 'transparent'};"></div>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get accessories customization content
    getAccessoriesContent() {
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div>
                    <h3>Hat</h3>
                    <div class="option-buttons">
                        ${this.customizationOptions.hats.map(hat => 
                            `<button class="option-btn" data-type="hat" data-value="${hat}" style="padding: 8px 16px; margin: 5px; background: ${hat === playerAvatar.avatar.hat ? '#2c3e50' : '#95a5a6'}; color: white; border: none; border-radius: 5px; cursor: pointer;">${hat}</button>`
                        ).join('')}
                    </div>
                </div>
                
                <div>
                    <h3>Glasses</h3>
                    <div class="option-buttons">
                        ${this.customizationOptions.glasses.map(glasses => 
                            `<button class="option-btn" data-type="glasses" data-value="${glasses}" style="padding: 8px 16px; margin: 5px; background: ${glasses === playerAvatar.avatar.glasses ? '#2c3e50' : '#95a5a6'}; color: white; border: none; border-radius: 5px; cursor: pointer;">${glasses}</button>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add event listeners for content
    addContentEventListeners() {
        // Color options
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const value = e.target.dataset.value;
                
                // Update avatar
                playerAvatar.avatar[type] = value;
                
                // Update selection
                document.querySelectorAll(`[data-type="${type}"]`).forEach(opt => {
                    opt.style.border = '3px solid transparent';
                });
                e.target.style.border = '3px solid #fff';
            });
        });
        
        // Option buttons
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const value = e.target.dataset.value;
                
                // Update avatar
                playerAvatar.avatar[type] = value;
                
                // Update selection
                document.querySelectorAll(`[data-type="${type}"]`).forEach(button => {
                    button.style.background = '#95a5a6';
                });
                e.target.style.background = '#2c3e50';
            });
        });
    }
    
    // Save avatar
    saveAvatar() {
        localStorage.setItem('playerAvatar', JSON.stringify(playerAvatar.getAvatarData()));
    }
    
    // Load avatar
    loadAvatar() {
        const saved = localStorage.getItem('playerAvatar');
        if (saved) {
            playerAvatar.loadAvatarData(JSON.parse(saved));
        }
    }
    
    // Remove customization UI
    removeCustomizationUI() {
        const customizer = document.getElementById('avatarCustomizer');
        if (customizer) {
            customizer.remove();
        }
    }
}

// Global avatar customizer instance
const avatarCustomizer = new AvatarCustomizer();
