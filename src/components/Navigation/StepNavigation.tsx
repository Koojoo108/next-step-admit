import { useApplicationState } from '@/hooks/useApplicationState';
import { Button } from '@/components/ui/button';

type StepNavigationProps = {
  onNext: () => Promise<void>;
  onBack: () => void;
  onSaveExit: () => void;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  isLastStep: boolean;
};

export function StepNavigation({
  onNext,
  onBack,
  onSaveExit,
  onSubmit,
  isSubmitting,
  isLastStep,
}: StepNavigationProps) {
  const { currentStep } = useApplicationState();

  return (
    <div className="flex justify-between mt-8">
      <div>
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={onBack}>
            Previous Step
          </Button>
        )}
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="secondary" onClick={onSaveExit}>
          Save & Exit
        </Button>

        {!isLastStep ? (
          <Button type="button" onClick={onNext} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Next Step'}
          </Button>
        ) : (
          <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        )}
      </div>
    </div>
  );
}
