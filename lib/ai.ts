import { GoogleGenAI } from '@google/genai';

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  pricePerUnit: number;
}

export interface ProposedChange {
  productId: string;
  productName: string;
  action: 'SALE' | 'RESTOCK';
  quantity: number;
  unit: string;
  currentStock: number;
  newProjectedStock: number;
  confidence: number;
}

export interface ProcessVoiceResult {
  transcript: string;
  proposedChanges: ProposedChange[];
  unrecognizedItems: string[];
}

interface RawLLMOutput {
  transcript?: string;
  proposedChanges?: Array<{
    productId?: string;
    productName?: string;
    action?: string;
    quantity?: number | string;
    unit?: string;
    confidence?: number;
  }>;
  unrecognizedItems?: string[];
}

/**
 * Strips markdown code blocks if the LLM output is wrapped in ```json ... ```
 */
function cleanJsonOutput(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    const lines = trimmed.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    return lines.join('\n').trim();
  }
  return trimmed;
}

/**
 * Local heuristic / regex parser used for text when GEMINI_API_KEY is not configured
 */
function parseTextFallback(text: string, catalog: CatalogProduct[]): ProcessVoiceResult {
  const proposedChanges: ProposedChange[] = [];
  const unrecognizedItems: string[] = [];

  // Match patterns like "sold 5 packets of milk", "added 10 kg rice", "2 kg sugar"
  const sentences = text.split(/[,.;\n]|(?:\band\b)|(?:\baur\b)/i).map((s) => s.trim()).filter(Boolean);

  for (const segment of sentences) {
    const isRestock = /\b(added|restock|restocked|aaya|le aaya|daala|kharida|received|plus)\b/i.test(segment);
    const isSale = /\b(sold|sale|becha|bech|diya|nikala|sell|minus)\b/i.test(segment);
    const action: 'SALE' | 'RESTOCK' = isRestock ? 'RESTOCK' : 'SALE';

    // Extract quantity (supports integer, float, and words like half/aadha)
    let quantity = 1;
    const numMatch = segment.match(/(\d+(?:\.\d+)?)/);
    if (numMatch) {
      quantity = parseFloat(numMatch[1]);
    } else if (/\b(half|aadha|adho)\b/i.test(segment)) {
      quantity = 0.5;
    } else if (/\b(quarter|paav|pau)\b/i.test(segment)) {
      quantity = 0.25;
    } else if (/\b(dedh)\b/i.test(segment)) {
      quantity = 1.5;
    } else if (/\b(dhai)\b/i.test(segment)) {
      quantity = 2.5;
    }

    // Match product from catalog
    let matchedProduct: CatalogProduct | undefined;
    for (const product of catalog) {
      const pNameLower = product.name.toLowerCase();
      const keywords = pNameLower.split(' ').concat(
        product.category.toLowerCase().split(' ')
      );

      // Check colloquial synonyms
      const synonyms: Record<string, string[]> = {
        'basmati rice': ['rice', 'chawal'],
        'refined sugar': ['sugar', 'cheeni', 'shakkar'],
        'sunflower cooking oil': ['oil', 'tel', 'cooking oil'],
        'toned milk packets': ['milk', 'doodh', 'milk packets', 'packet doodh'],
        'premium tea powder': ['tea', 'chai', 'chai patti', 'tea powder'],
        'bathing soap': ['soap', 'sabun'],
        'marie biscuits': ['biscuit', 'biscuits'],
        'toor dal': ['dal', 'daal', 'toor'],
        'whole wheat flour (atta)': ['atta', 'flour', 'wheat', 'gehu'],
        'washing detergent powder': ['detergent', 'surf', 'washing powder'],
      };

      const customSynonyms = synonyms[pNameLower] || [];
      const segmentLower = segment.toLowerCase();

      if (
        segmentLower.includes(pNameLower) ||
        keywords.some((k) => k.length > 3 && segmentLower.includes(k)) ||
        customSynonyms.some((syn) => segmentLower.includes(syn))
      ) {
        matchedProduct = product;
        break;
      }
    }

    if (matchedProduct) {
      const currentStock = matchedProduct.currentStock;
      const newProjectedStock =
        action === 'SALE'
          ? Number((currentStock - quantity).toFixed(3))
          : Number((currentStock + quantity).toFixed(3));

      proposedChanges.push({
        productId: matchedProduct.id,
        productName: matchedProduct.name,
        action,
        quantity,
        unit: matchedProduct.unit,
        currentStock,
        newProjectedStock,
        confidence: 0.85,
      });
    } else if (numMatch || isSale || isRestock) {
      unrecognizedItems.push(segment);
    }
  }

  return {
    transcript: text,
    proposedChanges,
    unrecognizedItems,
  };
}

/**
 * Main multimodal audio / text parser using Gemini 2.5 Flash
 */
