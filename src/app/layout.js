// src/app/layout.js

import Providers from "../components/Providers"
import "./globals.css"
import "./fonts.css"

export const metadata = {
  title: "Timetable Management System",
  description: "A modern solution for educational institutions to create, manage, and optimize academic schedules",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
