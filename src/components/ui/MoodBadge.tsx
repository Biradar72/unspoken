import type { MoodType } from '@/types/database'

const MOOD_EMOJI: Record<MoodType, string> = {
  love: '💕',
  heartbreak: '💔',
  sadness: '🌧️',
  loneliness: '🌑',
  hope: '🌅',
  healing: '🌿',
  happiness: '☀️',
  anger: '🔥',
  friendship: '🤝',
  motivation: '⚡',
  grief: '🕯️',
  gratitude: '🙏',
  self_discovery: '🔮',
  life: '🌱',
}

const MOOD_LABEL: Record<MoodType, string> = {
  love: 'Love',
  heartbreak: 'Heartbreak',
  sadness: 'Sadness',
  loneliness: 'Loneliness',
  hope: 'Hope',
  healing: 'Healing',
  happiness: 'Happiness',
  anger: 'Anger',
  friendship: 'Friendship',
  motivation: 'Motivation',
  grief: 'Grief',
  gratitude: 'Gratitude',
  self_discovery: 'Self-Discovery',
  life: 'Life',
}

export const MOODS: MoodType[] = [
  'love', 'heartbreak', 'sadness', 'loneliness', 'hope', 'healing',
  'happiness', 'anger', 'friendship', 'motivation', 'grief', 'gratitude',
  'self_discovery', 'life',
]

interface MoodBadgeProps {
  mood: MoodType
  showEmoji?: boolean
  interactive?: boolean
  onClick?: () => void
  className?: string
}

export function MoodBadge({
  mood,
  showEmoji = true,
  interactive = false,
  onClick,
  className = '',
}: MoodBadgeProps) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      className={`mood-badge mood-${mood} ${interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      {showEmoji && <span>{MOOD_EMOJI[mood]}</span>}
      <span>{MOOD_LABEL[mood]}</span>
    </Tag>
  )
}

export { MOOD_EMOJI, MOOD_LABEL }
