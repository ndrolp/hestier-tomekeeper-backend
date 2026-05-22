# Library Statistics

Get an aggregated overview of your entire library at a glance.

## Endpoint

```
GET /api/v1/statistics
```

**Example response:**
```json
{
  "totals": {
    "books": 120,
    "authors": 45,
    "series": 12,
    "editions": 200,
    "quotes": 88
  },
  "books": {
    "withCover": 100,
    "withDescription": 75,
    "withIsbn": 60,
    "inSeries": 80,
    "standalone": 40,
    "languagesTracked": 5
  },
  "editions": {
    "digital": 90,
    "hardcover": 50,
    "paperback": 60,
    "withFile": 30
  },
  "quotes": {
    "public": 70,
    "private": 18
  }
}
```
