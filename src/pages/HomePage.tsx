import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Users, ClipboardCheck, ArrowRight, Megaphone, Shield } from 'lucide-react';
import heroImage from '@/assets/hero-school.jpg';

const programmes = [
  { name: 'General Science', icon: '🔬', desc: 'Physics, Chemistry, Biology, Elective Maths' },
  { name: 'General Arts', icon: '📚', desc: 'Literature, Government, History, Economics' },
  { name: 'Business', icon: '💼', desc: 'Accounting, Business Management, Economics' },
  { name: 'Home Economics', icon: '🏠', desc: 'Food & Nutrition, Textiles, Management in Living' },
  { name: 'Visual Arts', icon: '🎨', desc: 'Graphic Design, Sculpture, Ceramics, Painting' },
  { name: 'Agricultural Science', icon: '🌱', desc: 'Crop Science, Animal Husbandry, General Agriculture' },
];

const steps = [
  { icon: ClipboardCheck, title: 'Create Account', desc: 'Register with your email and personal details' },
  { icon: BookOpen, title: 'Fill Application', desc: 'Complete the multi-step application form' },
  { icon: Users, title: 'Upload Documents', desc: 'Submit required documents and photographs' },
  { icon: GraduationCap, title: 'Get Admitted', desc: 'Receive your admission decision and letter' },
];

const announcements = [
  { title: '2026/2027 Admissions Now Open', date: 'March 1, 2026', desc: 'Applications for the upcoming academic year are now being accepted.' },
  { title: 'BECE Results Submission Deadline', date: 'April 15, 2026', desc: 'All applicants must submit BECE results by the deadline.' },
  { title: 'Campus Tour Dates Announced', date: 'March 20, 2026', desc: 'Visit our campus and explore our facilities.' },
];

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Duapa Academy Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-80" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-block px-3 py-1.5 rounded-full border border-accent/30 text-accent text-xs md:text-sm font-medium mb-4 md:mb-6">
              🎓 2026/2027 Admissions Open
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-6xl font-bold text-white leading-tight mb-4 md:mb-6">
              Your Future Starts at{' '}
              <span className="text-accent">Duapa Academy</span>
            </h1>
            <p className="text-white/80 text-base md:text-lg lg:text-xl mb-6 md:mb-8 leading-relaxed font-body">
              Join one of Ghana's premier academies. Excellence in academics, character, and leadership development.
            </p>
            <div className="flex flex-col sm:flex-wrap sm:flex-row gap-3 md:gap-4">
              <Link to="/register" className="block">
                <Button variant="hero" size="lg" className="text-base w-full sm:w-auto">
                  Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/about" className="block">
                <Button variant="hero-outline" size="lg" className="text-base w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Process Steps */}
      <section className="py-12 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How to Apply
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              Follow these simple steps to complete your admission application.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:bg-secondary/40 transition-colors">
                  <step.icon className="h-5 w-5 md:h-7 md:w-7 text-secondary" />
                </div>
                <div className="absolute top-6 md:top-8 left-[60%] right-0 h-px bg-border hidden md:block last:hidden" />
                <h3 className="font-display font-semibold text-foreground mb-2 text-sm md:text-base">{step.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                <span className="inline-block mt-2 text-xs font-bold text-secondary">Step {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programmes Overview */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Programmes
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              Six academic programmes designed to prepare you for university and beyond.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {programmes.map((prog) => (
              <div key={prog.name} className="bg-card rounded-lg p-4 md:p-6 shadow-card hover:shadow-elevated transition-shadow border border-border">
                <div className="text-2xl md:text-3xl mb-3">{prog.icon}</div>
                <h3 className="font-display font-semibold text-foreground mb-2 text-sm md:text-base">{prog.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{prog.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 md:mt-10">
            <Link to="/programmes">
              <Button variant="outline" className="w-full sm:w-auto">View All Programmes <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="py-12 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-6 md:mb-10">
            <Megaphone className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Announcements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {announcements.map((ann, i) => (
              <div key={i} className="bg-background rounded-lg p-4 md:p-6 border border-border">
                <span className="text-xs text-secondary font-medium">{ann.date}</span>
                <h3 className="font-display font-semibold text-foreground mt-2 mb-2 text-sm md:text-base">{ann.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{ann.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-6 md:mb-8 text-sm md:text-base">
            Start your application today or contact us for more information about admissions.
          </p>
          <div className="flex flex-col sm:flex-wrap sm:flex-row justify-center gap-3 md:gap-4">
            <Link to="/register" className="block">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">Start Application</Button>
            </Link>
            <a href="mailto:admissions@duapa.edu.gh" className="block">
              <Button variant="hero-outline" size="lg" className="w-full sm:w-auto">Contact Us</Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
