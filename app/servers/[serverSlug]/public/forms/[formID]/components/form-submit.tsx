"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Question } from "@prisma/client";
import { submitFormResponse } from "../form-actions";

type FormSubmitProps = {
  formId: string;
  serverSlug: string;
  questions: Question[];
  title: string;
  description: string | null;
}

export function FormSubmit({ formId, serverSlug, questions }: FormSubmitProps) {
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await submitFormResponse(formId, serverSlug, formData);
        toast.success("Votre réponse a été envoyée avec succès !");
      } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          return;
        }
        toast.error("Une erreur est survenue lors de l'envoi de votre réponse");
      }
    });
  }

  return (
    <form className="space-y-6" action={onSubmit}>
      {questions.map((question) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {question.label}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {question.type === "text" && (
              <Input
                name={`question_${question.id}`}
                required={question.required}
                placeholder="Votre réponse..."
              />
            )}

            {question.type === "textarea" && (
              <Textarea
                name={`question_${question.id}`}
                required={question.required}
                placeholder="Votre réponse..."
              />
            )}

            {question.type === "select" && question.options && (
              <Select name={`question_${question.id}`} required={question.required}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une option" />
                </SelectTrigger>
                <SelectContent>
                  {question.options.split(",").map((option) => (
                    <SelectItem key={option.trim()} value={option.trim()}>
                      {option.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {question.type === "checkbox" && question.options && (
              <div className="space-y-2">
                {question.options.split(",").map((option) => (
                  <div key={option.trim()} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${question.id}_${option.trim()}`}
                      name={`question_${question.id}`}
                      value={option.trim()}
                    />
                    <Label htmlFor={`${question.id}_${option.trim()}`}>
                      {option.trim()}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {question.type === "radio" && question.options && (
              <RadioGroup name={`question_${question.id}`} required={question.required}>
                {question.options.split(",").map((option) => (
                  <div key={option.trim()} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.trim()}
                      id={`${question.id}_${option.trim()}`}
                    />
                    <Label htmlFor={`${question.id}_${option.trim()}`}>
                      {option.trim()}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Envoi en cours..." : "Envoyer"}
        </Button>
      </div>
    </form>
  );
} 