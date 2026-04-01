import { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';

const icons = ['🔬', '📚', '💼', '🏠', '🎨', '🌱', '🎓', '💡'];

const ProgrammesPage = () => {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('programmes').select('*').order('name');
      setProgrammes(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-8 w-8 text-accent" />
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Our Programmes</h1>
          </div>
          <p className="text-white/80 max-w-xl text-lg">Academic programmes tailored to prepare students for university and professional success.</p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 space-y-8">
          {loading ? (
            <div className="flex justify-center py-12"><RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : programmes.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No programmes available yet. Check back soon!</p>
          ) : programmes.map((prog, i) => (
            <div key={prog.id} className={`bg-card rounded-lg border border-border shadow-card overflow-hidden md:flex ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="md:w-1/3 gradient-hero flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">{icons[i % icons.length]}</div>
                  <h3 className="font-display text-2xl font-bold text-accent">{prog.name}</h3>
                </div>
              </div>
              <div className="md:w-2/3 p-8">
                <p className="text-muted-foreground mb-4">{prog.description || 'Explore this programme at Duapa Academy.'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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
