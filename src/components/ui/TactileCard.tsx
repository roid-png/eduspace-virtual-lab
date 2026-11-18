import type { HTMLAttributes, ReactNode } from 'react';

interface TactileCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'raised' | 'raised-lg' | 'inset' | 'inset-deep';
  children: ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<TactileCardProps['variant']>, string> = {
  raised: 'tactile-raised',
  'raised-lg': 'tactile-raised-lg',
  inset: 'tactile-inset',
  'inset-deep': 'tactile-inset-deep',
};

export function TactileCard({
  variant = 'raised',
  className = '',
  children,
  ...rest
}: TactileCardProps) {
  return (
    <div className={`${VARIANT_CLASSES[variant]} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
