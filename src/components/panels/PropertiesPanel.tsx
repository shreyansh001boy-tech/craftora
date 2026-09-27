import { useEffect, useState, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import { IText, FabricObject, Group, ActiveSelection } from 'fabric'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { useEditorStore } from '@/store/editorStore'
import { Slider } from '@/components/ui/Slider'
import { FONT_LIST, loadGoogleFont } from '@/data/fontList'
import {
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  BringToFront, SendToBack, MoveUp, MoveDown,
  Copy, Trash2, Group as GroupIcon, Ungroup,
  Bold, Italic, Underline,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

// ── Small color swatch with popover picker ────────────────────────────────────
function ColorSwatch({ color, onChange, label }: { color: string; onChange: (c: string) => void; label?: string }) {
  const [open, setOpen] = useState(false)
  const safeColor = color && color !== 'transparent' ? color : '#000000'
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <span style={{ fontSize: 10, color: 'var(--color-base-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => setOpen(!open)}
          aria-label={`Pick ${label || 'color'}`}
          style={{ width: 26, height: 26, borderRadius: 5, background: color === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%,#fff 0% 50%) 0 0/10px 10px' : color,
            border: '1.5px solid var(--color-base-600)', cursor: 'pointer', flexShrink: 0 }}
        />
        <input
          value={color}
          onChange={e => onChange(e.target.value)}
          className="input-base"
          style={{ flex: 1, fontSize: 11, fontFamily: 'var(--font-mono)' }}
        />
      </div>
      {open && (
        <>
          <div style={{ position: 'absolute', top: 36, left: 0, zIndex: 500,
            padding: 10, background: 'var(--color-base-800)', border: '1px solid var(--color-base-600)',
            borderRadius: 10, boxShadow: 'var(--shadow-float)' }}>
            <HexColorPicker color={safeColor} onChange={onChange} />
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              <button onClick={() => { onChange('transparent'); setOpen(false) }}
                style={{ flex: 1, height: 24, background: 'var(--color-base-700)', border: '1px solid var(--color-base-600)', borderRadius: 5, color: 'var(--color-base-400)', fontSize: 10, cursor: 'pointer' }}>
                None
              </button>
              <button onClick={() => setOpen(false)}
                style={{ flex: 1, height: 24, background: 'var(--color-accent-400)', border: 'none', borderRadius: 5, color: '#fff', fontSize: 10, cursor: 'pointer', fontWeight: 600 }}>
                Done
              </button>
            </div>
          </div>
          <div style={{ position: 'fixed', inset: 0, zIndex: 499 }} onClick={() => setOpen(false)} />
        </>
      )}
    </div>
  )
}

// ── Icon button helper ────────────────────────────────────────────────────────
function IconBtn({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      title={label}
      aria-label={label}
      onClick={onClick}
      style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid',
        borderColor: active ? 'var(--color-accent-400)' : 'var(--color-base-600)',
        background: active ? 'rgba(244,63,94,0.12)' : 'var(--color-base-750)',
        color: active ? 'var(--color-accent-400)' : 'var(--color-base-400)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 80ms' }}
    >
      {icon}
    </motion.button>
  )
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHead({ children }: { children: React.ReactNode }) {
  return <div className="panel-heading">{children}</div>
}

// ── Row of icon buttons ───────────────────────────────────────────────────────
function BtnRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '4px 12px 8px' }}>{children}</div>
}

