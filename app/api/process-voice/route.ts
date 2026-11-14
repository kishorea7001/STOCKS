import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processVoiceOrText } from '@/lib/ai';

// Disable Edge runtime; ensure strict Node.js server-side execution for Buffer & DB access
export const runtime = 'nodejs';

/**
 * POST /app/api/process-voice
 * 
 * Server-side route that accepts audio (FormData) or text fallback,
 * queries the live product catalog from SQLite via Prisma, and invokes
 * Gemini with multimodal audio understanding or Hinglish text parsing.
 * 
 * CRITICAL ARCHITECTURAL RULE:
 * This route is strictly read-only / preview. It never modifies the database.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let audioBuffer: Buffer | undefined;
    let mimeType: string | undefined;
    let rawText: string | undefined;

    // 1. Parse incoming request (multipart/form-data or application/json)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('audio') as File | null;
      const textFromForm = formData.get('text') as string | null;

      if (file && file.size > 0) {
        const arrayBuf = await file.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuf);
        mimeType = file.type || 'audio/webm';
      }

      if (textFromForm && textFromForm.trim().length > 0) {
        rawText = textFromForm.trim();
      }
    } else if (contentType.includes('application/json')) {
      const jsonBody = await request.json();
      if (jsonBody.text && typeof jsonBody.text === 'string') {
        rawText = jsonBody.text.trim();
      }
      if (jsonBody.audioBase64 && typeof jsonBody.audioBase64 === 'string') {
        audioBuffer = Buffer.from(jsonBody.audioBase64, 'base64');
        mimeType = jsonBody.mimeType || 'audio/webm';
      }
    } else {
      return NextResponse.json(
        {
          error:
            'Unsupported content type. Send multipart/form-data (with audio file or text) or application/json.',
        },
        { status: 415 }
      );
    }

    if (!audioBuffer && !rawText) {
      return NextResponse.json(
        { error: 'No audio file or text payload provided.' },
        { status: 400 }
      );
    }

    // 2. Fetch the live catalog of products from the database
    // This provides the AI with the exact IDs, names, units, and stock quantities
    const catalog = await db.product.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        currentStock: true,
        unit: true,
        pricePerUnit: true,
      },
      orderBy: { name: 'asc' },
    });

    if (catalog.length === 0) {
      return NextResponse.json(
        {
          error:
            'Catalog is empty. Please run database seeding (`npm run db:seed`) before processing speech.',
        },
        { status: 400 }
      );
    }

    // 3. Process with AI (Gemini multimodal audio or bilingual Hinglish text understanding)
    // NOTE: This route ONLY previews proposed changes and DOES NOT write to the database.
    const result = await processVoiceOrText({
      audioBuffer,
      mimeType,
      text: rawText,
      catalog,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error('Error in /api/process-voice:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
