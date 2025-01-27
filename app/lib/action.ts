'use server';

import { revalidatePath } from 'next/cache';
import { sql } from '@vercel/postgres';
import {
  type Invoice,
  createInvoiceFormDataSchema,
} from '@/app/lib/definitions';
import { sanitiseCreateInvoiceData } from '@/app/lib/utils';
import { redirect } from 'next/navigation';

export const createInvoice = async (formData: FormData): Promise<void> => {
  const { customer_id, amount, status, date } = sanitiseCreateInvoiceData(
    createInvoiceFormDataSchema.parse({
      customer_id: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    })
  );

  await sql<Invoice>`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customer_id}, ${amount}, ${status}, ${date})
  `;

  revalidatePath(afterCreatePath);
  redirect(afterCreatePath);
};

const afterCreatePath = '/dashboard/invoices';

export const updateInvoice = async (
  id: string,
  formData: FormData
): Promise<void> => {
  const { customer_id, amount, status } = sanitiseCreateInvoiceData(
    createInvoiceFormDataSchema.parse({
      customer_id: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    })
  );

  await sql<Invoice>`
    UPDATE invoices
    SET customer_id = ${customer_id}, amount = ${amount}, status = ${status}
    WHERE id = ${id}
  `;

  revalidatePath(afterCreatePath);
  redirect(afterCreatePath);
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
};
