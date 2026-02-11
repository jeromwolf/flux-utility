import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.PIXABAY_API_KEY;
const BASE_URL = 'https://pixabay.com/api/';

export async function GET(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const { searchParams } = request.nextUrl;
  const params = new URLSearchParams();
  params.set('key', API_KEY);

  // Forward allowed parameters
  const allowedParams = ['q', 'lang', 'image_type', 'orientation', 'category', 'min_width', 'min_height', 'colors', 'editors_choice', 'safesearch', 'order', 'page', 'per_page'];
  for (const key of allowedParams) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }

  // Default safesearch on
  if (!searchParams.has('safesearch')) {
    params.set('safesearch', 'true');
  }

  try {
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Pixabay API error' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch from Pixabay' }, { status: 500 });
  }
}
