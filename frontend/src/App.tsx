import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LinkClipper from './pages/LinkClipper';
import Clips from './pages/Clips';
import HeroSection from './components/HeroSection';
import Channel from './pages/Channel';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import ClipDetail from './pages/ClipDetail';
import VodWorkflow from './pages/VodWorkflow';

function App() {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <AuthProvider>
            <div className="min-h-screen bg-black">
                {isLandingPage && <Navbar />}
                <main className={isLandingPage ? 'pt-16' : 'pt-0'}>
                    <Routes>
                        <Route path="/" element={<HeroSection />} />
                        <Route path="/link" element={<LinkClipper />} />
                        <Route path="/clips" element={<Clips />} />
                        <Route path="/channel/:username" element={<Dashboard />} />
                        <Route path="/workflow" element={<Dashboard />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/pricing" element={<Pricing />} />
                        <Route path="/clip/:clipId" element={<ClipDetail />} />
                    </Routes>
                </main>
            </div>
        </AuthProvider>
    );
}

export default App;
