const https = require("https");

const RSS_URL =
  "https://news.google.com/rss/search?q=agriculture+India&hl=hi&gl=IN&ceid=IN:hi";

// Category keyword mapping for tagging articles
const CATEGORY_KEYWORDS = {
  Scheme: ["scheme", "yojana", "subsidy", "pm kisan", "benefit", "welfare", "सरकार", "योजना"],
  Policy: ["policy", "law", "regulation", "cabinet", "ministry", "msp", "budget", "नीति"],
  Farming: ["kharif", "rabi", "sowing", "harvest", "crop", "paddy", "wheat", "rice", "खेती", "फसल"],
  Organic: ["organic", "natural farming", "bio", "जैविक"],
  Irrigation: ["irrigation", "water", "drip", "canal", "सिंचाई"],
  Technology: ["technology", "tech", "ai", "drone", "digital", "app", "satellite", "तकनीक"],
  Insurance: ["insurance", "bima", "fasal bima", "बीमा"],
  Export: ["export", "import", "trade", "market", "apeda", "निर्यात"],
};

function detectCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return cat;
    }
  }
  return "Farming"; // default
}

function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function extractCDATA(str) {
  const match = str.match(/\<\!\[CDATA\[([\s\S]*?)\]\]\>/);
  return match ? match[1].trim() : str.trim();
}

function extractLink(block) {
  // Google News RSS: <link> is a plain text node between tags (not wrapped like other tags)
  // It appears as: <link>https://...</link> OR as a sibling text outside child elements
  // Try standard child tag first
  const childMatch = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (childMatch) {
    const val = extractCDATA(childMatch[1]).trim();
    if (val.startsWith("http")) return val;
  }
  // Fallback: look for <link> text node pattern used by Google RSS (text between tags)
  const siblingMatch = block.match(/<link\/>\s*([^<]+)/i)
    || block.match(/<link>\s*([^<]+)/i);
  if (siblingMatch) {
    const val = siblingMatch[1].trim();
    if (val.startsWith("http")) return val;
  }
  // Try guid which often has the real URL
  const guidMatch = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
  if (guidMatch) {
    const val = extractCDATA(guidMatch[1]).trim();
    if (val.startsWith("http")) return val;
  }
  return "https://news.google.com";
}

function extractImageUrl(block, rawDescription) {
  const mediaMatch = block.match(/<media:(?:content|thumbnail)[^>]*url=["']([^"']+)["']/i);
  if (mediaMatch && mediaMatch[1]) return mediaMatch[1];

  const enclosureMatch = block.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  if (enclosureMatch && enclosureMatch[1]) return enclosureMatch[1];

  const imgMatch = (rawDescription || "").match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

  return null;
}

function parseRSS(xml) {
  const items = [];
  // Google RSS wraps <link> as a text sibling — split on <item> boundaries carefully
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let index = 0;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const getTag = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
      const m = block.match(r);
      return m ? extractCDATA(m[1]) : "";
    };

    const title = stripHtml(getTag("title"));
    const link = extractLink(block);
    const pubDate = getTag("pubDate");
    const rawDescription = getTag("description");
    // Strip ALL html tags (including anchor tags Google News embeds in descriptions)
    const description = stripHtml(rawDescription);
    const source = getTag("source") || "Google News";
    const imageUrl = extractImageUrl(block, rawDescription);

    if (!title) continue;

    const parsedDate = pubDate ? new Date(pubDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

    items.push({
      id: String(index + 1),
      title,
      description: description || title,
      url: link,
      imageUrl: imageUrl || null,
      publishedAt: parsedDate,
      source: stripHtml(source) || "Google News",
      category: detectCategory(title, description),
    });

    index++;
    if (index >= 30) break; // limit to 30 articles
  }

  return items;
}

function fetchRSS() {
  return new Promise((resolve, reject) => {
    const req = https.get(
      RSS_URL,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; KrishiMittra/1.0; +https://krishimittra.app)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        timeout: 10000,
      },
      (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location;
          https.get(redirectUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (res2) => {
            let data = "";
            res2.on("data", (chunk) => (data += chunk));
            res2.on("end", () => resolve(data));
            res2.on("error", reject);
          }).on("error", reject);
          return;
        }

        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
        res.on("error", reject);
      }
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("RSS fetch timed out"));
    });

    req.on("error", reject);
  });
}

// Simple in-memory cache (10 minutes)
let cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 10 * 60 * 1000; // 10 min

const getNews = async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if still fresh
    if (cache.data && now - cache.timestamp < CACHE_DURATION) {
      return res.status(200).json({
        success: true,
        source: "cache",
        count: cache.data.length,
        news: cache.data,
      });
    }

    const xml = await fetchRSS();
    const articles = parseRSS(xml);

    if (articles.length === 0) {
      return res.status(502).json({
        success: false,
        message: "Could not parse RSS feed. Using fallback.",
      });
    }

    // Update cache
    cache = { data: articles, timestamp: now };

    return res.status(200).json({
      success: true,
      source: "rss",
      count: articles.length,
      news: articles,
    });
  } catch (error) {
    console.error("News fetch error:", error.message);

    // Return stale cache if available
    if (cache.data) {
      return res.status(200).json({
        success: true,
        source: "stale_cache",
        count: cache.data.length,
        news: cache.data,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch news. Please try again later.",
    });
  }
};

module.exports = { getNews };
