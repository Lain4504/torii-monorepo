import { Nunito, Noto_Sans_JP, Noto_Serif_JP } from "next/font/google"

import "@workspace/ui/styles/globals.css"
import { Providers } from "@/lib/providers/providers"
import { Toaster } from "@workspace/ui/components/sonner"

const fontSans = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})

const fontHeading = Nunito({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  weight: ["600", "700", "800", "900"],
})

const fontSerif = Noto_Serif_JP({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

const fontJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-jp",
  weight: ["300", "400", "500", "700"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${fontHeading.variable} ${fontSans.variable} ${fontSerif.variable} ${fontJP.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  )
}
