import React, { useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { personalInfoSchema } from '@/schemas/validation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

const PersonalStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps, updatePersonal } = useApplicationState();
  const form = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: steps.personal || {},
    mode: 'onChange',
  });

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      console.log('[PersonalStep] Starting validation...');
      console.log('[PersonalStep] Current form values:', form.getValues());
      
      const isValid = await form.trigger();
      console.log('[PersonalStep] Validation result:', isValid);
      
      if (!isValid) {
        console.log('[PersonalStep] Form errors:', form.formState.errors);
        
        // Check each field individually
        const fields = ['fullName', 'dateOfBirth', 'gender', 'email', 'phone', 'address'];
        for (const fieldName of fields) {
          const fieldError = form.formState.errors[fieldName as keyof typeof form.formState.errors];
          if (fieldError) {
            console.log(`[PersonalStep] Field "${fieldName}" error:`, fieldError.message);
          }
        }
      }
      
      if (isValid) {
        console.log('[PersonalStep] Updating personal info with:', form.getValues());
        updatePersonal(form.getValues());
      }
      
      return isValid;
    },
  }));


  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select your date of birth"
                    maxDate={new Date()}
                    minDate={new Date(1900, 0, 1)}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+1 (555) 555-5555" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residential Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, Anytown, USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
});

export default PersonalStep;
