import React, { useImperativeHandle, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { programInfoSchema } from '@/schemas/validation';
import { useApplicationState } from '@/hooks/useApplicationState';
import { PROGRAMME_COMBINATIONS, getCombinationsForProgramme, ProgrammeName } from '@/data/programmeCombinations';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ProgramInfoForm = z.infer<typeof programInfoSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

const ProgramStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps, updateProgram } = useApplicationState();
  const [selectedProgramme, setSelectedProgramme] = useState<ProgrammeName | null>(null);
  const [availableCombinations, setAvailableCombinations] = useState<string[]>([]);
  
  const form = useForm<ProgramInfoForm>({
    resolver: zodResolver(programInfoSchema),
    defaultValues: steps.program || {},
    mode: 'onChange',
  });

  const handleProgrammeChange = (programme: ProgrammeName) => {
    setSelectedProgramme(programme);
    setAvailableCombinations(getCombinationsForProgramme(programme));
    form.setValue('major', programme);
    form.setValue('department', '');
  };

  const handleCombinationChange = (combination: string) => {
    form.setValue('department', combination);
  };

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      const isValid = await form.trigger();
      if (isValid) {
        updateProgram(form.getValues());
      }
      return isValid;
    },
  }));

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h2 className="text-2xl font-semibold">Program Selection</h2>
        
        {/* Programme Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="major"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Programme</FormLabel>
                <Select
                  onValueChange={(value) => handleProgrammeChange(value as ProgrammeName)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your programme" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(PROGRAMME_COMBINATIONS).map((programme) => (
                      <SelectItem key={programme} value={programme}>
                        {programme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subject Combination */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject Combination</FormLabel>
                <Select
                  onValueChange={handleCombinationChange}
                  defaultValue={field.value}
                  disabled={!selectedProgramme}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select programme first" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCombinations.map((combination) => (
                      <SelectItem key={combination} value={combination}>
                        {combination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Enrollment Term */}
        <FormField
            control={form.control}
            name="enrollmentTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enrollment Term</FormLabel>
                <FormControl>
                  <Input placeholder="Fall 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        {/* Housing Preference */}
        <FormField
            control={form.control}
            name="housingPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Housing Preference</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a preference" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="on-campus">Day Student</SelectItem>
                    <SelectItem value="off-campus">Boarder</SelectItem>
                    <SelectItem value="undecided">Undecided</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
      </form>
    </Form>
  );
});

export default ProgramStep;