// ─────────────────────────────────────────────────────────────────────────────
export function PropertiesPanel() {
  const canvas = useFabricCanvas()
  const { activeObjectId, syncLayersFromCanvas } = useEditorStore()

  const [obj, setObj] = useState<FabricObject | null>(null)
  const [fillColor, setFillColor] = useState('#3C3C4E')
  const [strokeColor, setStrokeColor] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(0)
  const [opacity, setOpacity] = useState(100)
  const [rx, setRx] = useState(0)
  const [posX, setPosX] = useState(0)
  const [posY, setPosY] = useState(0)
  const [objW, setObjW] = useState(0)
  const [objH, setObjH] = useState(0)
  const [rotation, setRotation] = useState(0)
  // Text
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontSize, setFontSize] = useState(32)
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [textColor, setTextColor] = useState('#E8E8F0')
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left')
  const [lineHeight, setLineHeight] = useState(1.2)
  const [charSpacing, setCharSpacing] = useState(0)
  // Canvas bg
  const [bgColor, setBgColor] = useState('#ffffff')

  // Sync from active object
  useEffect(() => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    setObj(active || null)
    if (!active) return

    setFillColor((active.fill as string) || '#3C3C4E')
    setStrokeColor((active.stroke as string) || 'transparent')
    setStrokeWidth(active.strokeWidth || 0)
    setOpacity(Math.round((active.opacity ?? 1) * 100))
    setRx((active as any).rx || 0)
    setPosX(Math.round(active.left || 0))
    setPosY(Math.round(active.top || 0))
    setObjW(Math.round((active.width || 0) * (active.scaleX || 1)))
    setObjH(Math.round((active.height || 0) * (active.scaleY || 1)))
    setRotation(Math.round(active.angle || 0))

    if (active.type === 'i-text' || active.type === 'text') {
      const t = active as IText
      setFontFamily(t.fontFamily || 'Inter')
      setFontSize(t.fontSize || 32)
      setBold(t.fontWeight === 'bold')
      setItalic(t.fontStyle === 'italic')
      setUnderline(t.underline || false)
      setTextColor((t.fill as string) || '#E8E8F0')
      setTextAlign((t.textAlign as any) || 'left')
      setLineHeight(t.lineHeight || 1.2)
      setCharSpacing(t.charSpacing || 0)
    }
  }, [activeObjectId, canvas])

  useEffect(() => {
    if (!canvas) return
    setBgColor((canvas.backgroundColor as string) || '#ffffff')
  }, [canvas])

  const update = (props: Record<string, any>) => {
    const active = canvas?.getActiveObject()
    if (!active || !canvas) return
    active.set(props as any)
    canvas.requestRenderAll()
  }

  const updateCanvas = (props: Record<string, any>) => {
    if (!canvas) return
    canvas.set(props as any)
    canvas.requestRenderAll()
  }

  // Alignment helpers
  const alignH = (dir: 'left' | 'center' | 'right') => {
    const o = canvas?.getActiveObject()
    if (!o || !canvas) return
    const cw = canvas.getWidth()
    const bw = (o.width || 0) * (o.scaleX || 1)
    const newLeft = dir === 'left' ? 0 : dir === 'center' ? (cw - bw) / 2 : cw - bw
    o.set({ left: newLeft })
    canvas.requestRenderAll()
  }

  const alignV = (dir: 'top' | 'middle' | 'bottom') => {
    const o = canvas?.getActiveObject()
    if (!o || !canvas) return
    const ch = canvas.getHeight()
    const bh = (o.height || 0) * (o.scaleY || 1)
    const newTop = dir === 'top' ? 0 : dir === 'middle' ? (ch - bh) / 2 : ch - bh
    o.set({ top: newTop })
    canvas.requestRenderAll()
  }

  // Z-order
  const bringFront = () => { const o = canvas?.getActiveObject(); if (o && canvas) { canvas.bringObjectToFront(o); canvas.requestRenderAll(); syncLayersFromCanvas() } }
  const sendBack   = () => { const o = canvas?.getActiveObject(); if (o && canvas) { canvas.sendObjectToBack(o); canvas.requestRenderAll(); syncLayersFromCanvas() } }
  const bringFwd   = () => { const o = canvas?.getActiveObject(); if (o && canvas) { canvas.bringObjectForward(o); canvas.requestRenderAll(); syncLayersFromCanvas() } }
  const sendBwd    = () => { const o = canvas?.getActiveObject(); if (o && canvas) { canvas.sendObjectBackwards(o); canvas.requestRenderAll(); syncLayersFromCanvas() } }

  // Copy / Paste / Delete
  const copyObj = () => {
    const o = canvas?.getActiveObject()
    if (!o) return
    o.clone().then((cloned: FabricObject) => { (window as any)._craftoraClipboard = cloned })
  }
  const pasteObj = () => {
    const cloned: FabricObject = (window as any)._craftoraClipboard
    if (!cloned || !canvas) return
    cloned.clone().then((c: FabricObject) => {
      c.set({ left: (cloned.left || 0) + 20, top: (cloned.top || 0) + 20 })
      ;(c as any).__uid = Math.random().toString(36).slice(2, 10)
      canvas.add(c)
      canvas.setActiveObject(c)
      canvas.requestRenderAll()
    })
  }
  const deleteObj = () => {
    const o = canvas?.getActiveObject()
    if (!o || !canvas) return
    canvas.remove(o)
    canvas.requestRenderAll()
    syncLayersFromCanvas()
  }

  // Group / Ungroup
  const groupObjs = () => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active?.type === 'activeselection') {
      try {
        const grp = new Group((active as any).getObjects(), { canvas })
        ;(active as any).getObjects().forEach((o: any) => canvas.remove(o))
        canvas.add(grp)
        canvas.setActiveObject(grp)
        canvas.requestRenderAll()
        syncLayersFromCanvas()
      } catch (_) {}
    }
  }
  const ungroupObjs = () => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active?.type === 'group') {
      const grp = active as Group
      const objs = grp.getObjects()
      canvas.remove(grp)
      objs.forEach((o: any) => {
        const t = grp.calcTransformMatrix()
        const m = (o as any).calcTransformMatrix()
        canvas.add(o)
      })
      canvas.requestRenderAll()
      syncLayersFromCanvas()
    }
  }

  const isText = obj?.type === 'i-text' || obj?.type === 'text'
  const isShape = obj && !isText && obj.type !== 'image'
  const isGroup = obj?.type === 'group'
  const isMulti = obj?.type === 'activeselection'

  return (
    <div style={{ padding: '0 0 16px', overflowY: 'auto' }}>

      {/* ── Canvas Background ── */}
      <SectionHead>Canvas Background</SectionHead>
      <div style={{ padding: '6px 12px 10px' }}>
        <ColorSwatch color={bgColor} onChange={c => { setBgColor(c); updateCanvas({ backgroundColor: c }) }} />
      </div>

      {!obj && (
        <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--color-base-500)', fontSize: 12, lineHeight: 1.6 }}>
          Select an object to edit its properties
        </div>
      )}

      {obj && (
        <>
          {/* ── Position & Size ── */}
          <SectionHead>Transform</SectionHead>
          <div style={{ padding: '6px 12px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { label: 'X', value: posX, key: 'left', set: setPosX },
              { label: 'Y', value: posY, key: 'top', set: setPosY },
            ].map(({ label, value, key, set }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--color-base-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <input className="input-base" type="number" value={value}
                  onChange={e => { const v = +e.target.value; set(v); update({ [key]: v }) }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
              </div>
            ))}
            {[
              { label: 'W', value: objW },
              { label: 'H', value: objH },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--color-base-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <input className="input-base" type="number" value={value} readOnly
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.6 }} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <Slider label="Rotation" value={rotation} min={0} max={360} step={1}
                onChange={v => { setRotation(v); update({ angle: v }) }} showValue unit="°" />
            </div>
          </div>

          {/* ── Alignment ── */}
          <SectionHead>Align to Canvas</SectionHead>
          <BtnRow>
            <IconBtn icon={<AlignLeft size={13} />} label="Align Left" onClick={() => alignH('left')} />
            <IconBtn icon={<AlignCenter size={13} />} label="Align Center H" onClick={() => alignH('center')} />
            <IconBtn icon={<AlignRight size={13} />} label="Align Right" onClick={() => alignH('right')} />
            <IconBtn icon={<AlignStartVertical size={13} />} label="Align Top" onClick={() => alignV('top')} />
            <IconBtn icon={<AlignCenterVertical size={13} />} label="Align Middle" onClick={() => alignV('middle')} />
            <IconBtn icon={<AlignEndVertical size={13} />} label="Align Bottom" onClick={() => alignV('bottom')} />
          </BtnRow>

          {/* ── Z-Order ── */}
          <SectionHead>Layer Order</SectionHead>
          <BtnRow>
            <IconBtn icon={<BringToFront size={13} />} label="Bring to Front" onClick={bringFront} />
            <IconBtn icon={<MoveUp size={13} />} label="Bring Forward" onClick={bringFwd} />
            <IconBtn icon={<MoveDown size={13} />} label="Send Backward" onClick={sendBwd} />
            <IconBtn icon={<SendToBack size={13} />} label="Send to Back" onClick={sendBack} />
          </BtnRow>

          {/* ── Actions ── */}
          <SectionHead>Actions</SectionHead>
          <BtnRow>
            <IconBtn icon={<Copy size={13} />} label="Copy" onClick={copyObj} />
            <IconBtn icon={<Copy size={13} />} label="Paste" onClick={pasteObj} />
            <IconBtn icon={<Trash2 size={13} />} label="Delete" onClick={deleteObj} />
            {(isMulti) && <IconBtn icon={<GroupIcon size={13} />} label="Group" onClick={groupObjs} />}
            {(isGroup) && <IconBtn icon={<Ungroup size={13} />} label="Ungroup" onClick={ungroupObjs} />}
          </BtnRow>

          {/* ── Fill (shapes & groups) ── */}
          {(isShape || isGroup) && (
            <>
              <SectionHead>Fill</SectionHead>
              <div style={{ padding: '6px 12px 10px' }}>
                <ColorSwatch color={fillColor} onChange={c => { setFillColor(c); update({ fill: c }) }} />
              </div>

              <SectionHead>Stroke</SectionHead>
              <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <ColorSwatch color={strokeColor} onChange={c => { setStrokeColor(c); update({ stroke: c }) }} />
                <Slider label="Stroke Width" value={strokeWidth} min={0} max={30} step={0.5}
                  onChange={v => { setStrokeWidth(v); update({ strokeWidth: v }) }} showValue unit="px" />
              </div>

              <SectionHead>Corner Radius</SectionHead>
              <div style={{ padding: '6px 12px 10px' }}>
                <Slider value={rx} min={0} max={200} step={1}
                  onChange={v => { setRx(v); update({ rx: v, ry: v }) }} showValue unit="px" />
              </div>
            </>
          )}

          {/* ── Text properties ── */}
          {isText && (
            <>
              <SectionHead>Text Color</SectionHead>
              <div style={{ padding: '6px 12px 10px' }}>
                <ColorSwatch color={textColor} onChange={c => { setTextColor(c); update({ fill: c }) }} />
              </div>

              <SectionHead>Font</SectionHead>
              <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select value={fontFamily}
                  onChange={async e => { const f = e.target.value; setFontFamily(f); await loadGoogleFont(f, canvas); update({ fontFamily: f }) }}
                  style={{ height: 28, background: 'var(--color-base-700)', border: '1px solid var(--color-base-600)',
                    borderRadius: 6, color: 'var(--color-base-100)', fontSize: 12, padding: '0 8px', outline: 'none', cursor: 'pointer' }}>
                  {FONT_LIST.map(f => <option key={f} value={f}>{f}</option>)}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 10, color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Size</span>
                    <input className="input-base" type="number" value={fontSize}
                      onChange={e => { const v = +e.target.value; setFontSize(v); update({ fontSize: v }) }}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 10, color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Spacing</span>
                    <input className="input-base" type="number" value={charSpacing}
                      onChange={e => { const v = +e.target.value; setCharSpacing(v); update({ charSpacing: v }) }}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
                  </div>
                </div>

                {/* B / I / U */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { label: 'B', icon: <Bold size={12} />, active: bold, action: () => { const n = !bold; setBold(n); update({ fontWeight: n ? 'bold' : 'normal' }) } },
                    { label: 'I', icon: <Italic size={12} />, active: italic, action: () => { const n = !italic; setItalic(n); update({ fontStyle: n ? 'italic' : 'normal' }) } },
                    { label: 'U', icon: <Underline size={12} />, active: underline, action: () => { const n = !underline; setUnderline(n); update({ underline: n }) } },
                  ].map(({ label, icon, active, action }) => (
                    <IconBtn key={label} icon={icon} label={label} onClick={action} active={active} />
                  ))}
                </div>

                {/* Alignment */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['left', 'center', 'right'] as const).map(a => (
                    <button key={a} onClick={() => { setTextAlign(a); update({ textAlign: a }) }}
                      style={{ flex: 1, height: 28, borderRadius: 5, border: '1px solid',
                        borderColor: textAlign === a ? 'var(--color-accent-400)' : 'var(--color-base-600)',
                        background: textAlign === a ? 'rgba(244,63,94,0.12)' : 'var(--color-base-700)',
                        color: textAlign === a ? 'var(--color-accent-400)' : 'var(--color-base-400)',
                        cursor: 'pointer', fontSize: 13, transition: 'all 80ms' }}>
                      {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
                    </button>
                  ))}
                </div>

                <Slider label="Line Height" value={lineHeight} min={0.8} max={3} step={0.05}
                  onChange={v => { setLineHeight(v); update({ lineHeight: v }) }} showValue />
              </div>
            </>
          )}

          {/* ── Opacity (all objects) ── */}
          <SectionHead>Opacity</SectionHead>
          <div style={{ padding: '6px 12px 12px' }}>
            <Slider value={opacity} min={0} max={100}
              onChange={v => { setOpacity(v); update({ opacity: v / 100 }) }} showValue unit="%" />
          </div>
        </>
      )}
    </div>
  )
}