export async function processVoiceOrText({
  audioBuffer,
  mimeType,
  text,
  catalog,
}: {
  audioBuffer?: Buffer;
  mimeType?: string;
  text?: string;
  catalog: CatalogProduct[];
}): Promise<ProcessVoiceResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && apiKey.trim().length > 0 && apiKey !== 'your-gemini-api-key-here';

  // If no Gemini key is provided, handle text fallback gracefully
  if (!isKeyConfigured) {
    if (text) {
      return parseTextFallback(text, catalog);
    }
    throw new Error(
      'Audio processing requires a valid GEMINI_API_KEY in .env.local. Please configure your Gemini API key.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const catalogContext = catalog
    .map(
      (p) =>
        `- ID: "${p.id}", Name: "${p.name}", Category: "${p.category}", Stock: ${p.currentStock} ${p.unit}, Unit: "${p.unit}"`
    )
    .join('\n');

  const systemInstruction = `You are an expert bilingual inventory parser for a retail shopkeeper.
You understand spoken colloquial speech, code-switching, and mixed languages (including English, Hindi, Hinglish, regional accents, and shopkeeper slang).
Common terms for SALE: sold, becha, bech diya, diya, nikala, out, minus, sell.
Common terms for RESTOCK: added, restock, aaya, le aaya, daala, kharida, received, in, plus.
Colloquial fractions:
- "aadha" / "half" = 0.5
- "paav" / "quarter" = 0.25
- "dedh" = 1.5
- "dhai" = 2.5

Catalog of Products in Store:
${catalogContext}

Instructions:
1. Provide the exact transcript of what was said in the "transcript" field.
2. Identify all inventory changes. Map each mentioned item to the closest matching product from the catalog.
   - Return the exact "productId" and "productName" from the catalog.
   - "action": strictly "SALE" or "RESTOCK".
   - "quantity": positive number (Float or Int).
   - "unit": unit mentioned or catalog unit.
   - "confidence": number between 0.0 and 1.0.
3. If an item was mentioned with a quantity/action but is NOT found in the catalog (e.g., chips, cold drinks, chocolate), do NOT invent a productId. Instead add it to "unrecognizedItems" as a descriptive string.
4. If the audio contains only ambient background noise, static, or silence with no audible inventory instructions, set "transcript" to "(Ambient background noise / no clear speech detected)" and "proposedChanges" to [].
5. Output strictly valid JSON matching this schema:
{
  "transcript": "string",
  "proposedChanges": [
    {
      "productId": "string",
      "productName": "string",
      "action": "SALE" | "RESTOCK",
      "quantity": 5,
      "unit": "string",
      "confidence": 0.95
    }
  ],
  "unrecognizedItems": ["string"]
}`;

  const contents: Array<string | { inlineData: { data: string; mimeType: string } } | { text: string }> = [];

  if (audioBuffer) {
    contents.push({
      inlineData: {
        data: audioBuffer.toString('base64'),
        mimeType: mimeType || 'audio/webm',
      },
    });
    contents.push({
      text: 'Listen to the shopkeeper audio recording and extract the inventory transactions matching the store catalog.',
    });
  } else if (text) {
    contents.push({
      text: `Shopkeeper said: "${text}". Extract the inventory transactions matching the store catalog.`,
    });
  } else {
    throw new Error('Neither audio nor text was provided.');
  }

  // Use Gemini 2.5 Flash (fallback to gemini-1.5-flash if needed)
  let rawJsonText = '';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contents: contents as any,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
    rawJsonText = response.text || '{}';
  } catch (apiError: unknown) {
    // If gemini-2.5-flash encounters an issue, fallback to gemini-1.5-flash
    console.warn('Gemini 2.5 Flash attempt failed, retrying with gemini-1.5-flash...', apiError);
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contents: contents as any,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });
    rawJsonText = response.text || '{}';
  }

  const cleaned = cleanJsonOutput(rawJsonText);
  let parsed: RawLLMOutput;

  try {
    parsed = JSON.parse(cleaned);
  } catch (jsonErr) {
    console.error('Failed to parse Gemini JSON output:', cleaned, jsonErr);
    // If text was provided, fallback to pattern matcher
    if (text) {
      return parseTextFallback(text, catalog);
    }
    throw new Error('LLM did not return a valid JSON response.');
  }

  // Construct final verified response with deterministic catalog IDs and stock calculations
  const finalProposedChanges: ProposedChange[] = [];
  const unrecognizedItems: string[] = parsed.unrecognizedItems || [];

  if (Array.isArray(parsed.proposedChanges)) {
    for (const change of parsed.proposedChanges) {
      // Find matching product by ID or fuzzy by name
      const matched =
        catalog.find((p) => p.id === change.productId) ||
        (change.productName
          ? catalog.find(
              (p) =>
                p.name.toLowerCase() === change.productName?.toLowerCase() ||
                p.name.toLowerCase().includes(change.productName?.toLowerCase() || '')
            )
          : undefined);

      if (matched) {
        const action: 'SALE' | 'RESTOCK' =
          String(change.action).toUpperCase() === 'RESTOCK' ? 'RESTOCK' : 'SALE';
        const quantity =
          typeof change.quantity === 'number'
            ? change.quantity
            : parseFloat(String(change.quantity || 1));

        const currentStock = matched.currentStock;
        const newProjectedStock =
          action === 'SALE'
            ? Number((currentStock - quantity).toFixed(3))
            : Number((currentStock + quantity).toFixed(3));

        finalProposedChanges.push({
          productId: matched.id,
          productName: matched.name,
          action,
          quantity,
          unit: matched.unit,
          currentStock,
          newProjectedStock,
          confidence:
            typeof change.confidence === 'number' ? Math.min(1.0, Math.max(0.0, change.confidence)) : 0.95,
        });
      } else {
        const itemDesc = change.productName
          ? `${change.quantity || ''} ${change.unit || ''} ${change.productName}`.trim()
          : 'Unknown item';
        unrecognizedItems.push(itemDesc);
      }
    }
  }

  return {
    transcript: parsed.transcript || text || 'Audio processed',
    proposedChanges: finalProposedChanges,
    unrecognizedItems,
  };
}
