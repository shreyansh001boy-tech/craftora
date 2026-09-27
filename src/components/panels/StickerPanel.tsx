import { useState } from 'react'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { addEmoji } from '@/lib/shapes'
import { motion } from 'framer-motion'

const EMOJI_CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: 'Smileys',
    icon: '😊',
    emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒'],
  },
  {
    label: 'Gestures',
    icon: '👋',
    emojis: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🤝','👏','🙌','🫶','🤲','🙏','✍️','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁️','👅','👄'],
  },
  {
    label: 'Hearts',
    icon: '❤️',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','✡️','🔯','🕎','☯️','☦️','🛐'],
  },
  {
    label: 'Nature',
    icon: '🌸',
    emojis: ['🌸','🌺','🌻','🌹','🌷','🌼','🪷','🌱','🌿','🍃','🍂','🍁','🍄','🌾','🎋','🎍','🪴','🌵','🌴','🌲','🌳','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘'],
  },
  {
    label: 'Food',
    icon: '🍕',
    emojis: ['🍕','🍔','🌮','🌯','🥙','🧆','🥚','🍳','🥘','🍲','🫕','🥗','🍿','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟'],
  },
  {
    label: 'Activities',
    icon: '⚽',
    emojis: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🏓','🏸','🥊','🥋','⛳','🏹','🎣','🤿','🎽','🛹','🛼','🛷','⛸️','🎿','🏋️','🤸','🤼','🤺','🏇','⛷️'],
  },
  {
    label: 'Travel',
    icon: '✈️',
    emojis: ['✈️','🚀','🛸','🚁','🛩️','⛵','🚢','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚗','🚘'],
  },
  {
    label: 'Objects',
    icon: '💡',
    emojis: ['💡','🔦','🕯️','🪔','🧯','🛢️','💰','💵','💴','💶','💷','💳','🪙','💎','⚖️','🪜','🧲','🔧','🪛','🔩','⚙️','🗜️','🔗','⛓️','🪝','🧰','🪤','🧱','🔮','🧿'],
  },
  {
    label: 'Symbols',
    icon: '✨',
    emojis: ['✨','⭐','🌟','💫','⚡','🔥','💥','❄️','🌊','🌀','🌈','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','⛄','🌬️','💨','💧','💦','🌫️','🌪️','🌡️'],
  },
  {
    label: 'Flags',
    icon: '🏳️',
    emojis: ['🏳️','🏴','🏁','🚩','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️','🇺🇳','🎌','🏴󠁧󠁢󠁥󠁮󠁧󠁿','🏴󠁧󠁢󠁳󠁣󠁴󠁿','🏴󠁧󠁢󠁷󠁬󠁳󠁿','🇦🇨','🇦🇩','🇦🇪','🇦🇫','🇦🇬','🇦🇮','🇦🇱','🇦🇲','🇦🇴','🇦🇶','🇦🇷','🇦🇸','🇦🇹','🇦🇺','🇦🇼','🇦🇽','🇦🇿'],
  },
]

export function StickerPanel() {
  const canvas = useFabricCanvas()
  const [activeCategory, setActiveCategory] = useState(0)
  const [search, setSearch] = useState('')

  // emoji-mart lazy load removed — using native emoji grid instead

  const handleEmoji = (emoji: string) => {
    if (!canvas) return
    addEmoji(emoji, canvas)
  }

  // Filter by search
  const allEmojis = EMOJI_CATEGORIES.flatMap(c => c.emojis)
  const filtered = search
    ? allEmojis.filter(e => e.includes(search))
    : EMOJI_CATEGORIES[activeCategory]?.emojis || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search */}
      <div style={{ padding: '8px 10px 6px' }}>
        <input
          className="input-base"
          placeholder="Search emoji…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* Category pills */}
      {!search && (
        <div style={{
          display: 'flex', overflowX: 'auto', padding: '0 10px 6px', gap: 4,
          scrollbarWidth: 'none',
        }}>
          {EMOJI_CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(i)}
              title={cat.label}
              style={{
                flexShrink: 0,
                width: 28, height: 28,
                borderRadius: 6,
                border: '1px solid',
                borderColor: activeCategory === i ? 'var(--color-accent-400)' : 'var(--color-base-600)',
                background: activeCategory === i ? 'rgba(244,63,94,0.12)' : 'var(--color-base-750)',
                cursor: 'pointer',
                fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 80ms',
              }}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Category label */}
      {!search && (
        <div className="panel-heading" style={{ paddingTop: 4 }}>
          {EMOJI_CATEGORIES[activeCategory]?.label} ({EMOJI_CATEGORIES[activeCategory]?.emojis.length})
        </div>
      )}

      {/* Emoji Grid */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '4px 10px 10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 2,
      }}>
        {(search ? filtered : EMOJI_CATEGORIES[activeCategory]?.emojis || []).map((emoji, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEmoji(emoji)}
            style={{
              width: '100%', aspectRatio: '1',
              background: 'none', border: 'none',
              cursor: 'pointer', borderRadius: 5,
              fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 80ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-base-750)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            title={emoji}
          >
            {emoji}
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'var(--color-base-500)' }}>
            No emoji found for "{search}"
          </div>
        )}
      </div>

      {/* Footer tip */}
      <div style={{ padding: '6px 10px', borderTop: '1px solid var(--color-base-600)', fontSize: 10, color: 'var(--color-base-500)', textAlign: 'center' }}>
        Click any emoji to place it on the canvas
      </div>
    </div>
  )
}
