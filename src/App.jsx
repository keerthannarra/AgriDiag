import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import NotFound from './pages/NotFound';

const PAGE_TITLES = {
  '/': 'Home',
  '/login': 'Sign In',
  '/register': 'Create Account',
  '/dashboard': 'Dashboard',
  '/diagnose': 'Diagnose a Plant',
  '/history': 'Diagnosis History',
  '/plants': 'Plant Library',
  '/faq': 'Frequently Asked Questions',
  '/blog': 'Field Journal',
  '/feedback': 'Feedback',
  '/chat': 'Live Chat',
  '/model': 'Direct Model',
};

function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const pageTitle = pathname.startsWith('/results/')
      ? 'Diagnosis Results'
      : PAGE_TITLES[pathname] || 'Page Not Found';

    document.title = `${pageTitle} | AgriDiag`;
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageTitle />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
