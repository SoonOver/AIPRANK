(() => {
    'use strict';

    // ═══ PARTICLE BACKGROUND ═══
    const canvas = document.getElementById('bgCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 60;
        const CONNECTION_DIST = 150;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.r = Math.random() * 1.5 + 0.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
                ctx.fill();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 229, 255, ${0.08 * (1 - dist / CONNECTION_DIST)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animate);
        }
        animate();
    }

    // ═══ NAVBAR SCROLL ═══
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = y;
    });

    // ═══ HAMBURGER MENU ═══
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('open'));
        });
    }

    // ═══ ACTIVE NAV LINK ═══
    const sections = document.querySelectorAll('section[id]');
    const navLinkEls = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(s => {
            const top = s.offsetTop - 120;
            if (window.scrollY >= top) current = s.id;
        });
        navLinkEls.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === '#' + current) a.classList.add('active');
        });
    });

    // ═══ REVEAL ON SCROLL ═══
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

    // ═══ ANIMATED COUNTERS ═══
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 30));
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = current;
                }, 40);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ═══ TERMINAL SIMULATION ═══
    const termBody = document.getElementById('terminal-body');
    const termLines = [
        { text: 'booting talos_core v2.0...', delay: 0 },
        { text: 'loading memory/long_term.json... [OK]', delay: 400 },
        { text: 'loading memory/skills.json... [OK]', delay: 300 },
        { text: 'initializing classifier engine... [OK]', delay: 350 },
        { text: 'initializing decider agent... [OK]', delay: 500 },
        { text: '', delay: 200, raw: '<span style="color:#ffbd2e">USER INPUT:</span> "buatkan web portfolio modern"' },
        { text: '', delay: 600, raw: '<span style="color:var(--text-dim)">[classifier]</span> intent=build' },
        { text: '', delay: 400, raw: '<span style="color:var(--text-dim)">[decider]</span> intent=build confidence=0.92 browse=false' },
        { text: '', delay: 300, raw: '<span style="color:var(--text-dim)">[intent]</span> final=build' },
        { text: '', delay: 200, raw: '<span style="color:var(--text-dim)">[pipeline]</span> researcher → planner → architect → builder → checker → verifier' },
        { text: '', delay: 800, raw: '<span style="color:var(--text-dim)">[1]</span> researcher (attempt 1) — searching web...' },
        { text: '', delay: 1000, raw: '<span style="color:var(--text-dim)">[2]</span> planner (attempt 1) — generating plan...' },
        { text: '', delay: 600, raw: '<span style="color:var(--text-dim)">[3]</span> architect (attempt 1) — designing structure...' },
        { text: '', delay: 1200, raw: '<span style="color:var(--text-dim)">[4]</span> builder (attempt 1) — writing 3 files...' },
        { text: '', delay: 700, raw: '<span style="color:var(--text-dim)">[5]</span> checker (attempt 1) — validating output...' },
        { text: '', delay: 500, raw: '<span style="color:var(--text-dim)">[6]</span> verifier (attempt 1) — <span style="color:var(--green)">PASSED</span>' },
        { text: '', delay: 300, raw: '<span style="color:var(--green)">✓ Task completed successfully. 3 files saved.</span>' },
        { text: '', delay: 200, raw: '<span style="color:var(--text-dim)">[memory]</span> saved to short_term + long_term + skills' },
        { text: 'talos_core is ready for next task. █', delay: 500 },
    ];

    let termStarted = false;
    const termObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !termStarted) {
                termStarted = true;
                runTerminal();
                termObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (termBody) {
        termObserver.observe(termBody);
    }

    function runTerminal() {
        let totalDelay = 0;
        termLines.forEach((item) => {
            totalDelay += item.delay + 200;
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'line';
                if (item.raw) {
                    div.innerHTML = item.raw;
                } else {
                    div.innerHTML = `<span class="prompt">talos@core:~$</span> ${item.text}`;
                }
                termBody.appendChild(div);
                termBody.scrollTop = termBody.scrollHeight;
            }, totalDelay);
        });
    }

    // ═══ ROLE CARDS STAGGER ═══
    const roleCards = document.querySelectorAll('.role-card');
    roleCards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.07}s`;
    });

})();
