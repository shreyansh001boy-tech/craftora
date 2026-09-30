import { useEffect, useState, useCallback } from 'react'
import { HexColorPicker } from 'react-colorful'
import { IText, FabricObject, Group, ActiveSelection } from 'fabric'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { useEditorStore } from '@/store/editorStore'
import { Slider } from '@/components/ui/Slider'
import { FONT_LIST, loadGoogleFont } from '@/data/fontList'
import { copyActive, pasteClipboard, moveZOrder } from '@/lib/clipboard'
import {
  NEUTRAL_ADJUSTMENTS, isImageObject, readAdjustments, applyAdjustments,
  type ImageAdjustments,
} from '@/lib/imageFilters'
import {
  BLEND_MODES, DEFAULT_GRADIENT, DEFAULT_SHADOW, buildGradient, buildShadow,
  isGradient, readGradient, readShadow,
  type FillMode, type GradientSpec, type ShadowSpec,
} from '@/lib/appearance'
import { copyStyle, pasteStyle } from '@/lib/style'
import {
  AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  BringToFront, SendToBack, MoveUp, MoveDown,
  Copy, Trash2, Group as GroupIcon, Ungroup,
  Bold, Italic, Underline, FlipHorizontal, FlipVertical, RotateCcw, Pipette, Paintbrush,
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

// ── Segmented control ─────────────────────────────────────────────────────────
function Segmented<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={{ flex: 1, height: 26, borderRadius: 5, fontSize: 11, cursor: 'pointer',
            border: '1px solid', transition: 'all 80ms',
            borderColor: value === o.value ? 'var(--color-accent-400)' : 'var(--color-base-600)',
            background: value === o.value ? 'rgba(244,63,94,0.12)' : 'var(--color-base-750)',
            color: value === o.value ? 'var(--color-accent-400)' : 'var(--color-base-400)' }}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

const FILL_MODES: { value: FillMode; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
]

// ── Gradient stop + angle editors ─────────────────────────────────────────────
function GradientFields({ spec, mode, onChange }: {
  spec: GradientSpec; mode: FillMode; onChange: (p: Partial<GradientSpec>) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <ColorSwatch label="Start" color={spec.from} onChange={c => onChange({ from: c })} />
        </div>
        <div style={{ flex: 1 }}>
          <ColorSwatch label="End" color={spec.to} onChange={c => onChange({ to: c })} />
        </div>
      </div>
      {mode === 'linear' && (
        <Slider label="Angle" value={spec.angle} min={0} max={359} step={1}
          onChange={v => onChange({ angle: v })} showValue unit="°" />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export function PropertiesPanel() {
  const canvas = useFabricCanvas()
  const { activeObjectId, syncLayersFromCanvas, snapshot, snapshotSoon, bgNonce } = useEditorStore()

  const [obj, setObj] = useState<FabricObject | null>(null)
  const [fillColor, setFillColor] = useState('#3C3C4E')
  const [fillMode, setFillMode] = useState<FillMode>('solid')
  const [grad, setGrad] = useState<GradientSpec>(DEFAULT_GRADIENT)
  const [strokeColor, setStrokeColor] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(0)
  const [opacity, setOpacity] = useState(100)
  const [blendMode, setBlendMode] = useState('source-over')
  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
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
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left')
  const [lineHeight, setLineHeight] = useState(1.2)
  const [charSpacing, setCharSpacing] = useState(0)
  // Image adjustments
  const [adj, setAdj] = useState<ImageAdjustments>(NEUTRAL_ADJUSTMENTS)
  // Shadow
  const [shadow, setShadow] = useState<ShadowSpec>(DEFAULT_SHADOW)
  const [hasShadow, setHasShadow] = useState(false)
  const [styleStored, setStyleStored] = useState(false)
  // Canvas bg
  const [bgColor, setBgColor] = useState('#ffffff')
  const [bgMode, setBgMode] = useState<FillMode>('solid')
  const [bgGrad, setBgGrad] = useState<GradientSpec>({ ...DEFAULT_GRADIENT, from: '#F43F5E', to: '#1E1E28' })

  // Sync from active object
  useEffect(() => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    setObj(active || null)
    setAdj(isImageObject(active) ? readAdjustments(active) : NEUTRAL_ADJUSTMENTS)
    if (!active) return

    if (isGradient(active.fill)) {
      setFillMode(active.fill.type === 'radial' ? 'radial' : 'linear')
      setGrad(readGradient(active.fill))
    } else {
      setFillMode('solid')
      setFillColor((active.fill as string) || '#3C3C4E')
    }
    setStrokeColor((active.stroke as string) || 'transparent')
    setStrokeWidth(active.strokeWidth || 0)
    setOpacity(Math.round((active.opacity ?? 1) * 100))
    setBlendMode(active.globalCompositeOperation || 'source-over')
    setFlipX(!!active.flipX)
    setFlipY(!!active.flipY)
    setHasShadow(!!active.shadow)
    if (active.shadow) setShadow(readShadow(active))
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
      setTextAlign((t.textAlign as any) || 'left')
      setLineHeight(t.lineHeight || 1.2)
      setCharSpacing(t.charSpacing || 0)
    }
  }, [activeObjectId, canvas])

  useEffect(() => {
    if (!canvas) return
    const bg = (canvas as any).backgroundColor
    if (isGradient(bg)) {
      setBgMode(bg.type === 'radial' ? 'radial' : 'linear')
      setBgGrad(readGradient(bg))
    } else {
      setBgMode('solid')
      setBgColor((bg as string) || '#ffffff')
    }
  }, [canvas, bgNonce])

  const update = (props: Record<string, any>) => {
    const active = canvas?.getActiveObject()
    if (!active || !canvas) return
    active.set(props as any)
    active.dirty = true
    canvas.requestRenderAll()
    snapshotSoon()
  }

  const setAdjustment = (key: keyof ImageAdjustments, value: number) => {
    const active = canvas?.getActiveObject()
    if (!canvas || !isImageObject(active)) return
    const next = { ...adj, [key]: value }
    setAdj(next)
    applyAdjustments(active, next)
    canvas.requestRenderAll()
    snapshotSoon()
  }

  const applyFill = (mode: FillMode, spec: GradientSpec, solid: string) => {
    const active = canvas?.getActiveObject()
    if (!canvas || !active) return
    active.set({
      fill: mode === 'solid'
        ? solid
        : buildGradient(mode, spec, active.width || 100, active.height || 100),
    })
    active.dirty = true
    canvas.requestRenderAll()
    snapshotSoon()
  }

  const applyShadow = (spec: ShadowSpec) => {
    const active = canvas?.getActiveObject()
    if (!canvas || !active) return
    active.set({ shadow: buildShadow(spec) })
    active.dirty = true
    canvas.requestRenderAll()
    snapshotSoon()
  }

  const applyBackground = (mode: FillMode, spec: GradientSpec, solid: string) => {
    if (!canvas) return
    canvas.backgroundColor = mode === 'solid'
      ? solid
      : buildGradient(mode, spec, canvas.getWidth(), canvas.getHeight())
    canvas.requestRenderAll()
    snapshotSoon()
  }

  const patchShadow = (patch: Partial<ShadowSpec>) => {
    const next = { ...shadow, ...patch }
    setShadow(next)
    applyShadow(next)
  }

  const patchGradient = (patch: Partial<GradientSpec>) => {
    const next = { ...grad, ...patch }
    setGrad(next)
    applyFill(fillMode, next, fillColor)
  }

  const patchBgGradient = (patch: Partial<GradientSpec>) => {
    const next = { ...bgGrad, ...patch }
    setBgGrad(next)
    applyBackground(bgMode, next, bgColor)
  }

  const toggleShadow = () => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (!active) return
    if (hasShadow) {
      active.set({ shadow: null })
      active.dirty = true
      canvas.requestRenderAll()
      snapshotSoon()
      setHasShadow(false)
    } else {
      setHasShadow(true)
      applyShadow(shadow)
    }
  }

  const applyBlend = (value: string) => {
    const active = canvas?.getActiveObject()
    if (!canvas || !active) return
    setBlendMode(value)
    active.set({ globalCompositeOperation: value as any })
    active.dirty = true
    canvas.requestRenderAll()
    snapshotSoon()
  }

  const applyFlip = (axis: 'x' | 'y') => {
    const active = canvas?.getActiveObject()
    if (!canvas || !active) return
    const nextX = axis === 'x' ? !flipX : flipX
    const nextY = axis === 'y' ? !flipY : flipY
    setFlipX(nextX)
    setFlipY(nextY)
    active.set({ flipX: nextX, flipY: nextY })
    canvas.requestRenderAll()
    snapshotSoon()
  }

  const resetTransform = () => {
    const active = canvas?.getActiveObject()
    if (!canvas || !active) return
    setFlipX(false)
    setFlipY(false)
    setRotation(0)
    active.set({ angle: 0, flipX: false, flipY: false, scaleX: 1, scaleY: 1 })
    setObjW(Math.round(active.width || 0))
    setObjH(Math.round(active.height || 0))
    canvas.requestRenderAll()
    snapshot()
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
    snapshotSoon()
  }

  const alignV = (dir: 'top' | 'middle' | 'bottom') => {
    const o = canvas?.getActiveObject()
    if (!o || !canvas) return
    const ch = canvas.getHeight()
    const bh = (o.height || 0) * (o.scaleY || 1)
    const newTop = dir === 'top' ? 0 : dir === 'middle' ? (ch - bh) / 2 : ch - bh
    o.set({ top: newTop })
    canvas.requestRenderAll()
    snapshotSoon()
  }

  // Z-order
  const bringFront = () => canvas && moveZOrder(canvas, 'front')
  const sendBack   = () => canvas && moveZOrder(canvas, 'back')
  const bringFwd   = () => canvas && moveZOrder(canvas, 'forward')
  const sendBwd    = () => canvas && moveZOrder(canvas, 'backward')

  // Copy / Paste / Delete
  const copyObj = () => { if (canvas) void copyActive(canvas) }
  const pasteObj = () => { if (canvas) void pasteClipboard(canvas) }
  const copyStyleBtn = () => {
    const active = canvas?.getActiveObject()
    if (active && copyStyle(active)) setStyleStored(true)
  }
  const pasteStyleBtn = () => {
    const active = canvas?.getActiveObject()
    if (!canvas || !active || !pasteStyle(active)) return
    canvas.requestRenderAll()
    snapshotSoon()
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
  const isImage = obj?.type === 'image'
  // A shared gradient on a multi-selection paints once per child, which reads as a bug.
  const canGradient = !!obj && !isGroup && !isMulti

  const fillEditor = canGradient ? (
    <>
      <Segmented value={fillMode} options={FILL_MODES}
        onChange={m => { setFillMode(m); applyFill(m, grad, fillColor) }} />
      {fillMode === 'solid' ? (
        <ColorSwatch color={fillColor} onChange={c => { setFillColor(c); applyFill('solid', grad, c) }} />
      ) : (
        <GradientFields spec={grad} mode={fillMode} onChange={patchGradient} />
      )}
    </>
  ) : (
    <ColorSwatch color={fillColor} onChange={c => { setFillColor(c); update({ fill: c }) }} />
  )

  return (
    <div style={{ padding: '0 0 16px', overflowY: 'auto' }}>

      {/* ── Canvas Background ── */}
      <SectionHead>Canvas Background</SectionHead>
      <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Segmented value={bgMode} options={FILL_MODES}
          onChange={m => { setBgMode(m); applyBackground(m, bgGrad, bgColor) }} />
        {bgMode === 'solid' ? (
          <ColorSwatch color={bgColor}
            onChange={c => { setBgColor(c); applyBackground('solid', bgGrad, c) }} />
        ) : (
          <GradientFields spec={bgGrad} mode={bgMode} onChange={patchBgGradient} />
        )}
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
              { label: 'W', value: objW, key: 'scaleX' },
              { label: 'H', value: objH, key: 'scaleY' },
            ].map(({ label, value, key }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 10, color: 'var(--color-base-500)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <input className="input-base" type="number" value={value}
                  onChange={e => {
                    const v = +e.target.value
                    const natural = key === 'scaleX' ? (obj?.width || 1) : (obj?.height || 1)
                    if (v <= 0 || !natural) return
                    if (key === 'scaleX') setObjW(v); else setObjH(v)
                    update({ [key]: v / natural })
                  }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <Slider label="Rotation" value={rotation} min={0} max={360} step={1}
                onChange={v => { setRotation(v); update({ angle: v }) }} showValue unit="°" />
            </div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 4 }}>
              <IconBtn icon={<FlipHorizontal size={13} />} label="Flip horizontal" onClick={() => applyFlip('x')} active={flipX} />
              <IconBtn icon={<FlipVertical size={13} />} label="Flip vertical" onClick={() => applyFlip('y')} active={flipY} />
              <button onClick={resetTransform}
                style={{ flex: 1, height: 28, borderRadius: 5, border: '1px solid var(--color-base-600)',
                  background: 'var(--color-base-750)', color: 'var(--color-base-400)', fontSize: 11,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                <RotateCcw size={12} /> Reset size and angle
              </button>
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
            <IconBtn icon={<Pipette size={13} />} label="Copy style" onClick={copyStyleBtn} />
            <IconBtn icon={<Paintbrush size={13} />} label="Paste style" onClick={pasteStyleBtn} active={styleStored} />
            {(isMulti) && <IconBtn icon={<GroupIcon size={13} />} label="Group" onClick={groupObjs} />}
            {(isGroup) && <IconBtn icon={<Ungroup size={13} />} label="Ungroup" onClick={ungroupObjs} />}
          </BtnRow>

          {/* ── Fill (shapes & groups) ── */}
          {(isShape || isGroup) && (
            <>
              <SectionHead>Fill</SectionHead>
              <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {fillEditor}
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
              <SectionHead>Fill</SectionHead>
              <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {fillEditor}
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

          {/* ── Blend mode ── */}
          <SectionHead>Blend Mode</SectionHead>
          <div style={{ padding: '6px 12px 10px' }}>
            <select value={blendMode}
              onChange={e => applyBlend(e.target.value)}
              style={{ width: '100%', height: 28, background: 'var(--color-base-700)',
                border: '1px solid var(--color-base-600)', borderRadius: 6, color: 'var(--color-base-100)',
                fontSize: 12, padding: '0 8px', outline: 'none', cursor: 'pointer' }}>
              {BLEND_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>

          {/* ── Drop shadow ── */}
          <SectionHead>Drop Shadow</SectionHead>
          <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Segmented value={hasShadow ? 'on' : 'off'}
              options={[{ value: 'on', label: 'On' }, { value: 'off', label: 'Off' }]}
              onChange={v => { if ((v === 'on') !== hasShadow) toggleShadow() }} />
            {hasShadow && (
              <>
                <ColorSwatch label="Color" color={shadow.color} onChange={c => patchShadow({ color: c })} />
                <Slider label="Blur" value={shadow.blur} min={0} max={80} step={1}
                  onChange={v => patchShadow({ blur: v })} showValue unit="px" />
                <Slider label="Offset X" value={shadow.offsetX} min={-60} max={60} step={1}
                  onChange={v => patchShadow({ offsetX: v })} showValue unit="px" />
                <Slider label="Offset Y" value={shadow.offsetY} min={-60} max={60} step={1}
                  onChange={v => patchShadow({ offsetY: v })} showValue unit="px" />
                <Slider label="Shadow opacity" value={shadow.opacity} min={0} max={100} step={1}
                  onChange={v => patchShadow({ opacity: v })} showValue unit="%" />
              </>
            )}
          </div>

          {/* ── Image adjustments ── */}
          {isImage && (
            <>
              <SectionHead>Image Adjustments</SectionHead>
              <div style={{ padding: '6px 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Slider label="Brightness" value={Math.round(adj.brightness * 100)} min={-100} max={100} step={1}
                  onChange={v => setAdjustment('brightness', v / 100)} showValue />
                <Slider label="Contrast" value={Math.round(adj.contrast * 100)} min={-100} max={100} step={1}
                  onChange={v => setAdjustment('contrast', v / 100)} showValue />
                <Slider label="Saturation" value={Math.round(adj.saturation * 100)} min={-100} max={100} step={1}
                  onChange={v => setAdjustment('saturation', v / 100)} showValue />
                <Slider label="Blur" value={Math.round(adj.blur * 100)} min={0} max={50} step={1}
                  onChange={v => setAdjustment('blur', v / 100)} showValue />
                <button onClick={() => { setAdj(NEUTRAL_ADJUSTMENTS); const a = canvas?.getActiveObject(); if (a && isImageObject(a)) { applyAdjustments(a, NEUTRAL_ADJUSTMENTS); canvas?.requestRenderAll(); snapshotSoon() } }}
                  style={{ height: 26, borderRadius: 5, border: '1px solid var(--color-base-600)',
                    background: 'var(--color-base-750)', color: 'var(--color-base-400)', fontSize: 11, cursor: 'pointer' }}>
                  Reset adjustments
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
