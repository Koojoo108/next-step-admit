import { useApplicationState } from '@/hooks/useApplicationState';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Personal' },
  { id: 2, title: 'Guardian' },
  { id: 3, title: 'Academics' },
  { id: 4, title: 'Program' },
  { id: 5, title: 'Passport' },
  { id: 6, title: 'Health' },
  { id: 7, title: 'Documents' },
  { id: 8, title: 'JHS Info' },
  { id: 9, title: 'Declaration' },
];

export function Stepper() {
  const { currentStep, setCurrentStep } = useApplicationState();

  const isStepCompleted = (stepId: number) => {
    // In this design, you can only go back to steps you have passed.
    // A more robust implementation might check if the step's data is valid in the store.
    return currentStep > stepId;
  }

  const handleStepClick = (stepId: number) => {
    // Allow navigation only to completed steps.
    if (isStepCompleted(stepId)) {
      setCurrentStep(stepId);
    }
  }

  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {STEPS.map((step) => (
          <li key={step.title} className="md:flex-1">
            {currentStep > step.id ? (
              <div
                className="group flex cursor-pointer flex-col border-l-4 border-primary py-2 pl-4 transition-colors hover:border-primary-dark md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                onClick={() => handleStepClick(step.id)}
              >
                <span className="text-sm font-medium text-primary transition-colors">
                  {`Step ${step.id}`}
                </span>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ) : currentStep === step.id ? (
              <div
                className="flex flex-col border-l-4 border-primary py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                aria-current="step"
              >
                <span className="text-sm font-medium text-primary">{`Step ${step.id}`}</span>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ) : (
              <div className="group flex flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                <span className="text-sm font-medium text-gray-500 transition-colors">
                  {`Step ${step.id}`}
                </span>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            )}
          </li >
        ))}
      </ol>
    </nav>
  );
}
