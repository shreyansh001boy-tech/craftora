import { useEditorStore } from '@/store/editorStore'

export function useFabricCanvas() {
  return useEditorStore((s) => s.fabricCanvas)
}
