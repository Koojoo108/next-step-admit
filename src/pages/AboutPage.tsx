import aboutImage from '@/assets/about-school.jpg';
import schoolCrest from '@/assets/school-crest.png';
import { Target, Eye, BookOpen, Users, FlaskConical, Trophy } from 'lucide-react';

const facilities = [
  { icon: BookOpen, name: 'Library', desc: 'Stocked with over 20,000 volumes and digital resources' },
  { icon: FlaskConical, name: 'Science Labs', desc: 'State-of-the-art physics, chemistry, and biology laboratories' },
  { icon: Users, name: 'Boarding Facilities', desc: 'Comfortable dormitories with 24/7 supervision' },
  { icon: Trophy, name: 'Sports Complex', desc: 'Football pitch, basketball courts, athletics track' },
];

const AboutPage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <img src={aboutImage} alt="School campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-75" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">About Our School</h1>
          <p className="text-white/80 mt-4 max-w-xl text-lg">Over 60 years of academic excellence and character development.</p>
        </div>
      </section>

      {/* History */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Our History</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Duapa Academy has grown into one of Ghana's most respected educational institutions. We have produced leaders in every field — from science and medicine to law, business, and the arts.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our commitment to holistic education combines rigorous academics with character development, sporting excellence, and community service. Every student who walks through our gates becomes part of a proud legacy.
            </p>
          </div>
          <div className="flex justify-center">
            <img src={schoolCrest} alt="School Crest" className="h-64 w-64 drop-shadow-lg" />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-lg p-8 shadow-card border border-border">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To provide quality, accessible education that develops the whole person — intellectually, morally, and physically — preparing students for higher education and responsible citizenship.
            </p>
          </div>
          <div className="bg-card rounded-lg p-8 shadow-card border border-border">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
              <Eye className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To be the leading senior high school in Ghana, recognized for academic excellence, innovative teaching, and producing graduates who positively impact their communities and the nation.
            </p>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground mb-10 text-center">Our Facilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map(f => (
              <div key={f.name} className="bg-background rounded-lg p-6 border border-border text-center">
                <f.icon className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-2">{f.name}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
