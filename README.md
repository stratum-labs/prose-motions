<h1 align="center"> Prose Motions </h1>

`@prose-motions/core` is a lightweight extension that brings Vim's **Normal / Insert** modes and an ever-growing collection of native keybindings to any [Tiptap (v2)](https://tiptap.dev) or [ProseMirror editor](https://prosemirror.net).

## Features

 - `Esc` / `i` to toggle modes
 - Basic cursor motions: `h` `j` `k` `l`
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

## Usage (BlockNote React example)

```tsx
// Styles required by BlockNote
import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import { BlockNoteView } from "@blocknote/mantine"
import { useCreateBlockNote } from "@blocknote/react"
import { VimMode } from "@prose-motions/core"

export default function MyBlockNote () {
  // Create an editor instance with VimMode registered up-front
  const editor = useCreateBlockNote({
    _tiptapOptions: {
      extensions: [VimMode],
    },
  })

  return <BlockNoteView editor={editor} />
}
```
## Why Prose Motions ?

This package is small on purpose but it still hides a lot of modern tooling that contributors may want to know about:

- **TypeScript-first** – the whole codebase is written in strict TS so extending the keybinding set feels like ordinary app code, no fiddling with build steps.
- **ProseMirror plugin architecture** – every keybinding (motions, operators, text-objects…) is ultimately a pure command that manipulates the editor state through transactions; no DOM tricks involved. See the ProseMirror reference for details ([docs](https://prosemirror.net/docs/ref/)).
- **Tiptap v2 wrapper** – the extension registers itself as a standard `Extension` so it works out-of-the-box in Tiptap powered editors and any wrapper that exposes the underlying ProseMirror view (e.g. BlockNote). ([tiptap.dev](https://tiptap.dev/guide/introduction))
- **Bun + SWC** – lightning-fast dev server (`bun --hot`) and SWC emits both modern ESM and legacy CJS bundles from the same source in milliseconds.
- **Zero runtime deps** – no CSS frameworks, no helper libs. The only peer deps are the editor engines themselves (`@tiptap/core`, `prosemirror-state`).

> Thanks to ProseMirror's declarative **state → transaction → new-state** we can express complex Vim behaviour in plain TypeScript (see the [ProseMirror State guide](https://prosemirror.net/docs/guide/#state)). Want to add `w`, `yy`, or repeat counts? Just compose new commands – no native code compilation, no browser-specific hacks.


## Roadmap

- Repeat counts (`5j`), more operators (`dw`, `yy`, `p`)
- Proper line height calculation to avoid layout thrash
- Performance micro-optimisations
- windows / linux mode change support
- editor sandbox
- CI / automated publishing flow
- Complete Vim key-binding coverage — implement the full command set documented in [`:help index`](https://vimhelp.org/index.txt.html)

## Who's using Prose Motions?

| Product | Description |
|---------|-------------|
| [Grit AI](https://gritai.app/) | The AI Note Editor |

Contributions & ideas are welcome – open an issue or PR.

