import React, { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApplicationState } from '@/hooks/useApplicationState';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

const declarationSchema = z.object({
  declaration: z.boolean().refine(val => val === true, {
    message: 'You must accept the declaration to proceed',
  }),
  declarationDate: z.date(),
  applicantSignature: z.string().min(1, 'Applicant signature is required'),
});

type DeclarationForm = z.infer<typeof declarationSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

const DeclarationStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps, updateDeclaration } = useApplicationState();
  const form = useForm<DeclarationForm>({
    resolver: zodResolver(declarationSchema),
    defaultValues: steps.declaration || {
      declaration: false,
      declarationDate: new Date(),
      applicantSignature: '',
    },
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      const isValid = await form.trigger();
      if (isValid) {
        updateDeclaration(form.getValues());
      }
      return isValid;
    },
  }));

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h2 className="text-2xl font-semibold">Professional Declaration</h2>
        <div className="text-sm text-muted-foreground mb-4">
          Please read and accept the following declaration to complete your application.
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <div className="space-y-4 text-sm">
            <p className="font-medium mb-2">Declaration:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>I certify that all information provided in this application is true and correct to the best of my knowledge.</li>
              <li>I understand that any false or misleading information may result in the rejection of this application or dismissal if already admitted.</li>
              <li>I agree to abide by all rules and regulations of the institution if admitted.</li>
              <li>I authorize the institution to verify the authenticity of all documents submitted.</li>
              <li>I understand that admission is subject to meeting all requirements and availability of space.</li>
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="declaration"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  I have read and agree to the above declaration
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicantSignature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Applicant's Full Name (Signature)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Type your full name as digital signature" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="declarationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Declaration</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    value={field.value ? field.value.toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
});

export default DeclarationStep;
