import { gotScraping } from "got-scraping";
import { resolveNeighborhood, CAMPUS_BAIRROS } from "./neighborhoods.js";
import { getShowcaseImageUrl } from "./showcase-images.js";
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
    id: "demo-1",
    title: "Quarto individual mobiliado",
    type: "Quarto",
    neighborhood: "Trindade",
    price: 950,
    distance: 0.8,
    source: "OLX",
    foundAt: "Hoje",
    score: 94,
    tags: ["perto da UFSC", "contas inclusas"],
    url: OLX_BASE,
  },
  {
    id: "demo-2",
    title: "Kitnet compacta no Pantanal",
    type: "Kitnet",
    neighborhood: "Pantanal",
    price: 1450,
    distance: 1.2,
    source: "OLX",
    foundAt: "Hoje",
    score: 88,
    tags: ["recém encontrado", "sem garagem"],
    url: OLX_BASE,
  },
  {
    id: "demo-3",
    title: "Apartamento compartilhado",
    type: "Apartamento",
    neighborhood: "Carvoeira",
    price: 1200,
    distance: 0.7,
    source: "OLX",
    foundAt: "Ontem",
    score: 91,
    tags: ["bom custo-benefício", "dividir despesas"],
    url: OLX_BASE,
  },
  {
    id: "demo-4",
    title: "Studio arejado próximo ao campus",
    type: "Kitnet",
    neighborhood: "Córrego Grande",
    price: 1750,
    distance: 2.1,
    source: "OLX",
    foundAt: "Ontem",
    score: 76,
    tags: ["contrato formal", "atenção ao preço"],
    url: OLX_BASE,
  },
  {
    id: "demo-5",
    title: "Vaga em república estudantil",
    type: "Quarto",
    neighborhood: "Serrinha",
    price: 780,
    distance: 1.6,
    source: "OLX",
    foundAt: "Hoje",
    score: 84,
    tags: ["menor preço", "ambiente estudantil"],
    url: OLX_BASE,
  },
  {
    id: "demo-6",
    title: "Apartamento 2 quartos para dividir",
    type: "Apartamento",
    neighborhood: "Santa Mônica",
    price: 1550,
    distance: 2.8,
    source: "OLX",
    foundAt: "Há 2 dias",
    score: 72,
    tags: ["mais espaço", "ônibus próximo"],
    url: OLX_BASE,
  },
].map((listing) => ({ ...listing, imageUrl: getShowcaseImageUrl(listing), isFallback: true }));

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
  };

  listing.foundAt = formatFoundAt(listing.recencyHours);
  listing.score = computeScore(listing);
  listing.tags = buildTags(listing);
  listing.imageUrl = getShowcaseImageUrl(listing);

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
          message: "Modo demonstração — dados ilustrativos com fotos de exemplo.",
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
            ? `Modo demonstração — ${error.message}`
            : "Modo demonstração — dados ilustrativos.",
      },
    };
  }
}
