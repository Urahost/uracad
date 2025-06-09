import {useLocale, useTranslations} from 'next-intl';
import LocaleSwitcherSelect from './LocaleSwitcherSelect';
import Image from 'next/image';

export default function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={[
        {
          value: 'fr',
          label: (
            <div className="flex items-center gap-2">
              <Image src="/locales/FR.svg" alt="FR" width={16} height={12} />
              <span>Français</span>
            </div>
          )
        },
        {
          value: 'en',
          label: (
            <div className="flex items-center gap-2">
              <Image src="/locales/GB-NIR.svg" alt="GB" width={16} height={12} />
              <span>English</span>
            </div>
          )
        }
      ]}
      label={t('label')}
    />
  );
}