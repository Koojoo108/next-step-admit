import React, { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { guardianInfoSchema } from '@/schemas/validation';
import { useApplicationState } from '@/hooks/useApplicationState';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type GuardianInfoForm = z.infer<typeof guardianInfoSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

const GuardianStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps, updateGuardian } = useApplicationState();
  const form = useForm<GuardianInfoForm>({
    resolver: zodResolver(guardianInfoSchema),
    defaultValues: steps.guardian || {},
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      const isValid = await form.trigger();
      if (isValid) {
        updateGuardian(form.getValues());
      }
      return isValid;
    },
  }));

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h2 className="text-2xl font-semibold">Guardian Information</h2>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guardian's Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship to Applicant</FormLabel>
                <FormControl>
                  <Input placeholder="Parent" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guardian's Contact Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1 (555) 555-5556" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <h3 className="text-lg font-medium pt-4">Emergency Alternate (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
           <FormField
            control={form.control}
            name="emergencyAlternate.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sam Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="emergencyAlternate.contact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Contact Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 555-5557" {...field} />
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

export default GuardianStep;
