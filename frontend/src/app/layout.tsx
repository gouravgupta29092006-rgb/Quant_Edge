import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
  weight:   ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default:  'QuantEdge — AI Financial Intelligence Platform',
    template: '%s | QuantEdge',
  },
  description: 'Virtual portfolio simulation, AI-powered analytics, strategy backtesting, and real-time market intelligence. Master investing with QuantEdge.',
  keywords:  ['stock portfolio', 'investment simulator', 'AI investing', 'backtesting', 'market analytics', 'fintech'],
  authors:   [{ name: 'QuantEdge' }],
  creator:   'QuantEdge',
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         'https://quantedge.app',
    title:       'QuantEdge — AI Financial Intelligence Platform',
    description: 'Virtual portfolio simulation, AI-powered analytics, and strategy backtesting.',
    siteName:    'QuantEdge',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'QuantEdge — AI Financial Intelligence Platform',
    description: 'Virtual portfolio simulation, AI-powered analytics, and strategy backtesting.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        {/* Google Fonts — preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Tri-stack: Calistoga (display) · Inter (loaded via next/font) · JetBrains Mono (mono) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Calistoga:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg-base text-text-primary font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
