'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function googleAuthenticate() {
  try {
    await signIn('google', { redirectTo: '/dashboard' });
  } catch (error) {
    // signIn throws NEXT_REDIRECT which is expected, so we need to re-throw it
    if (error instanceof AuthError) {
      // Handle auth errors
      switch (error.type) {
        case 'AccessDenied':
          console.error('Access denied');
          break;
        default:
          console.error('Authentication error:', error);
      }
    }
    // Re-throw the error so Next.js can handle the redirect
    throw error;
  }
}
