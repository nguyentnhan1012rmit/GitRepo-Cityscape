import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code, filename } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { summary: 'AI summary disabled (GEMINI_API_KEY not set).' },
        { status: 200 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `In exactly one sentence, describe what this file does:\n\nFilename: ${filename}\n\n${code.substring(0, 3000)}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error('Failed to generate summary:', error);
    return NextResponse.json(
      { summary: 'Failed to generate summary.' },
      { status: 500 }
    );
  }
}
