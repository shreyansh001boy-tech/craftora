import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import { PropertiesPanel } from './PropertiesPanel'
import { LayersPanel } from './LayersPanel'
import { TemplatePanel } from './TemplatePanel'
import { ProjectsPanel } from './ProjectsPanel'
import { StickerPanel } from './StickerPanel'
import { panelVariants } from '@/lib/motion'

const tabs = [
  { id: 'properties', label: 'Props' },
  { id: 'layers',     label: 'Layers' },
  { id: 'templates',  label: 'Templates' },
  { id: 'emoji',      label: '😊 Emoji' },
  { id: 'projects',   label: 'Projects' },
]

export function RightPanel() {
  const [activeTab, setActiveTab] = useState('properties')

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
      style={{
        width: 268,
        background: 'var(--color-base-875)',
        borderLeft: '1px solid var(--color-base-600)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {/* Tab Bar */}
        <Tabs.List
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-base-600)',
            background: 'var(--color-base-875)',
            flexShrink: 0,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              style={{
                flex: 1,
                minWidth: 0,
                height: 36,
                fontSize: 10.5,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--color-base-100)' : 'var(--color-base-500)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id
                  ? '2px solid var(--color-accent-400)'
                  : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 150ms',
                padding: '0 3px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ height: '100%' }}
            >
              <Tabs.Content value="properties" forceMount style={{ display: activeTab === 'properties' ? 'block' : 'none', height: '100%' }}>
                <PropertiesPanel />
              </Tabs.Content>
              <Tabs.Content value="layers" forceMount style={{ display: activeTab === 'layers' ? 'block' : 'none', height: '100%' }}>
                <LayersPanel />
              </Tabs.Content>
              <Tabs.Content value="templates" forceMount style={{ display: activeTab === 'templates' ? 'block' : 'none', height: '100%' }}>
                <TemplatePanel />
              </Tabs.Content>
              <Tabs.Content value="emoji" forceMount style={{ display: activeTab === 'emoji' ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}>
                <StickerPanel />
              </Tabs.Content>
              <Tabs.Content value="projects" forceMount style={{ display: activeTab === 'projects' ? 'block' : 'none', height: '100%' }}>
                <ProjectsPanel />
              </Tabs.Content>
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs.Root>
    </motion.aside>
  )
}
