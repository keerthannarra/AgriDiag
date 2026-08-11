import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Diagnose from './pages/Diagnose';
import Results from './pages/Results';
import History from './pages/History';
import PlantDatabase from './pages/PlantDatabase';
import FAQ from './pages/FAQ';
import Feedback from './pages/Feedback';
import Blog from './pages/Blog';
import LiveChat from './pages/LiveChat';
import DirectModel from './pages/DirectModel';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/plants" element={<PlantDatabase />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/diagnose" element={<Diagnose />} />
                <Route path="/results/:id" element={<Results />} />
                <Route path="/history" element={<History />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/chat" element={<LiveChat />} />
                <Route path="/model" element={<DirectModel />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
