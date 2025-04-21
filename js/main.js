
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

const clearImgCloneStyles = (clone) => {
    ["position", "objectFit", "opacity", "pointerEvents", "display", "transform", "top", "left"].forEach(prop => {
        clone.style[prop] = "";
    });
};

window.addEventListener("DOMContentLoaded", () => {
    const selectors = {
        img: ".main-section__img",
        h1: ".main-section__h1",
        logo: ".header__logo",
        main: ".main-section",
        pros: ".pros-section",
        firstItem: ".main-section .pros-list__item",
        icon: ".main-section .pros-list__item .pros-list__item-icon",
        iconImg: ".main-section .pros-list__item .pros-list__item-icon img"
    };

    const elements = {
        img: document.querySelector(selectors.img),
        h1: document.querySelector(selectors.h1),
        logo: document.querySelector(selectors.logo),
        mainSection: document.querySelector(selectors.main),
        prosSection: document.querySelector(selectors.pros),
        firstItem: document.querySelector(selectors.firstItem),
        icon: document.querySelector(selectors.icon),
        iconImg: document.querySelector(selectors.iconImg)
    };

    if (!elements.img || !elements.h1 || !elements.logo || !elements.firstItem || !elements.icon || !elements.iconImg) return;

    const imgClone = elements.img.cloneNode(true);
    Object.assign(imgClone.style, {
        position: "absolute",
        objectFit: "contain",
        opacity: 0,
        pointerEvents: "none",
        display: "none"
    });
    elements.logo.appendChild(imgClone);

    const diamond = document.createElement("div");
    diamond.classList.add("diamond-placeholder");
    elements.iconImg.style.opacity = "0";
    elements.icon.appendChild(diamond);
    Object.assign(diamond.style, {
        transform: "scale(0.1) rotate(0deg)",
        opacity: "0",
        position: "absolute"
    });

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: selectors.main,
            start: "top top",
            end: "+=1000",
            pin: true,
            scrub: true
        }
    });

    // Step 1: H1 fade out
    timeline.to(elements.h1, {
        opacity: 0,
        y: -50,
        duration: 0.5
    }, 0);

    // Step 2: Animate image to logo
    timeline.to(elements.img, {
        x: () => elements.logo.getBoundingClientRect().left - elements.img.getBoundingClientRect().left,
        y: () => elements.logo.getBoundingClientRect().top - elements.img.getBoundingClientRect().top,
        scaleX: () => elements.logo.offsetWidth / elements.img.offsetWidth,
        scaleY: () => elements.logo.offsetHeight / elements.img.offsetHeight,
        transformOrigin: "top left",
        duration: 1.5
    }, 0);

    // Step 3: Fade in cloned image
    timeline.to(imgClone, {
        opacity: 1,
        duration: 0.2,
        onStart: () => {
            if (!elements.logo.contains(imgClone)) {
                elements.logo.appendChild(imgClone);
            }
            imgClone.style.display = "block";
        },
        onComplete: () => clearImgCloneStyles(imgClone),
        onReverseComplete: () => {
            imgClone.style.display = "none";
            imgClone.style.opacity = "0";
            clearImgCloneStyles(imgClone);
            if (elements.logo.contains(imgClone)) {
                imgClone.remove();
            }
        }
    }, 0.9);

    // Step 4: Hide original image
    timeline.set(elements.img, { opacity: 0 }, 0.9);

    // Step 5: Hide h1 and img display-wise and show pros item
    timeline.set([elements.h1, elements.img], { display: "none" }, 1);
    timeline.set(elements.firstItem, { display: "flex" }, 1);

    // Step 6: Diamond appear animation
    timeline.to(diamond, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
    }, 1);

    // Step 7: Diamond disappear with rotate and fade, then show icon img
    timeline.to(diamond, {
        scale: 1,
        rotation: 45,
        opacity: 0,
        duration: 1.5,
        onComplete: () => {
            diamond.remove();
        },
        onReverseComplete: () => {
            elements.icon.appendChild(diamond);
            Object.assign(diamond.style, {
                transform: "scale(0.1) rotate(0deg)",
                opacity: "0"
            });
        }
    }, 2);

    timeline.to(elements.iconImg, {
        opacity: 1,
        duration: 0.5
    }, 2.5);

    // Step 8: Animate lines from icon
    const lineContainer = document.createElement("div");
    lineContainer.classList.add("line-container");

    const horizLine = document.createElement("div");
    horizLine.classList.add("line-horizontal", 'right');

    const vertLine = document.createElement("div");
    vertLine.classList.add("line-vertical", 'right');

    lineContainer.appendChild(horizLine);
    lineContainer.appendChild(vertLine);

    timeline.set({}, {
        onComplete: () => {
            elements.icon.appendChild(lineContainer);
        }
    }, 2.4);

    timeline.fromTo(horizLine,
        { width: 0 },
        { width: "585px", ease: "none" },
        2.5
    ).fromTo(vertLine,
        { height: 0 },
        {
            height: "380px",
            ease: "none"
        },
        ">"
    );
});

function animateDiamondLinesWithScroll() {
    const items = document.querySelectorAll(".pros-section .pros-list__item");
    const direction = ["left","right"];

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
                end: "+=500",
                scrub: true
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
document.addEventListener("DOMContentLoaded", () => {
    const prosSection = document.querySelector('.pros-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateDiamondLinesWithScroll();
                observer.disconnect();
            }
        });
    }, {
        threshold: 0.5
    });

    observer.observe(prosSection);
});