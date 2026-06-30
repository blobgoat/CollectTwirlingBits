import { twirlingBitsStyle } from "./twirlingbit";
/**
 * Represents the options for configuring the StarBits functionality.
 * @typedef {Object} StarBitsOptions
 * @property {number} [spawnEveryMs=1500] - The interval in milliseconds at which star bits should spawn.
 * @property {number} [maxOnScreen=8] - The maximum number of star bits that can be on screen at once.
 * @property {number} [starSize=28] - The size of each star bit in pixels.
 */
export type StarBitsOptions = {
    spawnEveryMs?: number;
    maxOnScreen?: number;
    starSize?: number;
    storageKey?: string;
    speedOfSpin?: number;
    spawnOverImages?: boolean;
};

/**
 * Represents the position of a star bit on the screen.
 * @typedef {Object} StarPosition
 * @property {number} x - The x-coordinate of the star bit.
 * @property {number} y - The y-coordinate of the star bit.
 */
export type StarPosition = {
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
export type StarBitsApi = {
    start: () => void;
    stop: () => void;
    destroy: () => void;
    getTotal: () => number;
    setTotal: (value: number) => void;
};

export function createStarBits(options: StarBitsOptions = {}): StarBitsApi {
    const spawnEveryMs: number = options.spawnEveryMs ?? 1500;
    const maxOnScreen: number = options.maxOnScreen ?? 8;
    const starSize: number = options.starSize ?? 28;
    const storageKey: string = options.storageKey ?? "starbits-total";
    const speedOfSpin: number = options.speedOfSpin ?? 2000;
    const spawnOverImages: boolean = options.spawnOverImages ?? false;

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
        //want one to spawn immediately
        spawnStarBit();
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

        const textRects: DOMRect[] = getTextRects(spawnOverImages);
        const position: StarPosition | null = findSafePosition(textRects);

        if (!position) {
            return;
        }

        const star: HTMLButtonElement = document.createElement("button");
        star.className = "starbit";
        star.type = "button";

        const starIcon: HTMLSpanElement = document.createElement("span");
        starIcon.className = "starbit-spin";
        starIcon.textContent = "✦";
        starIcon.style.setProperty("--speed", `${speedOfSpin}ms`);

        star.appendChild(starIcon);

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
        const padding: number = 20;
        const maxAttempts: number = 80;

        let bestPosition: StarPosition | null = null;
        let bestScore: number = -Infinity;

        for (let i = 0; i < maxAttempts; i++) {
            const x: number = randomBetween(padding, window.innerWidth - starSize - padding);
            const y: number = randomBetween(padding, window.innerHeight - starSize - padding);

            const overlapsText: boolean = overlapsAnyTextRect(x, y, starSize, textRects);

            if (overlapsText) {
                continue;
            }

            const score: number = distanceFromNearestObstacle(x, y);

            if (score > bestScore) {
                bestScore = score;
                bestPosition = { x, y };
            }
        }

        return bestPosition;
    }
    /**
     * Calculates the distance from a position to the nearest obstacle, which includes screen edges and existing stars
     * @param x x-coordinate of a star
     * @param y y-coordinate of a star
     * @returns The distance from the position to the nearest obstacle
     */
    function distanceFromNearestObstacle(x: number, y: number): number {
        const distanceToScreenEdge: number = distanceFromNearestScreenEdge(x, y);
        const distanceToStarBit: number = distanceFromNearestStarBit(x, y);
        return Math.min(distanceToScreenEdge, distanceToStarBit);
    }

    /**
     * Calculates the distance from a position to the nearest screen edge.
     * @param x x-coordinate of star
     * @param y y-coordinate of star
     * @returns number The distance from the position to the nearest screen edge
     */
    function distanceFromNearestScreenEdge(x: number, y: number): number {
        const leftDistance: number = x;
        const rightDistance: number = window.innerWidth - (x + starSize);
        const topDistance: number = y;
        const bottomDistance: number = window.innerHeight - (y + starSize);
        return Math.min(leftDistance, rightDistance, topDistance, bottomDistance);
    }

    /**
     * Calculates the distance from a position to the nearest existing star bit.
     * @param x x-coordinate of a star
     * @param y y-coordinate of a star
     * @returns the distance from the position to the nearest star or infinity if no overlay exists
     */
    function distanceFromNearestStarBit(x: number, y: number): number {
        if (!overlay) {
            console.log("Overlay is not defined. Returning Infinity for distance to nearest star bit.");
            return Infinity;
        }

        const existingStars = Array.from(
            overlay.querySelectorAll<HTMLButtonElement>(".starbit")
        );

        if (existingStars.length === 0) {
            return Infinity;
        }

        const candidateCenterX: number = x + starSize / 2;
        const candidateCenterY: number = y + starSize / 2;

        let nearestDistance: number = Infinity;

        for (const star of existingStars) {
            const rect = star.getBoundingClientRect();

            const starCenterX: number = rect.left + rect.width / 2;
            const starCenterY: number = rect.top + rect.height / 2;

            const dx: number = candidateCenterX - starCenterX;
            const dy: number = candidateCenterY - starCenterY;

            const distance: number = Math.sqrt(dx * dx + dy * dy);

            if (distance < nearestDistance) {
                nearestDistance = distance;
            }
        }

        return nearestDistance;
    }
    /**
     * This function handles the collection of a single star bit. It animates, adds sound effect, updates the total count, and removes the star bit from the DOM.
     * @param star @type(HTMLElement) The star that will be collected
     * @returns 
     */
    function collectStarBit(star: HTMLButtonElement): void {
        if (counter === undefined) {
            console.error("Counter element is not defined. Cannot collect star bit.");
            return;
        }
        const starRect: DOMRect = star.getBoundingClientRect();
        const counterRect: DOMRect = counter.getBoundingClientRect();

        const dx: number =
            counterRect.left +
            counterRect.width / 2 -
            (starRect.left + starRect.width / 2);

        const dy: number =
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
 * @param includeImages A boolean indicating whether to include images in the returned rectangles. Defaults to false.
 * @returns An array of DOMRect objects representing the bounding boxes of text elements on the page.
 */
function getTextRects(includeImages: boolean = false): DOMRect[] {
    const rects: DOMRect[] = [];

    /**
     * Determines if an element should be ignored when calculating text rectangles.
     * @param element The element to check.
     * @returns A boolean indicating whether the element should be ignored.
     */
    function isIgnoredElement(element: Element): boolean {
        if (
            element.closest(".starbits-overlay") ||
            element.closest(".starbits-counter")
        ) {
            return true;
        }

        let current: Element | null = element;

        while (current) {
            const style = window.getComputedStyle(current);

            if (
                style.display === "none" ||
                style.visibility === "hidden" ||
                Number(style.opacity) === 0
            ) {
                return true;
            }

            current = current.parentElement;
        }

        return false;
    }

    /**
     * Adds a DOMRect to the list of rectangles if it meets certain criteria.
     * @param rect The DOMRect to add.
     */
    function addRect(rect: DOMRect): void {
        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        // Optional: ignore things outside the viewport
        if (
            rect.right < 0 ||
            rect.bottom < 0 ||
            rect.left > window.innerWidth ||
            rect.top > window.innerHeight
        ) {
            return;
        }

        rects.push(rect);
    }

    const walker: TreeWalker = document.createTreeWalker(
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

                if (isIgnoredElement(parent)) {
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
            addRect(rect);
        }

        range.detach();
    }

    if (includeImages) {
        const imageElements: NodeListOf<Element> = document.querySelectorAll("img, svg, canvas, video");

        for (const element of Array.from(imageElements)) {
            if (isIgnoredElement(element)) {
                continue;
            }

            addRect(element.getBoundingClientRect());
        }
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


    style.textContent = twirlingBitsStyle;


    document.head.appendChild(style);
}