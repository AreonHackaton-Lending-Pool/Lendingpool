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
          <div className="bg-[url(https://cdn.discordapp.com/attachments/1192557701557932263/1203712867216400465/pexels-photo-998641.png?ex=65d217f7&is=65bfa2f7&hm=4e800d93a923fa9ed612805942353202af93a34f267533613e8d8d1dec4791a7&)] bg-cover">
            <div className="container mx-auto min-h-[648px]">
              {children}
            </div>
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
