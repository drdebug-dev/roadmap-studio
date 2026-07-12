import type { StepFormState } from '@/components/dialogs/step-edit/helpers'

export type FormState = StepFormState | null

export type FormAction =
  | { type: 'clear' }
  | { type: 'reset'; state: StepFormState }
  | { type: 'patch'; patch: Partial<StepFormState> }

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'clear':
      return null
    case 'reset':
      return action.state
    case 'patch':
      if (!state) {
        return state
      }
      return { ...state, ...action.patch }
    default:
      return state
  }
}
