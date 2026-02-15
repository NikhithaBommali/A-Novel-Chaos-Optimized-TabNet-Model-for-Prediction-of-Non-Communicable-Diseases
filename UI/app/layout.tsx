import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"

import { Toaster } from "sonner"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Disease Prediction System",
  description: "AI-powered prediction of non-communicable diseases using TabNet and machine learning",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">


      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
