
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, BookOpen, BarChart, Bell, Menu, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navbar */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container px-4 py-3 mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-lms-indigo text-white rounded-lg p-1.5">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">ScholarSync</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-lms-indigo">Home</Link>
              <Link to="/courses" className="text-gray-600 hover:text-lms-indigo">Courses</Link>
              {user && user.role === 'instructor' && (
                <Link to="/instructor-dashboard" className="text-gray-600 hover:text-lms-indigo">Instructor Dashboard</Link>
              )}
              {user && (
                <Link to="/dashboard" className="text-gray-600 hover:text-lms-indigo">Dashboard</Link>
              )}
              <Link to="/about" className="text-gray-600 hover:text-lms-indigo">About</Link>
            </nav>
          )}

          {/* User Menu or Login/Register */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full" size="icon">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {!isMobile && (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button size="sm" variant="default">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            )}
            
            {/* Mobile menu trigger */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobile && showMobileMenu && (
          <div className="md:hidden bg-white border-t">
            <div className="container px-4 py-3 mx-auto flex flex-col space-y-3">
              <Link to="/" className="text-gray-600 py-2 border-b" onClick={() => setShowMobileMenu(false)}>Home</Link>
              <Link to="/courses" className="text-gray-600 py-2 border-b" onClick={() => setShowMobileMenu(false)}>Courses</Link>
              {user && user.role === 'instructor' && (
                <Link to="/instructor-dashboard" className="text-gray-600 py-2 border-b" onClick={() => setShowMobileMenu(false)}>Instructor Dashboard</Link>
              )}
              {user && (
                <Link to="/dashboard" className="text-gray-600 py-2 border-b" onClick={() => setShowMobileMenu(false)}>Dashboard</Link>
              )}
              <Link to="/about" className="text-gray-600 py-2 border-b" onClick={() => setShowMobileMenu(false)}>About</Link>
              {!user && (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" onClick={() => setShowMobileMenu(false)}>
                    <Button className="w-full" variant="outline">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setShowMobileMenu(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">ScholarSync</h3>
              <p className="text-gray-600 text-sm">
                A modern learning management system designed to empower educators 
                and students with powerful tools for online education.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-600 hover:text-lms-indigo">Home</Link></li>
                <li><Link to="/courses" className="text-gray-600 hover:text-lms-indigo">Courses</Link></li>
                <li><Link to="/about" className="text-gray-600 hover:text-lms-indigo">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-600 hover:text-lms-indigo">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <address className="text-gray-600 text-sm not-italic">
                <p>Email: support@scholarsync.com</p>
                <p>Phone: (123) 456-7890</p>
              </address>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} ScholarSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
