import React, { useImperativeHandle } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { academicInfoSchema } from '@/schemas/validation';
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
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type AcademicInfoForm = z.infer<typeof academicInfoSchema>;

export type StepHandle = {
  trigger: () => Promise<boolean>;
};

const AcademicStep = React.forwardRef<StepHandle>((_props, ref) => {
  const { steps, updateAcademic } = useApplicationState();
  const form = useForm<AcademicInfoForm>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues: steps.academic || { previousInstitutions: [{ name: '', graduationDate: new Date().getFullYear() }] },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "previousInstitutions",
  });

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      const isValid = await form.trigger();
      if (isValid) {
        updateAcademic(form.getValues());
      }
      return isValid;
    },
  }));

  return (
    <Form {...form}>
      <form className="space-y-6">
        <h2 className="text-2xl font-semibold">Academic History</h2>
        
        <div>
          {fields.map((item, index) => (
            <div key={item.id} className="p-4 border rounded-lg mb-4 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`previousInstitutions.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Anytown High School" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`previousInstitutions.${index}.graduationDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2024" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: '', graduationDate: new Date().getFullYear() })}
          >
            Add Another Institution
          </Button>
        </div>
      </form>
    </Form>
  );
});

export default AcademicStep;
