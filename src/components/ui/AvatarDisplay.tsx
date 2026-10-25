interface AvatarDisplayProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export function AvatarDisplay({ src, name, size = 'md', className = '' }: AvatarDisplayProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('')

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`avatar ${sizes[size]} ${className}`}
      />
    )
  }

  return (
    <div className={`avatar ${sizes[size]} ${className}`}>
      {initials || '?'}
    </div>
  )
}
