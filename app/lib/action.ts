'use server';

import { sql } from '@vercel/postgres';
import {
  type Invoice,
  createInvoiceFormDataSchema,
} from '@/app/lib/definitions';
import { sanitiseCreateInvoiceData } from '@/app/lib/utils';

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
};
