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
		beforeEach(() => {
			editor = createEditor('<p>Hello world</p>')
			editor.commands.enterNormalMode()
			editor.commands.setTextSelection(editor.state.doc.content.size - 1)
		})

		it('moves left with "h"', () => {
			const start = editor.state.selection.$head.pos
			pressKey(editor, 'h')
			expect(editor.state.selection.$head.pos).toBeLessThan(start)
		})

		it('moves right with "l"', () => {
			pressKey(editor, 'h')
			const start = editor.state.selection.$head.pos
			pressKey(editor, 'l')
			expect(editor.state.selection.$head.pos).toBeGreaterThan(start)
		})

		it('moves to previous word with "b"', () => {
			editor.commands.setContent('<p>word1 word2 word3</p>')
			const start = editor.state.selection.$head.pos
			pressKey(editor, 'b')
			expect(editor.state.selection.$head.pos).toBeLessThan(start)
		})
	})
})
