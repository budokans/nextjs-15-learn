import type { ReactElement } from 'react';

interface ValidationErrorsDisplayProps<A> {
  readonly fieldName: string & keyof A;
  readonly errorMessages: readonly string[];
}

export const ValidationErrorsDisplay = <A,>({
  fieldName,
  errorMessages,
}: ValidationErrorsDisplayProps<A>): ReactElement => (
  <div
    id={`${fieldName}-input-validation-error`}
    aria-live="polite"
    aria-atomic="true"
  >
    {errorMessages.map((errorMessage, idx) => (
      <p className="mt-2 text-sm text-red-500" key={idx}>
        {errorMessage}
      </p>
    ))}
  </div>
);
