  class AnimatedFlower {
            constructor() {
                this.canvas = document.getElementById('flowerCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.startBtn = document.getElementById('startBtn');
                this.resetBtn = document.getElementById('resetBtn');
                this.loadingText = document.getElementById('loadingText');
                
                this.PETAL_COUNT = 24;
                this.PETAL_LENGTH = 150;
                this.PETAL_WIDTH = 40;
                
                this.rainbowColors = [
                    '#FF0000', '#FF4500', '#FFD700', '#32CD32',
                    '#00CED1', '#0000FF', '#8A2BE2', '#FF1493'
                ];
                
                this.petals = [];
                this.animationId = null;
                this.isAnimating = false;
                
                this.init();
            }

            init() {
                this.setupCanvas();
                this.setupEventListeners();
                this.clearCanvas();
                
                window.addEventListener('resize', () => this.setupCanvas());
            }

            setupCanvas() {
                const container = this.canvas.parentElement;
                const size = Math.min(container.clientWidth, container.clientHeight, 800);
                
                this.canvas.width = size;
                this.canvas.height = size;
                
                this.centerX = size / 2;
                this.centerY = size / 2;
                this.scale = size / 800;
            }

            setupEventListeners() {
                this.startBtn.addEventListener('click', () => this.startAnimation());
                this.resetBtn.addEventListener('click', () => this.resetAnimation());
            }

            createRadialGradient(centerX, centerY, radius, colors) {
                const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                colors.forEach((color, index) => {
                    gradient.addColorStop(index / (colors.length - 1), color);
                });
                return gradient;
            }

            drawPetal(angle, progress, colors) {
                const adjustedLength = this.PETAL_LENGTH * this.scale;
                const adjustedWidth = this.PETAL_WIDTH * this.scale;

                this.ctx.save();
                this.ctx.translate(this.centerX, this.centerY);
                this.ctx.rotate(angle);

                // Create rainbow gradient
                const gradient = this.createRadialGradient(0, 0, adjustedLength, colors);
                
                // Set up glow effect
                this.ctx.shadowColor = colors[Math.floor(colors.length / 2)];
                this.ctx.shadowBlur = 25 * this.scale;
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;

                this.ctx.beginPath();
                
                // Create elegant petal shape using bezier curves
                const controlPoint1X = adjustedLength * 0.3;
                const controlPoint1Y = -adjustedWidth * 0.5;
                const controlPoint2X = adjustedLength * 0.7;
                const controlPoint2Y = -adjustedWidth * 0.3;
                const endX = adjustedLength * progress;
                const endY = 0;
                
                const controlPoint3X = adjustedLength * 0.7;
                const controlPoint3Y = adjustedWidth * 0.3;
                const controlPoint4X = adjustedLength * 0.3;
                const controlPoint4Y = adjustedWidth * 0.5;

                // Draw petal shape
                this.ctx.moveTo(0, 0);
                this.ctx.bezierCurveTo(
                    controlPoint1X * progress, controlPoint1Y * progress,
                    controlPoint2X * progress, controlPoint2Y * progress,
                    endX, endY
                );
                
                this.ctx.bezierCurveTo(
                    controlPoint3X * progress, controlPoint3Y * progress,
                    controlPoint4X * progress, controlPoint4Y * progress,
                    0, 0
                );

                this.ctx.fillStyle = gradient;
                this.ctx.fill();

                // Add inner glow
                this.ctx.globalCompositeOperation = 'screen';
                this.ctx.shadowBlur = 15 * this.scale;
                this.ctx.fill();
                this.ctx.globalCompositeOperation = 'source-over';

                this.ctx.restore();
            }

            easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            clearCanvas() {
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }

            startAnimation() {
                if (this.isAnimating) return;
                
                this.isAnimating = true;
                this.startBtn.disabled = true;
                this.startBtn.textContent = 'Drawing...';
                this.loadingText.classList.add('show');
                
                // Initialize petals
                this.petals = [];
                for (let i = 0; i < this.PETAL_COUNT; i++) {
                    const angle = (i / this.PETAL_COUNT) * Math.PI * 2;
                    const colorStartIndex = Math.floor((i / this.PETAL_COUNT) * this.rainbowColors.length);
                    const colors = [
                        this.rainbowColors[colorStartIndex % this.rainbowColors.length],
                        this.rainbowColors[(colorStartIndex + 1) % this.rainbowColors.length],
                        this.rainbowColors[(colorStartIndex + 2) % this.rainbowColors.length],
                        this.rainbowColors[(colorStartIndex + 3) % this.rainbowColors.length]
                    ];
                    
                    this.petals.push({
                        angle,
                        progress: 0,
                        colors
                    });
                }

                const startTime = Date.now();
                const animationDuration = 5000;
                const petalDelay = animationDuration / this.PETAL_COUNT;

                const animate = () => {
                    const currentTime = Date.now();
                    const elapsed = currentTime - startTime;

                    this.clearCanvas();

                    // Update and draw petals
                    this.petals.forEach((petal, index) => {
                        const petalStartTime = index * petalDelay;
                        const petalElapsed = elapsed - petalStartTime;
                        
                        if (petalElapsed > 0) {
                            const petalDuration = 1200;
                            const rawProgress = Math.min(petalElapsed / petalDuration, 1);
                            petal.progress = this.easeInOutCubic(rawProgress);
                            
                            this.drawPetal(petal.angle, petal.progress, petal.colors);
                        }
                    });

                    // Continue animation
                    if (elapsed < animationDuration + 1200) {
                        this.animationId = requestAnimationFrame(animate);
                    } else {
                        this.startPulseAnimation();
                    }
                };

                animate();
            }

            startPulseAnimation() {
                this.loadingText.classList.remove('show');
                this.startBtn.textContent = 'Start Animation';
                this.startBtn.disabled = false;
                
                const pulseStart = Date.now();
                
                const pulse = () => {
                    const pulseTime = Date.now() - pulseStart;
                    const pulseValue = (Math.sin(pulseTime * 0.003) + 1) * 0.5;
                    
                    this.clearCanvas();
                    
                    this.petals.forEach((petal) => {
                        this.ctx.save();
                        this.ctx.globalAlpha = 0.6 + pulseValue * 0.4;
                        this.drawPetal(petal.angle, 1, petal.colors);
                        this.ctx.restore();
                    });
                    
                    if (this.isAnimating) {
                        this.animationId = requestAnimationFrame(pulse);
                    }
                };
                
                pulse();
            }

            resetAnimation() {
                this.isAnimating = false;
                
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
                
                this.startBtn.disabled = false;
                this.startBtn.textContent = 'Start Animation';
                this.loadingText.classList.remove('show');
                
                this.clearCanvas();
                this.petals = [];
            }
        }

        // Initialize the flower animation when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new AnimatedFlower();
        });