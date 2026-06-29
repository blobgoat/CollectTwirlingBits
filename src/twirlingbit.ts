export const twirlingBitsStyle = `
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

    @media (min-width: 768px) {
        .starbits-counter {
            left: 24px;
            bottom: 24px;
            transform: none;
        }
    }

    @keyframes starbit-float {
        from {
            translate: 0 0;
        }

        to {
            translate: 0 -6px;
        }
    }

    .starbit-spin {
        animation: starbit-spin var(--speed, 1000ms) linear infinite;
    }

    @keyframes starbit-spin {
        from {
            transform: rotateZ(0deg);
        }

        to {
            transform: rotateZ(360deg);
        }
    }`;