// app/page.js
'use client';

import { useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/Navigation';


// Common languages list
const LANGUAGES = [
  { code: 'auto', name: 'Detect Language' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'ar', name: 'Arabic' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'en', name: 'English' },
  { code: 'et', name: 'Estonian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'iw', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'id', name: 'Indonesian' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'es', name: 'Spanish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'vi', name: 'Vietnamese' },
];

export default function TranslationPage() {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }
      
      setResult(data.translatedText);
    } catch (err) {
      setError(err.message || 'An error occurred during translation');
      setResult('');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    // Don't swap if source is auto-detect
    if (sourceLang === 'auto') return;
    
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  return (
  
  <main>
  <Navigation />
    <div className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Type to Translate Here!</h1>
        <form onSubmit={handleTranslate} className="w-full">
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium mb-2 text-white">
              Text to translate
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black text-black"
              rows="5"
              required
              placeholder="Enter text to translate..."
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="sourceLang" className="block text-sm font-medium mb-2 text-white">
                Source Language
              </label>
              <select
                id="sourceLang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black text-base"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end justify-center mb-2">
              <button 
                type="button"
                onClick={handleSwapLanguages}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md"
                title="Swap languages"
                disabled={sourceLang === 'auto'}
              >
                ↔️
              </button>
            </div>
            
            <div className="flex-1">
              <label htmlFor="targetLang" className="block text-sm font-medium mb-2 text-white">
                Target Language
              </label>
              <label htmlFor="targetLang" className="block text-sm font-medium mb-2 text-black">
              <select
                id="targetLang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {LANGUAGES.filter(lang => lang.code !== 'auto').map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              </label>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-300 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {result && !loading && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2 text-white">Translation Result:</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-black text-lg">{result}</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}