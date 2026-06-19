type StarBitsOptions = {
    spawnEveryMs?: number;
    maxOnScreen?: number;
    starSize?: number;
    storageKey?: string;
};

export function createStarBits(options: StarBitsOptions = {}) {
    const spawnEveryMs = options.spawnEveryMs ?? 1500;
    const maxOnScreen = options.maxOnScreen ?? 8;
    const starSize = options.starSize ?? 28;
    const storageKey = options.storageKey ?? "starbits-total";

    let intervalId: number | null = null;
    let total = Number(localStorage.getItem(storageKey) ?? "0");
    let overlay: HTMLDivElement;
    let counter: HTMLDivElement;

    function setup() {
        overlay = document.createElement("div");
        overlay.className = "starbits-overlay";

        counter = document.createElement("div");
        counter.className = "starbits-counter";
        counter.textContent = `✦ ${total}`;

        document.body.appendChild(overlay);
        document.body.appendChild(counter);

        injectStyles();
    }

    function start() {
        if (!overlay) {
            setup();
        }

        if (intervalId !== null) {
            return;
        }

        intervalId = window.setInterval(() => {
            if (overlay.children.length >= maxOnScreen) {
                return;
            }

            spawnStarBit();
        }, spawnEveryMs);
    }

    function stop() {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function destroy() {
        stop();
        overlay?.remove();
        counter?.remove();
    }

    function getTotal() {
        return total;
    }

    function setTotal(value: number) {
        total = value;
        localStorage.setItem(storageKey, String(total));
        counter.textContent = `✦ ${total}`;
    }

    function spawnStarBit() {
        const textRects = getTextRects();
        const position = findSafePosition(textRects);

        if (!position) {
            return;
        }

        const star = document.createElement("button");
        star.className = "starbit";
        star.type = "button";
        star.textContent = "✦";

        star.style.left = `${position.x}px`;
        star.style.top = `${position.y}px`;
        star.style.width = `${starSize}px`;
        star.style.height = `${starSize}px`;

        star.addEventListener("mouseenter", () => collectStarBit(star), {
            once: true,
        });

        overlay.appendChild(star);
    }

    function findSafePosition(textRects: DOMRect[]) {
        const padding = 20;
        const maxAttempts = 50;

        for (let i = 0; i < maxAttempts; i++) {
            const x = randomBetween(padding, window.innerWidth - starSize - padding);
            const y = randomBetween(padding, window.innerHeight - starSize - padding);

            const overlapsText = overlapsAnyTextRect(x, y, starSize, textRects);

            if (!overlapsText) {
                return { x, y };
            }
        }

        return null;
    }

    function collectStarBit(star: HTMLElement) {
        const starRect = star.getBoundingClientRect();
        const counterRect = counter.getBoundingClientRect();

        const dx =
            counterRect.left +
            counterRect.width / 2 -
            (starRect.left + starRect.width / 2);

        const dy =
            counterRect.top +
            counterRect.height / 2 -
            (starRect.top + starRect.height / 2);

        star.style.pointerEvents = "none";
        star.style.transform = `translate(${dx}px, ${dy}px) scale(0.2) rotate(360deg)`;
        star.style.opacity = "0";

        window.setTimeout(() => {
            star.remove();
            setTotal(total + 1);
        }, 500);
    }

    function randomBetween(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    return {
        start,
        stop,
        destroy,
        getTotal,
        setTotal,
    };
}

function overlapsAnyTextRect(
    x: number,
    y: number,
    size: number,
    textRects: DOMRect[]
) {
    const margin = 6;

    const starRect = {
        left: x - margin,
        right: x + size + margin,
        top: y - margin,
        bottom: y + size + margin,
    };

    return textRects.some(rect => {
        return !(
            starRect.right < rect.left ||
            starRect.left > rect.right ||
            starRect.bottom < rect.top ||
            starRect.top > rect.bottom
        );
    });
}

function getTextRects(): DOMRect[] {
    const rects: DOMRect[] = [];

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node) {
                if (!node.textContent?.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }

                const parent = node.parentElement;
                if (!parent) {
                    return NodeFilter.FILTER_REJECT;
                }

                if (
                    parent.closest(".starbits-overlay") ||
                    parent.closest(".starbits-counter")
                ) {
                    return NodeFilter.FILTER_REJECT;
                }

                const style = window.getComputedStyle(parent);

                if (
                    style.display === "none" ||
                    style.visibility === "hidden" ||
                    Number(style.opacity) === 0
                ) {
                    return NodeFilter.FILTER_REJECT;
                }

                return NodeFilter.FILTER_ACCEPT;
            },
        }
    );

    let node: Node | null;

    while ((node = walker.nextNode())) {
        const range = document.createRange();
        range.selectNodeContents(node);

        for (const rect of Array.from(range.getClientRects())) {
            if (rect.width > 0 && rect.height > 0) {
                rects.push(rect);
            }
        }

        range.detach();
    }

    return rects;
}

function injectStyles() {
    if (document.getElementById("starbits-styles")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "starbits-styles";
    style.textContent = `
    .starbits-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999999;
      overflow: hidden;
    }

    .starbit {
      position: fixed;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: gold;
      font-size: 28px;
      cursor: pointer;
      pointer-events: auto;
      transition:
        transform 500ms ease-in,
        opacity 500ms ease-in;
      filter: drop-shadow(0 0 4px rgba(255, 220, 80, 0.8));
      animation: starbit-float 900ms ease-in-out infinite alternate;
    }

    .starbit:hover {
      transform: scale(1.25);
    }

    .starbits-counter {
      position: fixed;
      left: 50%;
      bottom: 24px;
      transform: translateX(-50%);
      z-index: 1000000;
      padding: 8px 14px;
      border-radius: 999px;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      font-family: system-ui, sans-serif;
      font-size: 20px;
      pointer-events: none;
    }

    @keyframes starbit-float {
      from {
        translate: 0 0;
      }

      to {
        translate: 0 -6px;
      }
    }
  `;

    document.head.appendChild(style);
}