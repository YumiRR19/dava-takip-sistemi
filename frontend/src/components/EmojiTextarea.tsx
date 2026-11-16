import * as React from 'react'
import { Smile } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const EMOJIS = [
  '✅', '❌', '❗', '❓', '⚠️', '📌', '📍', '⭐',
  '📅', '⏰', '⌛', '🔔', '📞', '📧', '💬', '📝',
  '📄', '📁', '📎', '🔍', '⚖️', '🏛️', '🏦', '💰',
  '🚗', '🏠', '🔴', '🟠', '🟡', '🟢', '🔵', '➡️',
  '👍', '👎', '🙂', '😊', '🙏', '👏', '🔥', '💡',
]

type EmojiTextareaProps = Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}

export function EmojiTextarea({ value, onValueChange, ...props }: EmojiTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const selectionRef = React.useRef<{ start: number; end: number } | null>(null)
  const [open, setOpen] = React.useState(false)

  const rememberSelection = () => {
    const el = textareaRef.current
    if (el) selectionRef.current = { start: el.selectionStart, end: el.selectionEnd }
  }

  const insertEmoji = (emoji: string) => {
    const current = value || ''
    const saved = selectionRef.current
    const start = Math.min(saved ? saved.start : current.length, current.length)
    const end = Math.min(saved ? saved.end : current.length, current.length)
    const next = current.slice(0, start) + emoji + current.slice(end)
    const caret = start + emoji.length
    selectionRef.current = { start: caret, end: caret }
    onValueChange(next)
    setOpen(false)
    setTimeout(() => {
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.setSelectionRange(caret, caret)
      }
    }, 0)
  }

  return (
    <div className="space-y-1">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value)
          selectionRef.current = { start: e.target.selectionStart, end: e.target.selectionEnd }
        }}
        onSelect={rememberSelection}
        onKeyUp={rememberSelection}
        onClick={rememberSelection}
        onBlur={rememberSelection}
        {...props}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600" aria-label="Emoji ekle">
            <Smile className="h-4 w-4 mr-1" />
            Emoji ekle
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <div className="grid grid-cols-8 gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="text-lg leading-none rounded p-1 hover:bg-gray-100"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
