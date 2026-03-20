import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useApplicationState } from '@/hooks/useApplicationState';
import { useFormPersistence, clearDraft } from '@/hooks/useFormPersistence';
import { supabase } from '@/integrations/supabase/client';

// Import new components
import { Stepper } from '@/components/Stepper';
import { StepNavigation } from '@/components/Navigation/StepNavigation';
import PersonalStep, { StepHandle as PersonalStepHandle } from '@/components/FormSteps/PersonalStep';
import GuardianStep, { StepHandle as GuardianStepHandle } from '@/components/FormSteps/GuardianStep';
import AcademicStep, { StepHandle as AcademicStepHandle } from '@/components/FormSteps/AcademicStep';
import ProgramStep, { StepHandle as ProgramStepHandle } from '@/components/FormSteps/ProgramStep';
import PassportStep, { StepHandle as PassportStepHandle } from '@/components/FormSteps/PassportStep';
import HealthStep, { StepHandle as HealthStepHandle } from '@/components/FormSteps/HealthStep';
import DocumentsStep, { StepHandle as DocumentsStepHandle } from '@/components/FormSteps/DocumentsStep';
import JhsStep, { StepHandle as JhsStepHandle } from '@/components/FormSteps/JhsStep';
import DeclarationStep, { StepHandle as DeclarationStepHandle } from '@/components/FormSteps/DeclarationStep';
import ReviewStep, { StepHandle as ReviewStepHandle } from '@/components/FormSteps/ReviewStep';

