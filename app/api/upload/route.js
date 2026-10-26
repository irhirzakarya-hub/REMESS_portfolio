import { NextResponse } from 'next/server';
import { uploadMedia, isBlobConfigured } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadMedia(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: result.url,
      source: result.source,
      isBlobConfigured: isBlobConfigured(),
    });
  } catch (error) {
    console.error('[API /api/upload error]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
