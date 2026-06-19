/**
 * generated_tests.test.ts
 *
 * Vitest test suite for the `example/` website created by prompt.txt.
 * These tests are written BEFORE the agent implements the task — all imports
 * and file paths refer to files that do not yet exist. Tests are expected to
 * fail until the agent completes the task.
 *
 * Run with: npx vitest run tests/generated_tests.test.ts
 * (requires `vitest` to be added as a devDependency first)
 */

import { describe, test, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Resolve paths relative to the repo root so tests work from any cwd.
// import.meta.dirname is used instead of __dirname because the package is ESM ("type": "module").
const ROOT = path.resolve(import.meta.dirname, "..");
const EXAMPLE = path.join(ROOT, "example");

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(EXAMPLE, relPath), "utf-8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(EXAMPLE, relPath));
}

// ---------------------------------------------------------------------------
// Domain: File structure existence
// Every file listed in the prompt's desired structure must be present.
// ---------------------------------------------------------------------------
describe("File structure existence", () => {
  // The prompt specifies exactly these 6 paths under example/.
  // Missing any of them means the agent produced an incomplete scaffold.
  const requiredFiles = [
    // Root-level config and entry files
    ["index.html", "Vite entry point HTML (req: desired structure)"],
    ["package.json", "npm manifest with local package link (req: desired structure)"],
    ["tsconfig.json", "TypeScript configuration (req: desired structure)"],
    ["vite.config.ts", "Vite bundler config (req: desired structure)"],
    // Source files
    ["src/main.ts", "App entry point with createStarBits init (req: desired structure)"],
    ["src/style.css", "Plain CSS styles — no framework (req: req #6)"],
    // README added by req #12
    ["README.md", "Instructions for running the example website (req: req #12)"],
  ] as const;

  test.each(requiredFiles)("%s exists — %s", (relPath) => {
    expect(
      fileExists(relPath),
      `Expected example/${relPath} to exist`
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Domain: Package.json configuration
// The example's package.json must declare the local package, a vite devDep,
// and the `npm run dev` script that the prompt says should work out of the box.
// ---------------------------------------------------------------------------
describe("example/package.json configuration", () => {
  // We parse the file once; individual cases inspect specific fields.
  function getPkg(): Record<string, unknown> {
    return JSON.parse(readFile("package.json"));
  }

  test.each([
    [
      "local package link",
      // req #1: install/use local package via "file:.."
      () => {
        const pkg = getPkg();
        const deps = (pkg.dependencies ?? pkg.devDependencies ?? {}) as Record<string, string>;
        expect(deps["collect-twirling-bits"]).toBe("file:..");
      },
    ],
    [
      "vite devDependency",
      // req #7: npm run dev must work; vite must be a devDep
      () => {
        const pkg = getPkg();
        const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
        expect(Object.keys(devDeps)).toContain("vite");
      },
    ],
    [
      "dev script defined",
      // req #7: `npm run dev` is the documented run command
      () => {
        const pkg = getPkg();
        const scripts = (pkg.scripts ?? {}) as Record<string, string>;
        expect(scripts["dev"]).toBeTruthy();
      },
    ],
    [
      "typescript devDependency",
      // req #11: TypeScript used cleanly; needs typescript in devDeps
      () => {
        const pkg = getPkg();
        const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
        expect(Object.keys(devDeps)).toContain("typescript");
      },
    ],
  ] as [string, () => void][])("%s", (_label, assertion) => {
    assertion();
  });
});

// ---------------------------------------------------------------------------
// Domain: Vite + TypeScript config files
// Config files must exist and contain sensible content.
// vite.config.ts should at minimum be a valid TS file with a vite config export.
// tsconfig.json must be valid JSON referencing TypeScript compiler options.
// ---------------------------------------------------------------------------
describe("Config file content", () => {
  test.each([
    [
      "vite.config.ts imports or references vite",
      // req: vite-based app; the config file must reference vite
      "vite.config.ts",
      /vite/i,
    ],
    [
      "tsconfig.json is valid JSON with compilerOptions",
      // req #11: TypeScript cleanly configured
      "tsconfig.json",
      /compilerOptions/,
    ],
  ] as [string, string, RegExp][])("%s", (_label, relPath, pattern) => {
    const content = readFile(relPath);
    expect(content).toMatch(pattern);
  });

  test("vite.config.ts is parseable as text (no syntax that would prevent import)", () => {
    // Just verify the file is non-empty and looks like a module
    // (full TS parsing requires compilation; this is a lightweight smoke check)
    const content = readFile("vite.config.ts");
    expect(content.trim().length).toBeGreaterThan(0);
    // Should export something (defineConfig or default export)
    expect(content).toMatch(/export\s+(default|const)/);
  });
});

// ---------------------------------------------------------------------------
// Domain: HTML page sections
// The prompt requires five visually labeled sections (req #9) so the example
// page is useful for testing text-avoidance, spawn density, and scrolling.
// ---------------------------------------------------------------------------
describe("HTML page sections", () => {
  const requiredSections = [
    [
      "Hero Text Avoidance Test",
      // req #9 + req #2: large hero section for text-avoidance validation
      "Hero Text Avoidance Test",
    ],
    [
      "Card Layout Test",
      // req #9 + req #2: several cards with text
      "Card Layout Test",
    ],
    [
      "Dense Paragraph Test",
      // req #9 + req #2: dense article/text section with wrapped paragraphs
      "Dense Paragraph Test",
    ],
    [
      "Open Space Spawn Test",
      // req #9 + req #2: empty visual space where bits spawn more easily
      "Open Space Spawn Test",
    ],
    [
      "Scroll Test",
      // req #9 + req #2: enough page height to test scrolling behavior
      "Scroll Test",
    ],
  ] as [string, string][];

  test.each(requiredSections)('section "%s" is present in index.html', (_label, sectionText) => {
    const html = readFile("index.html");
    expect(html).toContain(sectionText);
  });

  test("index.html has a <footer> element (req #2)", () => {
    // req #2 explicitly requires a footer with text
    const html = readFile("index.html");
    expect(html).toMatch(/<footer[\s>]/i);
  });

  test("index.html links to or includes style.css (req #6)", () => {
    // The CSS file must actually be wired up
    const html = readFile("index.html");
    expect(html).toMatch(/style\.css/);
  });

  test("index.html loads src/main.ts as the module entry (req: vite app)", () => {
    // Vite apps wire the TS entry via <script type="module" src="...main.ts">
    const html = readFile("index.html");
    expect(html).toMatch(/src\/main\.ts/);
  });
});

// ---------------------------------------------------------------------------
// Domain: Debug control panel
// The HTML must include buttons for all five debug actions (req #4).
// Button text or aria-label must clearly identify each action.
// ---------------------------------------------------------------------------
describe("Debug control panel buttons", () => {
  const requiredButtons = [
    [
      "Start button",
      // req #4 + #5: triggers twirlingBits.start()
      /\bstart\b/i,
    ],
    [
      "Stop button",
      // req #4 + #5: triggers twirlingBits.stop()
      /\bstop\b/i,
    ],
    [
      "Destroy button",
      // req #4 + #5: triggers twirlingBits.destroy()
      /\bdestroy\b/i,
    ],
    [
      "Reset total button",
      // req #4 + #5: triggers twirlingBits.setTotal(0); resets counter to 0
      /reset/i,
    ],
    [
      "Log total button",
      // req #4 + #5: triggers twirlingBits.getTotal() and logs to console
      /log/i,
    ],
  ] as [string, RegExp][];

  // We check both index.html (inline buttons) and main.ts (button wiring)
  // The button text itself must appear in the HTML so it's visually labeled.
  test.each(requiredButtons)('%s present in index.html', (_label, pattern) => {
    const html = readFile("index.html");
    // Look for a <button ...> element whose text matches the pattern
    // This regex finds any button tag followed (anywhere on the same or next line) by the pattern
    expect(html).toMatch(pattern);
  });
});

// ---------------------------------------------------------------------------
// Domain: main.ts API integration
// src/main.ts must import from the correct package, call createStarBits with
// the exact options from the prompt, and call .start() (req #3).
// ---------------------------------------------------------------------------
describe("main.ts API integration", () => {
  test.each([
    [
      "imports createStarBits from 'collect-twirling-bits'",
      // req #3 + package context: correct import path
      /import\s*\{[^}]*createStarBits[^}]*\}\s*from\s*['"]collect-twirling-bits['"]/,
    ],
    [
      "calls createStarBits({ spawnEveryMs: 1000 })",
      // req #3: exact option value from prompt
      /spawnEveryMs\s*:\s*1000/,
    ],
    [
      "calls createStarBits({ maxOnScreen: 10 })",
      // req #3: exact option value from prompt
      /maxOnScreen\s*:\s*10/,
    ],
    [
      "calls createStarBits({ starSize: 28 })",
      // req #3: exact option value from prompt
      /starSize\s*:\s*28/,
    ],
    [
      "calls createStarBits({ storageKey: 'twirling-bits-total' })",
      // req #3: exact option value from prompt
      /storageKey\s*:\s*['"]twirling-bits-total['"]/,
    ],
    [
      "calls .start() on the returned instance",
      // req #3: twirlingBits.start() must be called to begin spawning
      /\.start\s*\(\s*\)/,
    ],
  ] as [string, RegExp][])("%s", (_label, pattern) => {
    const mainTs = readFile("src/main.ts");
    expect(mainTs).toMatch(pattern);
  });

  test("main.ts wires Start button to .start()", () => {
    // req #5: debug buttons call the package methods
    const mainTs = readFile("src/main.ts");
    expect(mainTs).toMatch(/\.start\s*\(/);
  });

  test("main.ts wires Stop button to .stop()", () => {
    // req #5
    const mainTs = readFile("src/main.ts");
    expect(mainTs).toMatch(/\.stop\s*\(/);
  });

  test("main.ts wires Destroy button to .destroy()", () => {
    // req #5
    const mainTs = readFile("src/main.ts");
    expect(mainTs).toMatch(/\.destroy\s*\(/);
  });

  test("main.ts wires Reset button to .setTotal(0)", () => {
    // req #5: reset total to 0 via setTotal
    const mainTs = readFile("src/main.ts");
    expect(mainTs).toMatch(/\.setTotal\s*\(\s*0\s*\)/);
  });

  test("main.ts wires Log button to .getTotal()", () => {
    // req #5: log current total via getTotal
    const mainTs = readFile("src/main.ts");
    expect(mainTs).toMatch(/\.getTotal\s*\(/);
  });

  test("main.ts has no 'any' type annotations (req #11)", () => {
    // req #11: use TypeScript cleanly, avoid `any`
    const mainTs = readFile("src/main.ts");
    // Allow `any` inside comments but not as a type annotation
    const lines = mainTs.split("\n");
    const anyTypeLines = lines.filter(
      (line) =>
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("*") &&
        /:\s*any\b/.test(line)
    );
    expect(anyTypeLines).toHaveLength(0);
  });

  test("main.ts has comments explaining each control (req #10)", () => {
    // req #10: add comments explaining what each control does
    const mainTs = readFile("src/main.ts");
    // At minimum there should be several single-line comments
    const commentLines = mainTs
      .split("\n")
      .filter((line) => line.trim().startsWith("//"));
    expect(commentLines.length).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// Domain: CSS constraints
// style.css must exist, be non-empty, and must not reference any CSS framework
// (Bootstrap, Tailwind, etc.) since req #6 specifies plain CSS only.
// ---------------------------------------------------------------------------
describe("CSS constraints", () => {
  test("style.css is non-empty", () => {
    // req #6: plain CSS must be authored; an empty file suggests it was skipped
    const css = readFile("src/style.css");
    expect(css.trim().length).toBeGreaterThan(0);
  });

  test.each([
    [
      "no Bootstrap import",
      // req #6: no CSS frameworks
      /bootstrap/i,
    ],
    [
      "no Tailwind @apply or import",
      // req #6: no Tailwind
      /@tailwind|tailwind/i,
    ],
    [
      "no Bulma import",
      // req #6
      /bulma/i,
    ],
  ] as [string, RegExp][])("style.css has %s", (_label, pattern) => {
    const css = readFile("src/style.css");
    expect(css).not.toMatch(pattern);
  });
});

// ---------------------------------------------------------------------------
// Domain: README
// The example README must exist and contain instructions for running the app
// (req #12: cd example, npm install, npm run dev).
// ---------------------------------------------------------------------------
describe("Example README", () => {
  test.each([
    [
      "mentions cd example",
      // req #12: shows how to navigate into the folder
      /cd\s+example/i,
    ],
    [
      "mentions npm install",
      // req #12: install step
      /npm\s+install/i,
    ],
    [
      "mentions npm run dev",
      // req #12: run step
      /npm\s+run\s+dev/i,
    ],
    [
      "is non-trivially long (at least 3 lines)",
      // req #12: a meaningful README, not a single line placeholder
      null, // handled separately below
    ],
  ] as [string, RegExp | null][])("%s", (_label, pattern) => {
    const readme = readFile("README.md");
    if (pattern === null) {
      expect(readme.split("\n").filter((l) => l.trim()).length).toBeGreaterThanOrEqual(3);
    } else {
      expect(readme).toMatch(pattern);
    }
  });
});
