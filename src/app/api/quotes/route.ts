'use server';

import { NextRequest, NextResponse } from 'next/server';

// Quote result for a single symbol
interface QuoteResult {
    symbol: string;
    price?: number;
    timestamp?: string;
    error?: string;
}

// API response structure
interface QuotesResponse {
    source: string;
    fetchedAt: string;
    quotes: QuoteResult[];
}

// In-memory cache
interface CacheEntry {
    price: number;
    timestamp: string;
    fetchedAt: number; // Unix timestamp for TTL check
}

const quoteCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const PROVIDER = 'twelvedata';

// Validate ticker symbol format
function isValidSymbol(symbol: string): boolean {
    // Allow 1-10 chars: letters, digits, dots, hyphens
    return /^[A-Z0-9.-]{1,10}$/i.test(symbol);
}

// Fetch quote from Twelve Data API
async function fetchFromTwelveData(symbol: string): Promise<QuoteResult> {
    const apiKey = process.env.TWELVEDATA_API_KEY;

    if (!apiKey) {
        return { symbol, error: 'API key not configured' };
    }

    try {
        const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
        const response = await fetch(url, {
            next: { revalidate: 0 },
            headers: { 'User-Agent': 'Finmate/1.0' }
        });

        if (!response.ok) {
            return { symbol, error: `API error: ${response.status}` };
        }

        const data = await response.json();

        // Twelve Data returns { price: "123.45" } on success
        // or { code: 400, message: "...", status: "error" } on failure
        if (data.code || data.status === 'error') {
            return { symbol, error: data.message || 'Invalid symbol' };
        }

        const price = parseFloat(data.price);
        if (isNaN(price)) {
            return { symbol, error: 'Invalid price data' };
        }

        const timestamp = new Date().toISOString();

        // Update cache
        quoteCache.set(symbol.toUpperCase(), {
            price,
            timestamp,
            fetchedAt: Date.now()
        });

        return { symbol, price, timestamp };
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Network error';
        return { symbol, error: message };
    }
}

// Check cache for symbol
function getCachedQuote(symbol: string): QuoteResult | null {
    const entry = quoteCache.get(symbol.toUpperCase());
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
        quoteCache.delete(symbol.toUpperCase());
        return null;
    }

    return {
        symbol,
        price: entry.price,
        timestamp: entry.timestamp
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
        return NextResponse.json(
            { error: 'Missing symbols parameter' },
            { status: 400 }
        );
    }

    // Parse and validate symbols
    const rawSymbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
    const symbols = [...new Set(rawSymbols)]; // dedupe

    if (symbols.length === 0) {
        return NextResponse.json(
            { error: 'No valid symbols provided' },
            { status: 400 }
        );
    }

    if (symbols.length > 20) {
        return NextResponse.json(
            { error: 'Maximum 20 symbols per request' },
            { status: 400 }
        );
    }

    // Validate each symbol
    const invalidSymbols = symbols.filter(s => !isValidSymbol(s));

    // Process each symbol
    const quotes: QuoteResult[] = [];

    for (const symbol of symbols) {
        // Check for invalid format first
        if (invalidSymbols.includes(symbol)) {
            quotes.push({ symbol, error: 'Invalid symbol format' });
            continue;
        }

        // Check cache
        const cached = getCachedQuote(symbol);
        if (cached) {
            quotes.push(cached);
            continue;
        }

        // Fetch from provider
        const result = await fetchFromTwelveData(symbol);
        quotes.push(result);
    }

    const response: QuotesResponse = {
        source: PROVIDER,
        fetchedAt: new Date().toISOString(),
        quotes
    };

    return NextResponse.json(response);
}
