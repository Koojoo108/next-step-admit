export interface PassportInfo {
  passportPhotoUrl: string;
}

export interface HealthInfo {
  bloodType: string;
  medicalConditions: string;
  allergies: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface JhsInfo {
  jhsName: string;
  beceIndexNumber: string;
  graduationYear: number;
  aggregateScore?: string;
}

export interface DocumentsInfo {
  birthCertificateUrl: string;
  beceResultsUrl: string;
  transcriptUrl: string;
  otherDocumentsUrl: string;
}

export interface DeclarationInfo {
  declaration: boolean;
  declarationDate: Date;
  applicantSignature: string;
}

export interface PersonalInfo {
  fullName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  email: string;
  phone: string;
  address: string;
}

export interface GuardianInfo {
  name: string;
  relationship: string;
  contact: string;
  emergencyAlternate?: {
    name: string;
    contact: string;
  };
}

export interface AcademicInfo {
  previousInstitutions: {
    name: string;
    graduationDate: number;
  }[];
}

export interface ProgramInfo {
  major: string;
  department: string;
  enrollmentTerm: string;
  housingPreference: 'on-campus' | 'off-campus' | 'undecided';
}

export interface ApplicationState {
  applicationId: string;
  currentStep: number;
  steps: {
    personal: PersonalInfo | null;
    guardian: GuardianInfo | null;
    academic: AcademicInfo | null;
    program: ProgramInfo | null;
    passport: PassportInfo | null;
    health: HealthInfo | null;
    jhsInfo: JhsInfo | null;
    documents: DocumentsInfo | null;
    declaration: DeclarationInfo | null;
  };
  metadata: {
    lastSaved: Date | null;
    isComplete: boolean;
  };
}
