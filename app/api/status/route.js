import { NextResponse } from 'next/server';
import { isBlobConfigured, getConfig } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getConfig();
    return NextResponse.json({
      success: true,
      isBlobConfigured: isBlobConfigured(),
      dataSource: config._source || 'default',
      blobUrl: config._blobUrl || null,
      environment: process.env.NODE_ENV,
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
      isBlobConfigured: isBlobConfigured(),
    });
  }
}
