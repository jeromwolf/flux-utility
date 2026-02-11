import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  // Only allow pixabay domains
  const parsed = new URL(url);
  if (!parsed.hostname.endsWith('pixabay.com') && !parsed.hostname.endsWith('pxhere.com')) {
    return NextResponse.json({ error: 'Invalid URL domain' }, { status: 403 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: 'Download failed' }, { status: res.status });
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="pixabay-download"`);

    return new NextResponse(blob, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
