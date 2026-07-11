import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'

import { MarkdownEditorField } from '@/components/dialogs/step-edit/MarkdownEditorField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateFaq, useUpdateFaq } from '@/hooks/useFaqs'
import type { Faq } from '@/types/faq'

type FaqFormState = {
  question: string
  answer: string
}

const EMPTY_FORM: FaqFormState = {
  question: '',
  answer: '',
}

type FaqFormDialogProps = {
  mode: 'create' | 'edit'
  slug: string
  faq: Faq | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    if (typeof data === 'string') {
      return data
    }
    if (data && typeof data === 'object') {
      const messages = Object.entries(data).flatMap(([field, value]) => {
        if (Array.isArray(value)) {
          return value.map((message) => `${field}: ${String(message)}`)
        }
        return [`${field}: ${String(value)}`]
      })
      if (messages.length > 0) {
        return messages.join(' ')
      }
    }
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong.'
}

export function FaqFormDialog({
  mode,
  slug,
  faq,
  open,
  onClose,
  onSuccess,
}: FaqFormDialogProps) {
  const createFaq = useCreateFaq()
  const updateFaq = useUpdateFaq()

  const [formState, setFormState] = useState<FaqFormState>(EMPTY_FORM)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [answerError, setAnswerError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isSubmitting = createFaq.isPending || updateFaq.isPending

  useEffect(() => {
    if (!open) {
      return
    }

    if (mode === 'edit' && faq) {
      setFormState({
        question: faq.question,
        answer: faq.answer,
      })
    } else {
      setFormState(EMPTY_FORM)
    }

    setQuestionError(null)
    setAnswerError(null)
    setSubmitError(null)
  }, [faq, mode, open])

  const validate = (): boolean => {
    const trimmedQuestion = formState.question.trim()
    const trimmedAnswer = formState.answer.trim()
    let isValid = true

    if (!trimmedQuestion) {
      setQuestionError('Question is required.')
      isValid = false
    } else {
      setQuestionError(null)
    }

    if (!trimmedAnswer) {
      setAnswerError('Answer is required.')
      isValid = false
    } else {
      setAnswerError(null)
    }

    return isValid
  }

  const handleSubmit = async () => {
    if (!validate()) {
      return
    }

    setSubmitError(null)

    const input = {
      question: formState.question.trim(),
      answer: formState.answer.trim(),
    }

    try {
      if (mode === 'create') {
        await createFaq.mutateAsync({ slug, input })
      } else if (faq) {
        await updateFaq.mutateAsync({ slug, id: faq.id, input })
      }

      onSuccess()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add FAQ' : 'Edit FAQ'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a frequently asked question for this roadmap.'
              : 'Update the question and answer for this FAQ.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="faq-question">Question</Label>
            <Input
              id="faq-question"
              value={formState.question}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  question: event.target.value,
                }))
              }
              placeholder="What is..."
              aria-invalid={Boolean(questionError)}
            />
            {questionError ? (
              <p className="text-sm text-destructive">{questionError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Answer</Label>
            <MarkdownEditorField
              value={formState.answer}
              onChange={(answer) =>
                setFormState((current) => ({ ...current, answer }))
              }
            />
            {answerError ? (
              <p className="text-sm text-destructive">{answerError}</p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
