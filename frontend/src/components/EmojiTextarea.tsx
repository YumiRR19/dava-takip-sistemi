import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Maximize2, Smile, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EMOJI_GROUPS } from '@/lib/emojis'
import { cn } from '@/lib/utils'

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

function EmojiPickerButton({ onPick, container }: { onPick: (emoji: string) => void; container?: HTMLElement | null }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-600" aria-label="Emoji ekle">
          <Smile className="h-4 w-4 mr-1" />
          Emoji ekle
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start" container={container}>
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

function getFieldTitle(id?: string) {
  if (!id) return 'Metin'
  const label = document.querySelector(`label[for="${CSS.escape(id)}"]`)
  return label?.textContent?.replace(/\s*\*\s*$/, '').trim() || 'Metin'
}

function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Metni büyüt"
      title="Metni büyüt"
      className="absolute top-1.5 right-5 flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 bg-white/90 text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <Maximize2 className="h-3.5 w-3.5" />
    </button>
  )
}

type TextExpandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  value: string
  onValueChange: (value: string) => void
  readOnly: boolean
  returnFocusRef: React.RefObject<HTMLTextAreaElement>
  withEmoji: boolean
  placeholder?: string
  maxLength?: number
}

function TextExpandDialog({
  open,
  onOpenChange,
  title,
  value,
  onValueChange,
  readOnly,
  returnFocusRef,
  withEmoji,
  placeholder,
  maxLength,
}: TextExpandDialogProps) {
  const { ref, insertEmoji, handlers, rememberSelection } = useEmojiInsert<HTMLTextAreaElement>(value, onValueChange)
  const [contentEl, setContentEl] = React.useState<HTMLDivElement | null>(null)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          ref={setContentEl}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            const el = ref.current
            if (el) {
              el.focus()
              const end = el.value.length
              el.setSelectionRange(end, end)
              el.scrollTop = el.scrollHeight
              rememberSelection()
            }
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            returnFocusRef.current?.focus()
          }}
          className="fixed left-1/2 top-1/2 z-50 flex h-[calc(100dvh-2rem)] max-h-[880px] w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:h-[calc(100dvh-6rem)] sm:w-[calc(100vw-6rem)] dark:bg-zinc-900 dark:ring-white/10"
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-zinc-800">
            <div className="flex min-w-0 items-center gap-2">
              <DialogPrimitive.Title className="truncate text-[17px] font-semibold text-gray-900 dark:text-zinc-100">
                {title}
              </DialogPrimitive.Title>
              {readOnly && (
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">Salt okunur</span>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Kapat"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 bg-gray-50/70 p-4 sm:p-6 dark:bg-zinc-950/40">
            <textarea
              ref={ref}
              value={value}
              readOnly={readOnly}
              placeholder={placeholder}
              maxLength={maxLength}
              aria-label={title}
              onChange={(e) => {
                onValueChange(e.target.value)
                rememberSelection()
              }}
              {...handlers}
              className="h-full w-full resize-none overflow-y-auto rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 sm:px-6 dark:border-zinc-800">
            <div className="flex min-w-0 items-center gap-3">
              {withEmoji && !readOnly && <EmojiPickerButton onPick={insertEmoji} container={contentEl} />}
              <span className="text-xs text-gray-400">{value.length} karakter</span>
            </div>
            <DialogPrimitive.Close asChild>
              <Button type="button" className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-700">
                {readOnly ? 'Kapat' : 'Bitti'}
              </Button>
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function useTextExpand(id?: string) {
  const [open, setOpen] = React.useState(false)
  const [title, setTitle] = React.useState('Metin')
  const openDialog = () => {
    setTitle(getFieldTitle(id))
    setOpen(true)
  }
  return { open, setOpen, title, openDialog }
}

type EmojiTextareaProps = Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}

export function EmojiTextarea({ value, onValueChange, className, ...props }: EmojiTextareaProps) {
  const { ref, insertEmoji, handlers, rememberSelection } = useEmojiInsert<HTMLTextAreaElement>(value, onValueChange)
  const expand = useTextExpand(props.id)
  return (
    <div className="space-y-1">
      <div className="relative">
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value)
            rememberSelection()
          }}
          {...handlers}
          {...props}
          className={cn('pr-12', className)}
        />
        <ExpandButton onClick={expand.openDialog} />
      </div>
      <EmojiPickerButton onPick={insertEmoji} />
      <TextExpandDialog
        open={expand.open}
        onOpenChange={expand.setOpen}
        title={expand.title}
        value={value || ''}
        onValueChange={onValueChange}
        readOnly={!!(props.readOnly || props.disabled)}
        returnFocusRef={ref}
        withEmoji
        placeholder={props.placeholder}
        maxLength={props.maxLength}
      />
    </div>
  )
}

type ExpandableTextareaProps = Omit<React.ComponentProps<'textarea'>, 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}

export function ExpandableTextarea({ value, onValueChange, className, ...props }: ExpandableTextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const expand = useTextExpand(props.id)
  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
        className={cn(className, 'pr-12')}
      />
      <ExpandButton onClick={expand.openDialog} />
      <TextExpandDialog
        open={expand.open}
        onOpenChange={expand.setOpen}
        title={expand.title}
        value={value || ''}
        onValueChange={onValueChange}
        readOnly={!!(props.readOnly || props.disabled)}
        returnFocusRef={ref}
        withEmoji={false}
        placeholder={props.placeholder}
        maxLength={props.maxLength}
      />
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
