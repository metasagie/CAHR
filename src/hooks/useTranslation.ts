/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useGame } from '../store/gameStore';
import { DICTIONARY } from '../i18n';

export function useTranslation() {
  const { state } = useGame();
  const lang = (state?.language === 'ar' ? 'ar' : 'en') as 'en' | 'ar';

  const t = (key: keyof typeof DICTIONARY.en | string): string => {
    const dict = DICTIONARY[lang] as Record<string, string> | undefined;
    if (dict && dict[key]) {
      return dict[key];
    }
    const fallbackDict = DICTIONARY.en as Record<string, string> | undefined;
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
    }
    return key;
  };

  return { t, lang };
}
