import { describe, test, expect, beforeEach } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { VimMode } from '../src'

const pressKey = (editor: Editor, key: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, ...options })
  editor.view.dom.dispatchEvent(event)
}

describe('VimModeExtension Memory Management', () => {
  let editor: Editor
  let initialHeap: number

  beforeEach(() => {
    if (global.gc) {
      global.gc()
    }
    initialHeap = process.memoryUsage().heapUsed

    editor = new Editor({
      extensions: [StarterKit, VimMode],
      content: '<p>Test content</p>'.repeat(100)
    })
  })

  test('no memory leaks during mode transitions', () => {
    // Perform many mode switches
    for (let i = 0; i < 1000; i++) {
      editor.commands.enterNormalMode()
      editor.commands.enterInsertMode()
    }

    editor.destroy()

    if (global.gc) {
      global.gc()
    }

    const heapUsed = process.memoryUsage().heapUsed - initialHeap
    expect(heapUsed).toBeLessThan(1024 * 1024) // Should be under 1MB growth
  })

  test('no memory leaks during cursor operations', () => {
    editor.commands.enterNormalMode()

    // Perform many cursor movements
    for (let i = 0; i < 1000; i++) {
      pressKey(editor, 'h')
      pressKey(editor, 'j')
      pressKey(editor, 'k')
      pressKey(editor, 'l')
      pressKey(editor, 'b')
    }

    editor.destroy()

    if (global.gc) {
      global.gc()
    }

    const heapUsed = process.memoryUsage().heapUsed - initialHeap
    expect(heapUsed).toBeLessThan(1024 * 1024)
  })

  test('pending operator cleanup', async () => {
    editor.commands.enterNormalMode()

    // Trigger pending 'd' operator and let it expire multiple times
    for (let i = 0; i < 100; i++) {
      pressKey(editor, 'd')
      await new Promise(res => setTimeout(res, 600)) // > 500 ms expiry window
    }

    editor.destroy()

    if (global.gc) {
      global.gc()
    }

    const heapUsed = process.memoryUsage().heapUsed - initialHeap
    expect(heapUsed).toBeLessThan(1024 * 1024)
  })
})
