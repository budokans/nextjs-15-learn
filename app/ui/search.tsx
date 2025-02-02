'use client';

import type { ChangeEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const queryParam = 'query';
const pageNumberParam = 'page';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const onChange = useDebouncedCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      const mutableSearchParams = new URLSearchParams(searchParams);

      mutableSearchParams.set(pageNumberParam, String(1));

      if (event.target.value) {
        mutableSearchParams.set(queryParam, event.target.value);
      } else {
        mutableSearchParams.delete(queryParam);
      }

      return router.replace(`${pathname}?${mutableSearchParams.toString()}`);
    },
    300
  );

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>

      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={onChange}
        defaultValue={searchParams.get(queryParam)?.toString()}
      />

      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
