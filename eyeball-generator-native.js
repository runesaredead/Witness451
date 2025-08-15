// Generative Abstract Eyeballs - Native Canvas Version
// No external dependencies - perfect for Bitcoin inscription

// Seeded random number generator
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    // Linear congruential generator
    next() {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
    
    // Random float between min and max
    range(min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return min + this.next() * (max - min);
    }
    
    // Random integer between min and max (inclusive)
    int(min, max) {
        return Math.floor(this.range(min, max + 1));
    }
    
    // Random choice from array
    choice(array) {
        return array[this.int(0, array.length - 1)];
    }
    
    // Random boolean with probability
    boolean(probability = 0.5) {
        return this.next() < probability;
    }
}

// Canvas helper functions to replace p5.js
class CanvasHelper {
    constructor(ctx) {
        this.ctx = ctx;
        this.TWO_PI = Math.PI * 2;
        this.PI = Math.PI;
    }
    
    // Math functions
    sin(x) { return Math.sin(x); }
    cos(x) { return Math.cos(x); }
    map(value, start1, stop1, start2, stop2) {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    }
    lerp(start, stop, amt) {
        return start + (stop - start) * amt;
    }
    
    // Drawing state
    push() { this.ctx.save(); }
    pop() { this.ctx.restore(); }
    translate(x, y) { this.ctx.translate(x, y); }
    rotate(angle) { this.ctx.rotate(angle); }
    
