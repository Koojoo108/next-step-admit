import { useEffect, useRef } from 'react';
import { useApplicationState } from './useApplicationState';
import { toast } from 'sonner';

const DRAFT_PREFIX = 'admission-draft-';

// Utility function to clear all drafts
export function clearAllDrafts() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(DRAFT_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

// Utility function to clear a specific draft
export function clearDraft(applicationId: string) {
  const draftKey = `${DRAFT_PREFIX}${applicationId}`;
  localStorage.removeItem(draftKey);
}

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced;
}

export function useFormPersistence() {
  const { applicationId, steps, metadata, loadDraft, setLastSaved, setCurrentStep } = useApplicationState();
  const state = useApplicationState(); // Get the whole state for saving
  const hasLoadedDraft = useRef(false);

  // Effect for loading draft on initial mount
  useEffect(() => {
    if (hasLoadedDraft.current) return;
    hasLoadedDraft.current = true;

    const draftKey = `${DRAFT_PREFIX}${applicationId}`;
    const draftData = localStorage.getItem(draftKey);

    if (draftData) {
      try {
        const parsedDraft = JSON.parse(draftData);
        // Basic validation of the draft
        if (parsedDraft.applicationId && parsedDraft.steps) {
          // When loading, make sure date strings are converted back to Date objects
          if(parsedDraft.steps.personal?.dateOfBirth) {
              parsedDraft.steps.personal.dateOfBirth = new Date(parsedDraft.steps.personal.dateOfBirth);
          }
          if(parsedDraft.steps.declaration?.declarationDate) {
              parsedDraft.steps.declaration.declarationDate = new Date(parsedDraft.steps.declaration.declarationDate);
          }
          
          // Auto-restore the draft
          loadDraft(parsedDraft);
          
          // Restore the current step
          if(parsedDraft.currentStep) {
            setCurrentStep(parsedDraft.currentStep);
          }
          
          toast.success('Application draft has been automatically restored.');
        } else {
            throw new Error("Invalid draft format");
        }
      } catch (error) {
        console.error('Failed to parse or load draft:', error);
        localStorage.removeItem(draftKey);
        toast.error('Could not load corrupted draft. It has been removed.');
      }
    }
  }, [applicationId, loadDraft, setCurrentStep]);

  // Effect for auto-saving on state change
  useEffect(() => {
    const debouncedSave = debounce(() => {
      const draftKey = `${DRAFT_PREFIX}${applicationId}`;
      const stateToSave = { ...state };
      
      try {
        const jsonState = JSON.stringify(stateToSave);
        localStorage.setItem(draftKey, jsonState);
        setLastSaved(); // Update the lastSaved timestamp in the store
      } catch (error) {
        console.error('Failed to save draft:', error);
        toast.error('There was an issue saving your progress.');
      }
    }, 3000); // 3-second debounce

    debouncedSave();

    // Cleanup function for the debounce
    return () => {
        // This part is tricky with debounce. For simplicity, we let the last call go through.
        // A more robust implementation might cancel the pending timeout.
    };

  }, [steps, applicationId, state, setLastSaved]);
}
