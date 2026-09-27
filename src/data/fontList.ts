export const FONT_LIST = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Montserrat',
  'Lato',
  'Oswald',
  'Raleway',
  'Nunito',
  'Merriweather',
  'Source Sans Pro',
  'Ubuntu',
  'Barlow',
  'Fira Sans',
  'Mulish',
  'Quicksand',
  'Playfair Display',
  'Lobster',
  'Pacifico',
  'Dancing Script',
  'Bebas Neue',
  'Anton',
  'Righteous',
  'Permanent Marker',
  'Abril Fatface',
]

const loadedFonts = new Set<string>()

export async function loadGoogleFont(family: string, canvas?: any) {
  if (loadedFonts.has(family)) return
  loadedFonts.add(family)

  const encoded = encodeURIComponent(family)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`
  document.head.appendChild(link)

  await document.fonts.ready
  if (canvas) canvas.requestRenderAll()
}
