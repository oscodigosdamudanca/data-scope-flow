import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { LeadFormData } from './LeadFormValidation';

interface LeadFormBasicProps {
  form: UseFormReturn<LeadFormData>;
  interestOptions: { value: string; label: string }[];
  sourceOptions: { value: string; label: string }[];
  disabled?: boolean;
}

export const LeadFormBasic: React.FC<LeadFormBasicProps> = ({
  form,
  interestOptions,
  sourceOptions,
  disabled = false
}) => {
  const selectedInterests = form.watch('interests') || [];

  const removeInterest = (interest: string) => {
    const currentInterests = form.getValues('interests') || [];
    form.setValue(
      'interests',
      currentInterests.filter((i) => i !== interest),
      { shouldValidate: true }
    );
  };

  const addInterest = (interest: string) => {
    const currentInterests = form.getValues('interests') || [];
    if (!currentInterests.includes(interest)) {
      form.setValue(
        'interests',
        [...currentInterests, interest],
        { shouldValidate: true }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome*</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input placeholder="email@exemplo.com" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(00) 00000-0000" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Cargo ou função" {...field} disabled={disabled} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origem*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value} 
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sourceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="interests"
        render={() => (
          <FormItem>
            <FormLabel>Interesses</FormLabel>
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedInterests.map((interest) => {
                const label = interestOptions.find(
                  (option) => option.value === interest
                )?.label || interest;
                return (
                  <Badge key={interest} variant="secondary" className="mr-1 mb-1">
                    {label}
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                );
              })}
            </div>
            {!disabled && (
              <Select
                onValueChange={(value) => addInterest(value)}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar interesses" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {interestOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      disabled={selectedInterests.includes(option.value)}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Informações adicionais sobre o lead"
                className="resize-none"
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};