import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// Known store parsers
function parseSonoffEgypt(html: string, url: string): object[] {
  const products: object[] = [];
  // Parse product cards - sonoffegypt.com structure
  const nameMatches = html.matchAll(/<h2[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/h2>/gis);
  const priceMatches = html.matchAll(/class="[^"]*price[^"]*"[^>]*>\s*(?:EGP|جنيه)?\s*([\d,]+)/gi);
  const imgMatches = html.matchAll(/class="[^"]*product[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/gi);

  let i = 0;
  for (const m of nameMatches) {
    const name = m[1].replace(/<[^>]+>/g, "").trim();
    if (!name) continue;
    products.push({ id: `scraped-${Date.now()}-${i++}`, name, source: url });
  }
  return products;
}

function extractOpenGraph(html: string) {
  const get = (prop: string) => {
    const m = html.match(new RegExp(`<meta[^>]*property="og:${prop}"[^>]*content="([^"]+)"`, "i")) ||
              html.match(new RegExp(`<meta[^>]*content="([^"]+)"[^>]*property="og:${prop}"`, "i"));
    return m ? m[1].trim() : "";
  };
  return {
    title:       get("title") || "",
    description: get("description") || "",
    image:       get("image") || "",
    url:         get("url") || "",
    siteName:    get("site_name") || "",
  };
}

function extractJSONLD(html: string): object[] {
  const results: object[] = [];
  const regex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      if (data["@type"] === "Product" || data["@type"] === "ItemList") results.push(data);
      if (Array.isArray(data)) results.push(...data.filter((d: any) => d["@type"] === "Product"));
    } catch {}
  }
  return results;
}

function parseProductFromJSONLD(data: any, sourceUrl: string, idx: number): object {
  const offers = data.offers || {};
  const price = offers.price || offers.lowPrice || 0;
  const images = Array.isArray(data.image) ? data.image : (data.image ? [data.image] : []);
  return {
    id:          `scraped-${Date.now()}-${idx}`,
    sku:         data.sku || data.productID || `SKU-SCRAPED-${idx}`,
    name:        data.name || "Unknown Product",
    brand:       data.brand?.name || data.brand || "Unknown",
    category:    data.category || "Smart Home",
    shortDesc:   data.description?.slice(0, 200) || "",
    longDesc:    data.description || "",
    priceEGP:    typeof price === "number" ? price : parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0,
    originalPriceEGP: undefined,
    priceRange:  "Low" as const,
    images:      images.slice(0, 4).map((src: string) => ({ src, alt: data.name || "" })),
    inStock:     offers.availability?.includes("InStock") ?? true,
    stockQty:    10,
    rating:      data.aggregateRating?.ratingValue || 4.5,
    reviewCount: data.aggregateRating?.reviewCount || 0,
    protocol:    ["WiFi"],
    features:    [],
    specs:       [],
    compatibility: [],
    installation: "DIY" as const,
    warranty:    "1 Year",
    useCase:     ["Automation"],
    tags:        [data.brand?.name || ""].filter(Boolean),
    featured:    false,
    isNew:       false,
    isSale:      false,
    sourceUrl,
  };
}

