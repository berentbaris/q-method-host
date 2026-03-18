import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CoffeeButton from './CoffeeButton'

export default function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <CoffeeButton />
    </div>
  )
}
