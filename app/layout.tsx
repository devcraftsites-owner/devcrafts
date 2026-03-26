import type { Metadata } from "next"
import { SiteFooter } from "./_components/SiteFooter"
import { SiteHeader } from "./_components/SiteHeader"
import { ThemeScript } from "./_components/ThemeScript"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://dev-craft.dev"),
  title: {
    default: "dev-craft",
    template: "%s | dev-craft",
  },
  description: "Java 実務レシピとブラウザ完結ツールを単一ブランドで整理する開発者向けサイト。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" data-theme="light" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <SiteHeader />
        <main className="site-shell app-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
