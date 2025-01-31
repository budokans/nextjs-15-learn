import { z } from 'zod';

// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export interface AuthenticateRawFormData {
  readonly email: FormDataGet;
  readonly password: FormDataGet;
}

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

const invoiceStatusSchema = z.enum(['pending', 'paid'], {
  invalid_type_error: 'Please select an invoice status.',
});
type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;

export interface DBInvoice {
  readonly id: string;
  readonly customer_id: string;
  readonly amount: number;
  readonly date: string;
  readonly status: InvoiceStatus;
}

export type FormDataGet = FormDataEntryValue | null;

export interface MutateInvoiceRawFormData {
  customerId: FormDataGet;
  amount: FormDataGet;
  status: FormDataGet;
}

export const mutateInvoiceFormDataSchema = z
  .object({
    customerId: z.string({ invalid_type_error: 'Please select a customer.' }),
    amount: z.coerce
      .number()
      .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: invoiceStatusSchema,
  })
  .readonly();
export type MutateInvoiceFormData = z.infer<typeof mutateInvoiceFormDataSchema>;

export type MutateInvoiceData = Omit<DBInvoice, 'id'>;

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};
