document.addEventListener('DOMContentLoaded', () => {
    // Cubes animation
    const canvas = document.getElementById('heroCubes');
    const ctx = canvas.getContext('2d');
    let cubes = [];
    const cubeCount = 35;
    let cubesStarted = false;
    let cubesInteractive = false;
    let stopping = false;
    let speedMultiplier = 1;
    let draggedCube = null;
    let mouseX = 0;
    let mouseY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseVelX = 0;
    let mouseVelY = 0;
    let prevAngle = 0;
    let angularVel = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createCube(startFromBottom) {
        const size = Math.random() * 40 + 10;
        return {
            x: Math.random() * canvas.width,
            y: startFromBottom ? canvas.height + Math.random() * 200 : Math.random() * canvas.height,
            size: size,
            baseSpeedY: Math.random() * 1.5 + 0.3,
            speedX: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            opacity: Math.random() * 0.15 + 0.03,
            color: Math.random() > 0.5 ? '37, 99, 235' : '220, 38, 38',
        };
    }

    function startCubes() {
        cubes = [];
        for (let i = 0; i < cubeCount; i++) {
            cubes.push(createCube(true));
        }
        cubesStarted = true;
    }

    function drawCube(cube) {
        ctx.save();
        ctx.translate(cube.x, cube.y);
        ctx.rotate(cube.rotation);

        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(${cube.color}, 0.4)`;

        ctx.fillStyle = `rgba(${cube.color}, ${cube.opacity})`;
        ctx.fillRect(-cube.size / 2, -cube.size / 2, cube.size, cube.size);

        ctx.strokeStyle = `rgba(${cube.color}, ${cube.opacity * 1.5})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-cube.size / 2, -cube.size / 2, cube.size, cube.size);

        ctx.restore();
    }

    function getCubeAt(x, y) {
        for (let i = cubes.length - 1; i >= 0; i--) {
            const cube = cubes[i];
            const dx = x - cube.x;
            const dy = y - cube.y;
            if (Math.abs(dx) < cube.size / 2 && Math.abs(dy) < cube.size / 2) {
                return cube;
            }
        }
        return null;
    }

    canvas.addEventListener('mousedown', (e) => {
        if (!cubesInteractive) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cube = getCubeAt(x, y);
        if (cube) {
            draggedCube = cube;
            mouseX = x;
            mouseY = y;
            prevMouseX = x;
            prevMouseY = y;
            mouseVelX = 0;
            mouseVelY = 0;
            prevAngle = Math.atan2(y - cube.y, x - cube.x);
            angularVel = 0;
            canvas.style.cursor = 'grabbing';
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        mouseVelX = mouseX - prevMouseX;
        mouseVelY = mouseY - prevMouseY;

        if (draggedCube) {
            draggedCube.x += (mouseX - draggedCube.x) * 0.3;
            draggedCube.y += (mouseY - draggedCube.y) * 0.3;

            // Angular velocity from circular movement
            const angle = Math.atan2(mouseY - draggedCube.y, mouseX - draggedCube.x);
            let deltaAngle = angle - prevAngle;
            if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
            if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
            angularVel = deltaAngle;
            prevAngle = angle;

            draggedCube.throwRot = angularVel * 2;
        } else if (cubesInteractive) {
            const cube = getCubeAt(mouseX, mouseY);
            canvas.style.cursor = cube ? 'grab' : 'default';
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (draggedCube) {
            draggedCube.throwX = mouseVelX * 0.8;
            draggedCube.throwY = mouseVelY * 0.8;
            draggedCube.throwRot = angularVel * 3;
        }
        draggedCube = null;
        canvas.style.cursor = 'default';
    });

    canvas.addEventListener('mouseleave', () => {
        if (draggedCube) {
            draggedCube.throwX = mouseVelX * 0.8;
            draggedCube.throwY = mouseVelY * 0.8;
        }
        draggedCube = null;
        canvas.style.cursor = 'default';
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        if (!cubesInteractive) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const cube = getCubeAt(x, y);
        if (cube) {
            draggedCube = cube;
            mouseX = x;
            mouseY = y;
            prevMouseX = x;
            prevMouseY = y;
            mouseVelX = 0;
            mouseVelY = 0;
            prevAngle = Math.atan2(y - cube.y, x - cube.x);
            angularVel = 0;
        }
    });

    canvas.addEventListener('touchmove', (e) => {
        if (!draggedCube) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        mouseX = touch.clientX - rect.left;
        mouseY = touch.clientY - rect.top;
        mouseVelX = mouseX - prevMouseX;
        mouseVelY = mouseY - prevMouseY;
        draggedCube.x += (mouseX - draggedCube.x) * 0.3;
        draggedCube.y += (mouseY - draggedCube.y) * 0.3;

        const angle = Math.atan2(mouseY - draggedCube.y, mouseX - draggedCube.x);
        let deltaAngle = angle - prevAngle;
        if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
        if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
        angularVel = deltaAngle;
        prevAngle = angle;
        draggedCube.throwRot = angularVel * 2;
    });

    canvas.addEventListener('touchend', () => {
        if (draggedCube) {
            draggedCube.throwX = mouseVelX * 0.8;
            draggedCube.throwY = mouseVelY * 0.8;
            draggedCube.throwRot = angularVel * 3;
        }
        draggedCube = null;
    });

    function animateCubes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!cubesStarted) {
            requestAnimationFrame(animateCubes);
            return;
        }

        if (stopping) {
            speedMultiplier *= 0.97;
            if (speedMultiplier < 0.01) {
                speedMultiplier = 0;
                stopping = false;
                cubesInteractive = true;
            }
        }

        cubes.forEach(cube => {
            if (cube !== draggedCube) {
                // Throw physics
                if (cube.throwX || cube.throwY || cube.throwRot) {
                    cube.x += cube.throwX || 0;
                    cube.y += cube.throwY || 0;
                    cube.rotation += cube.throwRot || 0;
                    cube.throwX *= 0.95;
                    cube.throwY *= 0.95;
                    cube.throwRot *= 0.95;
                    if (Math.abs(cube.throwX) < 0.1) cube.throwX = 0;
                    if (Math.abs(cube.throwY) < 0.1) cube.throwY = 0;
                    if (Math.abs(cube.throwRot) < 0.001) cube.throwRot = 0;
                } else {
                    cube.y -= cube.baseSpeedY * speedMultiplier;
                    cube.x += cube.speedX * speedMultiplier;
                }
            }
            cube.rotation += cube.rotSpeed * 0.4;

            // Bounce off edges (only after cubes stop)
            if (cubesInteractive) {
                const half = cube.size / 2;
                if (cube.x - half < 0) {
                    cube.x = half;
                    cube.speedX = Math.abs(cube.speedX);
                    if (cube.throwX) cube.throwX = Math.abs(cube.throwX) * 0.8;
                    cube.rotSpeed = -cube.rotSpeed;
                } else if (cube.x + half > canvas.width) {
                    cube.x = canvas.width - half;
                    cube.speedX = -Math.abs(cube.speedX);
                    if (cube.throwX) cube.throwX = -Math.abs(cube.throwX) * 0.8;
                    cube.rotSpeed = -cube.rotSpeed;
                }
                if (cube.y - half < 0) {
                    cube.y = half;
                    cube.baseSpeedY = Math.abs(cube.baseSpeedY);
                    if (cube.throwY) cube.throwY = Math.abs(cube.throwY) * 0.8;
                    cube.rotSpeed = -cube.rotSpeed;
                } else if (cube.y + half > canvas.height) {
                    cube.y = canvas.height - half;
                    cube.baseSpeedY = -Math.abs(cube.baseSpeedY);
                    if (cube.throwY) cube.throwY = -Math.abs(cube.throwY) * 0.8;
                    cube.rotSpeed = -cube.rotSpeed;
                }
            }

            drawCube(cube);
        });

        requestAnimationFrame(animateCubes);
    }

    function stopCubes() {
        stopping = true;
    }

    resizeCanvas();
    animateCubes();

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    setTimeout(startCubes, 100);

    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');

    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            nav.classList.remove('active');
            burger.classList.remove('active');

            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            window.scrollTo({
                top: target.offsetTop - 56,
                behavior: 'smooth'
            });
        });
    });

    // Smooth scroll for hero buttons
    document.querySelectorAll('.btn-main, .btn-ghost').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 56,
                    behavior: 'smooth'
                });
            }
        });
    });

    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Hero animation
    const heroLabel = document.querySelector('[data-hero]');
    const scrambleEl = document.querySelector('[data-scramble]');
    const typeEl = document.querySelector('[data-type]');
    const heroDesc = document.querySelector('.hero-desc');
    const heroBtns = document.querySelector('.hero-buttons');
    const heroStats = document.querySelector('.hero-stats');

    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    function scrambleText(el, finalText, duration, callback) {
        const steps = 20;
        const stepTime = duration / steps;
        let step = 0;

        const interval = setInterval(() => {
            let result = '';
            const progress = step / steps;

            for (let i = 0; i < finalText.length; i++) {
                if (i < finalText.length * progress) {
                    result += finalText[i];
                } else {
                    result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                }
            }

            el.textContent = result;
            step++;

            if (step > steps) {
                clearInterval(interval);
                el.textContent = finalText;
                if (callback) callback();
            }
        }, stepTime);
    }

    function typeText(el, text, speed, callback) {
        el.textContent = '';
        el.style.borderRight = '2px solid var(--red)';
        let i = 0;

        function type() {
            if (i < text.length) {
                el.textContent += text[i];
                i++;
                setTimeout(type, speed);
            } else {
                setTimeout(() => {
                    el.style.borderRight = 'none';
                    if (callback) callback();
                }, 400);
            }
        }

        type();
    }

    function fadeSlideIn(el, delay, callback) {
        setTimeout(() => {
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            if (callback) setTimeout(callback, 600);
        }, delay);
    }

    function runHeroAnimation() {
        heroLabel.style.opacity = '0';
        heroLabel.style.transform = 'translateY(10px)';

        scrambleEl.style.opacity = '0';
        scrambleEl.style.transform = 'scale(0.8)';

        typeEl.style.opacity = '0';
        typeEl.style.transform = 'translateX(-20px)';

        heroDesc.style.opacity = '0';
        heroDesc.style.transform = 'translateY(15px)';

        heroBtns.style.opacity = '0';
        heroBtns.style.transform = 'translateY(20px)';

        heroStats.style.opacity = '0';
        heroStats.style.transform = 'translateY(15px)';

        setTimeout(() => {
            heroLabel.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            heroLabel.style.opacity = '1';
            heroLabel.style.transform = 'translateY(0)';
        }, 200);

        setTimeout(() => {
            scrambleEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            scrambleEl.style.opacity = '1';
            scrambleEl.style.transform = 'scale(1)';

            scrambleText(scrambleEl, 'BLUM', 800, () => {
                scrambleEl.style.textShadow = '3px 3px 0 rgba(37, 99, 235, 0.4)';

                setTimeout(() => {
                    typeEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    typeEl.style.opacity = '1';
                    typeEl.style.transform = 'translateX(0)';

                    typeText(typeEl, 'EXPERIMENT', 60, () => {
                        fadeSlideIn(heroDesc, 100, () => {
                            fadeSlideIn(heroBtns, 100, () => {
                                fadeSlideIn(heroStats, 100, () => {
                                    stopCubes();
                                });
                            });
                        });
                    });
                }, 200);
            });
        }, 600);
    }

    setTimeout(runHeroAnimation, 300);

    // Scroll animations
    const animatedElements = document.querySelectorAll('.about-item, .news-item, .contact-card, .download-box, .screenshot-item');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.willChange = 'transform, opacity';
    });

    function animateOnScroll() {
        const viewportHeight = window.innerHeight;

        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elCenter = rect.top + rect.height / 2;
            const viewportCenter = viewportHeight / 2;
            const dist = elCenter - viewportCenter;
            const threshold = viewportHeight * 0.6;

            if (dist < -threshold) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(-30px) scale(0.96)';
            } else if (dist > threshold) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px) scale(0.96)';
            } else {
                let progress = 1 - Math.abs(dist) / threshold;
                progress = Math.max(0, Math.min(1, progress));

                const ease = 1 - Math.pow(1 - progress, 3);

                const dir = dist > 0 ? 1 : -1;
                const yOffset = (1 - ease) * 30 * dir;

                el.style.opacity = String(ease);
                el.style.transform = `translateY(${yOffset}px) scale(${0.96 + ease * 0.04})`;
            }
        });

        requestAnimationFrame(animateOnScroll);
    }

    requestAnimationFrame(animateOnScroll);

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const screenshots = document.querySelectorAll('.screenshot-item img');
    let currentIndex = 0;

    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = screenshots[index].src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + screenshots.length) % screenshots.length;
        lightboxImg.src = screenshots[currentIndex].src;
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % screenshots.length;
        lightboxImg.src = screenshots[currentIndex].src;
    }

    screenshots.forEach((img, i) => {
        img.closest('.screenshot-item').style.cursor = 'pointer';
        img.closest('.screenshot-item').addEventListener('click', () => openLightbox(i));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrev);
    lightboxNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
});
