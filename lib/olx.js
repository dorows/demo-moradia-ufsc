import { gotScraping } from "got-scraping";
import { resolveNeighborhood, CAMPUS_BAIRROS } from "./neighborhoods.js";
import {
  inferPropertyType,
  computeScore,
  buildTags,
  formatFoundAt,
} from "./scoring.js";

const OLX_BASE =
  "https://www.olx.com.br/imoveis/aluguel/estado-sc/florianopolis-e-regiao";

const SEARCH_URLS = [
  OLX_BASE,
  `${OLX_BASE}?q=trindade`,
  `${OLX_BASE}?q=pantanal+ufsc`,
];

export const FALLBACK_LISTINGS = [
  {
    id: "fallback-1",
    title: "Quarto individual mobiliado",
    type: "Quarto",
    neighborhood: "Trindade",
    price: 950,
    distance: 0.8,
    source: "OLX",
    foundAt: "Exemplo",
    score: 94,
    tags: ["perto da UFSC", "dados de exemplo"],
    url: OLX_BASE,
    imageUrl: null,
    isFallback: true,
  },
];

function parsePrice(priceValue) {
  if (!priceValue) return null;
  const digits = String(priceValue).replace(/[^\d]/g, "");
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function extractAdsFromHtml(html) {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return [];

  try {
    const data = JSON.parse(match[1]);
    return data?.props?.pageProps?.ads ?? [];
  } catch {
    return [];
  }
}

function normalizeAd(ad) {
  const price = parsePrice(ad.priceValue ?? ad.price);
  if (!price) return null;

  const locationText =
    ad.locationDetails?.neighbourhood ||
    ad.location?.split(",").pop()?.trim() ||
    ad.location ||
    "";

  const { neighborhood, distance } = resolveNeighborhood(locationText);
  const recencyHours =
    ad.lastBumpAgeSecs != null
      ? Number(ad.lastBumpAgeSecs) / 3600
      : ad.date
        ? (Date.now() / 1000 - ad.date) / 3600
        : null;

  const type = inferPropertyType(ad.subject ?? "");
  const listing = {
    id: String(ad.listId ?? ad.url),
    title: ad.subject ?? "Imóvel para alugar",
    type,
    neighborhood,
    price,
    distance,
    source: "OLX",
    recencyHours,
    url: ad.url ?? OLX_BASE,
    imageUrl: ad.images?.[0]?.original ?? null,
  };

  listing.foundAt = formatFoundAt(listing.recencyHours);
  listing.score = computeScore(listing);
  listing.tags = buildTags(listing);

  return listing;
}

function isCampusRelevant(listing) {
  return (
    listing.distance <= 3.5 ||
    CAMPUS_BAIRROS.some(
      (bairro) => bairro.toLowerCase() === listing.neighborhood.toLowerCase()
    )
  );
}

async function fetchSearchPage(url) {
  const response = await gotScraping({ url, timeout: { request: 8000 } });
  if (response.statusCode !== 200) {
    throw new Error(`OLX respondeu com status ${response.statusCode}`);
  }
  return response.body;
}

export async function scrapeOlxListings() {
  const seen = new Set();
  const listings = [];

  for (const url of SEARCH_URLS) {
    const html = await fetchSearchPage(url);
    const ads = extractAdsFromHtml(html);

    for (const ad of ads) {
      const listing = normalizeAd(ad);
      if (!listing || seen.has(listing.id)) continue;
      if (!isCampusRelevant(listing)) continue;

      seen.add(listing.id);
      listings.push(listing);
    }
  }

  listings.sort((a, b) => b.score - a.score);
  return listings;
}

export async function getListings() {
  try {
    const listings = await scrapeOlxListings();
    if (listings.length === 0) {
      return {
        listings: FALLBACK_LISTINGS,
        meta: {
          source: "fallback",
          count: FALLBACK_LISTINGS.length,
          updatedAt: new Date().toISOString(),
          message: "Não foi possível carregar anúncios ao vivo. Exibindo dados de exemplo.",
        },
      };
    }

    return {
      listings,
      meta: {
        source: "olx",
        count: listings.length,
        updatedAt: new Date().toISOString(),
        message: null,
      },
    };
  } catch (error) {
    return {
      listings: FALLBACK_LISTINGS,
      meta: {
        source: "fallback",
        count: FALLBACK_LISTINGS.length,
        updatedAt: new Date().toISOString(),
        message:
          error instanceof Error
            ? `Erro ao buscar OLX: ${error.message}. Exibindo dados de exemplo.`
            : "Erro ao buscar OLX. Exibindo dados de exemplo.",
      },
    };
  }
}
