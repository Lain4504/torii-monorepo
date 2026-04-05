import { Montserrat } from "next/font/google"

import "@workspace/ui/styles/globals.css"
import { Providers } from "@/lib/providers/providers"
import { Toaster } from "@workspace/ui/components/sonner"
import { FacebookSDK } from "@/components/auth/facebook-sdk"

const fontSans = Montserrat({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <FacebookSDK />
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  )
}