    // Background
    background(r, g, b) {
        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    
    // Fill and stroke
    fill(r, g, b, a = 255) {
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a/255})`;
    }
    
    stroke(r, g, b, a = 255) {
        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a/255})`;
    }
    
    strokeWeight(weight) {
        this.ctx.lineWidth = weight;
    }
    
    noStroke() {
        this.ctx.strokeStyle = 'transparent';
    }
    
    noFill() {
        this.ctx.fillStyle = 'transparent';
    }
    
    // Basic shapes
    ellipse(x, y, w, h = w) {
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, w/2, h/2, 0, 0, this.TWO_PI);
        this.ctx.fill();
    }
    
    line(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }
    
    rect(x, y, w, h) {
        this.ctx.fillRect(x - w/2, y - h/2, w, h);
    }
    
    rectMode(mode) {
        // CENTER mode is default in our implementation
    }
    
    // Path functions
    beginShape() {
        this.ctx.beginPath();
    }
    
    endShape(close = false) {
        if (close) this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    vertex(x, y) {
        if (this.firstVertex) {
            this.ctx.moveTo(x, y);
            this.firstVertex = false;
        } else {
            this.ctx.lineTo(x, y);
        }
    }
    
    triangle(x1, y1, x2, y2, x3, y3) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

class Eyeball {
    constructor(seed, canvasWidth = 300, canvasHeight = 300) {
        this.w = canvasWidth;
        this.h = canvasHeight;
        this.centerX = this.w / 2;
        this.centerY = this.h / 2;
        this.seed = seed;
        
        // Initialize seeded random generator
        this.rng = new SeededRandom(seed);
        
        // Generate random properties for this eyeball
        this.generateProperties();
        
        // Animation properties
        this.time = 0;
        this.animationSpeed = this.rng.range(0.01, 0.05);
    }
    
    generateProperties() {
        // Eye socket shape and size
        this.socketShape = this.rng.choice(['circle', 'oval', 'diamond', 'almond', 'star', 'hexagon']);
        this.socketSize = this.rng.range(80, 140);
        this.socketColor = this.generateColor('socket');
        
        // Sclera (white part) properties
        this.scleraColor = this.generateColor('sclera');
        this.scleraTexture = this.rng.choice(['smooth', 'veined', 'cloudy', 'metallic', 'crystalline']);
        
        // Iris properties
        this.irisSize = this.rng.range(40, 80);
        this.irisShape = this.rng.choice(['circle', 'oval', 'star', 'diamond', 'octagon', 'spiral']);
        this.irisColor1 = this.generateColor('iris');
        this.irisColor2 = this.generateColor('iris');
        this.irisPattern = this.rng.choice(['solid', 'radial', 'spiral', 'geometric', 'fractal', 'crystalline', 'void']);
        
        // Pupil properties
        this.pupilSize = this.rng.range(15, 35);
        this.pupilShape = this.rng.choice(['circle', 'slit', 'star', 'cross', 'diamond', 'multiple', 'void']);
        this.pupilColor = this.generateColor('pupil');
        
        // Special effects
        this.hasGlow = this.rng.boolean(0.6);
        this.hasLaser = this.rng.boolean(0.3);
        this.hasAura = this.rng.boolean(0.4);
        this.hasParticles = this.rng.boolean(0.5);
        this.hasLightning = this.rng.boolean(0.2);
        
        // Animation intensity (all eyes animate, but at different energy levels)
        this.animationEnergy = this.rng.range(0.1, 1.0); // 0.1 = very subtle, 1.0 = high energy
        
        // Effect colors
        this.effectColor = this.generateColor('effect');
        this.laserColor = this.generateColor('laser');
        this.auraColor = this.generateColor('aura');
        
        // Style variations
        this.style = this.rng.choice(['organic', 'mechanical', 'cosmic', 'demonic', 'angelic', 'digital', 'crystal']);
        this.intensity = this.rng.range(0.5, 1.5);
        
        // Generate metadata traits
        this.generateMetadata();
    }
    
    generateMetadata() {
        this.metadata = {
            traits: []
        };
        
        // Portal Frame (Socket)
        const portalTypes = {
            'circle': 'Eternal Circle',
            'oval': 'Mystic Oval', 
            'diamond': 'Crystal Diamond',
            'almond': 'Ancient Almond',
            'star': 'Stellar Gateway',
            'hexagon': 'Sacred Hexagon'
        };
        const portalRarity = Math.round((this.socketSize - 80) / (140 - 80) * 10) / 10;
        this.metadata.traits.push({
            name: "Portal Frame",
            value: `${portalTypes[this.socketShape]} (${portalRarity})`
        });
        
        // Sclera Essence
        const scleraNames = {
            'smooth': 'Pure Essence',
            'veined': 'Bloodbound Veins',
            'cloudy': 'Ethereal Mist',
            'metallic': 'Liquid Metal',
            'crystalline': 'Crystal Matrix'
        };
        const scleraColor = this.getColorName(this.scleraColor);
        this.metadata.traits.push({
            name: "Sclera Essence",
            value: `${scleraColor} ${scleraNames[this.scleraTexture]} (${this.rng.range(1, 10).toFixed(1)})`
        });
        
        // Iris Constellation
        const irisPatterns = {
            'solid': 'Void Core',
            'radial': 'Stellar Burst',
            'spiral': 'Cosmic Spiral',
            'geometric': 'Sacred Geometry',
            'fractal': 'Infinite Fractal',
            'crystalline': 'Crystal Lattice',
            'void': 'Abyssal Void'
        };
        const irisRarity = Math.round((this.irisSize - 40) / (80 - 40) * 10) / 10;
        const irisColor = this.getColorName(this.irisColor1);
        this.metadata.traits.push({
            name: "Iris Constellation",
            value: `${irisColor} ${irisPatterns[this.irisPattern]} (${irisRarity})`
        });
        
        // Pupil Gate
        const pupilTypes = {
            'circle': 'Eternal Portal',
            'slit': 'Dragon Slit',
            'star': 'Celestial Star',
            'cross': 'Divine Cross',
            'diamond': 'Soul Diamond',
            'multiple': 'Trinity Gates',
            'void': 'Chaos Void'
        };
        const pupilRarity = Math.round((this.pupilSize - 15) / (35 - 15) * 10) / 10;
        const pupilColor = this.getColorName(this.pupilColor);
        this.metadata.traits.push({
            name: "Pupil Gate",
            value: `${pupilColor} ${pupilTypes[this.pupilShape]} (${pupilRarity})`
        });
        
        // Arcane Powers - only report effects that are guaranteed to be visible
        const powers = [];
        if (this.hasGlow) powers.push('Ethereal Glow');
        if (this.hasLaser) powers.push('Laser Beam');
        if (this.hasAura) powers.push('Energy Aura');
        if (this.hasParticles) powers.push('Particle Storm');
        if (this.hasLightning) powers.push('Lightning Strike');
        
        if (powers.length > 0) {
            const powerLevel = powers.length * 2.0 + this.rng.range(0, 2);
            this.metadata.traits.push({
                name: "Arcane Powers",
                value: `${powers.join(' + ')} (${powerLevel.toFixed(1)})`
            });
        } else {
            // If no powers, add a "Pure" trait
            this.metadata.traits.push({
                name: "Arcane Powers",
                value: "Pure Essence (1.0)"
            });
        }
        
        // Essence Type
        const essenceTypes = {
            'organic': 'Living Essence',
            'mechanical': 'Cyber Matrix',
            'cosmic': 'Stellar Origin',
            'demonic': 'Infernal Soul',
            'angelic': 'Divine Light',
            'digital': 'Data Stream',
            'crystal': 'Crystal Core'
        };
        const intensityValue = (this.intensity * 10).toFixed(1);
        this.metadata.traits.push({
            name: "Essence Type",
            value: `${essenceTypes[this.style]} (${intensityValue})`
        });
    }
    
    getColorName(rgb) {
        const [r, g, b] = rgb;
        
        // Define color ranges and names
        if (r > 200 && g > 200 && b > 200) return "Ivory";
        if (r < 50 && g < 50 && b < 50) return "Obsidian";
        if (r > 200 && g < 100 && b < 100) return "Crimson";
        if (r < 100 && g > 200 && b < 100) return "Emerald";
        if (r < 100 && g < 100 && b > 200) return "Sapphire";
        if (r > 200 && g > 200 && b < 100) return "Golden";
        if (r > 200 && g < 100 && b > 200) return "Amethyst";
        if (r < 100 && g > 200 && b > 200) return "Turquoise";
        if (r > 150 && g > 100 && b < 100) return "Copper";
        if (r > 100 && g > 150 && b < 100) return "Jade";
        if (r < 100 && g > 100 && b > 150) return "Azure";
        if (r > 150 && g < 100 && b > 100) return "Rose";
        if (r > 100 && g < 100 && b > 150) return "Violet";
        if (r > 100 && g > 100 && b > 100) return "Silver";
        if (r > 150) return "Ruby";
        if (g > 150) return "Verdant";
        if (b > 150) return "Cobalt";
        
        return "Mystic";
    }
    
    generateColor(type) {
        const colorPalettes = {
            socket: [
                [20, 20, 30], [40, 0, 60], [60, 20, 0], [0, 30, 50],
                [80, 80, 80], [30, 30, 30], [10, 50, 30]
            ],
            sclera: [
                [255, 255, 255], [240, 240, 255], [255, 240, 240], [200, 255, 200],
                [50, 50, 60], [100, 100, 120], [80, 80, 100], [255, 200, 150]
            ],
            iris: [
                [0, 150, 255], [255, 0, 150], [150, 255, 0], [255, 150, 0],
                [200, 0, 200], [0, 255, 200], [255, 255, 0], [150, 0, 255],
                [255, 100, 100], [100, 255, 100], [100, 100, 255], [255, 0, 0],
                [0, 255, 0], [0, 0, 255], [255, 255, 255], [50, 255, 150]
            ],
            pupil: [
                [0, 0, 0], [20, 0, 40], [40, 0, 0], [0, 20, 40],
                [255, 255, 255], [255, 0, 0], [0, 255, 255], [255, 255, 0]
            ],
            effect: [
                [255, 0, 255], [0, 255, 255], [255, 255, 0], [255, 100, 0],
                [100, 255, 100], [255, 50, 150], [150, 100, 255], [255, 200, 0]
            ],
            laser: [
                [255, 0, 0], [0, 255, 0], [0, 100, 255], [255, 0, 255],
                [255, 255, 0], [255, 100, 0], [100, 255, 255]
            ],
            aura: [
                [100, 0, 255], [255, 0, 100], [0, 255, 100], [255, 200, 0],
                [0, 200, 255], [255, 0, 200], [200, 255, 0]
            ]
        };
        
        const palette = colorPalettes[type] || colorPalettes.iris;
        const baseColor = this.rng.choice(palette);
        
        // Add some random variation
        const constrain = (val, min, max) => Math.min(max, Math.max(min, val));
        return [
            constrain(baseColor[0] + this.rng.range(-30, 30), 0, 255),
            constrain(baseColor[1] + this.rng.range(-30, 30), 0, 255),
            constrain(baseColor[2] + this.rng.range(-30, 30), 0, 255)
        ];
    }
    
    draw(ctx) {
        const p = new CanvasHelper(ctx);
        
        // Update animation (all eyes animate, but at different energy levels)
        this.time += this.animationSpeed * this.animationEnergy;
        
        // Clear background
        p.background(10, 10, 15);
        
        // Draw outer glow effect
        if (this.hasGlow) {
            this.drawGlow(p);
        }
        
        // Draw aura
        if (this.hasAura) {
            this.drawAura(p);
        }
        
        // Draw eye socket
        this.drawSocket(p);
        
        // Draw sclera
        this.drawSclera(p);
        
        // Draw iris
        this.drawIris(p);
        
        // Draw pupil
        this.drawPupil(p);
        
        // Draw reflections and highlights
        this.drawHighlights(p);
        
        // Draw special effects LAST (front layer) - never covered by anything
        if (this.hasLaser) {
            this.drawLaser(p);
        }
        
        if (this.hasParticles) {
            this.drawParticles(p);
        }
        
        if (this.hasLightning) {
            this.drawLightning(p);
        }
    }
    
    drawSocket(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        if (this.hasGlow) {
            for (let i = 5; i > 0; i--) {
                p.fill(this.socketColor[0], this.socketColor[1], this.socketColor[2], 50 - i * 8);
                this.drawShape(p, this.socketShape, this.socketSize + i * 10);
            }
        }
        
        p.fill(this.socketColor[0], this.socketColor[1], this.socketColor[2]);
        this.drawShape(p, this.socketShape, this.socketSize);
        p.pop();
    }
    
    drawSclera(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        // Add texture based on scleraTexture
        if (this.scleraTexture === 'veined') {
            this.drawVeins(p);
        }
        
        const scleraSize = this.socketSize * 0.85;
        p.fill(this.scleraColor[0], this.scleraColor[1], this.scleraColor[2]);
        
        if (this.scleraTexture === 'metallic') {
            // Metallic gradient
            for (let i = 0; i < scleraSize; i += 2) {
                const alpha = p.map(i, 0, scleraSize, 255, 100);
                p.fill(this.scleraColor[0], this.scleraColor[1], this.scleraColor[2], alpha);
                this.drawShape(p, this.socketShape, scleraSize - i);
            }
        } else {
            this.drawShape(p, this.socketShape, scleraSize);
        }
        
        p.pop();
    }
    
    drawIris(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        // Animated movement (scaled by energy level)
        const offsetX = p.sin(this.time) * 5 * this.animationEnergy;
        const offsetY = p.cos(this.time * 0.7) * 3 * this.animationEnergy;
        p.translate(offsetX, offsetY);
        
        // Check if laser is firing for iris glow effect
        let laserGlow = 0;
        if (this.hasLaser) {
            const materializationCycle = this.time * this.animationEnergy * 0.4;
            const materializationPhase = (p.sin(materializationCycle) + 1) / 2;
            const materializationThreshold = 0.2;
            
            if (materializationPhase > materializationThreshold) {
                const matIntensity = p.map(materializationPhase, materializationThreshold, 1, 0, 1);
                laserGlow = p.sin(matIntensity * p.PI); // Sync with laser materialization
            }
        }
        
        // Draw the iris pattern first (always visible)
        if (this.irisPattern === 'radial') {
            this.drawRadialPattern(p);
        } else if (this.irisPattern === 'spiral') {
            this.drawSpiralPattern(p);
        } else if (this.irisPattern === 'geometric') {
            this.drawGeometricPattern(p);
        } else if (this.irisPattern === 'fractal') {
            this.drawFractalPattern(p);
        } else if (this.irisPattern === 'crystalline') {
            this.drawCrystallinePattern(p);
        } else if (this.irisPattern === 'void') {
            this.drawVoidPattern(p);
        } else {
            // Solid color
            p.fill(this.irisColor1[0], this.irisColor1[1], this.irisColor1[2]);
            this.drawShape(p, this.irisShape, this.irisSize);
        }
        
        // Add laser-colored glow OVER the iris when laser is firing (overlay effect)
        if (laserGlow > 0.1) {
            // Outer glow layers (subtle)
            for (let i = 6; i > 0; i--) {
                const glowAlpha = laserGlow * 30 * (i / 6); // More subtle
                const glowSize = this.irisSize + i * 6;
                p.fill(this.laserColor[0], this.laserColor[1], this.laserColor[2], glowAlpha);
                this.drawShape(p, this.irisShape, glowSize);
            }
            
            // Inner bright glow (overlay on the iris)
            const innerGlowAlpha = laserGlow * 40; // Much more subtle
            p.fill(255, 255, 255, innerGlowAlpha);
            this.drawShape(p, this.irisShape, this.irisSize + 2);
            
            // Laser color tint over the iris
            const tintAlpha = laserGlow * 25; // Very subtle tint
            p.fill(this.laserColor[0], this.laserColor[1], this.laserColor[2], tintAlpha);
            this.drawShape(p, this.irisShape, this.irisSize);
        }
        
        p.pop();
    }
    
    drawPupil(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        // Animated movement (scaled by energy level)
        const offsetX = p.sin(this.time) * 5 * this.animationEnergy;
        const offsetY = p.cos(this.time * 0.7) * 3 * this.animationEnergy;
        p.translate(offsetX, offsetY);
        
        // Check if laser is firing for pupil glow effect (same as iris)
        let laserGlow = 0;
        if (this.hasLaser) {
            const materializationCycle = this.time * this.animationEnergy * 0.4;
            const materializationPhase = (p.sin(materializationCycle) + 1) / 2;
            const materializationThreshold = 0.2;
            
            if (materializationPhase > materializationThreshold) {
                const matIntensity = p.map(materializationPhase, materializationThreshold, 1, 0, 1);
                laserGlow = p.sin(matIntensity * p.PI);
            }
        }
        
        if (this.pupilShape === 'multiple') {
            // Multiple pupils
            const numPupils = 3;
            for (let i = 0; i < numPupils; i++) {
                const angle = (p.TWO_PI / numPupils) * i;
                const x = p.cos(angle) * (this.pupilSize * 0.3);
                const y = p.sin(angle) * (this.pupilSize * 0.3);
                p.push();
                p.translate(x, y);
                p.fill(this.pupilColor[0], this.pupilColor[1], this.pupilColor[2]);
                p.ellipse(0, 0, this.pupilSize * 0.5, this.pupilSize * 0.5);
                p.pop();
            }
        } else if (this.pupilShape === 'slit') {
            p.fill(this.pupilColor[0], this.pupilColor[1], this.pupilColor[2]);
            p.ellipse(0, 0, this.pupilSize * 0.3, this.pupilSize);
        } else if (this.pupilShape === 'cross') {
            p.fill(this.pupilColor[0], this.pupilColor[1], this.pupilColor[2]);
            p.rectMode(p.CENTER);
            p.rect(0, 0, this.pupilSize * 0.3, this.pupilSize);
            p.rect(0, 0, this.pupilSize, this.pupilSize * 0.3);
        } else if (this.pupilShape === 'void') {
            // Void effect - dark center with swirling edges
            for (let i = 10; i > 0; i--) {
                const alpha = p.map(i, 0, 10, 255, 0);
                p.fill(0, 0, 0, alpha);
                const size = p.map(i, 0, 10, this.pupilSize, 0);
                p.ellipse(0, 0, size, size);
            }
        } else {
            p.fill(this.pupilColor[0], this.pupilColor[1], this.pupilColor[2]);
            this.drawShape(p, this.pupilShape, this.pupilSize);
        }
        
        // Add subtle laser glow to pupil when laser is firing
        if (laserGlow > 0.1) {
            // Very subtle outer glow
            for (let i = 3; i > 0; i--) {
                const glowAlpha = laserGlow * 20 * (i / 3); // Very subtle
                const glowSize = this.pupilSize + i * 3;
                p.fill(this.laserColor[0], this.laserColor[1], this.laserColor[2], glowAlpha);
                this.drawShape(p, this.pupilShape, glowSize);
            }
            
            // Tiny inner glow
            const innerGlowAlpha = laserGlow * 30;
            p.fill(255, 255, 255, innerGlowAlpha);
            this.drawShape(p, this.pupilShape, this.pupilSize + 1);
        }
        
        p.pop();
    }
    
    drawShape(p, shape, size) {
        switch (shape) {
            case 'circle':
                p.ellipse(0, 0, size, size);
                break;
            case 'oval':
                p.ellipse(0, 0, size * 1.3, size * 0.8);
                break;
            case 'diamond':
                p.push();
                p.rotate(p.PI / 4);
                p.rectMode(p.CENTER);
                p.rect(0, 0, size * 0.7, size * 0.7);
                p.pop();
                break;
            case 'star':
                this.drawStar(p, 0, 0, size / 2, size / 4, 6);
                break;
            case 'hexagon':
                this.drawPolygon(p, 0, 0, size / 2, 6);
                break;
            case 'almond':
                p.ellipse(0, 0, size * 1.5, size * 0.6);
                break;
            default:
                p.ellipse(0, 0, size, size);
        }
    }
    
    drawStar(p, x, y, radius1, radius2, npoints) {
        const angle = p.TWO_PI / npoints;
        const halfAngle = angle / 2.0;
        p.firstVertex = true;
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += angle) {
            let sx = x + p.cos(a) * radius2;
            let sy = y + p.sin(a) * radius2;
            p.vertex(sx, sy);
            sx = x + p.cos(a + halfAngle) * radius1;
            sy = y + p.sin(a + halfAngle) * radius1;
            p.vertex(sx, sy);
        }
        p.endShape(true);
    }
    
    drawPolygon(p, x, y, radius, npoints) {
        const angle = p.TWO_PI / npoints;
        p.firstVertex = true;
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += angle) {
            const sx = x + p.cos(a) * radius;
            const sy = y + p.sin(a) * radius;
            p.vertex(sx, sy);
        }
        p.endShape(true);
    }
    
    drawRadialPattern(p) {
        const segments = 12;
        for (let i = 0; i < segments; i++) {
            const angle = (p.TWO_PI / segments) * i;
            const colorLerp = i / segments;
            const r = p.lerp(this.irisColor1[0], this.irisColor2[0], colorLerp);
            const g = p.lerp(this.irisColor1[1], this.irisColor2[1], colorLerp);
            const b = p.lerp(this.irisColor1[2], this.irisColor2[2], colorLerp);
            
            p.fill(r, g, b);
            p.push();
            p.rotate(angle);
            p.triangle(0, 0, this.irisSize / 2, -5, this.irisSize / 2, 5);
            p.pop();
        }
    }
    
    drawSpiralPattern(p) {
        p.noFill();
        p.strokeWeight(3);
        
        for (let i = 0; i < 5; i++) {
            const colorLerp = i / 5;
            const r = p.lerp(this.irisColor1[0], this.irisColor2[0], colorLerp);
            const g = p.lerp(this.irisColor1[1], this.irisColor2[1], colorLerp);
            const b = p.lerp(this.irisColor1[2], this.irisColor2[2], colorLerp);
            p.stroke(r, g, b);
            
            p.firstVertex = true;
            p.beginShape();
            p.noFill();
            for (let angle = 0; angle < p.TWO_PI * 3; angle += 0.1) {
                const radius = p.map(angle, 0, p.TWO_PI * 3, 0, this.irisSize / 2);
                const x = p.cos(angle + this.time * this.animationEnergy + i) * radius;
                const y = p.sin(angle + this.time * this.animationEnergy + i) * radius;
                p.vertex(x, y);
            }
            p.endShape();
        }
        p.noStroke();
    }
    
    drawGeometricPattern(p) {
        const numRings = 4;
        for (let ring = 0; ring < numRings; ring++) {
            const radius = p.map(ring, 0, numRings - 1, this.irisSize / 8, this.irisSize / 2);
            const numShapes = 6 + ring * 2;
            
            for (let i = 0; i < numShapes; i++) {
                const angle = (p.TWO_PI / numShapes) * i + this.time * this.animationEnergy * (ring + 1);
                const x = p.cos(angle) * radius;
                const y = p.sin(angle) * radius;
                
                const colorLerp = ring / numRings;
                const r = p.lerp(this.irisColor1[0], this.irisColor2[0], colorLerp);
                const g = p.lerp(this.irisColor1[1], this.irisColor2[1], colorLerp);
                const b = p.lerp(this.irisColor1[2], this.irisColor2[2], colorLerp);
                p.fill(r, g, b);
                
                p.push();
                p.translate(x, y);
                p.rotate(angle);
                p.rectMode(p.CENTER);
                p.rect(0, 0, 5, 5);
                p.pop();
            }
        }
    }
    
    drawFractalPattern(p) {
        this.drawFractalLayer(p, this.irisSize / 2, 0, 0, 4);
    }
    
    drawFractalLayer(p, size, x, y, depth) {
        if (depth <= 0 || size < 5) return;
        
        const colorLerp = p.map(depth, 0, 4, 1, 0);
        const r = p.lerp(this.irisColor1[0], this.irisColor2[0], colorLerp);
        const g = p.lerp(this.irisColor1[1], this.irisColor2[1], colorLerp);
        const b = p.lerp(this.irisColor1[2], this.irisColor2[2], colorLerp);
        p.fill(r, g, b, 150);
        
        p.ellipse(x, y, size, size);
        
        const newSize = size * 0.6;
        const offset = size * 0.3;
        
        this.drawFractalLayer(p, newSize, x - offset, y, depth - 1);
        this.drawFractalLayer(p, newSize, x + offset, y, depth - 1);
        this.drawFractalLayer(p, newSize, x, y - offset, depth - 1);
        this.drawFractalLayer(p, newSize, x, y + offset, depth - 1);
    }
    
    drawCrystallinePattern(p) {
        const numCrystals = 8;
        for (let i = 0; i < numCrystals; i++) {
            const angle = (p.TWO_PI / numCrystals) * i;
            const radius = this.irisSize / 3;
            const x = p.cos(angle) * radius;
            const y = p.sin(angle) * radius;
            
            p.fill(this.irisColor1[0], this.irisColor1[1], this.irisColor1[2], 180);
            p.push();
            p.translate(x, y);
            p.rotate(angle);
            p.triangle(0, -10, -8, 10, 8, 10);
            p.pop();
        }
        
        p.fill(this.irisColor2[0], this.irisColor2[1], this.irisColor2[2], 220);
        p.ellipse(0, 0, this.irisSize / 3, this.irisSize / 3);
    }
    
    drawVoidPattern(p) {
        // Create a void effect with concentric circles
        for (let i = 20; i > 0; i--) {
            const alpha = p.map(i, 0, 20, 0, 255);
            const size = p.map(i, 0, 20, 0, this.irisSize);
            
            if (i % 2 === 0) {
                p.fill(this.irisColor1[0], this.irisColor1[1], this.irisColor1[2], alpha);
            } else {
                p.fill(0, 0, 0, alpha);
            }
            
            p.ellipse(0, 0, size, size);
        }
    }
    
    drawVeins(p) {
        p.stroke(200, 100, 100, 100);
        p.strokeWeight(1);
        
        for (let i = 0; i < 8; i++) {
            const angle = this.rng.range(0, p.TWO_PI);
            const length = this.rng.range(20, 40);
            p.push();
            p.rotate(angle);
            p.line(0, 0, length, this.rng.range(-5, 5));
            p.pop();
        }
        p.noStroke();
    }
    
    drawGlow(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        // Enhanced glow effect - fully opaque outer layers
        for (let i = 10; i > 0; i--) {
            const alpha = p.map(i, 0, 10, 0, 255); // Full opacity range
            const size = this.socketSize + i * 20;
            p.fill(this.effectColor[0], this.effectColor[1], this.effectColor[2], alpha);
            p.ellipse(0, 0, size, size);
        }
        
        // Inner bright glow (opaque)
        for (let i = 5; i > 0; i--) {
            const alpha = p.map(i, 0, 5, 0, 255); // Fully opaque
            const size = this.socketSize + i * 8;
            p.fill(255, 255, 255, alpha);
            p.ellipse(0, 0, size, size);
        }
        
        p.pop();
    }
    
    drawAura(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        const numRays = 20;
        for (let i = 0; i < numRays; i++) {
            const angle = (p.TWO_PI / numRays) * i + this.time * 2 * this.animationEnergy;
            const length = 70 + p.sin(this.time * 3 * this.animationEnergy + i) * 40 * this.animationEnergy;
            
            const x1 = p.cos(angle) * (this.socketSize / 2);
            const y1 = p.sin(angle) * (this.socketSize / 2);
            const x2 = p.cos(angle) * (this.socketSize / 2 + length);
            const y2 = p.sin(angle) * (this.socketSize / 2 + length);
            
            // Outer glow ray (opaque)
            p.stroke(this.auraColor[0], this.auraColor[1], this.auraColor[2], 255);
            p.strokeWeight(8);
            p.line(x1, y1, x2, y2);
            
            // Middle ray (opaque)
            p.stroke(255, 255, 255, 255);
            p.strokeWeight(6);
            p.line(x1, y1, x2, y2);
            
            // Inner bright ray (opaque)
            p.stroke(this.auraColor[0], this.auraColor[1], this.auraColor[2], 255);
            p.strokeWeight(4);
            p.line(x1, y1, x2, y2);
            
            // Core ray (bright white, opaque)
            p.stroke(255, 255, 255, 255);
            p.strokeWeight(2);
            p.line(x1, y1, x2, y2);
        }
        
        p.noStroke();
        p.pop();
    }
    
    drawLaser(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        // Animated laser movement (scaled by energy level)
        const offsetX = p.sin(this.time) * 5 * this.animationEnergy;
        const offsetY = p.cos(this.time * 0.7) * 3 * this.animationEnergy;
        p.translate(offsetX, offsetY);
        
        // Materialization cycle - laser appears and disappears dramatically
        const materializationCycle = this.time * this.animationEnergy * 0.4;
        const materializationPhase = (p.sin(materializationCycle) + 1) / 2; // 0 to 1
        
        // Only show laser when materialization is above threshold
        const materializationThreshold = 0.2;
        if (materializationPhase < materializationThreshold) {
            p.pop();
            return; // Laser is dematerialized
        }
        
        // Calculate materialization intensity (0 to 1)
        const matIntensity = p.map(materializationPhase, materializationThreshold, 1, 0, 1);
        const fadeIn = p.sin(matIntensity * p.PI); // Smooth fade curve
        
        // Bottom triangle quadrant sweep (45 to 135 degrees, pointing downward)
        const sweepCycle = this.time * this.animationEnergy * 0.6;
        const sweepStart = p.PI * 0.25; // 45 degrees (bottom-right)
        const sweepEnd = p.PI * 0.75;   // 135 degrees (bottom-left)
        const sweepRange = sweepEnd - sweepStart;
        
        // Smooth back-and-forth sweep with pause at edges
        const sweepProgress = (p.sin(sweepCycle) + 1) / 2; // 0 to 1
        const laserAngle = sweepStart + sweepProgress * sweepRange;
        
        // Dramatic pulsing effects
        const pulseSpeed = this.animationEnergy * 12;
        const pulseIntensity = 0.5 + 0.5 * p.sin(this.time * pulseSpeed);
        const chargeUpEffect = 0.3 + 0.7 * p.sin(this.time * pulseSpeed * 1.5);
        
        // Longer laser for more drama
        const laserLength = 400 * fadeIn;
        
        // Create dual laser beams to simulate single thick beam
        const numBeams = 2; // Just 2 beams for cohesive look
        
        for (let beam = 0; beam < numBeams; beam++) {
            const beamIntensity = (beam === 0 ? 1.0 : 0.7 - (beam * 0.15)) * fadeIn;
            const waveOffset = beam * 0.25;
            
            // Create wavy path for each beam
            const segments = 10; // More segments for smoother curves
            const points = [];
            
            for (let i = 0; i <= segments; i++) {
                const progress = i / segments;
                const distance = progress * laserLength;
                
                // Base position along laser direction
                let x = p.cos(laserAngle) * distance;
                let y = p.sin(laserAngle) * distance;
                
                // Reduced wave distortion - much less bendy
                const waveFreq = 8 + beam; 
                const baseWaveAmp = 3 * this.animationEnergy * beamIntensity; // Much smaller amplitude
                const timeOffset = this.time * 2 + waveOffset; // Slower wave motion
                
                // Subtle wave that stays small throughout beam length
                const waveAmp = baseWaveAmp * (0.3 + 0.7 * progress) * fadeIn; // Slight increase with distance
                
                // Perpendicular wave motion - much more subtle
                const perpAngle = laserAngle + p.PI / 2;
                const shimmer = 1 + 0.1 * p.sin(this.time * 4 + progress * 3); // Less shimmer
                const waveX = p.cos(perpAngle) * p.sin(progress * waveFreq + timeOffset) * waveAmp * shimmer;
                const waveY = p.sin(perpAngle) * p.sin(progress * waveFreq + timeOffset) * waveAmp * shimmer;
                
                // Add slight beam spread to simulate thickness
                const fanAngle = (beam - (numBeams - 1) / 2) * 0.015; // Much smaller angle for cohesive beam
                const fanX = p.cos(laserAngle + fanAngle) * distance;
                const fanY = p.sin(laserAngle + fanAngle) * distance;
                
                // Combine base position with fan spread and subtle wave
                x = fanX + waveX;
                y = fanY + waveY;
                
                points.push({x, y});
            }
            
            // Enhanced layers with materialization effects
            const layers = [
                {weight: 24 * beamIntensity * pulseIntensity, alpha: 40 * beamIntensity * chargeUpEffect, color: this.laserColor},
                {weight: 18 * beamIntensity * pulseIntensity, alpha: 80 * beamIntensity * pulseIntensity, color: this.laserColor},
                {weight: 14 * beamIntensity * pulseIntensity, alpha: 140 * beamIntensity * pulseIntensity, color: [255, 255, 255]},
                {weight: 10 * beamIntensity, alpha: 200 * beamIntensity, color: this.laserColor},
                {weight: 6 * beamIntensity, alpha: 255 * beamIntensity, color: [255, 255, 255]},
                {weight: 3 * beamIntensity, alpha: 255 * beamIntensity, color: this.laserColor}
            ];
            
            // Draw each layer with materialization alpha
            layers.forEach(layer => {
                const finalAlpha = layer.alpha * fadeIn;
                p.stroke(layer.color[0], layer.color[1], layer.color[2], finalAlpha);
                p.strokeWeight(layer.weight);
                
                // Draw the wavy path
                p.beginShape();
                p.noFill();
                
                points.forEach(point => {
                    p.vertex(point.x, point.y);
                });
                
                p.endShape();
            });
        }
        
        // Dramatic materialization particles at the source
        if (fadeIn > 0.5) {
            const numSourceParticles = 8;
            for (let i = 0; i < numSourceParticles; i++) {
                const angle = (i / numSourceParticles) * p.TWO_PI + this.time * 3;
                const radius = 15 + 10 * p.sin(this.time * 6 + i);
                const particleX = p.cos(angle) * radius * fadeIn;
                const particleY = p.sin(angle) * radius * fadeIn;
                
                p.fill(255, 255, 255, 180 * fadeIn);
                p.ellipse(particleX, particleY, 4, 4);
                p.fill(this.laserColor[0], this.laserColor[1], this.laserColor[2], 255 * fadeIn);
                p.ellipse(particleX, particleY, 2, 2);
            }
        }
        
        // Enhanced energy particles along the beam path
        if (chargeUpEffect > 0.5 && fadeIn > 0.3) {
            const numParticles = 8;
            for (let i = 0; i < numParticles; i++) {
                const progress = (i / numParticles) + (this.time * 0.7) % 1;
                const distance = progress * laserLength;
                
                // Follow the same slight spread pattern as the beams
                const particleBeam = (i % numBeams); // Distribute particles across beams
                const fanAngle = (particleBeam - (numBeams - 1) / 2) * 0.015;
                let x = p.cos(laserAngle + fanAngle) * distance;
                let y = p.sin(laserAngle + fanAngle) * distance;
                
                // Much more subtle wave motion for particles
                const perpAngle = laserAngle + p.PI / 2;
                const particleWaveAmp = 2 * progress * fadeIn; // Much smaller wave
                const waveX = p.cos(perpAngle) * p.sin(progress * 8 + this.time * 3) * particleWaveAmp;
                const waveY = p.sin(perpAngle) * p.sin(progress * 8 + this.time * 3) * particleWaveAmp;
                
                x += waveX;
                y += waveY;
                
                // Dramatic particle effects
                const particleSize = 4 + 6 * chargeUpEffect * fadeIn;
                p.fill(255, 255, 255, 220 * chargeUpEffect * fadeIn);
                p.ellipse(x, y, particleSize * 1.5, particleSize * 1.5);
                
                p.fill(this.laserColor[0], this.laserColor[1], this.laserColor[2], 255 * fadeIn);
                p.ellipse(x, y, particleSize, particleSize);
                
                // Trailing sparks
                p.fill(255, 255, 255, 120 * fadeIn);
                p.ellipse(x - waveX * 0.3, y - waveY * 0.3, particleSize * 0.5, particleSize * 0.5);
            }
        }
        
        p.noStroke();
        p.pop();
    }
    
    drawParticles(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        const numParticles = 25;
        for (let i = 0; i < numParticles; i++) {
            const angle = (p.TWO_PI / numParticles) * i + this.time * 1.5 * this.animationEnergy;
            const radius = this.socketSize / 2 + p.sin(this.time * 2 * this.animationEnergy + i) * 40 * this.animationEnergy;
            const x = p.cos(angle) * radius;
            const y = p.sin(angle) * radius;
            
            const size = 5 + p.sin(this.time * 4 * this.animationEnergy + i) * 4 * this.animationEnergy;
            
            // Outer glow (largest, opaque)
            p.fill(this.effectColor[0], this.effectColor[1], this.effectColor[2], 255);
            p.ellipse(x, y, size * 1.5, size * 1.5);
            
            // Main particle (bright and opaque)
            p.fill(255, 255, 255, 255);
            p.ellipse(x, y, size, size);
            
            // Inner core (colored, opaque)
            p.fill(this.effectColor[0], this.effectColor[1], this.effectColor[2], 255);
            p.ellipse(x, y, size * 0.6, size * 0.6);
            
            // Add trailing particles (opaque)
            const trailX = x - p.cos(angle) * 15;
            const trailY = y - p.sin(angle) * 15;
            p.fill(this.effectColor[0], this.effectColor[1], this.effectColor[2], 255);
            p.ellipse(trailX, trailY, size * 0.8, size * 0.8);
            
            // Second trail
            const trail2X = x - p.cos(angle) * 25;
            const trail2Y = y - p.sin(angle) * 25;
            p.fill(this.effectColor[0], this.effectColor[1], this.effectColor[2], 200);
            p.ellipse(trail2X, trail2Y, size * 0.5, size * 0.5);
        }
        
        p.pop();
    }
    
    drawLightning(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        // Lightning bolts - always draw at least 3 visible bolts
        const numBolts = 3 + Math.floor(this.rng.range(0, 2));
        
        for (let i = 0; i < numBolts; i++) {
            const startAngle = (p.TWO_PI / numBolts) * i + this.rng.range(-0.3, 0.3);
            const startRadius = this.irisSize / 2;
            const endRadius = this.socketSize / 2 + 20; // Extend beyond socket
            
            let x = p.cos(startAngle) * startRadius;
            let y = p.sin(startAngle) * startRadius;
            
            // Outer glow (widest, opaque)
            p.stroke(255, 255, 255, 255);
            p.strokeWeight(8);
            p.firstVertex = true;
            p.beginShape();
            p.noFill();
            p.vertex(x, y);
            
            for (let step = 0; step < 6; step++) {
                const progress = step / 6;
                const targetRadius = p.lerp(startRadius, endRadius, progress);
                const targetAngle = startAngle + this.rng.range(-0.4, 0.4);
                
                x = p.cos(targetAngle) * targetRadius + this.rng.range(-8, 8);
                y = p.sin(targetAngle) * targetRadius + this.rng.range(-8, 8);
                p.vertex(x, y);
            }
            p.endShape();
            
            // Middle lightning stroke (opaque)
            x = p.cos(startAngle) * startRadius;
            y = p.sin(startAngle) * startRadius;
            p.stroke(200, 200, 255, 255);
            p.strokeWeight(5);
            p.firstVertex = true;
            p.beginShape();
            p.noFill();
            p.vertex(x, y);
            
            for (let step = 0; step < 6; step++) {
                const progress = step / 6;
                const targetRadius = p.lerp(startRadius, endRadius, progress);
                const targetAngle = startAngle + this.rng.range(-0.4, 0.4);
                
                x = p.cos(targetAngle) * targetRadius + this.rng.range(-8, 8);
                y = p.sin(targetAngle) * targetRadius + this.rng.range(-8, 8);
                p.vertex(x, y);
            }
            p.endShape();
            
            // Core lightning bolt (bright, opaque)
            x = p.cos(startAngle) * startRadius;
            y = p.sin(startAngle) * startRadius;
            p.stroke(255, 255, 255, 255);
            p.strokeWeight(2);
            p.firstVertex = true;
            p.beginShape();
            p.noFill();
            p.vertex(x, y);
            
            for (let step = 0; step < 6; step++) {
                const progress = step / 6;
                const targetRadius = p.lerp(startRadius, endRadius, progress);
                const targetAngle = startAngle + this.rng.range(-0.4, 0.4);
                
                x = p.cos(targetAngle) * targetRadius + this.rng.range(-8, 8);
                y = p.sin(targetAngle) * targetRadius + this.rng.range(-8, 8);
                p.vertex(x, y);
            }
            p.endShape();
        }
        
        p.noStroke();
        p.pop();
    }
    
    drawHighlights(p) {
        p.push();
        p.translate(this.centerX, this.centerY);
        
        // Animated movement (scaled by energy level)
        const offsetX = p.sin(this.time) * 5 * this.animationEnergy;
        const offsetY = p.cos(this.time * 0.7) * 3 * this.animationEnergy;
        p.translate(offsetX, offsetY);
        
        // Main highlight
        p.fill(255, 255, 255, 180);
        p.ellipse(-this.irisSize / 4, -this.irisSize / 4, this.irisSize / 4, this.irisSize / 4);
        
        // Secondary highlight
        p.fill(255, 255, 255, 100);
        p.ellipse(this.irisSize / 3, this.irisSize / 3, this.irisSize / 6, this.irisSize / 6);
        
        p.pop();
    }
}

