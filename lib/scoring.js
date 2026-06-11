const PRICE_MIN = 500;
const PRICE_MAX = 3000;

export function inferPropertyType(title) {
  const text = title.toLowerCase();

  if (/quarto|república|republica|vaga/.test(text)) return "Quarto";
  if (/kitnet|kitinete|studio|estúdio|estudio|loft/.test(text)) return "Kitnet";
  if (/apartamento|ap\.|cobertura|flat/.test(text)) return "Apartamento";
  if (/casa|sobrado/.test(text)) return "Casa";

  return "Outro";
}

export function buildTags(listing) {
  const tags = [];

  if (listing.distance <= 1) tags.push("perto da UFSC");
  if (listing.price <= 1000) tags.push("menor preço");
  if (listing.recencyHours != null && listing.recencyHours <= 24) tags.push("recém encontrado");
  if (listing.price <= 1300 && listing.distance <= 2) tags.push("bom custo-benefício");

  if (tags.length === 0) tags.push("via OLX");

  return tags.slice(0, 3);
}

function priceScore(price) {
  const clamped = Math.max(PRICE_MIN, Math.min(PRICE_MAX, price));
  const ratio = (PRICE_MAX - clamped) / (PRICE_MAX - PRICE_MIN);
  return Math.round(ratio * 100);
}

function distanceScore(distance) {
  const clamped = Math.max(0.3, Math.min(5, distance));
  const ratio = (5 - clamped) / (5 - 0.3);
  return Math.round(ratio * 100);
}

function recencyScore(recencyHours) {
  if (recencyHours == null) return 50;
  if (recencyHours <= 6) return 100;
  if (recencyHours <= 24) return 85;
  if (recencyHours <= 72) return 60;
  if (recencyHours <= 168) return 40;
  return 20;
}

export function computeScore(listing) {
  const price = priceScore(listing.price);
  const distance = distanceScore(listing.distance);
  const recency = recencyScore(listing.recencyHours);

  return Math.round(price * 0.4 + distance * 0.4 + recency * 0.2);
}

export function formatFoundAt(recencyHours) {
  if (recencyHours == null) return "Recente";
  if (recencyHours < 1) return "Agora";
  if (recencyHours <= 24) return "Hoje";
  if (recencyHours <= 48) return "Ontem";
  if (recencyHours <= 168) return `Há ${Math.round(recencyHours / 24)} dias`;
  return "Há mais de uma semana";
}
