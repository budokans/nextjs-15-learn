'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type {
  MutateInvoiceFormData,
  CustomerField,
} from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { ValidationErrorsDisplay } from '@/app/ui/validation';
import {
  type MutateInvoiceActionState,
  createInvoice,
} from '@/app/lib/actions';
import { ForceRerender } from '../rerender';

export default function Form({ customers }: { customers: CustomerField[] }) {
  const [{ error, formData }, formAction] = useActionState<
    MutateInvoiceActionState,
    FormData
  >(createInvoice, {
    formData: {
      customerId: null,
      amount: null,
      status: null,
    },
    error: null,
  });

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        <div className="mb-4">
          <label htmlFor="customer" className="mb-2 block text-sm font-medium">
            Choose customer
          </label>

          <div className="relative">
            <ForceRerender
              key={
                typeof formData.customerId === 'string'
                  ? formData.customerId
                  : ''
              }
            >
              <select
                id="customer"
                name="customerId"
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="customer-input-validation-error"
                defaultValue={
                  typeof formData.customerId === 'string'
                    ? formData.customerId
                    : undefined
                }
              >
                <option value={undefined} disabled>
                  Select a customer
                </option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </ForceRerender>

            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>

          {error?.fieldErrors?.customerId && (
            <ValidationErrorsDisplay<MutateInvoiceFormData>
              fieldName="customerId"
              errorMessages={error.fieldErrors.customerId}
            />
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="amount" className="mb-2 block text-sm font-medium">
            Choose an amount
          </label>

          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="Enter USD amount"
                defaultValue={
                  typeof formData.amount === 'string'
                    ? formData.amount
                    : undefined
                }
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                aria-describedby="amount-input-validation-error"
              />

              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          {error?.fieldErrors?.amount && (
            <ValidationErrorsDisplay<MutateInvoiceFormData>
              fieldName="amount"
              errorMessages={error.fieldErrors.amount}
            />
          )}
        </div>

        <fieldset aria-describedby="status-input-validation-error">
          <legend className="mb-2 block text-sm font-medium">
            Set the invoice status
          </legend>

          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  defaultChecked={formData.status === 'pending'}
                />

                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                  defaultChecked={formData.status === 'paid'}
                />

                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {error?.fieldErrors?.status && (
          <ValidationErrorsDisplay<MutateInvoiceFormData>
            fieldName="status"
            errorMessages={error.fieldErrors.status}
          />
        )}
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>

        <Button type="submit">Create Invoice</Button>
      </div>
    </form>
  );
}
