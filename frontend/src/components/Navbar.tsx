import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success('You have been logged out');
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 300 }
    }
  };

  const menuItems = ['Home', 'Features', 'Appointments', 'Emergency', 'Mental Health', 'Contact'];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Simplified */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-medical-blue-600 to-medical-green-500 dark:from-medical-blue-400 dark:to-medical-green-300 bg-clip-text text-transparent">
                TIET Medi-Care
              </span>
            </a>
          </motion.div>
          
          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden md:flex space-x-10"
            variants={navVariants}
            initial="hidden"
            animate="visible"
          >
            {menuItems.map((item, index) => (
              <motion.a 
                key={index}
                href={item === 'Home' ? '/' : `#${item.toLowerCase().replace(' ', '-')}`}
                className={`relative text-gray-800 dark:text-gray-200 transition-colors font-medium`}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onHoverStart={() => setActiveItem(item)}
                onHoverEnd={() => setActiveItem(null)}
              >
                {item}
                <motion.span 
                  className="absolute -bottom-1 left-0 w-full h-0.5 bg-medical-blue-500 dark:bg-medical-blue-400"
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: activeItem === item || window.location.hash === `#${item.toLowerCase().replace(' ', '-')}` ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </motion.nav>
          
          {/* Auth Button or User Menu & Theme Toggle */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-medical-blue-200 dark:border-medical-blue-700">
                      <AvatarFallback className="bg-medical-blue-100 dark:bg-medical-blue-800 text-medical-blue-700 dark:text-medical-blue-200">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center" onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center" onClick={() => navigate('/my-appointments')}>
                    <span>My Appointments</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleLogin}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </motion.div>
            )}
          </div>
          
          {/* Mobile menu button and theme toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full mr-2">
                    <Avatar className="h-8 w-8 border-2 border-medical-blue-200 dark:border-medical-blue-700">
                      <AvatarFallback className="bg-medical-blue-100 dark:bg-medical-blue-800 text-medical-blue-700 dark:text-medical-blue-200 text-xs">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>My Appointments</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-500 focus:text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLogin}
                className="mr-2 h-8 flex items-center gap-1 text-xs"
                size="sm"
                variant="outline"
              >
                <LogIn className="h-3 w-3" />
                Sign In
              </Button>
            )}
            
            <motion.button 
              onClick={toggleMenu}
              className="flex items-center justify-center p-2 rounded-md text-gray-800 dark:text-gray-200 hover:text-medical-blue-500 dark:hover:text-medical-blue-400 focus:outline-none"
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="pt-2 pb-4 space-y-1 px-6">
              {menuItems.map((item, index) => (
                <motion.a 
                  key={index}
                  href={item === 'Home' ? '/' : `#${item.toLowerCase().replace(' ', '-')}`}
                  className="block py-3 px-4 font-medium hover:bg-medical-blue-50 dark:hover:bg-gray-800 hover:text-medical-blue-500 dark:hover:text-medical-blue-400 transition-colors rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
