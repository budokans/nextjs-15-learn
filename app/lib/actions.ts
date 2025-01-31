'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import {
  type DBInvoice,
  type MutateInvoiceRawFormData,
  type MutateInvoiceFormData,
  type AuthenticateRawFormData,
  mutateInvoiceFormDataSchema,
} from '@/app/lib/definitions';
import {
  buildRawCredentialsFormData,
  buildRawInvoiceFormData,
  sanitiseCreateInvoiceData,
} from '@/app/lib/utils';
import { signIn } from '@/auth';

interface ActionError {
  readonly fieldErrors?: {
    readonly customerId?: readonly string[];
    readonly amount?: readonly string[];
    readonly status?: readonly string[];
  };
  readonly message?: string;
}

export interface MutateInvoiceActionState {
  readonly formData: MutateInvoiceRawFormData;
  readonly error: ActionError | null;
}

export const createInvoice = async (
  _: MutateInvoiceActionState,
  formData: FormData
): Promise<MutateInvoiceActionState> => {
  const rawFormData = buildRawInvoiceFormData(formData);
  const formDataParseResult =
    mutateInvoiceFormDataSchema.safeParse(rawFormData);

  if (!formDataParseResult.success) {
    return {
      formData: rawFormData,
      error: buildActionError(formDataParseResult.error),
    };
  } else {
    const sanitisedFormData = sanitiseCreateInvoiceData(
      formDataParseResult.data
    );

    try {
      await sql<DBInvoice>`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${sanitisedFormData.customer_id}, ${sanitisedFormData.amount}, ${sanitisedFormData.status}, ${sanitisedFormData.date})
      `;

      revalidatePath(afterCreatePath);
    } catch (error) {
      console.error(error);

      return {
        formData: rawFormData,
        error: {
          message: 'Database Error: failed to create invoice.',
        },
      };
    }
  }

  // This stupidly throws an error, so we can't put it in the try block where it should be.
  redirect(afterCreatePath);
};

const afterCreatePath = '/dashboard/invoices';

export const updateInvoice = async (
  _: MutateInvoiceActionState,
  formData: FormData,
  id: string
): Promise<MutateInvoiceActionState> => {
  const rawFormData = buildRawInvoiceFormData(formData);
  const formDataParseResult =
    mutateInvoiceFormDataSchema.safeParse(rawFormData);

  if (!formDataParseResult.success) {
    return {
      formData: rawFormData,
      error: buildActionError(formDataParseResult.error),
    };
  } else {
    const sanitisedFormData = sanitiseCreateInvoiceData(
      formDataParseResult.data
    );

    try {
      await sql<DBInvoice>`
        UPDATE invoices
        SET customer_id = ${sanitisedFormData.customer_id}, amount = ${sanitisedFormData.amount}, status = ${sanitisedFormData.status}
        WHERE id = ${id}
    `;
      revalidatePath(afterCreatePath);
    } catch (error) {
      console.error(error);

      return {
        formData: rawFormData,
        error: {
          message: 'Database Error: failed to create invoice.',
        },
      };
    }
  }

  redirect(afterCreatePath);
};

export interface AuthenticateActionState {
  readonly formData: AuthenticateRawFormData;
  readonly errorMessage?: string;
}

export const authenticate = async (
  _prevState: AuthenticateActionState,
  formData: FormData
): Promise<AuthenticateActionState> => {
  const rawFormData = buildRawCredentialsFormData(formData);

  try {
    await signIn('credentials', formData);

    return {
      formData: rawFormData,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            formData: rawFormData,
            errorMessage: 'Invalid credentials.',
          };
        default:
          return {
            formData: rawFormData,
            errorMessage: 'Something went wrong.',
          };
      }
    } else {
      throw error;
    }
  }
};

const buildActionError = (
  error: z.ZodError<MutateInvoiceFormData>
): ActionError => ({
  fieldErrors: error.flatten().fieldErrors,
  message: 'Missing fields. Failed to create invoice.',
});

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    await sql<DBInvoice>`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error(error);
  }
};
