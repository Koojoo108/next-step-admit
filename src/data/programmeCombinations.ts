// Ghana SHS Programme Combinations for Admission System
// Updated to match official Ghana Education Service combinations

export const PROGRAMME_COMBINATIONS: Record<string, string[]> = {
  'General Arts': [
    'CRS + Government + Literature + French',
    'CRS + Government + History + Twi',
    'Economics + Geography + Elective Mathematics + ICT',
    'Economics + Geography + History + Government',
    'Literature + Government + Economics + French',
    'CRS + Economics + Government + Twi'
  ],
  'General Science': [
    'Physics + Chemistry + Biology + Elective Mathematics',
    'Physics + Chemistry + Biology + ICT',
    'Physics + Chemistry + Elective Mathematics + Geography'
  ],
  'Business': [
    'Financial Accounting + Business Management + Economics + Elective Mathematics',
    'Financial Accounting + Business Management + Economics + Cost Accounting',
    'Financial Accounting + Business Management + Economics + ICT'
  ],
  'Visual Arts': [
    'General Knowledge in Art + Graphic Design + Picture Making + Sculpture',
    'General Knowledge in Art + Textiles + Graphic Design + ICT',
    'General Knowledge in Art + Sculpture + Picture Making + Economics'
  ],
  'Home Economics': [
    'Management in Living + Food and Nutrition + Biology + General Knowledge in Art',
    'Management in Living + Food and Nutrition + Clothing and Textiles + General Knowledge in Art',
    'Management in Living + Food and Nutrition + Biology + Economics'
  ],
  'Agricultural Science': [
    'General Agriculture + Crop Husbandry + Chemistry + Physics',
    'Agriculture + Chemistry + Physics + Elective Mathematics'
  ],
  'Technical / Applied Technology': [
    'Technical Drawing + Woodwork + Building Construction + Elective Mathematics',
    'Auto Mechanics + Metalwork + Applied Electricity + Physics'
  ]
};

export type ProgrammeName = keyof typeof PROGRAMME_COMBINATIONS;
export type Combination = string;

export function getCombinationsForProgramme(programme: ProgrammeName): Combination[] {
  return PROGRAMME_COMBINATIONS[programme] || [];
}

export function getAllProgrammes(): ProgrammeName[] {
  return Object.keys(PROGRAMME_COMBINATIONS) as ProgrammeName[];
}

export function isValidCombination(programme: ProgrammeName, combination: string): boolean {
  const validCombinations = getCombinationsForProgramme(programme);
  return validCombinations.includes(combination);
}
