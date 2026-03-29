import { describe, it, expect, beforeEach } from 'vitest';
import { useApplicationState } from '../hooks/useApplicationState';

describe('useApplicationState', () => {
  beforeEach(() => {
    useApplicationState.getState().reset();
  });

  it('should initialize with step 1', () => {
    const state = useApplicationState.getState();
    expect(state.currentStep).toBe(1);
  });

  it('should update current step', () => {
    useApplicationState.getState().setCurrentStep(2);
    const state = useApplicationState.getState();
    expect(state.currentStep).toBe(2);
  });

  it('should update personal info', () => {
    const personalInfo = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      dateOfBirth: new Date('2000-01-01'),
      gender: 'male' as const,
      address: '123 Main St',
    };
    useApplicationState.getState().updatePersonal(personalInfo);
    const state = useApplicationState.getState();
    expect(state.steps.personal).toEqual(personalInfo);
  });

  it('should reset state', () => {
    useApplicationState.getState().setCurrentStep(3);
    useApplicationState.getState().reset();
    const state = useApplicationState.getState();
    expect(state.currentStep).toBe(1);
    expect(state.steps.personal).toBeNull();
  });
});
