import { cn } from '@/lib/utils';

interface OrderCommentProps {
  comment: string;
  /** Versión compacta: bordes más pequeños, texto con line-clamp (para recepción) */
  compact?: boolean;
  className?: string;
}

export function OrderComment({ comment, compact = false, className }: OrderCommentProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-1.5 bg-yellow-50 border border-yellow-200',
        compact ? 'rounded-lg p-2' : 'rounded-xl p-2.5',
        className,
      )}
    >
      <p className={cn('text-xs text-yellow-800 leading-relaxed', compact && 'line-clamp-2')}>
        {comment}
      </p>
    </div>
  );
}
