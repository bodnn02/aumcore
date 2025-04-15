
gsap.registerPlugin(ScrollTrigger);

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

        ScrollTrigger.create({
            trigger: el,
            start: "top 80%",
            end: "bottom 20%",
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: finalValue,
                    duration: 3,
                    ease: "power2.out",
                    onUpdate: function () {
                        el.innerText = Math.round(this.targets()[0].val) + suffix;
                    }
                });
            },
            onLeaveBack: () => {
                el.innerText = "0" + suffix;
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", animateNumbers);

window.addEventListener("DOMContentLoaded", () => {
    const selectors = {
        img: ".main-section__img",
        h1: ".main-section__h1",
        logo: ".header__logo",
        main: ".main-section",
        pros: ".pros-section"
    };

    const elements = {
        img: document.querySelector(selectors.img),
        h1: document.querySelector(selectors.h1),
        logo: document.querySelector(selectors.logo),
        mainSection: document.querySelector(selectors.main),
        prosSection: document.querySelector(selectors.pros)
    };

    const imgClone = elements.img.cloneNode(true);
    Object.assign(imgClone.style, {
        position: "absolute",
        objectFit: "contain",
        opacity: 0,
        pointerEvents: "none",
        display: "none"
    });
    elements.logo.insertBefore(imgClone, elements.logo.firstChild);

    const resetStyles = el => {
        ["position", "top", "left", "width", "zIndex"].forEach(prop => {
            el.style[prop] = "";
        });
    };

    const animateProsFixation = () => {
        elements.prosSection.scrollIntoView({ block: "start" });

        Object.assign(elements.prosSection.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            zIndex: "999"
        });

        setTimeout(() => {
            resetStyles(elements.prosSection);
            elements.prosSection.scrollIntoView({ block: "start" });
        }, 1500);
    };

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: selectors.main,
            start: "top top",
            end: "+=1000",
            pin: true,
            scrub: true,
            onEnter: () => {
                elements.mainSection.scrollIntoView({ block: "start", behavior: "smooth" });
            },
            onLeave: animateProsFixation,
            onUpdate: (self) => {
                if (self.progress >= 0.3 && !self.trigger._animationStarted) {
                    self.trigger._animationStarted = true;
                    startProsAnimation?.();
                }
            }
        }
    });

    timeline.to(elements.h1, {
        opacity: 0,
        y: -50,
        duration: 0.5
    }, 0);

    timeline.to(elements.img, {
        x: () => elements.logo.getBoundingClientRect().left - elements.img.getBoundingClientRect().left,
        y: () => elements.logo.getBoundingClientRect().top - elements.img.getBoundingClientRect().top,
        scaleX: () => elements.logo.offsetWidth / elements.img.offsetWidth,
        scaleY: () => elements.logo.offsetHeight / elements.img.offsetHeight,
        transformOrigin: "top left",
        duration: 1.5
    }, 0);

    timeline.to(imgClone, {
        opacity: 1,
        duration: 0.2,
        onStart: () => { imgClone.style.display = "block"; },
        onComplete: () => { imgClone.removeAttribute("style"); }
    }, 0.9);

    timeline.set(elements.img, { opacity: 0 }, 0.9);
});


function startProsAnimation() {
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
        rotation: 0,
        opacity: 1,
        duration: 1,
        pin: true,
        ease: "power3.out",
        onComplete: () => {
            gsap.to(diamond, {
                scale: 1,
                rotation: 45,
                opacity: 0,
                duration: 1.5,
                onComplete: () => {
                    diamond.remove();
                    img.style.opacity = "1";
                    animateDiamondLinesWithScroll();
                }
            });
        }
    });
}

function animateDiamondLinesWithScroll() {
    const items = document.querySelectorAll(".pros-list__item");
    const direction = ["right", "left"];

    document.querySelectorAll(".line-container").forEach(el => el.remove());

    const animations = [];

    items.forEach((item, index) => {
        const currentIcon = item.querySelector(".pros-list__item-icon");
        if (!currentIcon) return;

        const currentTextWrapper = item.querySelector(".pros-list__item-wrapper");
        if (!currentTextWrapper) return;

        const nextItem = items[index + 1];
        if (!nextItem) return;

        const lineContainer = document.createElement("div");
        lineContainer.classList.add("line-container");

        const horizLine = document.createElement("div");
        horizLine.classList.add("line-horizontal", direction[index % 2]);

        const vertLine = document.createElement("div");
        vertLine.classList.add("line-vertical");

        lineContainer.appendChild(horizLine);
        lineContainer.appendChild(vertLine);
        currentIcon.appendChild(lineContainer);

        const tl_lines = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "center center",
                end: "+=1000",
                scrub: true,
                pin: true,
                pinSpacing: true
            }
        });

        tl_lines.fromTo(horizLine,
            { width: 0 },
            { width: "585px", ease: "none" }
        ).fromTo(vertLine,
            { height: 0 },
            { height: "380px", ease: "none" },
            ">"
        );


        animations.push(tl_lines);

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 60%",
                end: "bottom top",
                scrub: true,
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

        if (index > 0) {
            if (index === 1) {
                tl.to(currentIcon, {
                    ease: "power3.out",
                    duration: 1.5
                }, ">")
                    .add(() => {
                        if (!animations[index - 1].isActive()) {
                            return;
                        }
                    });

                tl_text.to(currentTextWrapper, {
                    ease: "power3.out",
                    duration: 1.5
                }, ">");
            } else {
                tl.to(currentIcon, {
                    ease: "power3.out",
                    duration: 1.5
                }, ">");

                tl_text.to(currentTextWrapper, {
                    ease: "power3.out",
                    duration: 1.5
                }, ">");
            }
        }
    });
}