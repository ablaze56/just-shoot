// Modern Graphics System - Minecraft-style rendering
class GraphicsSystem {
    constructor() {
        this.lighting = {
            ambient: 0.3,
            directional: {
                x: 0.5,
                y: -1,
                z: 0.3,
                intensity: 0.7,
                color: [1.0, 0.95, 0.8] // Warm sunlight
            },
            pointLights: []
        };
        
        this.shadows = {
            enabled: true,
            resolution: 0.5,
            blur: 2,
            darkness: 0.3
        };
        
        this.particles = {
            maxParticles: 1000,
            systems: []
        };
        
        this.postProcessing = {
            bloom: true,
            ssao: true,
            fxaa: true,
            colorGrading: true
        };
        
        this.weather = {
            type: 'clear', // clear, rain, snow, fog
            intensity: 0,
            wind: { x: 0, y: 0 }
        };
        
        this.timeOfDay = 0.5; // 0 = midnight, 0.5 = noon, 1 = midnight
        this.dayLength = 120000; // 2 minutes for full day cycle
        
        this.initShaders();
    }
    
    initShaders() {
        // Create lighting shader
        this.lightingShader = this.createShader(`
            precision mediump float;
            varying vec2 vTexCoord;
            varying vec3 vNormal;
            varying vec3 vPosition;
            uniform vec3 uLightDirection;
            uniform vec3 uLightColor;
            uniform float uAmbient;
            uniform float uTime;
            
            void main() {
                // Calculate lighting
                float NdotL = max(dot(normalize(vNormal), normalize(-uLightDirection)), 0.0);
                vec3 lighting = uLightColor * NdotL + vec3(uAmbient);
                
                // Add some atmospheric scattering
                vec3 skyColor = mix(vec3(0.5, 0.7, 1.0), vec3(1.0, 0.8, 0.6), sin(uTime * 0.001) * 0.5 + 0.5);
                lighting = mix(lighting, skyColor, 0.1);
                
                gl_FragColor = vec4(lighting, 1.0);
            }
        `, `
            precision mediump float;
            attribute vec3 aPosition;
            attribute vec3 aNormal;
            attribute vec2 aTexCoord;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying vec2 vTexCoord;
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vPosition = aPosition;
                vNormal = aNormal;
                vTexCoord = aTexCoord;
                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
            }
        `);
    }
    
    createShader(fragmentSource, vertexSource) {
        // Simplified shader creation for canvas 2D context
        return {
            fragment: fragmentSource,
            vertex: vertexSource
        };
    }
    
    update(deltaTime) {
        // Update time of day
        this.timeOfDay += deltaTime / this.dayLength;
        if (this.timeOfDay > 1) this.timeOfDay = 0;
        
        // Update lighting based on time of day
        this.updateLighting();
        
        // Update weather
        this.updateWeather(deltaTime);
        
        // Update particles
        this.updateParticles(deltaTime);
    }
    
    updateLighting() {
        const sunAngle = this.timeOfDay * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle);
        
        // Update directional light
        this.lighting.directional.y = -sunHeight;
        this.lighting.directional.intensity = Math.max(0.1, sunHeight * 0.8 + 0.2);
        
        // Update ambient light
        this.lighting.ambient = Math.max(0.1, sunHeight * 0.3 + 0.1);
        
