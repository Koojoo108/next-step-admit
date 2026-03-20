import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
    invalid_type_error: "That's not a valid date!",
  }),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    required_error: 'Gender is required',
  }),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
});

export const guardianInfoSchema = z.object({
  name: z.string().min(1, "Guardian's name is required"),
  relationship: z.string().min(1, 'Relationship to applicant is required'),
  contact: z.string().min(10, 'Invalid contact number'),
  emergencyAlternate: z
    .object({
      name: z.string().min(1, 'Alternate contact name is required'),
      contact: z.string().min(10, 'Invalid alternate contact number'),
    })
    .optional(),
});

export const academicInfoSchema = z.object({
  previousInstitutions: z
    .array(
      z.object({
        name: z.string().min(1, 'Institution name is required'),
        graduationDate: z.number().int().min(1950).max(new Date().getFullYear() + 10),
      })
    )
    .min(1, 'At least one institution is required'),
});

export const programInfoSchema = z.object({
  major: z.string().min(1, 'Programme is required'),
  department: z.string().min(1, 'Subject combination is required'),
  enrollmentTerm: z.string().min(1, 'Enrollment term is required'),
  housingPreference: z.enum(['on-campus', 'off-campus', 'undecided'], {
    required_error: 'Housing preference is required',
  }),
});

const passportSchema = z.object({
  passportPhotoUrl: z.string().min(1, 'Passport photo upload is required'),
});

const healthSchema = z.object({
  bloodType: z.string().min(1, 'Blood type is required'),
  medicalConditions: z.string().min(1, 'Medical conditions information is required'),
  allergies: z.string().min(1, 'Allergies information is required'),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    phone: z.string().min(10, 'Emergency contact phone is required'),
    relationship: z.string().min(1, 'Relationship is required'),
  }),
});

const documentsSchema = z.object({
  birthCertificateUrl: z.string().min(1, 'Birth certificate upload is required'),
  beceResultsUrl: z.string().min(1, 'BECE results upload is required'),
  transcriptUrl: z.string().min(1, 'Academic transcript upload is required'),
  otherDocumentsUrl: z.string().optional(),
});

const jhsSchema = z.object({
  jhsName: z.string().min(1, 'JHS name is required'),
  beceIndexNumber: z.string().min(1, 'BECE index number is required'),
  graduationYear: z.number().min(2010).max(new Date().getFullYear()),
  aggregateScore: z.string().optional(),
});

const declarationSchema = z.object({
  declaration: z.boolean().refine(val => val === true, {
    message: 'You must accept the declaration to proceed',
  }),
  declarationDate: z.date(),
  applicantSignature: z.string().min(1, 'Applicant signature is required'),
});

export const applicationStepsSchema = [
  personalInfoSchema,
  guardianInfoSchema,
  academicInfoSchema,
  programInfoSchema,
  passportSchema,
  healthSchema,
  documentsSchema,
  jhsSchema,
  declarationSchema,
];
