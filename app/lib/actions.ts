'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import {
  type DBInvoice,
  type MutateInvoiceRawFormData,
  type MutateInvoiceFormData,
  mutateInvoiceFormDataSchema,
} from '@/app/lib/definitions';
import { buildRawFormData, sanitiseCreateInvoiceData } from '@/app/lib/utils';

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
  const rawFormData = buildRawFormData(formData);
  const formDataParseResult =
    mutateInvoiceFormDataSchema.safeParse(rawFormData);

  if (!formDataParseResult.success) {
    return {
      formData: buildRawFormData(formData),
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
  id: string,
  formData: FormData
): Promise<void> => {
  try {
    const { customer_id, amount, status } = sanitiseCreateInvoiceData(
      mutateInvoiceFormDataSchema.parse({
        customer_id: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      })
    );

    await sql<DBInvoice>`
      UPDATE invoices
      SET customer_id = ${customer_id}, amount = ${amount}, status = ${status}
      WHERE id = ${id}
    `;

    revalidatePath(afterCreatePath);
  } catch (error) {
    console.error(error);
  }

  redirect(afterCreatePath);
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
