import { avatarUrl } from './avatar'

export function Avatar({ id, name, size = 48 }: { id: string; name: string; size?: number }) {
  return (
    <img
      src={avatarUrl(id)}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 rounded-full bg-white/10 object-cover"
      style={{ width: size, height: size }}
    />
  )
}
