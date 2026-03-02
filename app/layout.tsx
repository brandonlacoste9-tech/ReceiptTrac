import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ReceiptAI - The Anti-Gaslighting Money App',
  description: 'Stop wondering where your money went. Your receipts tell the truth.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
