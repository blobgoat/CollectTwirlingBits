/**
 * Represents the options for configuring the StarBits functionality.
 * @typedef {Object} StarBitsOptions
 * @property {number} [spawnEveryMs=1500] - The interval in milliseconds at which star bits should spawn.
 * @property {number} [maxOnScreen=8] - The maximum number of star bits that can be on screen at once.
 * @property {number} [starSize=28] - The size of each star bit in pixels.
 */
type StarBitsOptions = {
    spawnEveryMs?: number;
    maxOnScreen?: number;
    starSize?: number;
    storageKey?: string;
};

/**
 * Represents the position of a star bit on the screen.
 * @typedef {Object} StarPosition
 * @property {number} x - The x-coordinate of the star bit.
 * @property {number} y - The y-coordinate of the star bit.
 */
type StarPosition = {
    x: number;
    y: number;
};

/**
 * Represents the API for the StarBits functionality.
 * @typedef {Object} StarBitsApi
 * @property {Function} start - Starts the spawning of star bits.
 * @property {Function} stop - Stops the spawning of star bits.
 * @property {Function} destroy - Destroys the star bits overlay and counter.
 * @property {Function} getTotal - Gets the total number of collected star bits.
 * @property {Function} setTotal - Sets the total number of collected star bits.
 */
type StarBitsApi = {
    start: () => void;
    stop: () => void;
    destroy: () => void;
    getTotal: () => number;
    setTotal: (value: number) => void;
};

export function createStarBits(options: StarBitsOptions = {}) {
    const spawnEveryMs = options.spawnEveryMs ?? 1500;
    const maxOnScreen = options.maxOnScreen ?? 8;
    const starSize = options.starSize ?? 28;
    const storageKey = options.storageKey ?? "starbits-total";

    let intervalId: number | null = null;
    let total = Number(localStorage.getItem(storageKey) ?? "0");
    let overlay: HTMLDivElement | undefined;
    let counter: HTMLDivElement | undefined;

    /**
     * Initialized the overlay and conter elements, works as a reset method
     */
    function setup(): void {
        overlay = document.createElement("div");
        overlay.className = "starbits-overlay";

        counter = document.createElement("div");
        counter.className = "starbits-counter";
        counter.textContent = `✦ ${total}`;

        document.body.appendChild(overlay);
        document.body.appendChild(counter);

        injectStyles();
    }
    /**
     * starts the spawning at a set interval, if overlay isnt setup yet it will attemt to setup first
     * 
     */
    function start(): void {
        if (!overlay || overlay === undefined) {
            setup();
        }
        if (overlay === undefined || counter === undefined) {
            console.error("Failed to initialize StarBits overlay or counter.");
            return;
        }

        if (intervalId !== null) {
            return;
        }

        intervalId = window.setInterval(() => {
            //overlay is guarenteed to be defined here, compiler not smart enough
            if (overlay!.children.length >= maxOnScreen) {
                return;
            }

            spawnStarBit();
        }, spawnEveryMs);
    }
    /**
     * stops the spawing of starbits, but can be restarted with start()
     */
    function stop(): void {
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
    /**
     * completely removes overlay and counter elements, this is for memory! So only use for cleaning up.
     */
    function destroy(): void {
        stop();
        overlay?.remove();
        counter?.remove();
        overlay = undefined;
        counter = undefined;
    }

    /**
     * Returns the total number of collected star bits.
     */
    function getTotal(): number {
        return total;
    }

    function setTotal(value: number): void {
        if (counter === undefined) {
            console.error("Counter element is not defined. Cannot set total.");
            return;
        }
        total = value;
        localStorage.setItem(storageKey, String(total));
        counter.textContent = `✦ ${total}`;
    }

    /**
     * Spawns a new star bit at a random safe position. This will be called on regular intervals.
     */
    function spawnStarBit(): void {
        if (!overlay) {
            console.error("Overlay element is not defined. Cannot spawn star bit.");
            return;
        }
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
    /**
     * Finds a safe position for a new star bit that doesn't overlap with existing text.
     * @param textRects @type {DOMRect[]} an array of DOMRect objects representing the bounding boxes of text elements on the page
     * @returns @type({ x: number; y: number } | null)  if null no safe position was found
     */
    function findSafePosition(textRects: DOMRect[]): StarPosition | null {
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
    /**
     * This function handles the collection of a single star bit. It animates, adds sound effect, updates the total count, and removes the star bit from the DOM.
     * @param star @type(HTMLElement) The star that will be collected
     * @returns 
     */
    function collectStarBit(star: HTMLElement): void {
        if (counter === undefined) {
            console.error("Counter element is not defined. Cannot collect star bit.");
            return;
        }
        const starRect: DOMRect = star.getBoundingClientRect();
        const counterRect: DOMRect = counter.getBoundingClientRect();

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

    /**
     * Generates a random number between the specified minimum and maximum values.
     * @param min The minimum value (inclusive).
     * @param max The maximum value (exclusive).
     * @returns A random number between min and max.
     */
    function randomBetween(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    return {
        start,
        stop,
        destroy,
        getTotal,
        setTotal,
    } satisfies StarBitsApi;
}

/**
 * Checks if a position overlaps with any text rectangle.
 * @param x The x-coordinate of the position to check.
 * @param y The y-coordinate of the position to check.
 * @param size The size of the area to check.
 * @param textRects An array of DOMRect objects representing the bounding boxes of text elements on the page.
 * @returns A boolean indicating whether the position overlaps with any text rectangle.
 */
function overlapsAnyTextRect(
    x: number,
    y: number,
    size: number,
    textRects: DOMRect[]
): boolean {
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

/**
 * Gets the bounding rectangles of all text nodes on the page.
 * @returns An array of DOMRect objects representing the bounding boxes of text elements on the page.
 */
function getTextRects(): DOMRect[] {
    const rects: DOMRect[] = [];

    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode(node: Node) {
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

/**
 * Injects the necessary styles for the star bits into the document.
 */
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