class ParticleNetwork {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.className = 'particle-network';
        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.particles = [];
        this.particleCount = 50;
        
        // Check theme from body data attribute
        const theme = document.body.getAttribute('data-theme') || 'dark';
        this.updateColors(theme);

        this.init();
        window.addEventListener('resize', () => this.resize());
        
        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = document.body.getAttribute('data-theme') || 'dark';
                    this.updateColors(newTheme);
                    // Regenerate particles with new colors for immediate visual effect
                    this.createParticles();
                }
            });
        });
        
        observer.observe(document.body, { attributes: true });
    }
    
    // Function to update particle colors based on theme
    updateColors(theme) {
        this.colors = theme === 'dark' ? 
            ['#f0a500', '#ffffff', '#cccccc'] : 
            ['#f0a500', '#555555', '#333333'];
    }

    init() {
        this.resize();
        this.createParticles();
        this.animate();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = Math.min(500, window.innerHeight);
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1.5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.height) particle.vy *= -1;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();

            // Draw connections
            this.particles.forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    this.ctx.beginPath();
                    const theme = document.body.getAttribute('data-theme') || 'dark';
                    const strokeColor = theme === 'dark' ? 
                        '240, 165, 0' : // Gold color for dark theme
                        '240, 165, 0';  // Same gold for light theme
                    this.ctx.strokeStyle = `rgba(${strokeColor}, ${0.3 * (1 - distance / 120)})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.stroke();
                }
            });
        });
    }

    animate() {
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the particle network when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set theme attribute on body if not already present
    if (!document.body.hasAttribute('data-theme')) {
        document.body.setAttribute('data-theme', 'dark');
    }
    
    new ParticleNetwork();
});