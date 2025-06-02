import { describe, it, expect, beforeEach } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { VimMode } from '../src'

function createEditor (html = '<p>Hello world</p>') {
	return new Editor({
		extensions: [StarterKit, VimMode],
		content: html,
	})
}

function pressKey (editor: Editor, key: string, options: KeyboardEventInit = {}) {
	const event = new KeyboardEvent('keydown', { key, ...options })
	editor.view.dom.dispatchEvent(event)
}

// ---------------------------------------------------------------------------
//  Unit tests – correctness of VimMode behaviour
// ---------------------------------------------------------------------------

describe('VimMode extension', () => {
	let editor: Editor

	beforeEach(() => {
		editor = createEditor()
	})

	// ──────────────────────────────────────────────────────────────────────────
	// Mode management
	// ──────────────────────────────────────────────────────────────────────────
	it('starts in Insert mode by default', () => {
		expect(editor.storage.vimMode.state.mode).toBe('insert')
	})

	it('enters Normal mode via command', () => {
		editor.commands.enterNormalMode()
		expect(editor.storage.vimMode.state.mode).toBe('normal')
	})

	it('enters Insert mode with "i" key in Normal mode', () => {
		editor.commands.enterNormalMode()
		pressKey(editor, 'i')
		expect(editor.storage.vimMode.state.mode).toBe('insert')
	})

	it('enters Normal mode with "Escape" key', () => {
		pressKey(editor, 'Escape')
		expect(editor.storage.vimMode.state.mode).toBe('normal')
	})

	// ──────────────────────────────────────────────────────────────────────────
	// Input blocking
	// ──────────────────────────────────────────────────────────────────────────
	it('blocks text insertion while in Normal mode', () => {
		editor.commands.enterNormalMode()
		const before = editor.getHTML()
		editor.commands.insertContent('x')
		expect(editor.getHTML()).toBe(before)
	})

	it('blocks paste shortcut (Mod-v) in Normal mode', () => {
		editor.commands.enterNormalMode()
		const before = editor.getHTML()
		pressKey(editor, 'v', { metaKey: true, ctrlKey: true })
		expect(editor.getHTML()).toBe(before)
	})

	// ──────────────────────────────────────────────────────────────────────────
	// Cursor motion
	// ──────────────────────────────────────────────────────────────────────────
	describe('cursor motion', () => {
		beforeEach(() => editor.commands.enterNormalMode())

		it('moves left with "h"', () => {
			const start = editor.state.selection.$head.pos
			pressKey(editor, 'h')
			expect(editor.state.selection.$head.pos).toBeLessThan(start)
		})

		it('moves right with "l"', () => {
			// Ensure we are not at doc end
			pressKey(editor, 'h')
			const start = editor.state.selection.$head.pos
			pressKey(editor, 'l')
			expect(editor.state.selection.$head.pos).toBeGreaterThan(start)
		})

		it('moves down with "j" and up with "k"', () => {
			editor.commands.setContent('<p>a</p><p>b</p>')
			const start = editor.state.selection.$head.pos
			pressKey(editor, 'j')
			const down = editor.state.selection.$head.pos
			expect(down).toBeGreaterThan(start)
			pressKey(editor, 'k')
			expect(editor.state.selection.$head.pos).toBeLessThan(down)
		})

		it('moves to previous word with "b"', () => {
			editor.commands.setContent('<p>word1 word2 word3</p>')
			const start = editor.state.selection.$head.pos
			pressKey(editor, 'b')
			expect(editor.state.selection.$head.pos).toBeLessThan(start)
		})
	})

	// ──────────────────────────────────────────────────────────────────────────
	// Line operations
	// ──────────────────────────────────────────────────────────────────────────
	it('deletes current line with "dd"', () => {
		editor.commands.setContent('<p>Line 1</p><p>Line 2</p>')
		editor.commands.enterNormalMode()
		pressKey(editor, 'd')
		pressKey(editor, 'd')
		expect(editor.getHTML()).toBe('<p>Line 2</p>')
	})
})
