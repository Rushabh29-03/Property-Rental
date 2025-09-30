import './App.css'
import Header from './components/header/Header'
import AppRoutes from './routes/routes'
import { Link } from 'react-router'
import { PropertyProvider } from './components/customHooks/PropertyContext'

function App() {
  return (
    <PropertyProvider>
      <span className='sticky top-0 z-100 w-full'><Header /></span>
      {/* <Link to="/" className="text-2xl bg-fuchsia-500 decoration-none">Jordan</Link> */}
      {/* <Header /> */}
      <AppRoutes />
    </PropertyProvider>
  )
}

export default App
