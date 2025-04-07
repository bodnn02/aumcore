function animateNumbers() {
    const numbers = document.querySelectorAll(".pros-list__item-number");

    numbers.forEach((el) => {
        const text = el.getAttribute("data-value") || el.innerText.trim();
        const match = text.match(/^(\d+)(%?)$/);

        if (!match) return;

        const finalValue = parseInt(match[1], 10);
        const suffix = match[2];
        
        // Сохраняем оригинальное значение как атрибут, если еще не сохранено
        if (!el.getAttribute("data-value")) {
            el.setAttribute("data-value", text);
        }

        // Обнуляем начальное значение
        el.innerText = "0" + suffix;

        gsap.to({
            val: 0
        }, {
            val: finalValue,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
                el.innerText = Math.round(this.targets()[0].val) + suffix;
            }
        });
    });
}

gsap.registerPlugin(ScrollTrigger);

// Глобальные флаги для отслеживания состояния анимации
let numbersAnimated = false;
let linesAnimated = false;

// 1. "Залипание" main-section при скролле с обратной анимацией
ScrollTrigger.create({
    trigger: ".main-section",
    start: "top top",
    end: "+=300",
    pin: true,
    scrub: true,
    onLeave: () => startProsAnimation(),
    onEnterBack: () => reverseProsAnimation(),
    id: "main-pin"
});

// 2. Анимация исчезновения заголовка и перемещения img с обратной анимацией
gsap.timeline({
    scrollTrigger: {
        trigger: ".main-section",
        start: "top top",
        end: "+=300",
        scrub: true,
        id: "main-animation" 
    }
})
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

// 3. Плавная анимация ромба и иконки
function startProsAnimation() {
    if (numbersAnimated) return;

    const firstItem = document.querySelector(".pros-list__item");
    if (!firstItem) return;

    const icon = firstItem.querySelector(".pros-list__item-icon");
    if (!icon) return;

    const img = icon.querySelector("img");
    if (!img) return;

    img.style.opacity = "0";

    // Удаляем существующий placeholder, если он есть
    const existingDiamond = icon.querySelector(".diamond-placeholder");
    if (existingDiamond) existingDiamond.remove();

    const diamond = document.createElement("div");
    diamond.classList.add("diamond-placeholder");
    icon.appendChild(diamond);

    // Убедимся, что начальные стили установлены
    Object.assign(diamond.style, {
        transform: "scale(0.1) rotate(0deg)",
        opacity: "0"
    });

    // Анимация: квадрат становится ромбом
    gsap.to(diamond, {
        scale: 1,
        rotation: 45,
        opacity: 1,
        duration: 1.0,
        ease: "power3.out",
        onComplete: () => {
            // Расширяем и исчезаем
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


// Новая функция для обратной анимации
function reverseProsAnimation() {
    numbersAnimated = false;
    linesAnimated = false;
    
    // Сбрасываем видимость чисел к начальным значениям
    const numbers = document.querySelectorAll(".pros-list__item-number");
    numbers.forEach((el) => {
        const text = el.getAttribute("data-value") || el.innerText.trim();
        const match = text.match(/^(\d+)(%?)$/);
        if (match) {
            const suffix = match[2];
            el.innerText = "0" + suffix;
        }
    });

    // Удаляем все созданные линии
    const lineContainers = document.querySelectorAll(".line-container");
    lineContainers.forEach(container => {
        gsap.to(container, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => container.remove()
        });
    });

    // Возвращаем первую иконку к исходному состоянию
    const firstItem = document.querySelector(".pros-list__item");
    if (firstItem) {
        const icon = firstItem.querySelector(".pros-list__item-icon");
        const img = icon.querySelector("img");
        
        if (img) {
            // Плавно возвращаем иконку
            gsap.to(img, {
                opacity: 0,
                duration: 0.5
            });
        }
    }
}

// 4. Отрисовка линий от ромба к ромбу с возможностью обратной анимации
function animateDiamondLinesWithScroll() {
    const items = document.querySelectorAll(".pros-list__item");
    const direction = ["right", "left"]; // Чередование

    // Удаляем старые линии
    document.querySelectorAll(".line-container").forEach(el => el.remove());

    items.forEach((item, index) => {
        const nextItem = items[index + 1];
        if (!nextItem) return;

        const currentIcon = item.querySelector(".pros-list__item-icon");
        if (!currentIcon) return;

        const lineContainer = document.createElement("div");
        lineContainer.classList.add("line-container");

        const horizLine = document.createElement("div");
        horizLine.classList.add("line-horizontal", direction[index % 2]);

        const vertLine = document.createElement("div");
        vertLine.classList.add("line-vertical");

        lineContainer.appendChild(horizLine);
        lineContainer.appendChild(vertLine);
        currentIcon.appendChild(lineContainer);

        // Создаем timeline с scrub-анимацией
        gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top center",
                end: "+=1300", // Длина скролла, за которую анимация происходит
                scrub: true
            }
        })
        .fromTo(horizLine, {
            width: 0
        }, {
            width: "604px",
            ease: "power2.out",
            duration: 1
        })
        .fromTo(vertLine, {
            height: 0
        }, {
            height: "380px",
            ease: "power2.out",
            duration: 1
        }, "<+0.8"); // запускаем вертикальную с задержкой после горизонтальной
    });
}


// Создаем отдельный триггер для запуска анимации чисел
ScrollTrigger.create({
    trigger: ".pros-list",
    start: "top center",
    onEnter: () => {
        if (!numbersAnimated) {
            numbersAnimated = true;
            animateNumbers();
        }
    },
    onLeaveBack: () => {
        numbersAnimated = false;
        // Сбрасываем числа на ноль при прокрутке назад
        const numbers = document.querySelectorAll(".pros-list__item-number");
        numbers.forEach((el) => {
            const text = el.getAttribute("data-value") || el.innerText.trim();
            const match = text.match(/^(\d+)(%?)$/);
            if (match) {
                const suffix = match[2];
                el.innerText = "0" + suffix;
            }
        });
    },
    id: "numbers-trigger"
});