// Global variables
let eyeballs = [];
let canvasContainer;
let animationLoops = [];

// Initialize the application
function init() {
    canvasContainer = document.getElementById('canvas-container');
    generateNewCollection();
}

// Generate a new collection of eyeballs
function generateNewCollection() {
    clearCollection();
    
    const numEyeballs = 12; // Generate 12 unique eyeballs
    
    for (let i = 0; i < numEyeballs; i++) {
        generateSingleEye();
    }
}

// Generate an eyeball with a specific seed
function generateEyeballWithSeed(seed) {
    const eyeball = new Eyeball(seed, 300, 300);
    
    // Create container for eyeball and metadata
    const eyeballContainer = document.createElement('div');
    eyeballContainer.className = 'eyeball-container';
    eyeballContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 15px;
        padding: 15px;
        background: linear-gradient(145deg, #1a1a2e, #16213e);
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: transform 0.3s ease;
        max-width: 350px;
    `;
    
    eyeballContainer.addEventListener('mouseenter', () => {
        eyeballContainer.style.transform = 'scale(1.02)';
    });
    
    eyeballContainer.addEventListener('mouseleave', () => {
        eyeballContainer.style.transform = 'scale(1)';
    });
    
    canvasContainer.appendChild(eyeballContainer);
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    canvas.className = 'eyeball-canvas';
    canvas.style.borderRadius = '15px';
    
    const canvasDiv = document.createElement('div');
    canvasDiv.style.position = 'relative';
    canvasDiv.appendChild(canvas);
    eyeballContainer.appendChild(canvasDiv);
    
    // Add seed info
    const seedInfo = document.createElement('div');
    seedInfo.textContent = `#${seed}`;
    seedInfo.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: linear-gradient(45deg, #ff006e, #8338ec);
        color: white;
        padding: 4px 8px;
        font-size: 12px;
        font-weight: bold;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    canvasDiv.appendChild(seedInfo);
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    
    // Animation loop
    function animate() {
        eyeball.draw(ctx);
        requestAnimationFrame(animate);
    }
    
    // Start animation
    const animationId = requestAnimationFrame(animate);
    animationLoops.push(animationId);
    
    // Create metadata display
    const metadataDiv = document.createElement('div');
    metadataDiv.className = 'metadata-display';
    metadataDiv.style.cssText = `
        width: 100%;
        margin-top: 10px;
        background: linear-gradient(135deg, #0f0f23, #1a1a2e);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        overflow: hidden;
        transition: all 0.3s ease;
    `;
    
    // Create header (always visible)
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 10px 15px;
        cursor: pointer;
        user-select: none;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const title = document.createElement('h3');
    title.textContent = `Witness #${seed}`;
    title.style.cssText = `
        margin: 0;
        color: #fff;
        font-size: 14px;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    `;
    
    const toggleIcon = document.createElement('span');
    toggleIcon.textContent = '▼';
    toggleIcon.style.cssText = `
        color: #8338ec;
        font-size: 12px;
        transition: transform 0.3s ease;
        transform: rotate(-90deg);
    `;
    
    header.appendChild(title);
    header.appendChild(toggleIcon);
    metadataDiv.appendChild(header);
    
    // Create content container (collapsible)
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        padding: 0 15px;
    `;
    
    // Add traits to content
    const traitsContainer = document.createElement('div');
    traitsContainer.style.cssText = `
        padding: 10px 0;
    `;
    
    eyeball.metadata.traits.forEach(trait => {
        const traitDiv = document.createElement('div');
        traitDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 4px 0;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
            border-left: 2px solid #8338ec;
        `;
        
        const traitName = document.createElement('span');
        traitName.textContent = trait.name;
        traitName.style.cssText = `
            color: #aaa;
            font-size: 11px;
            font-weight: 500;
        `;
        
        const traitValue = document.createElement('span');
        traitValue.textContent = trait.value;
        traitValue.style.cssText = `
            color: #fff;
            font-size: 11px;
            font-weight: bold;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
        `;
        
        traitDiv.appendChild(traitName);
        traitDiv.appendChild(traitValue);
        traitsContainer.appendChild(traitDiv);
    });
    
    contentDiv.appendChild(traitsContainer);
    metadataDiv.appendChild(contentDiv);
    
    // Add click handler for toggle
    let isExpanded = false;
    header.addEventListener('click', () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
            contentDiv.style.maxHeight = contentDiv.scrollHeight + 'px';
            toggleIcon.style.transform = 'rotate(0deg)';
        } else {
            contentDiv.style.maxHeight = '0';
            toggleIcon.style.transform = 'rotate(-90deg)';
        }
    });
    
    eyeballContainer.appendChild(metadataDiv);
    
    eyeballs.push(eyeball);
    return seed;
}

