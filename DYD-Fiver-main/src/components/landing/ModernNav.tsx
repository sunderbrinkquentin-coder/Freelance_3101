import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ModernNavProps {
  onStartWizard: () => void;
}

export default function ModernNav({ onStartWizard }: ModernNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login?redirect=/dashboard');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/70 border-b border-white/5">
      <div className="w-full flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/DYD Logo RGB.svg"
            alt="DYD Logo"
            className="w-10 h-10"
          />
          <span className="text-2xl font-bold tracking-tight">DYD</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('features')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            So funktioniert's
          </button>
          <button
            onClick={() => scrollToSection('preise')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Preise
          </button>
          <button
            onClick={() => scrollToSection('festival')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Festival
          </button>
          <button
            onClick={handleAuthClick}
            disabled={isCheckingAuth}
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <User size={16} />
            {isCheckingAuth ? '...' : isLoggedIn ? 'Dashboard' : 'Login'}
          </button>
          <button
            onClick={onStartWizard}
            className="px-6 py-2.5 bg-gradient-to-r from-[#30E3CA] to-[#38f6d1] hover:shadow-[0_0_30px_rgba(48,227,202,0.5)] rounded-lg font-semibold transition-all duration-300"
          >
            Kostenlos
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/5">
          <div className="w-full px-4 py-4 space-y-3">
            <button
              onClick={() => {
                scrollToSection('features');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-gray-400 hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => {
                scrollToSection('features');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-gray-400 hover:text-white transition-colors"
            >
              So funktioniert's
            </button>
            <button
              onClick={() => {
                scrollToSection('preise');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-gray-400 hover:text-white transition-colors"
            >
              Preise
            </button>
            <button
              onClick={() => {
                scrollToSection('festival');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-gray-400 hover:text-white transition-colors"
            >
              Festival
            </button>
            <button
              onClick={() => {
                handleAuthClick();
                setMobileMenuOpen(false);
              }}
              disabled={isCheckingAuth}
              className="block w-full text-left py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <User size={16} />
              {isCheckingAuth ? '...' : isLoggedIn ? 'Dashboard' : 'Login'}
            </button>
            <button
              onClick={() => {
                onStartWizard();
                setMobileMenuOpen(false);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#30E3CA] to-[#38f6d1] rounded-lg font-semibold transition-all"
            >
              Kostenlos
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
