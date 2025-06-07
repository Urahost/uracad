
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`https://${env.URACAD_FIVEM_ENDPOINT}/players`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'URacad-Preview',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Retourner seulement les 10 premiers pour l'aperçu
    return NextResponse.json(data.slice(0, 10));
    
  } catch (error) {
    logger.error('Erreur lors de la récupération des données:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer les données du serveur' },
      { status: 500 }
    );
  }
} 