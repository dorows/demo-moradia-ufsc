const TYPE_IMAGES = {
  Quarto: "/showcase/quarto.svg",
  Kitnet: "/showcase/kitnet.svg",
  Apartamento: "/showcase/apartamento.svg",
  Casa: "/showcase/casa.svg",
  Outro: "/showcase/default.svg",
};

const VARIANTS = [
  "/showcase/variant-a.svg",
  "/showcase/variant-b.svg",
  "/showcase/variant-c.svg",
];

export function getShowcaseImageUrl(listing) {
  const typeImage = TYPE_IMAGES[listing.type] ?? TYPE_IMAGES.Outro;

  if (!listing.id) return typeImage;

  const hash = String(listing.id)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  if (hash % 3 === 0) {
    return typeImage;
  }

  return VARIANTS[hash % VARIANTS.length];
}
