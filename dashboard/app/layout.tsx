import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'לוח בקרת תמיכה',
  description: 'ניהול פניות תמיכת לקוחות WhatsApp',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-full bg-gray-50">{children}</body>
    </html>
  )
}
