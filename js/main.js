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
    const img = document.querySelector(".main-section__img");
    const h1 = document.querySelector(".main-section__h1");
    const logo = document.querySelector(".header__logo");
    const mainSection = document.querySelector(".main-section");
    const prosSection = document.querySelector(".pros-section");

    const imgClone = img.cloneNode(true);
    imgClone.style.position = "absolute";
    imgClone.style.top = 0;
    imgClone.style.left = 0;
    imgClone.style.width = "100%";
    imgClone.style.height = "100%";
    imgClone.style.objectFit = "contain";
    imgClone.style.opacity = 0;
    imgClone.style.pointerEvents = "none";
    imgClone.style.display = "none";
    logo.insertBefore(imgClone, logo.firstChild);

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".main-section",
            start: "top top",
            end: "bottom top",
            scrub: true,
            pin: ".pros-section",
            onLeave: () => {
                prosSection.scrollIntoView({
                    block: "start",
                    behavior: "smooth"
                });
                document.body.style.overflow = "hidden";

                startProsAnimation();

                setTimeout(() => {
                    document.body.style.overflow = "auto";
                }, 2000);
            },
            onEnter: () => {
                mainSection.scrollIntoView({
                    block: "start",
                    behavior: "smooth"
                });

                setTimeout(() => {
                    document.body.style.overflow = "auto";
                }, 2000);
            }
        }
    });

    timeline.to(h1, {
        opacity: 0,
        y: -50,
        duration: 0.5
    }, 0);

    timeline.to(img, {
        x: () => logo.getBoundingClientRect().left - img.getBoundingClientRect().left,
        y: () => logo.getBoundingClientRect().top - img.getBoundingClientRect().top,
        scaleX: () => logo.offsetWidth / img.offsetWidth,
        scaleY: () => logo.offsetHeight / img.offsetHeight,
        transformOrigin: "top left",
        duration: 1.5
    }, 0);

    timeline.to(imgClone, {
        opacity: 1,
        duration: 0.2,
        onStart: () => {
            imgClone.style.display = "block";
        },
        onComplete: () => {
            imgClone.removeAttribute("style");
        }
    }, 0.9);

    timeline.set(img, {
        opacity: 0
    }, 0.9);
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

    // Удаляем существующие контейнеры линий
    document.querySelectorAll(".line-container").forEach(el => el.remove());

    // Массив для хранения всех timeline анимаций
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

        // Устанавливаем начальное положение для всех элементов кроме первого
        if (index > 0) {
            gsap.set(currentIcon, { y: 600 });
            gsap.set(currentTextWrapper, { y: 600 });
        }

        // Создаем таймлайн для анимации линий
        const tl_lines = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 45%",
                end: "+=700",
                scrub: 5,
            }
        });

        // Анимируем горизонтальную и вертикальную линии последовательно
        tl_lines.fromTo(horizLine,
            { width: 0 },
            { width: "585px", ease: "power2.out", duration: 1 }
        )
            .fromTo(vertLine,
                { height: 0 },
                {
                    height: "380px", ease: "power2.out", duration: 1,
                },
                "<+1"
            );

        // Сохраняем timeline для возможной синхронизации
        animations.push(tl_lines);

        // Анимация для иконки
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 60%",
                end: "+=700",
                scrub: true
            }
        });

        // Анимация для текста
        const tl_text = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 50%",
                end: "top 40%",
                scrub: true
            }
        });

        // Анимируем появление иконки и текста для элементов после первого
        if (index > 0) {
            // Связываем анимацию с предыдущей линией
            if (index === 1) {
                tl.to(currentIcon, {
                    y: 0,
                    ease: "power3.out",
                    duration: 1.5
                }, ">")
                    .add(() => {
                        // Проверка окончания анимации линии перед анимацией иконки
                        if (!animations[index - 1].isActive()) {
                            return;
                        }
                    });

                tl_text.to(currentTextWrapper, {
                    y: 0,
                    ease: "power3.out",
                    duration: 1.5
                }, ">");
            } else {
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
        }
    });
}