        // Update light color based on time
        if (sunHeight < 0) {
            // Night time - blue tint
            this.lighting.directional.color = [0.3, 0.4, 0.8];
        } else if (sunHeight < 0.2) {
            // Sunrise/sunset - orange/red tint
            this.lighting.directional.color = [1.0, 0.6, 0.3];
        } else {
            // Day time - warm white
            this.lighting.directional.color = [1.0, 0.95, 0.8];
        }
    }
    
    updateWeather(deltaTime) {
        if (this.weather.type === 'rain') {
            this.weather.wind.x += (Math.random() - 0.5) * 0.01;
            this.weather.wind.y += (Math.random() - 0.5) * 0.01;
            
            // Clamp wind
            this.weather.wind.x = Math.max(-0.5, Math.min(0.5, this.weather.wind.x));
            this.weather.wind.y = Math.max(-0.5, Math.min(0.5, this.weather.wind.y));
        }
    }
    
    updateParticles(deltaTime) {
        this.particles.systems.forEach(system => {
            system.update(deltaTime);
        });
    }
    
    // Render with modern graphics
    render() {
        // Clear with sky color
        this.clearWithSkyColor();
        
        // Render shadows
        if (this.shadows.enabled) {
            this.renderShadows();
        }
        
        // Render main scene
        this.renderMainScene();
        
        // Render particles
        this.renderParticles();
        
        // Render weather effects
        this.renderWeather();
        
        // Apply post-processing
        this.applyPostProcessing();
    }
    
    clearWithSkyColor() {
        const skyColor = this.getSkyColor();
        ctx.fillStyle = `rgb(${skyColor.r}, ${skyColor.g}, ${skyColor.b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    getSkyColor() {
        const sunHeight = Math.sin(this.timeOfDay * Math.PI * 2);
        
        if (sunHeight < 0) {
            // Night sky
            return { r: 20, g: 25, b: 40 };
        } else if (sunHeight < 0.2) {
            // Sunrise/sunset
            const factor = sunHeight / 0.2;
            return {
                r: 255 * factor + 20 * (1 - factor),
                g: 150 * factor + 25 * (1 - factor),
                b: 100 * factor + 40 * (1 - factor)
            };
        } else {
            // Day sky
            return { r: 135, g: 206, b: 235 };
        }
    }
    
    renderShadows() {
        // Create shadow map
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = this.shadows.darkness;
        
        // Render shadow for each object
        this.renderObjectShadows();
        
        ctx.restore();
    }
    
    renderObjectShadows() {
        // Render shadows for terrain elements
        terrainSystem.terrainElements.forEach(element => {
            if (element.castShadow) {
                this.renderShadow(element);
            }
        });
        
        // Render shadows for enemies
        enemies.forEach(enemy => {
            this.renderShadow(enemy);
        });
    }
    
    renderShadow(object) {
        const lightDir = this.lighting.directional;
        const shadowOffset = 10;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(
            object.x + lightDir.x * shadowOffset,
            object.y + lightDir.y * shadowOffset,
            object.width,
            object.height
        );
    }
    
    renderMainScene() {
        // Apply lighting to all objects
        ctx.save();
        
        // Set up lighting context
        this.setupLightingContext();
        
        // Render terrain with lighting
        this.renderTerrainWithLighting();
        
        // Render enemies with lighting
        this.renderEnemiesWithLighting();
        
        ctx.restore();
    }
    
    setupLightingContext() {
        // Apply global lighting
        const lightIntensity = this.lighting.directional.intensity;
        const lightColor = this.lighting.directional.color;
        const ambient = this.lighting.ambient;
        
        // Create lighting gradient
        const gradient = ctx.createRadialGradient(
            canvas.width * 0.5, canvas.height * 0.3,
            0,
            canvas.width * 0.5, canvas.height * 0.3,
            canvas.width * 0.8
        );
        
        gradient.addColorStop(0, `rgba(${lightColor[0] * 255}, ${lightColor[1] * 255}, ${lightColor[2] * 255}, ${lightIntensity})`);
        gradient.addColorStop(1, `rgba(${ambient * 255}, ${ambient * 255}, ${ambient * 255}, 0)`);
        
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = 'source-over';
    }
    
    renderTerrainWithLighting() {
        terrainSystem.terrainElements.forEach(element => {
            this.renderObjectWithLighting(element);
        });
    }
    
    renderEnemiesWithLighting() {
        enemies.forEach(enemy => {
            this.renderObjectWithLighting(enemy);
        });
    }
    
    renderObjectWithLighting(object) {
        // Calculate lighting for object
        const lightDir = this.lighting.directional;
        const lightIntensity = this.lighting.directional.intensity;
        const lightColor = this.lighting.directional.color;
        const ambient = this.lighting.ambient;
        
        // Calculate normal (simplified)
        const normal = { x: 0, y: -1, z: 0 };
        const NdotL = Math.max(0, normal.y * (-lightDir.y));
        
        // Calculate final color
        const r = Math.min(255, (lightColor[0] * NdotL + ambient) * 255);
        const g = Math.min(255, (lightColor[1] * NdotL + ambient) * 255);
        const b = Math.min(255, (lightColor[2] * NdotL + ambient) * 255);
        
        // Apply lighting to object
        ctx.save();
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(object.x, object.y, object.width, object.height);
        ctx.restore();
    }
    
    renderParticles() {
        this.particles.systems.forEach(system => {
            system.render();
        });
    }
    
    renderWeather() {
        switch (this.weather.type) {
            case 'rain':
                this.renderRain();
                break;
            case 'snow':
                this.renderSnow();
                break;
            case 'fog':
                this.renderFog();
                break;
        }
    }
    
    renderRain() {
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 200; i++) {
            const x = (i * 7) % canvas.width;
            const y = (i * 11 + Date.now() * 0.01) % canvas.height;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + this.weather.wind.x * 10, y + 20);
            ctx.stroke();
        }
    }
    
    renderSnow() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let i = 0; i < 100; i++) {
            const x = (i * 13) % canvas.width;
            const y = (i * 17 + Date.now() * 0.005) % canvas.height;
            
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderFog() {
        const gradient = ctx.createRadialGradient(
            canvas.width * 0.5, canvas.height * 0.5,
            0,
            canvas.width * 0.5, canvas.height * 0.5,
            canvas.width * 0.8
        );
        
        gradient.addColorStop(0, 'rgba(200, 200, 200, 0)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    applyPostProcessing() {
        if (this.postProcessing.bloom) {
            this.applyBloom();
        }
        
        if (this.postProcessing.fxaa) {
            this.applyFXAA();
        }
        
        if (this.postProcessing.colorGrading) {
            this.applyColorGrading();
        }
    }
    
    applyBloom() {
        // Simplified bloom effect
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.3;
        ctx.filter = 'blur(2px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.restore();
    }
    
    applyFXAA() {
        // Simplified anti-aliasing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
    }
    
    applyColorGrading() {
        // Apply color grading based on time of day
        const sunHeight = Math.sin(this.timeOfDay * Math.PI * 2);
        
        if (sunHeight < 0) {
            // Night - blue tint
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgba(0.7, 0.8, 1.0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        } else if (sunHeight < 0.2) {
            // Sunrise/sunset - warm tint
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgba(1.0, 0.8, 0.6, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }
    
    // Add particle system
    addParticleSystem(system) {
        this.particles.systems.push(system);
    }
    
    // Set weather
    setWeather(type, intensity = 1) {
        this.weather.type = type;
        this.weather.intensity = intensity;
    }
    
    // Get current time of day (0-1)
    getTimeOfDay() {
        return this.timeOfDay;
    }
    
    // Set time of day
    setTimeOfDay(time) {
        this.timeOfDay = Math.max(0, Math.min(1, time));
    }
}

// Global graphics system
const graphicsSystem = new GraphicsSystem();
