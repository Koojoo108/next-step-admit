import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import schoolCrest from '@/assets/school-crest.png';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programmes', label: 'Programmes' },
  { to: '/admissions', label: 'Admissions' },
];

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-primary/20">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={schoolCrest} alt="School Crest" className="h-10 w-10" />
          <span className="font-display text-lg font-bold text-accent">Prestige SHS</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? 'text-accent'
                  : 'text-primary-foreground/80 hover:text-accent'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2 ml-4">
            <Link to="/login">
              <Button variant="hero-outline" size="sm">Student Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="hero" size="sm">Apply Now</Button>
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-accent" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-primary border-t border-primary/20 px-4 pb-4">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-primary-foreground/80 hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 mt-3">
            <Link to="/login" onClick={() => setOpen(false)}>
              <Button variant="hero-outline" size="sm" className="w-full">Student Login</Button>
            </Link>
            <Link to="/register" onClick={() => setOpen(false)}>
              <Button variant="hero" size="sm" className="w-full">Apply Now</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
