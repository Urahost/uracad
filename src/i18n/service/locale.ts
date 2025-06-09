'use server';

import {cookies} from 'next/headers';
import type { Locale } from '../config';
import { defaultLocale } from '../config';

// Nom du cookie qui stockera la locale choisie par l'utilisateur
const COOKIE_NAME = 'NEXT_LOCALE';

// Function pour récupérer la locale actuelle de l'utilisateur
export async function getUserLocale() {
  return (await cookies()).get(COOKIE_NAME)?.value ?? 
    defaultLocale;
}

// Function pour définir la locale de l'utilisateur
export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
