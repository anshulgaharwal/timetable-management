// src/app/layout.js

import Providers from "../components/Providers"
import "./globals.css"

export const metadata = {
  title: "Timetable Management System",
  description: "A system for managing academic timetables",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
