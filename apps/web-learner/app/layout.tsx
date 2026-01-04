import { Open_Sans } from "next/font/google"

import "@workspace/ui/styles/globals.css"
import { Providers } from "@/lib/providers/providers"
import { Header } from "@/components/layout/header"
import { Toaster } from "@workspace/ui/components/sonner"

const fontSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} font-sans antialiased `}
      >
        <Providers>
          <Header />
          <main>{children}</main>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
