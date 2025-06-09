'use client';

import * as Select from '@radix-ui/react-select';
import clsx from 'clsx';
import {useTransition, useState} from 'react';
import { CheckIcon, LanguagesIcon } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/service/locale';


type Props = {
  defaultValue: string;
  items: { value: string; label: string | React.ReactNode }[];
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [currentValue, setCurrentValue] = useState(defaultValue);

  function onChange(value: string) {
    const locale = value as Locale;
    setCurrentValue(value);
    startTransition(() => {
      void setUserLocale(locale);
    });
  }

  return (
    <div className="relative">
      <Select.Root value={currentValue} onValueChange={onChange}>
        <Select.Trigger
          aria-label={label}
          className={clsx(
            'rounded-sm p-2 transition-colors hover:bg-slate-200 outline-none',
            isPending && 'pointer-events-none opacity-60'
          )}
        >
          <Select.Icon>
            <LanguagesIcon className="w-[1.3rem]transition-colors size-5 group-hover:text-slate-900" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            align="end"
            className="min-w-32 overflow-hidden rounded-sm bg-white py-1 shadow-md"
            position="popper"
          >
            <Select.Viewport>
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  className="flex cursor-default items-center justify-between px-3 py-2 text-base data-[highlighted]:bg-slate-100"
                  value={item.value}
                >
                  <span className="text-slate-900">{item.label}</span>
                  <div className="mr-2 w-4">
                    {item.value === currentValue && (
                      <CheckIcon className="size-5 text-slate-600" />
                    )}
                  </div>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.Arrow className="fill-white text-white" />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}