'use server';

import { signIn } from '@/auth';

export async function authenticateWithGoogle() {
  await signIn('google', { redirectTo: '/dashboard' });
}
