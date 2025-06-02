<div align="center">
  <h1>@prose-motions/core</h1>
  <p>Drop-in Vim-style motions for Tiptap / ProseMirror editors</p>

  [![npm version](https://img.shields.io/npm/v/@prose-motions/core)](https://www.npmjs.com/package/@prose-motions/core)
  ![package size](https://img.shields.io/badge/size-3.83%20kB-brightgreen)
  [![npm](https://img.shields.io/npm/l/@prose-motions/core)](https://www.npmjs.com/package/@prose-motions/core)
</div>

`@prose-motions/core` is a lightweight extension that brings Vim's **Normal / Insert** modes and an ever-growing collection of native keybindings to any [Tiptap (v2)](https://tiptap.dev) or [ProseMirror editor](https://prosemirror.net).

## Features

 - `Esc` / `i` to toggle modes
 - Cursor motions: `h` `j` `k` `l`
 - Word-back with `b`
 - Delete current line with `dd`
 - Blocks text input in Normal mode to match Vim behaviour

Designed to be drop-in: no external CSS, no runtime deps beyond Tiptap itself.

## Installation

```bash
bun add @prose-motions/core  # or npm/yarn/pnpm
```

## Usage (Tiptap React example)

```tsx
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { VimMode } from '@prose-motions/core'

function MyEditor () {
  const editor = useEditor({
    extensions: [StarterKit, VimMode],
    content: '<p>hello world</p>'
  })

  return <EditorContent editor={editor} />
}
```

## Usage (ProseMirror React example)

```tsx
import { useState } from 'react'
import {
	ProseMirror,
	ProseMirrorDoc,
	reactKeys,
} from '@handlewithcare/react-prosemirror'
import { EditorState } from 'prosemirror-state'
import { schema } from 'prosemirror-schema-basic'
import { VimMode } from '@prose-motions/core'

export default function MyProseMirror () {
    return (
        <ProseMirror
            defaultState={EditorState.create({
                schema,
                plugins: [
                // The reactKeys plugin is required for the ProseMirror component to work!
                reactKeys(),
                ...VimMode.addProseMirrorPlugins()
                ],
            })}
        >
            <ProseMirrorDoc />
        </ProseMirror>
  );
}
```

> This snippet uses the modern "React × ProseMirror" bridge maintained by Handle with Care ([handlewithcarecollective/react-prosemirror](https://github.com/handlewithcarecollective/react-prosemirror)). It automatically handles state-tearing issues by updating the `EditorView` inside a layout effect

## Why Prose Motions ?

Intentionally minimal and built with modern tooling, Prose Motions adds powerful Vim keybindings to your editor without the bloat - perfect for developers who value efficiency:

- **TypeScript-first** – the whole codebase is written in strict TS so extending the keybinding set feels like ordinary app code, no fiddling with build steps.
- **ProseMirror plugin architecture** – every keybinding (motions, operators, text-objects…) is ultimately a pure command that manipulates the editor state through transactions; no DOM tricks involved. See the ProseMirror reference for details ([docs](https://prosemirror.net/docs/ref/)).
- **Tiptap v2 wrapper** – the extension registers itself as a standard `Extension` so it works out-of-the-box in Tiptap powered editors and any wrapper that exposes the underlying ProseMirror view. ([tiptap.dev](https://tiptap.dev/guide/introduction))
- **Optimized Bundle** – Built with SWC for both ESM and CJS, with minification and tree-shaking. Tiny footprint in your application bundle.
- **Zero runtime deps** – no CSS frameworks, no helper libs. The only peer deps are the editor engines themselves (`@tiptap/core`, `prosemirror-state`).

> Thanks to ProseMirror's declarative **state → transaction → new-state** we can express complex Vim behaviour in plain TypeScript (see the [ProseMirror State guide](https://prosemirror.net/docs/guide/#state)). Want to add `w`, `yy`, or repeat counts? Just compose new commands – no native code compilation, no browser-specific hacks.


## Roadmap

- Repeat counts (`5j`), more operators (`dw`, `yy`, `p`)
- Proper line height calculation to avoid layout thrash
- Performance micro-optimisations
- windows / linux mode change support
- editor sandbox
- @prose-motions/styles package / caret transform support in normal vs insert mode
- config layer / i.e, change caret size or color, choose if editor defaults to normal or insert mode (currently defaults to insert mode)
- CI / automated publishing flow
- Complete Vim key-binding coverage — implement the full command set documented in [`:help index`](https://vimhelp.org/index.txt.html)

## Size Challenge

We're on a mission to keep this package lean and mean. Check out our size stats:

| Initial Size (January 2025) | Latest Size | Change |
|-------------------------|-------------|---------|
| 3.83 kB | 3.83 kB | +0.0 kB |

> Let's see if we can add awesome features while keeping our package fit. Every byte counts, but fun counts more!

## Who's using Prose Motions?

| Product | Description |
|---------|-------------|
| [Grit AI](https://gritai.app/) | The AI Note Editor |

Contributions & ideas are welcome – open an issue or PR.

