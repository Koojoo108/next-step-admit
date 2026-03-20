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
import { Input } from '@/components/ui/input';

const jhsSchema = z.object({
  jhsName: z.string().min(1, 'JHS name is required'),
  beceIndexNumber: z.string().min(1, 'BECE index number is required'),
  graduationYear: z.number().min(2010).max(new Date().getFullYear()),
  aggregateScore: z.string().optional(),
});

type JhsForm = z.infer<typeof jhsSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

const JhsStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps, updateJhsInfo } = useApplicationState();
  const form = useForm<JhsForm>({
    resolver: zodResolver(jhsSchema),
    defaultValues: steps.jhsInfo || {},
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      const isValid = await form.trigger();
      if (isValid) {
        updateJhsInfo(form.getValues());
      }
      return isValid;
    },
  }));

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h2 className="text-2xl font-semibold">JHS Information</h2>
        <div className="text-sm text-muted-foreground mb-4">
          Please provide accurate information about your previous Junior High School.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="jhsName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>JHS Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your previous JHS name" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="beceIndexNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BECE Index Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your BECE index number" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="graduationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Graduation Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="Year of graduation" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aggregateScore"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aggregate Score (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter aggregate score if available" 
                    {...field} 
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

export default JhsStep;
