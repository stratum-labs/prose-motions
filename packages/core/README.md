<h1 align="center"> Prose Motions </h1>

`@prose-motions/core` is a lightweight extension that brings Vim's **Normal / Insert** modes and an ever-growing collection of native keybindings to any [Tiptap (v2)](https://tiptap.dev) or [ProseMirror editor](https://prosemirror.net).

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
