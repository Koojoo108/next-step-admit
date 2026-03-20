import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const programmes = [
  {
    name: 'General Science',
    icon: '🔬',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Elective Mathematics'],
    desc: 'Prepares students for careers in medicine, engineering, pharmacy, and the sciences.',
    careers: 'Medicine, Engineering, Pharmacy, Research',
  },
  {
    name: 'General Arts',
    icon: '📚',
    subjects: ['Literature in English', 'Government', 'History', 'Economics', 'French'],
    desc: 'Develops critical thinking and communication skills for the humanities.',
    careers: 'Law, Journalism, Diplomacy, Education',
  },
  {
    name: 'Business',
    icon: '💼',
    subjects: ['Financial Accounting', 'Business Management', 'Economics', 'Cost Accounting'],
    desc: 'Builds a strong foundation in business principles and financial literacy.',
    careers: 'Accounting, Banking, Entrepreneurship, Marketing',
  },
  {
    name: 'Home Economics',
    icon: '🏠',
    subjects: ['Food and Nutrition', 'Textiles', 'Management in Living', 'General Knowledge in Art'],
    desc: 'Focuses on practical life skills and the science of nutrition and textiles.',
    careers: 'Hospitality, Nutrition, Fashion, Food Science',
  },
  {
    name: 'Visual Arts',
    icon: '🎨',
    subjects: ['Graphic Design', 'Sculpture', 'Ceramics', 'Painting & Decorating', 'General Knowledge in Art'],
    desc: 'Nurtures creative talent and artistic expression in multiple media.',
    careers: 'Graphic Design, Architecture, Fine Arts, Animation',
  },
  {
    name: 'Agricultural Science',
    icon: '🌱',
    subjects: ['Crop Husbandry', 'Animal Husbandry', 'General Agriculture', 'Elective Mathematics'],
    desc: 'Equips students with modern agricultural knowledge and techniques.',
    careers: 'Agribusiness, Veterinary, Environmental Science, Farming',
  },
];

const ProgrammesPage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Our Programmes</h1>
          </div>
          <p className="text-white/80 max-w-xl text-lg">
            Six academic programmes tailored to prepare students for university and professional success.
          </p>
        </div>
      </section>

      {/* Programme Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 space-y-8">
          {programmes.map((prog, i) => (
            <div key={prog.name} className={`bg-card rounded-lg border border-border shadow-card overflow-hidden md:flex ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="md:w-1/3 gradient-hero flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">{prog.icon}</div>
                  <h3 className="font-display text-2xl font-bold text-accent">{prog.name}</h3>
                </div>
              </div>
              <div className="md:w-2/3 p-8">
                <p className="text-muted-foreground mb-4">{prog.desc}</p>
                <div className="mb-4">
                  <h4 className="font-semibold text-foreground mb-2">Core Subjects:</h4>
                  <div className="flex flex-wrap gap-2">
                    {prog.subjects.map(sub => (
                      <span key={sub} className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground">{sub}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Career Paths:</h4>
                  <p className="text-sm text-secondary">{prog.careers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to Choose Your Path?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Apply now and select up to three programme choices.</p>
          <Link to="/register">
            <Button variant="default" size="lg">Start Application</Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProgrammesPage;
