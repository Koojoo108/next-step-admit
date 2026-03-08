import { Link } from 'react-router-dom';
import schoolCrest from '@/assets/school-crest.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={schoolCrest} alt="School Crest" className="h-12 w-12" />
              <span className="font-display text-lg font-bold text-accent">Prestige SHS</span>
            </div>
            <p className="text-sm leading-relaxed">
              Nurturing excellence in education since 1965. Building tomorrow's leaders today.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-accent mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/programmes" className="hover:text-accent transition-colors">Programmes</Link></li>
              <li><Link to="/admissions" className="hover:text-accent transition-colors">Admissions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-accent mb-4">Admissions</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-accent transition-colors">Apply Now</Link></li>
              <li><Link to="/login" className="hover:text-accent transition-colors">Student Login</Link></li>
              <li><Link to="/admissions" className="hover:text-accent transition-colors">Requirements</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-accent mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>P.O. Box 1234, Accra, Ghana</li>
              <li>+233 30 123 4567</li>
              <li>admissions@prestigeshs.edu.gh</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Prestige Senior High School. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