// Generate a single eyeball
function generateSingleEye() {
    const seed = Math.floor(Math.random() * 1000000); // Generate random seed
    return generateEyeballWithSeed(seed);
}

// Generate eyeball from seed input
function generateFromSeed() {
    const seedInput = document.getElementById('seedInput');
    const seed = parseInt(seedInput.value);
    
    if (seed && seed >= 1 && seed <= 999999) {
        generateEyeballWithSeed(seed);
        seedInput.value = ''; // Clear input
    } else {
        alert('Please enter a valid seed between 1 and 999999');
    }
}

// Clear all eyeballs
function clearCollection() {
    // Stop all animation loops
    animationLoops.forEach(id => cancelAnimationFrame(id));
    animationLoops = [];
    
    // Remove all eyeball containers
    const containers = document.querySelectorAll('.eyeball-container');
    containers.forEach(container => {
        container.remove();
    });
    
    // Clear the eyeballs array
    eyeballs = [];
}

// Export metadata for NFT marketplace
function exportMetadata() {
    const allMetadata = eyeballs.map((eyeball, index) => ({
        name: `Witness #${eyeball.seed}`,
        description: "A unique generative abstract eyeball from the Witness collection. Each eye possesses distinct arcane powers and mystical properties, forged from the depths of digital consciousness.",
        image: `witness_${eyeball.seed}.png`, // This would be the actual image file
        external_url: `https://witness.io/eye/${eyeball.seed}`,
        attributes: eyeball.metadata.traits.map(trait => ({
            trait_type: trait.name,
            value: trait.value
        })),
        seed: eyeball.seed,
        collection: "Witness",
        edition: index + 1,
        total_supply: eyeballs.length
    }));
    
    // Download as JSON file
    const dataStr = JSON.stringify(allMetadata, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `witness_metadata_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', init);