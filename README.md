# Collect Twirling Bits

A small, framework-agnostic JavaScript/TypeScript package that spawns collectible twirling bits on a webpage.

Twirling bits appear in random safe positions on the screen, avoid overlapping visible text, and fly to a bottom counter when hovered. The collected total is stored locally in the browser using `localStorage`.

## Features

* Framework-agnostic
* Works with plain HTML, React, Vite, and most frontend apps
* Spawns twirling bits in a fixed overlay
* Avoids overlapping visible text
* Collects twirling bits on hover
* Animates collected twirling bits toward the counter
* Stores the total on the client with `localStorage`
* Configurable spawn rate, max count, size, and storage key

## Demo


## Demo

### Spawning Twirling Bits

<img
  src="https://raw.githubusercontent.com/blobgoat/CollectTwirlingBits/main/assets/CollectingBits.gif"
  alt="Twirling bits spawning around the page"
  width="700"
/>

### Collecting Twirling Bits

<img
  src="https://raw.githubusercontent.com/blobgoat/CollectTwirlingBits/main/assets/WindowFullOfBits.gif"
  alt="Twirling bit being collected and flying toward the counter"
  width="700"
/>

### Mobile Layout

<img
  src="https://raw.githubusercontent.com/blobgoat/CollectTwirlingBits/main/assets/PhoneScreen.gif"
  alt="Collect Twirling Bits phone layout demo"
  width="320"
/>

## Installation

```bash
npm install collect-twirling-bits
```

For local development inside this repository:

```bash
npm install
npm run build
```

## Basic Usage

```ts
import { createStarBits } from "collect-twirling-bits";

const starBits = createStarBits({
  spawnEveryMs: 1500,
  maxOnScreen: 8,
});

starBits.start();
```

## React Usage

```tsx
import { useEffect } from "react";
import { createStarBits } from "collect-twirling-bits";

export function App() {
  useEffect(() => {
    const starBits = createStarBits({
      spawnEveryMs: 1500,
      maxOnScreen: 8,
    });

    starBits.start();

    return () => {
      starBits.destroy();
    };
  }, []);

  return (
    <main>
      <h1>Hello world</h1>
      <p>Twirling bits should avoid spawning on top of this text.</p>
    </main>
  );
}
```

## API

### `createStarBits(options?)`

Creates a twirling bit controller.

```ts
const starBits = createStarBits(options);
```

### Options

```ts
type StarBitsOptions = {
  spawnEveryMs?: number;
  maxOnScreen?: number;
  starSize?: number;
  storageKey?: string;
  speedOfSpin?: string;
};
```

| Option         | Type     | Default                 | Description                                                |
| -------------- | -------- | ----------------------- | ---------------------------------------------------------- |
| `spawnEveryMs` | `number` | `1500`                  | How often a new twirling bit attempts to spawn.            |
| `maxOnScreen`  | `number` | `8`                     | Maximum number of twirling bits allowed on screen at once. |
| `starSize`     | `number` | `28`                    | Size of each twirling bit in pixels.                       |
| `storageKey`   | `string` | `"twirling-bits-total"` | The `localStorage` key used to save the collected total.   |
| `speedOfSpin`  | `number` | `2000` | The time in milliseconds required to complete one full rotation. Lower values spin faster; higher values spin slower.
| `spawnOverImages` | `boolean` | `false` | when determining where the stars should spawn, it will avoid images and image like objects (currently supports svg, images, canvas and videos).

### Methods

#### `start()`

Starts spawning twirling bits.

```ts
starBits.start();
```

#### `stop()`

Stops spawning new twirling bits. Existing twirling bits remain on the screen.

```ts
starBits.stop();
```

#### `destroy()`

Stops the package and removes the overlay, counter, and twirling bits from the page.

```ts
starBits.destroy();
```

#### `getTotal()`

Returns the current collected total.

```ts
const total = starBits.getTotal();
```

#### `setTotal(value)`

Sets the collected total and saves it to `localStorage`.

```ts
starBits.setTotal(0);
```

## How Text (and Image) Avoidance Works

Collect Twirling Bits uses the browser DOM to find visible text nodes on the page.

It walks through text nodes with `TreeWalker`, measures their visible line boxes (and other elements) using `Range.getClientRects()`, and rejects spawn positions that overlap those rectangles.

Note: it doesn't seem possible to parrellize this task due to it being on the DOM and web workers are unable to do the DOM reading part.

This means twirling bits should avoid spawning directly on top of actual rendered text(or image like objects), even when paragraphs wrap across multiple lines.

## Example Folder

This repository includes an `example/` folder for local testing and debugging.

```txt
collect-twirling-bits/
  src/
    index.ts
  example/
    index.html
    src/
      main.ts
      style.css
    package.json
    tsconfig.json
    vite.config.ts
  package.json
  tsconfig.json
  README.md
```

The example app is useful for testing:

* Whether twirling bits spawn correctly
* Whether text avoidance works
* Whether the hover collection animation works
* Whether the local total is stored correctly
* Whether the package works after being built

## Local Development With Example App

From the package root:

```bash
npm install
npm run build
```

Then enter the example app:

```bash
cd example
npm install
npm run dev
```

The example app can import the local package instead of the published npm version.

For example, in `example/package.json`:

```json
{
  "dependencies": {
    "collect-twirling-bits": "file:.."
  }
}
```

Then in `example/src/main.ts`:

```ts
import { createStarBits } from "collect-twirling-bits";

const starBits = createStarBits({
  spawnEveryMs: 1000,
  maxOnScreen: 10,
});

starBits.start();
```

## Development Scripts

Common package scripts:

```json
{
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --dts --watch",
    "test": "vitest run"
  }
}
```

## Package Goals

This package is intended to be:

* Lightweight
* Easy to install
* Safe to add to an existing webpage
* Independent from any specific frontend framework
* Fun and customizable

## Planned Improvements

Possible future improvements:

* Custom Images/pngs for the Particle
* Custom Animations the User Can Add
* Sound effects
* Particle trail on collection
* Click or touch collection mode
* Custom counter placement
* Custom spawn area
* MutationObserver support for dynamic pages
* React wrapper
* Accessibility options
* Configurable twirling bit rendering

## License

MIT
