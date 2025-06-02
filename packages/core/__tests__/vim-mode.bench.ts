import { describe, bench, beforeEach } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { VimModeExtension } from '../src/VimMode'

// helper to dispatch key events (used for performance benches)
const pressKey = (editor: Editor, key: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, ...options })
  editor.view.dom.dispatchEvent(event)
}

describe('VimModeExtension Performance', () => {
  let editor: Editor

  beforeEach(() => {
    editor = new Editor({
      extensions: [StarterKit, VimModeExtension],
      content: '<p>The quick brown fox jumps over the lazy dog</p>'.repeat(100)
    })
  })

  bench('mode switching (insert ↔ normal)', () => {
    editor.commands.enterNormalMode()
    editor.commands.enterInsertMode()
  })

  bench('cursor movement - horizontal (h, l)', () => {
    editor.commands.enterNormalMode()
    // Test both left and right movements
    pressKey(editor, 'h')
    pressKey(editor, 'l')
  })

  bench('cursor movement - vertical (j, k)', () => {
    editor.commands.enterNormalMode()
    // Test both up and down movements
    pressKey(editor, 'j')
    pressKey(editor, 'k')
  })

  bench('word navigation (b)', () => {
    editor.commands.enterNormalMode()
    // Test backward word movement
    pressKey(editor, 'b')
  })

  bench('line operations (dd)', () => {
    editor.commands.enterNormalMode()
    // Measure the double-d line deletion
    pressKey(editor, 'd')
    pressKey(editor, 'd')
  })

  bench('input blocking in normal mode', () => {
    editor.commands.enterNormalMode()
    // Test blocking of various printable characters
    'hello world'.split('').forEach(char => {
      pressKey(editor, char)
    })
  })

  bench('complex operation sequence', () => {
    // Simulate a typical editing sequence
    editor.commands.enterNormalMode()    // Enter normal mode
    pressKey(editor, 'j') // Move down
    pressKey(editor, 'b') // Back one word
    pressKey(editor, 'd') // Delete line (dd)
    pressKey(editor, 'd')
    pressKey(editor, 'i') // Enter insert mode
  })
})
