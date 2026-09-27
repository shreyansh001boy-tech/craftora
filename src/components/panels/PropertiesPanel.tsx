import { useEffect, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { IText, FabricObject } from 'fabric'
import { useFabricCanvas } from '@/hooks/useFabricCanvas'
import { useEditorStore } from '@/store/editorStore'
import { Slider } from '@/components/ui/Slider'
import { Input } from '@/components/ui/Input'
import { FONT_LIST, loadGoogleFont } from '@/data/fontList'
import { cn } from '@/lib/cn'

function ColorSwatch({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 24, height: 24, borderRadius: 5,
          background: color || '#transparent',
          border: '2px solid var(--color-base-600)',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        aria-label="Pick color"
      />
      {open && (
        <div style={{ position: 'absolute', top: 28, left: 0, zIndex: 100, padding: 8, background: 'var(--color-base-800)', border: '1px solid var(--color-base-600)', borderRadius: 8, boxShadow: 'var(--shadow-float)' }}>
          <HexColorPicker color={color} onChange={onChange} />
          <button onClick={() => setOpen(false)} style={{ marginTop: 6, fontSize: 11, color: 'var(--color-base-400)', background: 'none', border: 'none', cursor: 'pointer' }}>Done</button>
        </div>
      )}
    </div>
  )
}

export function PropertiesPanel() {
  const canvas = useFabricCanvas()
  const { activeObjectId } = useEditorStore()
  const [obj, setObj] = useState<FabricObject | null>(null)
  const [fillColor, setFillColor] = useState('#3C3C4E')
  const [strokeColor, setStrokeColor] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(0)
  const [opacity, setOpacity] = useState(100)
  // Text props
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontSize, setFontSize] = useState(32)
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [textColor, setTextColor] = useState('#E8E8F0')
  const [textAlign, setTextAlign] = useState<'left'|'center'|'right'>('left')
  const [lineHeight, setLineHeight] = useState(1.2)
  const [bgColor, setBgColor] = useState('#ffffff')

  // Sync props from active object
  useEffect(() => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    setObj(active || null)
    if (!active) return

    setFillColor((active.fill as string) || '#3C3C4E')
    setStrokeColor((active.stroke as string) || 'transparent')
    setStrokeWidth(active.strokeWidth || 0)
    setOpacity(Math.round((active.opacity ?? 1) * 100))

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
    }
  }, [activeObjectId, canvas])

  // Background color
  useEffect(() => {
    if (!canvas) return
    setBgColor((canvas.backgroundColor as string) || '#ffffff')
  }, [canvas])

  const update = (props: Record<string, any>) => {
    if (!canvas) return
    const active = canvas.getActiveObject()
    if (active) {
      active.set(props)
      canvas.requestRenderAll()
    }
  }

  const updateCanvas = (props: Record<string, any>) => {
    if (!canvas) return
    canvas.set(props)
    canvas.requestRenderAll()
  }

  const isText = obj?.type === 'i-text' || obj?.type === 'text'
  const isShape = obj && !isText

  return (
    <div style={{ padding: '8px 0' }}>
      {/* Background Color (always visible) */}
      <div className="panel-heading">Background</div>
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ColorSwatch color={bgColor} onChange={(c) => { setBgColor(c); updateCanvas({ backgroundColor: c }) }} />
        <Input value={bgColor} onChange={(e) => { setBgColor(e.target.value); updateCanvas({ backgroundColor: e.target.value }) }} style={{ flex: 1 }} />
      </div>

      {!obj && (
        <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--color-base-500)', fontSize: 12 }}>
          Select an object to edit properties
        </div>
      )}

      {/* Shape Properties */}
      {isShape && (
        <>
          <div className="panel-heading">Fill</div>
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ColorSwatch color={fillColor} onChange={(c) => { setFillColor(c); update({ fill: c }) }} />
            <Input value={fillColor} onChange={(e) => { setFillColor(e.target.value); update({ fill: e.target.value }) }} style={{ flex: 1 }} />
          </div>

          <div className="panel-heading">Stroke</div>
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ColorSwatch color={strokeColor === 'transparent' ? '#000000' : strokeColor} onChange={(c) => { setStrokeColor(c); update({ stroke: c }) }} />
              <Input value={strokeColor} onChange={(e) => { setStrokeColor(e.target.value); update({ stroke: e.target.value }) }} style={{ flex: 1 }} />
            </div>
            <Slider label="Width" value={strokeWidth} min={0} max={20} step={0.5} onChange={(v) => { setStrokeWidth(v); update({ strokeWidth: v }) }} showValue unit="px" />
          </div>
        </>
      )}

      {/* Text Properties */}
      {isText && (
        <>
          <div className="panel-heading">Text Color</div>
          <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ColorSwatch color={textColor} onChange={(c) => { setTextColor(c); update({ fill: c }) }} />
            <Input value={textColor} onChange={(e) => { setTextColor(e.target.value); update({ fill: e.target.value }) }} style={{ flex: 1 }} />
          </div>

          <div className="panel-heading">Font</div>
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <select
              value={fontFamily}
              onChange={async (e) => {
                const f = e.target.value
                setFontFamily(f)
                await loadGoogleFont(f, canvas)
                update({ fontFamily: f })
              }}
              style={{ height: 28, background: 'var(--color-base-700)', border: '1px solid var(--color-base-600)', borderRadius: 6, color: 'var(--color-base-100)', fontSize: 12, padding: '0 8px', outline: 'none' }}
            >
              {FONT_LIST.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>

            <div style={{ display: 'flex', gap: 6 }}>
              <Input label="Size" type="number" value={fontSize} unit="px" onChange={(e) => { const v = +e.target.value; setFontSize(v); update({ fontSize: v }) }} style={{ flex: 1 }} />
            </div>

            {/* B/I/U toggles */}
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { label: 'B', style: { fontWeight: 700 }, active: bold, action: () => { const n = !bold; setBold(n); update({ fontWeight: n ? 'bold' : 'normal' }) } },
                { label: 'I', style: { fontStyle: 'italic' }, active: italic, action: () => { const n = !italic; setItalic(n); update({ fontStyle: n ? 'italic' : 'normal' }) } },
                { label: 'U', style: { textDecoration: 'underline' }, active: underline, action: () => { const n = !underline; setUnderline(n); update({ underline: n }) } },
              ].map(({ label, style, active, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    width: 28, height: 28, borderRadius: 5, border: '1px solid',
                    borderColor: active ? 'var(--color-accent-400)' : 'var(--color-base-600)',
                    background: active ? 'rgba(244,63,94,0.15)' : 'var(--color-base-700)',
                    color: active ? 'var(--color-accent-400)' : 'var(--color-base-400)',
                    cursor: 'pointer', fontSize: 12, ...style,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Alignment */}
            <div style={{ display: 'flex', gap: 4 }}>
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => { setTextAlign(align); update({ textAlign: align }) }}
                  style={{
                    flex: 1, height: 28, borderRadius: 5, border: '1px solid',
                    borderColor: textAlign === align ? 'var(--color-accent-400)' : 'var(--color-base-600)',
                    background: textAlign === align ? 'rgba(244,63,94,0.15)' : 'var(--color-base-700)',
                    color: textAlign === align ? 'var(--color-accent-400)' : 'var(--color-base-400)',
                    cursor: 'pointer', fontSize: 11,
                  }}
                >
                  {align === 'left' ? '⬅' : align === 'center' ? '↔' : '➡'}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-heading">Spacing</div>
          <div style={{ padding: '8px 12px' }}>
            <Slider label="Line Height" value={lineHeight} min={0.8} max={3} step={0.05} onChange={(v) => { setLineHeight(v); update({ lineHeight: v }) }} showValue />
          </div>
        </>
      )}

      {/* Opacity — always visible when object selected */}
      {obj && (
        <>
          <div className="panel-heading">Opacity</div>
          <div style={{ padding: '8px 12px' }}>
            <Slider value={opacity} min={0} max={100} onChange={(v) => { setOpacity(v); update({ opacity: v / 100 }) }} showValue unit="%" />
          </div>
        </>
      )}
    </div>
  )
}
