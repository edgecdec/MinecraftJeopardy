import Ably from 'ably';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const client = new Ably.Rest(process.env.ABLY_API_KEY || 'placeholder:key');
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'jeopardy-client' });
  return NextResponse.json(tokenRequestData);
}
