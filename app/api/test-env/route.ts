import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasAuthTrustHost: !!process.env.AUTH_TRUST_HOST,
    googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
  });
}
