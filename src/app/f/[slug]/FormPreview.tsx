"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

interface FormSchema {
  title: string;
  fields: FormField[];
  submitText?: string;
  description?: string;
  successMessage?: string;
}

interface FormPreviewProps {
  schema: FormSchema;
}

// Helper function to create Zod schema from form fields
function createZodSchema(fields: FormField[]) {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let fieldSchema:
      | z.ZodString
      | z.ZodNumber
      | z.ZodOptional<z.ZodString>
      | z.ZodOptional<z.ZodNumber>;

    switch (field.type) {
      case "text":
      case "email":
        fieldSchema = z.string();
        if (field.type === "email") {
          fieldSchema = (fieldSchema as z.ZodString).email(
            "Please enter a valid email address"
          );
        }
        break;
      case "textarea":
        fieldSchema = z.string();
        break;
      case "number":
        fieldSchema = z.coerce.number();
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.required) {
      if (field.type === "number") {
        // For numbers, we don't use min(1) as it's a value constraint
        schemaObject[field.id] = fieldSchema;
      } else {
        fieldSchema = (fieldSchema as z.ZodString).min(
          1,
          `${field.name} is required`
        );
        schemaObject[field.id] = fieldSchema;
      }
    } else {
      schemaObject[field.id] = fieldSchema.optional();
    }
  });

  return z.object(schemaObject);
}

// Helper function to create default values
function createDefaultValues(fields: FormField[]) {
  const defaultValues: Record<string, string> = {};
  fields.forEach((field) => {
    defaultValues[field.id] = "";
  });
  return defaultValues;
}

export default function FormPreview({ schema }: FormPreviewProps) {
  const [submittedData, setSubmittedData] = useState<Record<
    string,
    unknown
  > | null>(null);

  const zodSchema = createZodSchema(schema.fields);
  const defaultValues = createDefaultValues(schema.fields);

  const form = useForm<z.infer<typeof zodSchema>>({
    resolver: zodResolver(zodSchema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof zodSchema>) {
    console.log("Form submitted:", values);
    setSubmittedData(values);
  }

  const renderField = (field: FormField) => {
    return (
      <FormField
        key={field.id}
        control={form.control}
        name={field.id as keyof z.infer<typeof zodSchema>}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {field.type === "textarea" ? (
                <Textarea
                  placeholder={
                    field.placeholder || `Enter ${field.name.toLowerCase()}`
                  }
                  value={formField.value as string}
                  onChange={formField.onChange}
                  onBlur={formField.onBlur}
                  name={formField.name}
                  ref={formField.ref}
                />
              ) : (
                <Input
                  type={
                    field.type === "email"
                      ? "email"
                      : field.type === "number"
                      ? "number"
                      : "text"
                  }
                  placeholder={
                    field.placeholder || `Enter ${field.name.toLowerCase()}`
                  }
                  value={formField.value as string}
                  onChange={formField.onChange}
                  onBlur={formField.onBlur}
                  name={formField.name}
                  ref={formField.ref}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="bg-white dark:bg-zinc-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Form Preview
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {schema.fields.map((field) => renderField(field))}

            <Button type="submit" className="w-full">
              {schema.submitText || "Submit Form"}
            </Button>
          </form>
        </Form>
      </div>

      {submittedData && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <h3 className="text-base font-semibold text-green-800 dark:text-green-200 mb-2">
            {schema.successMessage || "Form Submitted Successfully!"}
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded border p-3">
            <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <details className="bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-gray-700">
        <summary className="p-3 cursor-pointer font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-sm">
          View Schema JSON
        </summary>
        <div className="p-3 pt-0">
          <pre className="bg-gray-100 dark:bg-zinc-950 p-3 rounded text-xs text-gray-700 dark:text-gray-300 overflow-auto">
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}
