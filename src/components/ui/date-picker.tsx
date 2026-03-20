import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  maxDate?: Date;
  minDate?: Date;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className,
  id,
  name,
  required = false,
  maxDate = new Date(),
  minDate = new Date(1900, 0, 1),
}: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const parsed = new Date(inputDate);
      if (!isNaN(parsed.getTime())) {
        onChange?.(parsed);
      }
    } else {
      onChange?.(undefined);
    }
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">
        {placeholder} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        type="date"
        id={id}
        name={name}
        value={formatDateForInput(value)}
        onChange={handleDateChange}
        disabled={disabled}
        max={formatDateForInput(maxDate)}
        min={formatDateForInput(minDate)}
        className="w-full"
        placeholder={placeholder}
      />
    </div>
  );
}
