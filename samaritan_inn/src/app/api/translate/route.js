// app/api/translate/route.js
import { NextResponse } from 'next/server';
import { Translate } from '@google-cloud/translate/build/src/v2';

export async function POST(request) {
  try {
    const { text, sourceLang, targetLang } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!targetLang) {
      return NextResponse.json({ error: 'Target language is required' }, { status: 400 });
    }

    // Initialize the Google Cloud Translate client with your API key
    const translate = new Translate({
      key: process.env.GOOGLE_CLOUD_API_KEY, // This will use the API key from .env.local
    });

    // If sourceLang is 'auto', we don't specify source language and let Google detect it
    const options = {
      to: targetLang,
    };

    if (sourceLang && sourceLang !== 'auto') {
      options.from = sourceLang;
    }

    // Call the translation API
    const [translation] = await translate.translate(text, options);

    return NextResponse.json({ 
      translatedText: translation,
      sourceLang,
      targetLang
    }, { status: 200 });
  } catch (error) {
    console.error('Translation error:', error);
    
    return NextResponse.json({ 
      error: 'Translation failed: ' + error.message 
    }, { status: 500 });
  }
}