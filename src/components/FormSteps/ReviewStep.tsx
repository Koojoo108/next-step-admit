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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

const reviewSchema = z.object({
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions to submit.',
  }),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

const ReviewStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps } = useApplicationState();
  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { termsAccepted: false },
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    trigger: () => form.trigger(),
  }));

  const { personal, guardian, academic, program } = steps;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">Review & Submit</h2>
      
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Full Name:</strong> {personal?.fullName}</p>
          <p><strong>Date of Birth:</strong> {personal?.dateOfBirth ? format(personal.dateOfBirth, 'PPP') : ''}</p>
          <p><strong>Email:</strong> {personal?.email}</p>
        </CardContent>
      </Card>

      {/* Guardian Info */}
      <Card>
        <CardHeader>
          <CardTitle>Guardian Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Guardian Name:</strong> {guardian?.name}</p>
          <p><strong>Contact:</strong> {guardian?.contact}</p>
        </CardContent>
      </Card>

      {/* Academic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Academic History</CardTitle>
        </CardHeader>
        <CardContent>
          {academic?.previousInstitutions.map((inst, i) => (
            <p key={i}><strong>{inst.name}:</strong> Graduated {inst.graduationDate}, GPA: {inst.gpa}</p>
          ))}
        </CardContent>
      </Card>

       {/* Program Info */}
       <Card>
        <CardHeader>
          <CardTitle>Program Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Major:</strong> {program?.major}</p>
          <p><strong>Campus:</strong> {program?.campusLocation}</p>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Form {...form}>
        <form>
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I hereby declare that the information provided is true and correct.
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
});

export default ReviewStep;
