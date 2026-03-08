import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const programmes = [
  'General Science', 'General Arts', 'Business',
  'Home Economics', 'Visual Arts', 'Agricultural Science',
];

const grades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const initialForm = {
  // Step 1 - Personal
  full_name: '', date_of_birth: '', gender: '', nationality: '', address: '',
  guardian_name: '', guardian_phone: '',
  // Step 2 - Education
  jhs_name: '', jhs_location: '', bece_index: '', bece_year: '',
  english_grade: '', math_grade: '', science_grade: '', social_grade: '',
  // Step 3 - Programme
  first_choice: '', second_choice: '', third_choice: '',
};

const ApplicationForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setApplicationId(data.id);
        setExistingStatus(data.status);
        setForm({
          full_name: data.full_name || '',
          date_of_birth: data.date_of_birth || '',
          gender: data.gender || '',
          nationality: data.nationality || '',
          address: data.address || '',
          guardian_name: data.guardian_name || '',
          guardian_phone: data.guardian_phone || '',
          jhs_name: data.jhs_name || '',
          jhs_location: data.jhs_location || '',
          bece_index: data.bece_index || '',
          bece_year: data.bece_year || '',
          english_grade: data.english_grade || '',
          math_grade: data.math_grade || '',
          science_grade: data.science_grade || '',
          social_grade: data.social_grade || '',
          first_choice: data.first_choice || '',
          second_choice: data.second_choice || '',
          third_choice: data.third_choice || '',
        });
      }
    };
    load();
  }, [user]);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const saveProgress = async () => {
    if (!user) return;
    setLoading(true);
    const payload = { ...form, user_id: user.id, status: 'draft' };
    if (applicationId) {
      await supabase.from('applications').update(payload).eq('id', applicationId);
    } else {
      const { data } = await supabase.from('applications').insert(payload).select().single();
      if (data) setApplicationId(data.id);
    }
    setLoading(false);
    toast({ title: 'Progress saved!' });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const payload = { ...form, user_id: user.id, status: 'pending' };
    if (applicationId) {
      await supabase.from('applications').update(payload).eq('id', applicationId);
    } else {
      await supabase.from('applications').insert(payload);
    }
    setSubmitting(false);
    setExistingStatus('pending');
    toast({ title: 'Application Submitted!', description: 'Your application is now under review.' });
  };

  const isSubmitted = existingStatus === 'pending' || existingStatus === 'approved' || existingStatus === 'rejected';

  const stepTitles = ['Personal Information', 'Educational Background', 'Programme Selection', 'Review & Submit'];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl font-bold text-foreground mb-2">Application Form</h1>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {stepTitles.map((title, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step > i + 1 ? 'bg-success text-success-foreground' :
              step === i + 1 ? 'bg-secondary text-secondary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {step > i + 1 ? <Check size={16} /> : i + 1}
            </div>
            <span className="hidden md:inline text-sm text-muted-foreground">{title}</span>
            {i < 3 && <div className="w-4 md:w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg p-6 md:p-8 border border-border shadow-card">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={e => updateField('full_name', e.target.value)} disabled={isSubmitted} />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input type="date" value={form.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} disabled={isSubmitted} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => updateField('gender', v)} disabled={isSubmitted}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nationality</Label>
                <Input value={form.nationality} onChange={e => updateField('nationality', e.target.value)} disabled={isSubmitted} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={form.address} onChange={e => updateField('address', e.target.value)} disabled={isSubmitted} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Parent/Guardian Name</Label>
                <Input value={form.guardian_name} onChange={e => updateField('guardian_name', e.target.value)} disabled={isSubmitted} />
              </div>
              <div>
                <Label>Parent/Guardian Phone</Label>
                <Input value={form.guardian_phone} onChange={e => updateField('guardian_phone', e.target.value)} disabled={isSubmitted} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Educational Background</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>JHS Name</Label>
                <Input value={form.jhs_name} onChange={e => updateField('jhs_name', e.target.value)} disabled={isSubmitted} />
              </div>
              <div>
                <Label>JHS Location</Label>
                <Input value={form.jhs_location} onChange={e => updateField('jhs_location', e.target.value)} disabled={isSubmitted} />
              </div>
              <div>
                <Label>BECE Index Number</Label>
                <Input value={form.bece_index} onChange={e => updateField('bece_index', e.target.value)} disabled={isSubmitted} />
              </div>
              <div>
                <Label>BECE Year</Label>
                <Input value={form.bece_year} onChange={e => updateField('bece_year', e.target.value)} disabled={isSubmitted} />
              </div>
            </div>
            <h3 className="font-semibold text-foreground mt-4">BECE Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'English', field: 'english_grade' },
                { label: 'Mathematics', field: 'math_grade' },
                { label: 'Science', field: 'science_grade' },
                { label: 'Social Studies', field: 'social_grade' },
              ].map(subj => (
                <div key={subj.field}>
                  <Label>{subj.label}</Label>
                  <Select value={(form as any)[subj.field]} onValueChange={v => updateField(subj.field, v)} disabled={isSubmitted}>
                    <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
                    <SelectContent>
                      {grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Programme Selection</h2>
            {['first_choice', 'second_choice', 'third_choice'].map((field, i) => (
              <div key={field}>
                <Label>{['First', 'Second', 'Third'][i]} Choice</Label>
                <Select value={(form as any)[field]} onValueChange={v => updateField(field, v)} disabled={isSubmitted}>
                  <SelectTrigger><SelectValue placeholder="Select programme" /></SelectTrigger>
                  <SelectContent>
                    {programmes.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        {/* Step 4 - Review */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Review Your Application</h2>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
              <div className="bg-muted rounded-md p-4 text-sm space-y-1">
                <p><span className="text-muted-foreground">Name:</span> {form.full_name}</p>
                <p><span className="text-muted-foreground">DOB:</span> {form.date_of_birth}</p>
                <p><span className="text-muted-foreground">Gender:</span> {form.gender}</p>
                <p><span className="text-muted-foreground">Nationality:</span> {form.nationality}</p>
                <p><span className="text-muted-foreground">Address:</span> {form.address}</p>
                <p><span className="text-muted-foreground">Guardian:</span> {form.guardian_name} ({form.guardian_phone})</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Educational Background</h3>
              <div className="bg-muted rounded-md p-4 text-sm space-y-1">
                <p><span className="text-muted-foreground">JHS:</span> {form.jhs_name}, {form.jhs_location}</p>
                <p><span className="text-muted-foreground">BECE Index:</span> {form.bece_index} ({form.bece_year})</p>
                <p><span className="text-muted-foreground">Grades:</span> Eng: {form.english_grade}, Math: {form.math_grade}, Sci: {form.science_grade}, Soc: {form.social_grade}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Programme Choices</h3>
              <div className="bg-muted rounded-md p-4 text-sm space-y-1">
                <p><span className="text-muted-foreground">1st:</span> {form.first_choice}</p>
                <p><span className="text-muted-foreground">2nd:</span> {form.second_choice}</p>
                <p><span className="text-muted-foreground">3rd:</span> {form.third_choice}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {!isSubmitted && (
              <Button variant="ghost" onClick={saveProgress} disabled={loading}>
                {loading ? 'Saving...' : 'Save Progress'}
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : !isSubmitted ? (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            ) : (
              <div className="px-4 py-2 bg-success/10 text-success rounded-md text-sm font-medium">
                Application Submitted ✓
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
