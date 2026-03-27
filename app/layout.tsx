import type { Metadata } from "next"
import Script from "next/script"
import { SiteFooter } from "./_components/SiteFooter"
import { SiteHeader } from "./_components/SiteHeader"
import { ThemeScript } from "./_components/ThemeScript"
import "./globals.css"

const GA_ID = "G-4C08CPRE94"

export const metadata: Metadata = {
  metadataBase: new URL("https://dev-craft.dev"),
  title: {
    default: "dev-craft — Java 実務レシピ & ブラウザ完結ツール",
    template: "%s | dev-craft",
  },
  description: "Java 8/17/21 対応の実務レシピとブラウザ完結ツールを整理した開発者向けサイト。外部ライブラリ不要のコード例とサーバー送信なしの計算・変換ツールを提供します。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "dev-craft",
    images: [
      {
        url: "https://dev-craft.dev/og-image.png",
        width: 1200,
        height: 630,
        alt: "dev-craft — Java 実務レシピ & ブラウザ完結ツール",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
        />
        <ThemeScript />
      </head>
      <body>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <SiteHeader />
        <main className="site-shell app-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
