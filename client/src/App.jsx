import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import CreateStudy from './pages/CreateStudy'
import Participate from './pages/Participate'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateStudy />} />
          <Route path="/participate" element={<Participate />} />
          <Route path="/study/:code" element={<Participate />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
