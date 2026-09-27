import { useState, useEffect, Suspense } from 'react'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { addEmoji } from '@/lib/shapes'
import { motion } from 'framer-motion'

// Lazy load emoji-mart data
let EmojiPicker: any = null

export function StickerPanel() {
  const canvas = useFabricCanvas()
  const [loaded, setLoaded] = useState(false)
  const [Comp, setComp] = useState<any>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      import('@emoji-mart/react'),
      import('@emoji-mart/data'),
    ]).then(([mod, datamod]) => {
      setComp(() => mod.default)
      setData(datamod.default)
      setLoaded(true)
    })
  }, [])

  const handleEmojiSelect = (emoji: any) => {
    if (!canvas) return
    addEmoji(emoji.native, canvas)
  }

  if (!loaded || !Comp || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--color-base-500)', fontSize: 12 }}>
        Loading emoji…
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: 8 }}
    >
      <div className="panel-heading">Emoji & Stickers</div>
      <Comp
        data={data}
        onEmojiSelect={handleEmojiSelect}
        theme="dark"
        previewPosition="none"
        skinTonePosition="none"
        set="native"
        perLine={7}
        emojiSize={20}
        style={{ width: '100%' }}
      />
    </motion.div>
  )
}
