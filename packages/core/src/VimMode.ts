import { Extension, type CommandProps, type KeyboardShortcutCommand } from '@tiptap/core'
import { keymap } from '@tiptap/pm/keymap'
import { TextSelection } from '@tiptap/pm/state'
import { Plugin } from '@tiptap/pm/state'

interface VimState {
	mode: 'normal' | 'insert'
}

// pending multi-key operator storage
let pendingOp: {
	key: string
	expires: number
} | null = null

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		vimMode: {
			/** switch to Vim normal mode */
			enterNormalMode: () => ReturnType
			/** switch to Vim insert mode */
			enterInsertMode: () => ReturnType
		}
	}
}

export const VimModeExtension = Extension.create<object, { state: VimState }>({
	name: 'vimMode',

	addStorage() {
		return {
			state: {
				mode: 'insert',
			} satisfies VimState,
		}
	},

	// ────────────────────────────────────────────────────────────────────────────
	// Commands
	// ────────────────────────────────────────────────────────────────────────────
	addCommands() {
		return {
			enterNormalMode: () => ({ tr, dispatch }: CommandProps) => {
				if (dispatch) {
					this.storage.state.mode = 'normal'
					// Move cursor one position left (like exiting insert mode in Vim)
					const { $head } = tr.selection
					const newPos = Math.max(0, $head.pos - 1)
					dispatch(tr.setSelection(TextSelection.create(tr.doc, newPos)))
				}
				return true
			},
			enterInsertMode: () => () => {
				this.storage.state.mode = 'insert'
				return true
			},
		}
	},

	// ────────────────────────────────────────────────────────────────────────────
	// Keyboard shortcuts
	// ────────────────────────────────────────────────────────────────────────────
	addKeyboardShortcuts() {
		// helper to move cursor horizontally by `delta` characters
		const moveBy = (delta: number): KeyboardShortcutCommand => {
			return () => {
				const { state, view } = this.editor
				const { $head } = state.selection
				const newPos = Math.max(0, Math.min(state.doc.content.size, $head.pos + delta))
				view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, newPos)))
				return true
			}
		}

		// helper to move cursor vertically by one line (`dir` = -1 for up, +1 for down)
		const moveLine = (dir: number): KeyboardShortcutCommand => {
			return () => {
				const { state, view } = this.editor
				const { $head } = state.selection
				const start = view.coordsAtPos($head.pos)
				if (!start) return true // Still consume the key in normal mode
				// Approximate line height from computed style, fallback to 20px
				const lineHeight = parseInt(getComputedStyle(view.dom).lineHeight) || 20
				const target = view.posAtCoords({ left: start.left, top: start.top + dir * lineHeight })
				if (target) {
					view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, target.pos)))
				}
				return true
			}
		}

		// helper to move cursor to previous word start
		const moveToPrevWord = (): KeyboardShortcutCommand => {
			return () => {
				const { state, view } = this.editor
				let pos = state.selection.$head.pos

				if (pos === 0) {
					return true
				}

				// helper to fetch single character at document position `p`
				const charAt = (p: number): string =>
					state.doc.textBetween(p, p + 1, '\0', '\0') || ''

				// Step 1: skip any whitespace immediately before the cursor
				while (pos > 0 && /\s/.test(charAt(pos - 1))) {
					pos--
				}

				// Step 2: move left until we hit whitespace or start of doc
				while (pos > 0 && !/\s/.test(charAt(pos - 1))) {
					pos--
				}

				view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, pos)))
				return true
			}
		}

		// helper to delete current line
		const deleteCurrentLine = (): void => {
			const { state, view } = this.editor
			const { $head } = state.selection

			// Get the start and end positions of the parent block (line)
			const start = $head.start($head.depth)
			const end = $head.end($head.depth)

			const tr = state.tr.delete(start, end)
			view.dispatch(tr.scrollIntoView())
		}

		const shortcuts: Record<string, KeyboardShortcutCommand> = {
			Escape: () => {
				this.editor.commands.enterNormalMode()
				return true
			},
			i: () => {
				if (this.storage.state.mode === 'normal') {
					this.editor.commands.enterInsertMode()
					return true
				}
				return false
			},
			h: (props) => (this.storage.state.mode === 'normal' ? moveBy(-1)(props) : false),
			l: (props) => (this.storage.state.mode === 'normal' ? moveBy(1)(props) : false),
			j: (props) => (this.storage.state.mode === 'normal' ? moveLine(1)(props) : false),
			k: (props) => (this.storage.state.mode === 'normal' ? moveLine(-1)(props) : false),
			b: (props) => (this.storage.state.mode === 'normal' ? moveToPrevWord()(props) : false),
			d: () => {
				if (this.storage.state.mode !== 'normal') return false

				const now = Date.now()
				if (pendingOp && pendingOp.key === 'd' && pendingOp.expires > now) {
					// Detected second 'd' within timeframe -> delete line
					pendingOp = null
					deleteCurrentLine()
					return true
				} else {
					// First 'd' press – set pending operator for 500ms
					pendingOp = { key: 'd', expires: now + 500 }
					return true // consume key but do nothing yet
				}
			},
		}

		// Add catch-all for any single character to block in normal mode
		const catchAllHandler: KeyboardShortcutCommand = () => {
			return this.storage.state.mode === 'normal'
		}

		// Block all printable characters in normal mode (except those already handled)
		const printableChars = 'abcdefgmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}\\|;:\'",.<>?/~`'
		for (const char of printableChars) {
			if (!shortcuts[char]) {
				shortcuts[char] = catchAllHandler
			}
		}

		return shortcuts
	},

	// ────────────────────────────────────────────────────────────────────────────
	// Additional ProseMirror plugins
	//   – block regular text input while in Normal mode
	//   – allow paste only in Insert mode
	// ────────────────────────────────────────────────────────────────────────────
	addProseMirrorPlugins() {
		return [
			keymap({
				'Mod-v': () => this.storage.state.mode === 'insert',
			}),
			new Plugin({
				handleTextInput: () => {
					// Block ALL text input in normal mode
					return this.storage.state.mode === 'normal'
				},
			}),
		]
	},
})
