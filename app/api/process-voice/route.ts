import { NextRequest, NextResponse } from 'next/server';
import { parseVoicePrompt } from '@/lib/ai';

/**
 * POST /api/process-voice
 * Handles audio/text payloads and performs AI parsing for inventory actions.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { text } = body;

      if (!text) {
        return NextResponse.json(
          { error: 'Missing "text" field in request body.' },
          { status: 400 }
        );
      }

      const result = await parseVoicePrompt({ text });
      return NextResponse.json(result);
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File | null;
      const text = formData.get('text') as string | null;

      if (!audioFile && !text) {
        return NextResponse.json(
          { error: 'Provide either an "audio" file or "text" prompt.' },
          { status: 400 }
        );
      }

      let audioBuffer: Buffer | undefined;
      let mimeType: string | undefined;

      if (audioFile) {
        const bytes = await audioFile.arrayBuffer();
        audioBuffer = Buffer.from(bytes);
        mimeType = audioFile.type;
      }

      const result = await parseVoicePrompt({
        audioBuffer,
        text: text ?? undefined,
        mimeType,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Unsupported Content-Type. Use application/json or multipart/form-data.' },
      { status: 415 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
