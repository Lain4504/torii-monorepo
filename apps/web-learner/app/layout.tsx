import { Poppins, Open_Sans, Source_Serif_4 } from "next/font/google"

import "@workspace/ui/styles/globals.css"
import { Providers } from "@/lib/providers/providers"
import { Toaster } from "@workspace/ui/components/sonner"

const fontHeading = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
})

const fontSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontHeading.variable} ${fontSans.variable} ${fontSerif.variable} font-sans antialiased `}
      >
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
