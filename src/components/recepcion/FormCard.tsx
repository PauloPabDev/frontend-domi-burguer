import { cn } from '@/lib/utils';

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function FormCard({ children, className, disabled }: FormCardProps) {
  return (
    <section className={cn(
      'flex flex-col gap-4 p-5 rounded-xl border bg-white shadow-sm transition-opacity duration-200',
      disabled
        ? 'border-neutral-black-10 opacity-40 pointer-events-none'
        : 'border-neutral-black-20',
      className
    )}>
      {children}
    </section>
  );
}
