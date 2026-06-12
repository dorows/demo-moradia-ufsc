const OPENROUTER_RERANK_URL = "https://openrouter.ai/api/v1/rerank";
const DEFAULT_MODEL = "nvidia/llama-nemotron-rerank-vl-1b-v2:free";
const MAX_QUERY_LENGTH = 200;
const MAX_LISTINGS = 50;

export class RerankUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = "RerankUnavailableError";
    this.statusCode = 503;
  }
}

export class RerankRateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = "RerankRateLimitError";
    this.statusCode = 429;
  }
}

export function listingToDocument(listing) {
  const tags = Array.isArray(listing.tags) ? listing.tags.join(", ") : "";
  return {
    text: `${listing.title}. ${listing.type} em ${listing.neighborhood}. ${listing.price} reais. ${listing.distance}km da UFSC. ${tags}`,
  };
}

export async function rerankListings(query, listings, options = {}) {
  const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new RerankUnavailableError("Busca por IA indisponível");
  }

  const trimmedQuery = String(query ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  if (!trimmedQuery) {
    return { orderedIds: [], scores: {}, reply: "" };
  }

  if (!listings?.length) {
    return { orderedIds: [], scores: {}, reply: "Nenhum imóvel para ordenar." };
  }

  const model = options.model ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;
  const slice = listings.slice(0, MAX_LISTINGS);
  const documents = slice.map(listingToDocument);

  const response = await fetch(OPENROUTER_RERANK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer":
        process.env.OPENROUTER_SITE_URL ?? "https://demo-moradia-ufsc.vercel.app",
      "X-OpenRouter-Title": process.env.OPENROUTER_SITE_NAME ?? "Moradias UFSC",
    },
    body: JSON.stringify({
      model,
      query: trimmedQuery,
      documents,
      top_n: documents.length,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new RerankRateLimitError(
        "Limite diário da IA atingido. Tente amanhã ou ajuste os filtros."
      );
    }
    const errorBody = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];

  const scores = {};
  const orderedIds = [];
  const sorted = [...results].sort((a, b) => b.relevance_score - a.relevance_score);

  for (const result of sorted) {
    const listing = slice[result.index];
    if (listing && !orderedIds.includes(listing.id)) {
      orderedIds.push(listing.id);
      scores[listing.id] = result.relevance_score;
    }
  }

  for (const listing of slice) {
    if (!orderedIds.includes(listing.id)) {
      orderedIds.push(listing.id);
    }
  }

  const count = orderedIds.length;
  const reply =
    count === 1
      ? "Ordenamos 1 imóvel por relevância para sua busca."
      : `Ordenamos ${count} imóveis por relevância para sua busca.`;

  return { orderedIds, scores, reply };
}
