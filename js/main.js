function animateNumbers() {
    const numbers = document.querySelectorAll(".pros-list__item-number");

    numbers.forEach((el) => {
        const text = el.getAttribute("data-value") || el.innerText.trim();
        const match = text.match(/^(\d+)(%?)$/);

        if (!match) return;

        const finalValue = parseInt(match[1], 10);
        const suffix = match[2];

        if (!el.getAttribute("data-value")) {
            el.setAttribute("data-value", text);
        }

        el.innerText = "0" + suffix;

        gsap.to({
            val: 0
        }, {
            val: finalValue,
            duration: 2,
            ease: "power2.out",
            onUpdate: function () {
                el.innerText = Math.round(this.targets()[0].val) + suffix;
            }
        });
    });
}

gsap.registerPlugin(ScrollTrigger);

let mainAnimationComplete = false;
let numbersAnimated = false;
let linesAnimated = false;
let scrollLocked = false;
let scrollDirection = null;

let originalScrollY = 0;
let targetSection = null;

function toggleScrollLock(lock) {
    if (lock && !scrollLocked) {
        originalScrollY = window.scrollY;

        document.body.style.position = 'fixed';
        document.body.style.top = `-${originalScrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflowY = 'scroll';

        scrollLocked = true;
    } else if (!lock && scrollLocked) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';

        scrollLocked = false;
    }
}

function jumpToSection(selector) {
    const section = document.querySelector(selector);
    if (!section) return;

    const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;

    toggleScrollLock(false);

    window.scrollTo({
        top: sectionTop,
        behavior: 'auto'
    });
}

const forwardTimeline = gsap.timeline({
    paused: true,
    onComplete: () => {
        mainAnimationComplete = true;
        jumpToSection('.pros-section');
        setTimeout(startProsAnimation, 100);
    }
});

forwardTimeline
    .to(".main-section__h1", {
        opacity: 0,
        y: -50,
        duration: 1
    })
    .to("#main-section__img", {
        scale: 0.3,
        x: () => {
            const img = document.getElementById("main-section__img");
            const logo = document.querySelector(".header__logo-img");
            return logo.getBoundingClientRect().left - img.getBoundingClientRect().left;
        },
        y: () => {
            const img = document.getElementById("main-section__img");
            const logo = document.querySelector(".header__logo-img");
            return logo.getBoundingClientRect().top - img.getBoundingClientRect().top;
        },
        duration: 1,
        ease: "power2.inOut"
    });

const backwardTimeline = gsap.timeline({
    paused: true,
    onComplete: () => {
        mainAnimationComplete = false;
        jumpToSection('.main-section');
        reverseProsAnimation();
    }
});

backwardTimeline
    .fromTo("#main-section__img", {
        scale: 0.3,
        x: () => {
            const img = document.getElementById("main-section__img");
            const logo = document.querySelector(".header__logo-img");
            return logo.getBoundingClientRect().left - img.getBoundingClientRect().left;
        },
        y: () => {
            const img = document.getElementById("main-section__img");
            const logo = document.querySelector(".header__logo-img");
            return logo.getBoundingClientRect().top - img.getBoundingClientRect().top;
        }
    }, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 1,
        ease: "power2.inOut"
    })
    .fromTo(".main-section__h1", {
        opacity: 0,
        y: -50
    }, {
        opacity: 1,
        y: 0,
        duration: 1
    });

function setupScrollTriggers() {
    const mainSectionMarker = ScrollTrigger.create({
        trigger: ".main-section",
        start: "top top",
        end: "bottom bottom",
        onLeave: () => {
            if (!mainAnimationComplete) {
                scrollDirection = 'down';
                toggleScrollLock(true);
                forwardTimeline.play();
            }
        },
    });

    const prosSectionMarker = ScrollTrigger.create({
        trigger: ".pros-section",
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
            if (mainAnimationComplete) {
                startProsAnimation();
            }
        },
        onLeaveBack: () => {
            if (mainAnimationComplete) {
                scrollDirection = 'up';
                toggleScrollLock(false);
                backwardTimeline.play();
            }
        }
    });

    document.addEventListener('wheel', handleWheelEvent, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('keydown', handleKeyDown, { passive: false });
}

function handleWheelEvent(e) {
    const mainSection = document.querySelector('.main-section');
    const prosSection = document.querySelector('.pros-section');
    if (!mainSection || !prosSection) return;

    const mainRect = mainSection.getBoundingClientRect();
    const prosRect = prosSection.getBoundingClientRect();

    if (mainRect.top <= 0 && mainRect.bottom > 0 && !mainAnimationComplete && e.deltaY > 0) {
        e.preventDefault();
        scrollDirection = 'down';
        toggleScrollLock(true);
        forwardTimeline.play();
    }
}

function handleTouchMove(e) {
    if (scrollLocked) {
        e.preventDefault();
    }
}

function handleKeyDown(e) {
    const mainSection = document.querySelector('.main-section');
    const prosSection = document.querySelector('.pros-section');
    if (!mainSection || !prosSection) return;

    const mainRect = mainSection.getBoundingClientRect();
    const prosRect = prosSection.getBoundingClientRect();

    if ((e.key === 'ArrowDown' || e.key === 'PageDown') &&
        mainRect.top <= 0 && mainRect.bottom > 0 && !mainAnimationComplete) {
        e.preventDefault();
        scrollDirection = 'down';
        toggleScrollLock(true);
        forwardTimeline.play();
    }

    if ((e.key === 'ArrowUp' || e.key === 'PageUp') &&
        prosRect.top <= 0 && prosRect.bottom > window.innerHeight && mainAnimationComplete) {
        e.preventDefault();
        scrollDirection = 'up';
        toggleScrollLock(true);
        backwardTimeline.play();
    }
}

function startProsAnimation() {
    if (numbersAnimated) return;

    const firstItem = document.querySelector(".pros-list__item");
    if (!firstItem) return;

    const icon = firstItem.querySelector(".pros-list__item-icon");
    if (!icon) return;

    const img = icon.querySelector("img");
    if (!img) return;

    img.style.opacity = "0";

    const existingDiamond = icon.querySelector(".diamond-placeholder");
    if (existingDiamond) existingDiamond.remove();

    const diamond = document.createElement("div");
    diamond.classList.add("diamond-placeholder");
    icon.appendChild(diamond);

    Object.assign(diamond.style, {
        transform: "scale(0.1) rotate(0deg)",
        opacity: "0"
    });

    gsap.to(diamond, {
        scale: 1,
        rotation: 45,
        opacity: 1,
        duration: 1.0,
        ease: "power3.out",
        onComplete: () => {
            gsap.to(diamond, {
                scale: 1.3,
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    diamond.remove();
                    img.style.opacity = "1";
                    numbersAnimated = true;
                    animateNumbers();
                    animateDiamondLinesWithScroll();
                }
            });
        }
    });
}

function reverseProsAnimation() {
    numbersAnimated = false;
    linesAnimated = false;

    const numbers = document.querySelectorAll(".pros-list__item-number");
    numbers.forEach((el) => {
        const text = el.getAttribute("data-value") || el.innerText.trim();
        const match = text.match(/^(\d+)(%?)$/);
        if (match) {
            const suffix = match[2];
            el.innerText = "0" + suffix;
        }
    });

    const lineContainers = document.querySelectorAll(".line-container");
    lineContainers.forEach(container => {
        gsap.to(container, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => container.remove()
        });
    });

    const firstItem = document.querySelector(".pros-list__item");
    if (firstItem) {
        const icon = firstItem.querySelector(".pros-list__item-icon");
        const img = icon.querySelector("img");

        if (img) {
            gsap.to(img, {
                opacity: 0,
                duration: 0.5
            });
        }
    }
}

function animateDiamondLinesWithScroll() {
    const items = document.querySelectorAll(".pros-list__item");
    const direction = ["right", "left"];

    document.querySelectorAll(".line-container").forEach(el => el.remove());

    items.forEach((item, index) => {
        const currentIcon = item.querySelector(".pros-list__item-icon");
        if (!currentIcon) return;

        const currentTextWrapper = item.querySelector(".pros-list__item-wrapper");
        if (!currentTextWrapper) return;

        const lineContainer = document.createElement("div");
        lineContainer.classList.add("line-container");

        const horizLine = document.createElement("div");
        horizLine.classList.add("line-horizontal", direction[index % 2]);

        const vertLine = document.createElement("div");
        vertLine.classList.add("line-vertical");

        lineContainer.appendChild(horizLine);
        lineContainer.appendChild(vertLine);
        currentIcon.appendChild(lineContainer);

        if (index > 0) {
            gsap.set(currentIcon, {
                y: 600
            });

            gsap.set(currentTextWrapper, {
                y: 600
            });
        }

        const tl_lines = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 10%",  
                end: "bottom 50%",     
                scrub: true
            }
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 58%", 
                end: "top 48%",      
                scrub: true
            }
        });

        const tl_text = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 50%", 
                end: "top 40%",      
                scrub: true
            }
        });

        tl_lines.fromTo(horizLine, {
            width: 0
        }, {
            width: "585px",
            ease: "power2.out",
            duration: 1
        })
        .fromTo(vertLine, {
            height: 0
        }, {
            height: "380px",
            ease: "power2.out",
            duration: 1
        }, "<+1");

        if (index > 0) {
            tl.to(currentIcon, {
                y: 0,
                ease: "power3.out",
                duration: 1.5
            }, ">");

            tl_text.to(currentTextWrapper, {
                y: 0,
                ease: "power3.out",
                duration: 1.5
            }, ">");
        }
    });
}

function resetMainSection() {
    gsap.set(".main-section__h1", { opacity: 1, y: 0 });
    gsap.set("#main-section__img", { scale: 1, x: 0, y: 0 });
}

function resetProsSection() {
    const numbers = document.querySelectorAll(".pros-list__item-number");
    numbers.forEach((el) => {
        const text = el.getAttribute("data-value") || el.innerText.trim();
        const match = text.match(/^(\d+)(%?)$/);
        if (match) {
            const suffix = match[2];
            el.innerText = "0" + suffix;
        }
    });

    const lineContainers = document.querySelectorAll(".line-container");
    lineContainers.forEach(container => container.remove());
}

document.addEventListener('DOMContentLoaded', () => {
    resetMainSection();
    resetProsSection();

    setupScrollTriggers();

    gsap.registerPlugin(ScrollToPlugin);
});