import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import {
  ApplicationState,
  PersonalInfo,
  GuardianInfo,
  AcademicInfo,
  ProgramInfo,
  PassportInfo,
  HealthInfo,
  JhsInfo,
  DocumentsInfo,
  DeclarationInfo,
} from '../types/application';

type State = ApplicationState;

type Actions = {
  setCurrentStep: (step: number) => void;
  updatePersonal: (data: PersonalInfo) => void;
  updateGuardian: (data: GuardianInfo) => void;
  updateAcademic: (data: AcademicInfo) => void;
  updateProgram: (data: ProgramInfo) => void;
  updatePassport: (data: PassportInfo) => void;
  updateHealth: (data: HealthInfo) => void;
  updateJhsInfo: (data: JhsInfo) => void;
  updateDocuments: (data: DocumentsInfo) => void;
  updateDeclaration: (data: DeclarationInfo) => void;
  setLastSaved: () => void;
  loadDraft: (draft: ApplicationState) => void;
  reset: () => void;
};

const initialState: State = {
  applicationId: uuidv4(),
  currentStep: 1,
  steps: {
    personal: null,
    guardian: null,
    academic: null,
    program: null,
    passport: null,
    health: null,
    jhsInfo: null,
    documents: null,
    declaration: null,
  },
  metadata: {
    lastSaved: null,
    isComplete: false,
  },
};

export const useApplicationState = create<State & Actions>()(
  immer((set) => ({
    ...initialState,
    setCurrentStep: (step) =>
      set((state) => {
        state.currentStep = step;
      }),
    updatePersonal: (data) =>
      set((state) => {
        state.steps.personal = data;
      }),
    updateGuardian: (data) =>
      set((state) => {
        state.steps.guardian = data;
      }),
    updateAcademic: (data) =>
      set((state) => {
        state.steps.academic = data;
      }),
    updateProgram: (data) =>
      set((state) => {
        state.steps.program = data;
      }),
    updatePassport: (data) =>
      set((state) => {
        state.steps.passport = data;
      }),
    updateHealth: (data) =>
      set((state) => {
        state.steps.health = data;
      }),
    updateJhsInfo: (data) =>
      set((state) => {
        state.steps.jhsInfo = data;
      }),
    updateDocuments: (data) =>
      set((state) => {
        state.steps.documents = data;
      }),
    updateDeclaration: (data) =>
      set((state) => {
        state.steps.declaration = data;
      }),
    setLastSaved: () =>
      set((state) => {
        state.metadata.lastSaved = new Date();
      }),
    loadDraft: (draft) => set(() => draft),
    reset: () => set(() => initialState),
  }))
);
