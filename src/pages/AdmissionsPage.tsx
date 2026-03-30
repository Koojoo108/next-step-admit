import { FileText, Calendar, CheckCircle, Upload, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const requirements = [
  'Completed Junior High School (JHS)',
  'BECE aggregate of 30 or better',
  'Minimum grade of C6 in English and Mathematics',
  'Good moral character reference',
  'Completed application form with all required documents',
];

const documents = [
  'Passport-size photograph (recent)',
  'BECE result slip / provisional results',
  'Birth certificate or baptismal certificate',
  'School placement form (if available)',
];

const deadlines = [
  { event: 'Applications Open', date: 'March 1, 2026' },
  { event: 'Early Admission Deadline', date: 'April 30, 2026' },
  { event: 'Regular Deadline', date: 'June 15, 2026' },
  { event: 'Late Applications Close', date: 'July 31, 2026' },
  { event: 'Admission Letters Released', date: 'August 15, 2026' },
];

const AdmissionsPage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Admission Information</h1>
          <p className="text-white/80 max-w-xl text-lg">
            Everything you need to know about applying to Duapa Academy.
          </p>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle className="h-6 w-6 text-secondary" />
            <h2 className="font-display text-3xl font-bold text-foreground">Admission Requirements</h2>
          </div>
          <div className="bg-background rounded-lg p-8 border border-border">
            <ul className="space-y-3">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Application Steps */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground mb-10 text-center">Application Steps</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              { step: 1, title: 'Create Your Account', desc: 'Register with a valid email address and set your password.' },
              { step: 2, title: 'Fill Personal Information', desc: 'Enter your personal and guardian details.' },
              { step: 3, title: 'Enter Educational Background', desc: 'Provide your JHS details and BECE results.' },
              { step: 4, title: 'Select Your Programmes', desc: 'Choose up to three programme preferences.' },
              { step: 5, title: 'Upload Documents', desc: 'Upload your photograph, BECE results, and birth certificate.' },
              { step: 6, title: 'Review & Submit', desc: 'Review your application and submit for processing.' },
            ].map(s => (
              <div key={s.step} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-secondary-foreground font-bold text-sm">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deadlines */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="h-6 w-6 text-secondary" />
            <h2 className="font-display text-3xl font-bold text-foreground">Important Deadlines</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full bg-background rounded-lg border border-border overflow-hidden">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-6 py-3 font-semibold text-foreground text-sm">Event</th>
                  <th className="text-left px-6 py-3 font-semibold text-foreground text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {deadlines.map((d, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-6 py-3 text-muted-foreground">{d.event}</td>
                    <td className="px-6 py-3 text-secondary font-medium">{d.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Upload className="h-6 w-6 text-secondary" />
            <h2 className="font-display text-3xl font-bold text-foreground">Required Documents</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {documents.map((doc, i) => (
              <div key={i} className="bg-card rounded-lg p-5 border border-border flex items-center gap-3">
                <FileText className="h-5 w-5 text-secondary shrink-0" />
                <span className="text-muted-foreground">{doc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 gradient-hero text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Start Your Application</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">Don't miss the deadline. Apply today for the 2026/2027 academic year.</p>
          <Link to="/register">
            <Button variant="hero" size="lg">Apply Now <ArrowRight className="ml-2 h-5 w-5" /></Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AdmissionsPage;
