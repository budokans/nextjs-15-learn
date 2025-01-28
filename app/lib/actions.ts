'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import {
  type DBInvoice,
  createInvoiceFormDataSchema,
} from '@/app/lib/definitions';
import { sanitiseCreateInvoiceData } from '@/app/lib/utils';

export interface MutateInvoiceErrorState {
  readonly fieldErrors?: {
    readonly customerId?: readonly string[];
    readonly amount?: readonly string[];
    readonly status?: readonly string[];
  };
  readonly message?: string;
}

export type MutationInvoiceResponse = MutateInvoiceErrorState;

export const createInvoice = async (
  _: MutateInvoiceErrorState,
  formData: FormData
): Promise<MutateInvoiceErrorState> => {
  const formDataParseResult = createInvoiceFormDataSchema.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!formDataParseResult.success) {
    console.log({
      returning: {
        fieldErrors: formDataParseResult.error.flatten().fieldErrors,
        message: 'Missing fields. Failed to create invoice.',
      },
    });

    return {
      fieldErrors: formDataParseResult.error.flatten().fieldErrors,
      message: 'Missing fields. Failed to create invoice.',
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
        message: 'Database Error: failed to create invoice.',
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
      createInvoiceFormDataSchema.parse({
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

export const deleteInvoice = async (id: string): Promise<void> => {
  try {
    await sql<DBInvoice>`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error(error);
  }
};
