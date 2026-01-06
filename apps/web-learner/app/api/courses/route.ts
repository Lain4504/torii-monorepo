import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.search;
  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082'}/courses${search}`;

  const res = await fetch(backendUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(req.headers.get('authorization') ? { 'authorization': req.headers.get('authorization')! } : {}),
    },
    credentials: 'include',
  });

  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
