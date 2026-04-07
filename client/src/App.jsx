import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import CreateStudy from './pages/CreateStudy'
import Participate from './pages/Participate'
import Results from './pages/Results'
import NotFound from './pages/NotFound'
import QMethodologyTool from './pages/QMethodologyTool'
import OnlineQSortTool from './pages/OnlineQSortTool'
import QMethodologyExplained from './pages/QMethodologyExplained'
import QMethodAnalysisGuide from './pages/QMethodAnalysisGuide'
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
          <Route path="/results" element={<Results />} />
          <Route path="/results/:code" element={<Results />} />
          {/* SEO landing pages */}
          <Route path="/q-methodology-tool" element={<QMethodologyTool />} />
          <Route path="/online-q-sort-tool" element={<OnlineQSortTool />} />
          <Route path="/q-methodology-explained" element={<QMethodologyExplained />} />
          <Route path="/q-method-analysis-guide" element={<QMethodAnalysisGuide />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
