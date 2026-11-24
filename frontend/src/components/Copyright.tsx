import imza from '@/assets/imza.png'
import { cn } from '@/lib/utils'

export default function Copyright({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn('flex select-none flex-col items-center text-center', compact ? 'gap-0.5 py-1.5' : 'gap-1.5 px-4 py-4')}>
      <span className={cn('font-medium tracking-wide text-gray-500', compact ? 'text-[11px]' : 'text-xs')}>
        Her hakkı Mahfuzdur
      </span>
      <img
        src={imza}
        alt="By Yusuf imzası"
        draggable={false}
        className={cn('w-auto invert opacity-80', compact ? 'h-6' : 'h-10')}
      />
    </div>
  )
}
