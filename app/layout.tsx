import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Blindegust', description: 'Jeu de dégustation de sodas à l’aveugle' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>
}
