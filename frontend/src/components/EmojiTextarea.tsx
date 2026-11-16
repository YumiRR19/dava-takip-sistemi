import * as React from 'react'
import { Smile } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EMOJI_GROUPS } from '@/lib/emojis'

type TextElement = HTMLTextAreaElement | HTMLInputElement

function useEmojiInsert<T extends TextElement>(value: string, onValueChange: (value: string) => void) {
  const ref = React.useRef<T>(null)
  const selectionRef = React.useRef<{ start: number; end: number } | null>(null)

  const rememberSelection = () => {
    const el = ref.current
    if (el && el.selectionStart !== null && el.selectionEnd !== null) {
      selectionRef.current = { start: el.selectionStart, end: el.selectionEnd }
    }
  }

  const insertEmoji = (emoji: string) => {
    const current = value || ''
    const saved = selectionRef.current
    const start = Math.min(saved ? saved.start : current.length, current.length)
    const end = Math.min(saved ? saved.end : current.length, current.length)
    const caret = start + emoji.length
    selectionRef.current = { start: caret, end: caret }
    onValueChange(current.slice(0, start) + emoji + current.slice(end))
    setTimeout(() => {
      const el = ref.current
      if (el) {
        el.focus()
        el.setSelectionRange(caret, caret)
      }
    }, 0)
  }

  const handlers = {
    onSelect: rememberSelection,
    onKeyUp: rememberSelection,
    onClick: rememberSelection,
    onBlur: rememberSelection,
  }

  return { ref, insertEmoji, handlers, rememberSelection }
}

function EmojiPickerButton({ onPick }: { onPick: (emoji: string) => void }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600" aria-label="Emoji ekle">
          <Smile className="h-4 w-4 mr-1" />
          Emoji ekle
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="max-h-72 overflow-y-auto space-y-2">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-[11px] font-medium text-gray-500 px-1 mb-1">{group.title}</p>
              <div className="grid grid-cols-8 gap-1">
                {group.items.map(([emoji, name]) => (
                  <button
                    key={emoji}
                    type="button"
                    title={name}
                    className="text-lg leading-none rounded p-1 hover:bg-gray-100"
                    onClick={() => {
                      onPick(emoji)
                      setOpen(false)
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

type EmojiTextareaProps = Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}

export function EmojiTextarea({ value, onValueChange, ...props }: EmojiTextareaProps) {
  const { ref, insertEmoji, handlers, rememberSelection } = useEmojiInsert<HTMLTextAreaElement>(value, onValueChange)
  return (
    <div className="space-y-1">
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value)
          rememberSelection()
        }}
        {...handlers}
        {...props}
      />
      <EmojiPickerButton onPick={insertEmoji} />
    </div>
  )
}

type EmojiInputProps = Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}

export function EmojiInput({ value, onValueChange, ...props }: EmojiInputProps) {
  const { ref, insertEmoji, handlers, rememberSelection } = useEmojiInsert<HTMLInputElement>(value, onValueChange)
  return (
    <div className="space-y-1">
      <Input
        ref={ref}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value)
          rememberSelection()
        }}
        {...handlers}
        {...props}
      />
      <EmojiPickerButton onPick={insertEmoji} />
    </div>
  )
}