function parseHTMLFallback(html: string, sourceUrl: string): object[] {
  const products: object[] = [];

  // Extract product names from common HTML patterns
  const namePatterns = [
    /<h2[^>]*class="[^"]*(?:product|title|name)[^"]*"[^>]*>([\s\S]*?)<\/h2>/gi,
    /<h3[^>]*class="[^"]*(?:product|title|name)[^"]*"[^>]*>([\s\S]*?)<\/h3>/gi,
    /class="product-title"[^>]*>([\s\S]*?)<\/[a-z]+>/gi,
    /class="woocommerce-loop-product__title"[^>]*>([\s\S]*?)<\/[a-z]+>/gi,
  ];

  const pricePatterns = [
    /amount"[^>]*>([\d,٠-٩]+(?:\.\d+)?)/g,
    /price"[^>]*>(?:EGP\s*)?([\d,]+)/gi,
    /\b(\d{3,6})\s*(?:EGP|جنيه|ج\.م)/gi,
  ];

  const imgPatterns = [
    /<img[^>]*class="[^"]*(?:product|thumbnail|wp-post-image)[^"]*"[^>]*src="([^"]+)"/gi,
    /<img[^>]*src="([^"]+)"[^>]*class="[^"]*(?:product|thumbnail)[^"]*"/gi,
  ];

  const names: string[] = [];
  const prices: string[] = [];
  const images: string[] = [];

  for (const pat of namePatterns) {
    let m; pat.lastIndex = 0;
    while ((m = pat.exec(html)) !== null) {
      const cleaned = m[1].replace(/<[^>]+>/g, "").trim();
      if (cleaned.length > 3 && cleaned.length < 200) names.push(cleaned);
    }
  }
  for (const pat of pricePatterns) {
    let m; pat.lastIndex = 0;
    while ((m = pat.exec(html)) !== null) prices.push(m[1].replace(/[,٬]/g, ""));
  }
  for (const pat of imgPatterns) {
    let m; pat.lastIndex = 0;
    while ((m = pat.exec(html)) !== null && !m[1].includes("placeholder")) images.push(m[1]);
  }

  const count = Math.min(names.length, 50);
  for (let i = 0; i < count; i++) {
    const price = prices[i] ? parseFloat(prices[i]) : 0;
    products.push({
      id:          `scraped-${Date.now()}-${i}`,
      sku:         `SCRAPED-${i + 1}`,
      name:        names[i],
      brand:       new URL(sourceUrl).hostname.replace("www.", "").split(".")[0].toUpperCase(),
      category:    "Smart Home",
      subcategory: "",
      protocol:    ["WiFi"],
      shortDesc:   `Imported from ${new URL(sourceUrl).hostname}`,
      longDesc:    "",
      features:    [],
      specs:       [],
      images:      images[i] ? [{ src: images[i], alt: names[i] }] : [],
      priceEGP:    price,
      priceRange:  price < 1000 ? "Low" : price < 5000 ? "Medium" : "Premium",
      inStock:     true,
      stockQty:    10,
      compatibility: [],
      installation: "DIY",
      warranty:    "1 Year",
      useCase:     [],
      rating:      4.5,
      reviewCount: 0,
      featured:    false,
      isNew:       false,
      isSale:      false,
      tags:        [],
      sourceUrl,
    });
  }

  return products;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = "https://" + targetUrl;

    // Validate URL
    let parsedUrl: URL;
    try { parsedUrl = new URL(targetUrl); }
    catch { return NextResponse.json({ error: "Invalid URL format" }, { status: 400 }); }

    // Fetch the page
    let html = "";
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Baytzaki/1.0; +https://baytzaki.com)",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ar,en;q=0.9",
        },
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) {
        return NextResponse.json({
          error: `Could not fetch page (HTTP ${response.status}). The site may block scraping.`,
          tip: "Try entering a product list page URL, not the homepage."
        }, { status: 422 });
      }

      html = await response.text();
    } catch (fetchErr) {
      return NextResponse.json({
        error: "Could not reach that URL. Check it's accessible and try again.",
        details: fetchErr instanceof Error ? fetchErr.message : "Fetch failed",
      }, { status: 422 });
    }

    if (!html || html.length < 100) {
      return NextResponse.json({ error: "Page returned empty content" }, { status: 422 });
    }

    // 1. Try JSON-LD structured data (most reliable)
    const jsonldData = extractJSONLD(html);
    if (jsonldData.length > 0) {
      const products = jsonldData.map((d, i) => parseProductFromJSONLD(d, targetUrl, i));
      return NextResponse.json({
        products,
        meta: { source: parsedUrl.hostname, method: "json-ld", count: products.length },
      });
    }

    // 2. Try OpenGraph (single product page)
    const og = extractOpenGraph(html);
    if (og.title && og.title.length > 3) {
      // Check if it looks like a product page with price
      const priceMatch = html.match(/(?:EGP|جنيه|ج\.م)\s*([\d,]+)/i) ||
                         html.match(/"price":\s*"?([\d.]+)"?/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : 0;

      return NextResponse.json({
        products: [{
          id:          `scraped-${Date.now()}-0`,
          sku:         `OG-${Date.now()}`,
          name:        og.title,
          brand:       og.siteName || parsedUrl.hostname.replace("www.", ""),
          category:    "Smart Home",
          subcategory: "",
          protocol:    ["WiFi"],
          shortDesc:   og.description?.slice(0, 200) || "",
          longDesc:    og.description || "",
          features:    [],
          specs:       [],
          images:      og.image ? [{ src: og.image, alt: og.title }] : [],
          priceEGP:    price,
          priceRange:  price < 1000 ? "Low" : price < 5000 ? "Medium" : "Premium",
          inStock:     true,
          stockQty:    10,
          compatibility: [],
          installation: "DIY",
          warranty:    "1 Year",
          useCase:     [],
          rating:      4.5,
          reviewCount: 0,
          featured:    false,
          isNew:       false,
          isSale:      false,
          tags:        [],
          sourceUrl:   targetUrl,
        }],
        meta: { source: parsedUrl.hostname, method: "opengraph", count: 1 },
      });
    }

    // 3. Fallback HTML parsing
    const products = parseHTMLFallback(html, targetUrl);
    if (products.length === 0) {
      return NextResponse.json({
        error: "No products could be extracted from this page.",
        tip: "Try a product listing page (like /shop or /products), or the site may require JavaScript to load products.",
        html_length: html.length,
      }, { status: 422 });
    }

    return NextResponse.json({
      products,
      meta: { source: parsedUrl.hostname, method: "html-fallback", count: products.length },
    });

  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json({
      error: "Internal server error during scraping",
      details: err instanceof Error ? err.message : "Unknown error",
    }, { status: 500 });
  }
}
