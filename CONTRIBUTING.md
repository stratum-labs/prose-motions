# Contributing to Prose Motions

First off, thanks for taking the time to contribute! 🎉

This document describes the development workflow, code style, and tooling used in this monorepo so that you can get productive quickly and send high-quality pull requests.

---

## Table of contents

1. Getting started
2. Project layout
3. Development workflow
4. Tests
5. Linting & formatting
6. Commit conventions & PR checklist
7. Release process
8. Code of conduct

---

## 1. Getting started

1. Install [Bun](https://bun.sh/) ≥ 1.1.8 (used for package management & the dev server).
2. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/stratum-labs/prose-motions.git
   cd prose-motions
   bun install
   ```
3. Build once or start the watcher:

   ```bash
   bun run build   # one-off build (ESM + CJS + declaration files)
   bun run dev     # fast rebuilds with --watch
   ```

The build emits artifacts into `packages/core/dist` so that they can be required/imported directly from Node or bundlers.

---

## 2. Project layout

```
prose-motions
├─ packages/
│  └─ core/          # source of @prose-motions/core – editor extension
│     ├─ src/
│     ├─ dist/       # generated artefacts (ignored by git)
│     └─ tests/
├─ index.ts          # Bun demo entry-point
├─ eslint.config.json
└─ tsconfig.json
```

Key facts:
 - Each workspace is completely independent and publishes its own artefacts.
 - SWC (`.swcrc`) controls TS→JS compilation; we never ship `ts-node` at runtime.
 - Declarations are generated once via `tsc -p tsconfig.build.json`.

---

## 3. Development workflow

### Hot-reloading during feature work

```
bun run --hot packages/core dev
```

This will re-execute SWC on every change and write to `packages/core/dist`.  You can link this folder into another local project with `npm/yarn/bun link` if you want to test the extension in a real editor.

### Adding new motions or commands

1. Open `packages/core/src/VimMode.ts` and locate the keyboard-shortcut map.
2. Implement the new command as a pure function that receives `CommandProps` – do **not** touch the DOM.
3. Write unit tests (see next section) that cover cursor movement at document edges and across multi-line content.

### Docs & playground

If you update the public API, please update the examples in the README as well.

---

## 4. Tests

We use [Vitest](https://vitest.dev/) for ultra-fast in-memory tests:

```bash
bun run test        # interactive UI
bun run test --run  # CI-friendly non-interactive mode
```

Write table-driven tests where possible. Each test file should be colocated next to the source (`*.test.ts`).

---

## 5. Linting & formatting

 - ESLint config inherits from `@antfu/eslint-config`. Run `bun run lint` to see issues.
 - Prettier 3 is used for Markdown & JSON files; run `npx prettier --check .` before pushing.
 - CI will fail if lint errors are introduced.

---

## 6. Commit conventions & PR checklist

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/) so that future automated changelog tooling can be added easily. Short summary:

```
<type>(scope): summary

feat(core): add `w` motion
fix: handle cursor at doc start in `b` motion
```

Before opening a PR:

1. `bun run build` succeeds with no type errors.
2. `bun run test --run` passes.
3. `bun run lint` passes.
4. Update docs / README if public behaviour changed.

---

## 7. Release process (maintainers only)

Releases are managed manually for now:

1. Increment version in `packages/core/package.json` following semver.
2. Run `bun run build` and commit the updated `dist/` artefacts **(do not** edit them by hand).
3. Tag the commit (`git tag vX.Y.Z && git push --tags`).
4. Publish from the workspace root:

   ```bash
   npm publish ./packages/core --access public
   ```

CI/CD automation will come later – see Roadmap.

---

## 8. Code of conduct

Be excellent to each other. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) – harassment, discrimination, or toxic behaviour will not be tolerated.

---

Happy hacking! ✨
