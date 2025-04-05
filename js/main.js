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
    // Проверяем, были ли уже запущены анимации чисел
    if (numbersAnimated) return;
    
    const firstItem = document.querySelector(".pros-list__item");
    if (!firstItem) return;
    
    const icon = firstItem.querySelector(".pros-list__item-icon");
    if (!icon) return;
    
    const img = icon.querySelector("img");
    if (!img) return;

    img.style.opacity = "0";

    // Удаляем существующий ромб, если он есть
    const existingDiamond = icon.querySelector(".diamond-placeholder");
    if (existingDiamond) existingDiamond.remove();

    const diamond = document.createElement("div");
    diamond.classList.add("diamond-placeholder");
    icon.appendChild(diamond);

    gsap.fromTo(diamond, {
        scale: 0.1,
        opacity: 0,
    }, {
        scale: 1,
        opacity: 1,
        duration: 1.0,
        ease: "power3.out",
        onComplete: () => {
            gsap.to(diamond, {
                opacity: 0,
                scale: 1.3,
                duration: 0.5,
                onComplete: () => {
                    diamond.remove();
                    img.style.opacity = "1";
                    numbersAnimated = true;
                    animateNumbers();
                    animateDiamondLines();
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
function animateDiamondLines() {
    // Проверяем, были ли уже запущены анимации линий
    if (linesAnimated) return;
    linesAnimated = true;
    
    // Удаляем существующие линии перед созданием новых
    const existingLines = document.querySelectorAll(".line-container");
    existingLines.forEach(line => line.remove());

    const items = document.querySelectorAll(".pros-list__item");
    const direction = ["right", "left"]; // чередование
    const initialDelay = 0.5; // Задержка перед началом всей анимации (в секундах)

    items.forEach((item, index) => {
        if (!items[index + 1]) return;

        const current = item.querySelector(".pros-list__item-icon");
        if (!current) return;

        const lineContainer = document.createElement("div");
        lineContainer.classList.add("line-container");

        const horizLine = document.createElement("div");
        horizLine.classList.add("line-horizontal");
        horizLine.classList.add(direction[index % 2]);

        const vertLine = document.createElement("div");
        vertLine.classList.add("line-vertical");

        lineContainer.appendChild(horizLine);
        lineContainer.appendChild(vertLine);
        current.appendChild(lineContainer);

        const baseDelay = index * 0.5 + initialDelay;

        // Анимация горизонтальной линии
        gsap.fromTo(horizLine, {
            width: 0
        }, {
            width: "560px",
            duration: 0.6,
            delay: baseDelay,
            ease: "power1.out"
        });

        // Анимация вертикальной линии
        gsap.fromTo(vertLine, {
            height: 0
        }, {
            height: "380px",
            duration: 0.6,
            delay: baseDelay + 0.5,
            ease: "power1.out"
        });
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