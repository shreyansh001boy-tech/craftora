import { TopBar } from '@/components/topbar/TopBar'
import { Toolbar } from '@/components/toolbar/Toolbar'
import { CanvasBoard } from '@/components/canvas/CanvasBoard'
import { RightPanel } from '@/components/panels/RightPanel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function EditorLayout() {
  useKeyboardShortcuts()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--color-base-900)' }}>
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Toolbar */}
        <Toolbar />

        {/* Canvas */}
        <CanvasBoard />

        {/* Right Panel */}
        <RightPanel />
      </div>

      {/* Status Bar */}
      <div style={{
        height: 26,
        background: 'var(--color-base-875)',
        borderTop: '1px solid var(--color-base-600)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 16,
        fontSize: 11,
        color: 'var(--color-base-500)',
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
      }}>
        <span>Craftora</span>
        <span style={{ color: 'var(--color-base-600)' }}>|</span>
        <span>No backend. No account. Fully yours.</span>
      </div>
    </div>
  )
}

export default function App() {
  return <EditorLayout />
}
