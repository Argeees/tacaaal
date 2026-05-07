import { useEffect, useRef } from 'react';

export default function ParticleBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width, height;
        let particles = [];

        // 🎛️ AQUÍ ESTÁN TUS VALORES ELEGIDOS:
        const config = {
            nodes: 150,            // Número de Nodos
            speed: 0.2,           // Velocidad de Deriva
            linkDistance: 300,     // Límite de Enlace (px)
            color: '107, 107, 107'  // RGB del color 
        };

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 2 * config.speed;
                this.vy = (Math.random() - 0.5) * 2 * config.speed;
                this.radius = 3; // Tamaño del punto
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                // Rebotar en los bordes
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${config.color}, 0.5)`;
                ctx.fill();
            }
        }

        const init = () => {
            resize();
            window.addEventListener('resize', resize);

            // Crear los nodos
            particles = [];
            for (let i = 0; i < config.nodes; i++) {
                particles.push(new Particle());
            }

            animate();
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Actualizar y dibujar cada punto
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Dibujar las líneas de conexión
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < config.linkDistance) {
                        // Mientras más lejos, más transparente es la línea
                        const opacity = 1 - (distance / config.linkDistance);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${config.color}, ${opacity * 0.9})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();

        // Limpiar memoria cuando el usuario cambie de página
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            // Clases de Tailwind para mandarlo al fondo y dejar que los clics lo traspasen
            className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-70"
        />
    );
}