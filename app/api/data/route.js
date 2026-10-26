import { NextResponse } from 'next/server';
import { getConfig, saveConfig, isBlobConfigured } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getConfig();
    return NextResponse.json({
      success: true,
      data,
      isBlobConfigured: isBlobConfigured(),
    });
  } catch (error) {
    console.error('[API /api/data GET error]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Optional password verification:
    // If client sends password, check against stored or default password
    const currentConfig = await getConfig();
    const storedPassword = currentConfig.general?.adminPassword || 'admin';
    
    if (body.authPassword && body.authPassword !== storedPassword) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe administrateur incorrect' },
        { status: 401 }
      );
    }

    const { authPassword, ...dataToSave } = body;
    const result = await saveConfig(dataToSave);

    return NextResponse.json({
      success: true,
      message: 'Données enregistrées avec succès',
      result,
      isBlobConfigured: isBlobConfigured(),
    });
  } catch (error) {
    console.error('[API /api/data POST error]:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
