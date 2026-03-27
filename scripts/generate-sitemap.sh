#!/bin/bash
# Generate sitemap.xml from built output directory
# Run after `npm run build` to generate sitemap based on actual pages

OUT_DIR="${1:-out}"
DOMAIN="https://dev-craft.dev"
DATE=$(date -I)

echo '<?xml version="1.0" encoding="UTF-8"?>'
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

# Find all index.html files, convert to URLs
find "$OUT_DIR" -name "index.html" -not -path "*/_not-found/*" -not -path "*/_next/*" -not -path "*/404/*" | sort | while read -r file; do
  path="${file#$OUT_DIR}"
  path="${path%/index.html}/"
  if [ "$path" = "/" ]; then
    path="/"
  fi
  echo "  <url>"
  echo "    <loc>${DOMAIN}${path}</loc>"
  echo "    <lastmod>${DATE}</lastmod>"
  echo "  </url>"
done

echo '</urlset>'