import { Toaster, toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ApplicationForm() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    currentStep,
    setCurrentStep,
    applicationId,
    reset,
  } = useApplicationState();

  // Load draft from localStorage if available
  useFormPersistence();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Refs for each step to trigger validation
  const personalStepRef = useRef<PersonalStepHandle>(null);
  const guardianStepRef = useRef<GuardianStepHandle>(null);
  const academicStepRef = useRef<AcademicStepHandle>(null);
  const programStepRef = useRef<ProgramStepHandle>(null);
  const passportStepRef = useRef<PassportStepHandle>(null);
  const healthStepRef = useRef<HealthStepHandle>(null);
  const documentsStepRef = useRef<DocumentsStepHandle>(null);
  const jhsStepRef = useRef<JhsStepHandle>(null);
  const declarationStepRef = useRef<DeclarationStepHandle>(null);
  const reviewStepRef = useRef<ReviewStepHandle>(null);

  const stepRefs = [
    personalStepRef,
    guardianStepRef,
    academicStepRef,
    programStepRef,
    passportStepRef,
    healthStepRef,
    documentsStepRef,
    jhsStepRef,
    declarationStepRef,
  ];

  const handleNext = async () => {
    setIsSubmitting(true);
    const currentStepRef = stepRefs[currentStep - 1];
    if (currentStepRef?.current) {
      const isValid = await currentStepRef.current.trigger();
      if (isValid) {
        setCurrentStep(currentStep + 1);
      } else {
        toast.error('Please fill out all required fields before continuing.');
      }
    }
    setIsSubmitting(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveExit = () => {
    // The useFormPersistence hook handles saving automatically.
    // We just need to show a toast and redirect.
    toast.success('Application saved successfully!');
    navigate('/dashboard');
    console.log('Application saved. Redirecting...');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    console.log('[ApplicationForm] Starting submission validation...');
    console.log('[ApplicationForm] Current step:', currentStep);
    
    try {
      // CRITICAL: First, trigger validation for the current step (which should be the last step)
      // to ensure its data is saved to the Zustand store before we check the store.
      const currentStepRef = stepRefs[currentStep - 1];
      if (currentStepRef?.current) {
        console.log('[ApplicationForm] Triggering validation for step:', currentStep);
        const isValid = await currentStepRef.current.trigger();
        if (!isValid) {
          console.log('[ApplicationForm] Current step validation failed');
          toast.error('Please complete the current step correctly.');
          setIsSubmitting(false);
          return;
        }
      }

      // Validate all steps using stored data instead of component refs
      const { steps } = useApplicationState.getState();
      console.log('[ApplicationForm] Stored steps data:', steps);
      
      // Validate Personal Info
      if (!steps.personal?.fullName || !steps.personal?.email || !steps.personal?.phone) {
        console.log('[ApplicationForm] Personal info validation failed');
        toast.error('Please review Personal Information step. Some fields are incomplete.');
        setCurrentStep(1);
        setIsSubmitting(false);
        return;
      }
      
      // Validate Guardian Info
      if (!steps.guardian?.name || !steps.guardian?.contact) {
        console.log('[ApplicationForm] Guardian info validation failed');
        toast.error('Please review Guardian Information step. Some fields are incomplete.');
        setCurrentStep(2);
        setIsSubmitting(false);
        return;
      }
      
      // Validate Academic Info
      if (!steps.academic?.previousInstitutions || steps.academic.previousInstitutions.length === 0) {
        console.log('[ApplicationForm] Academic info validation failed');
        toast.error('Please review Academic Information step. Previous institution is required.');
        setCurrentStep(3);
        setIsSubmitting(false);
        return;
      }
      
      // Validate Program Info
      if (!steps.program?.major || !steps.program?.department) {
        console.log('[ApplicationForm] Program info validation failed');
        toast.error('Please review Program Information step. Programme selection is required.');
        setCurrentStep(4);
        setIsSubmitting(false);
        return;
      }
      
      // Validate Passport
      if (!steps.passport?.passportPhotoUrl) {
        console.log('[ApplicationForm] Passport validation failed');
        toast.error('Please review Passport Photograph step. Photo upload is required.');
        setCurrentStep(5);
        setIsSubmitting(false);
        return;
      }
      
      // Validate Health Info
      if (!steps.health?.bloodType || !steps.health?.emergencyContact?.name) {
        console.log('[ApplicationForm] Health info validation failed');
        toast.error('Please review Health Information step. Medical information is required.');
        setCurrentStep(6);
        setIsSubmitting(false);
        return;
      }
      
      // Validate Documents
      if (!steps.documents?.birthCertificateUrl || !steps.documents?.beceResultsUrl || !steps.documents?.transcriptUrl) {
        console.log('[ApplicationForm] Documents validation failed');
        toast.error('Please review Documents step. All required documents must be uploaded.');
        setCurrentStep(7);
        setIsSubmitting(false);
        return;
      }
      
      // Validate JHS Info
      if (!steps.jhsInfo?.jhsName || !steps.jhsInfo?.beceIndexNumber) {
        console.log('[ApplicationForm] JHS info validation failed');
        toast.error('Please review JHS Information step. School name and BECE index are required.');
        setCurrentStep(8);
        setIsSubmitting(false);
        return;
      }
      
      // Validate Declaration
      if (!steps.declaration?.declaration || !steps.declaration?.applicantSignature) {
        console.log('[ApplicationForm] Declaration validation failed');
        toast.error('Please review Declaration step. You must accept the declaration and provide your signature.');
        setCurrentStep(9);
        setIsSubmitting(false);
        return;
      }
      
      console.log('[ApplicationForm] All steps validated successfully, saving application to database...');
      
      // Prepare application data for database
      const applicationData = {
        user_id: user?.id,
        full_name: steps.personal.fullName,
        email: steps.personal.email,
        phone: steps.personal.phone,
        date_of_birth: steps.personal.dateOfBirth?.toISOString(),
        gender: steps.personal.gender,
        address: steps.personal.address,
        guardian_name: steps.guardian.name,
        guardian_phone: steps.guardian.contact,
        parent_relationship: steps.guardian.relationship,
        programme: steps.program.major,
        programme_name: steps.program.department,
        enrollment_term: steps.program.enrollmentTerm,
        preferred_campus: steps.program.housingPreference === 'on-campus' ? 'Main Campus' : 'Off Campus',
        passport_photo_url: steps.passport.passportPhotoUrl,
        medical_conditions: steps.health.medicalConditions,
        jhs_name: steps.jhsInfo.jhsName,
        bece_index: steps.jhsInfo.beceIndexNumber,
        year_of_completion: steps.jhsInfo.graduationYear?.toString(),
        declaration_accepted: steps.declaration.declaration,
        digital_signature: steps.declaration.applicantSignature,
        status: 'Submitted',
        application_date: new Date().toISOString(),
        application_id_display: applicationId
      };
      
      console.log('[ApplicationForm] Saving application data:', applicationData);
      
      // Save application to database via API
      console.log('[ApplicationForm] Attempting to save to database via API...');
      
      const response = await fetch('http://localhost:3000/api/applications/submit-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      const result = await response.json();
      console.log('[ApplicationForm] Application saved successfully to database:', result);
      
      // Simulate API submission for user feedback
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      toast.success(`Application submitted successfully! Reference: ${applicationId}`);
      
      // Clear the localStorage draft using utility function
      clearDraft(applicationId);
      reset(); // Reset Zustand store
      
      // Also navigate to dashboard after a short delay if it's not the isSubmitted view
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('[ApplicationForm] Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during submission. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="text-center max-w-2xl mx-auto my-20">
        <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
        <p className="text-lg mb-8">
          Thank you for your application. Your reference number is{' '}
          <span className="font-mono bg-gray-100 p-1 rounded">{applicationId}</span>.
        </p>
        <Button onClick={() => setIsSubmitted(false)}>Start New Application</Button>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalStep ref={personalStepRef} />;
      case 2:
        return <GuardianStep ref={guardianStepRef} />;
      case 3:
        return <AcademicStep ref={academicStepRef} />;
      case 4:
        return <ProgramStep ref={programStepRef} />;
      case 5:
        return <PassportStep ref={passportStepRef} />;
      case 6:
        return <HealthStep ref={healthStepRef} />;
      case 7:
        return <DocumentsStep ref={documentsStepRef} />;
      case 8:
        return <JhsStep ref={jhsStepRef} />;
      case 9:
        return <DeclarationStep ref={declarationStepRef} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Toaster richColors />
      <header className="mb-12">
        <h1 className="text-4xl font-bold">School Admission Application</h1>
        <Stepper />
      </header>

      <main className="bg-white p-8 rounded-lg shadow-md">
        {renderStep()}
      </main>

      <footer className="mt-8">
        <StepNavigation
          onNext={handleNext}
          onBack={handleBack}
          onSaveExit={handleSaveExit}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isLastStep={currentStep === 9}
        />
      </footer>
    </div>
  );
}
