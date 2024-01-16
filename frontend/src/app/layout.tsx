import { Providers } from './providers'
import '../globals.css'
import Navbar from '../components/main/navbar/Navbar'
import Footer from '../components/main/footer/Footer'

export const metadata = {
  title: 'wagmi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
