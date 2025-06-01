import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { VimMode } from '../src'

function createEditor() {
  return new Editor({
    extensions: [StarterKit, VimMode],
    content: '<p>Hello world</p>',
  })
}

describe('VimMode extension', () => {
  it('starts in Insert mode by default', () => {
    const editor = createEditor()
    // @ts-ignore accessing internal storage for assertion purposes
    expect(editor.extensionStorage.vimMode.state.mode).toBe('insert')
  })

  it('toggles to Normal mode with command', () => {
    const editor = createEditor()
    editor.commands.enterNormalMode()
    // @ts-ignore internal
    expect(editor.extensionStorage.vimMode.state.mode).toBe('normal')
  })

  it('blocks text insertion while in Normal mode', () => {
    const editor = createEditor()
    editor.commands.enterNormalMode()
    const before = editor.getHTML()

    // Attempt to insert text via standard command
    editor.commands.insertContent('x')

    expect(editor.getHTML()).toBe(before)
  })
})
