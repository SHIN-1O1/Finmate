# Stock Quotes Provider Documentation

## Provider Choice: Twelve Data

### Why Twelve Data?
- **Reliable for demos**: Less aggressive rate limiting than Alpha Vantage free tier
- **Simple API**: Single endpoint for price quotes
- **Fast response**: Suitable for real-time refresh UX

### API Configuration

**Environment Variable:**
```
TWELVEDATA_API_KEY=your_api_key_here
```

### Endpoint Used
```
GET https://api.twelvedata.com/price?symbol={SYMBOL}&apikey={API_KEY}
```

**Response Format:**
```json
{
  "price": "1234.56"
}
```

**Error Response:**
```json
{
  "code": 400,
  "message": "Invalid symbol",
  "status": "error"
}
```

---

## Rate Limits (Free Tier)

| Limit | Value |
|-------|-------|
| API calls/minute | 8 |
| API calls/day | 800 |

---

## Caching Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Cache TTL | 15 minutes | Balance freshness vs API usage |
| Stale threshold | 6 hours | Auto-refresh on page load if older |
| Max symbols/request | 20 | Prevent abuse |

### Cache Implementation
- **Type**: In-memory `Map<string, CacheEntry>`
- **Key**: Uppercase symbol (e.g., "INFY")
- **Entry**: `{ price, timestamp, fetchedAt }`

---

## API Route

**Endpoint:** `GET /api/quotes?symbols=INFY,TCS,...`

**Response:**
```json
{
  "source": "twelvedata",
  "fetchedAt": "2026-02-05T12:00:00Z",
  "quotes": [
    { "symbol": "INFY", "price": 1234.5, "timestamp": "2026-02-05T12:00:00Z" },
    { "symbol": "BAD", "error": "Invalid symbol" }
  ]
}
```

---

## Fallback Strategy

1. **Cache hit**: Return cached price if within TTL
2. **API failure**: Keep existing `currentValue`, set `quoteError`, show "Last updated" timestamp
3. **Invalid symbol**: Show error on that row only; other symbols update normally

---

## Future Considerations

- [ ] Add Alpha Vantage as backup provider (via `QUOTE_PROVIDER` env flag)
- [ ] Implement Redis cache for production (multi-instance support)
- [ ] Add demo mode toggle for hackathon presentations
