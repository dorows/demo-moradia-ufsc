/** Approximate distance (km) from UFSC campus by bairro name. */
export const UFSC_NEIGHBORHOODS = {
  trindade: { name: "Trindade", distance: 0.8 },
  pantanal: { name: "Pantanal", distance: 1.2 },
  carvoeira: { name: "Carvoeira", distance: 0.7 },
  "córrego grande": { name: "Córrego Grande", distance: 2.1 },
  "corrego grande": { name: "Córrego Grande", distance: 2.1 },
  serrinha: { name: "Serrinha", distance: 1.6 },
  "santa mônica": { name: "Santa Mônica", distance: 2.8 },
  "santa monica": { name: "Santa Mônica", distance: 2.8 },
  itacorubi: { name: "Itacorubi", distance: 2.5 },
  agronômica: { name: "Agronômica", distance: 3.2 },
  agronomica: { name: "Agronômica", distance: 3.2 },
  coqueiros: { name: "Coqueiros", distance: 4.5 },
  centro: { name: "Centro", distance: 5.0 },
};

export const CAMPUS_BAIRROS = [
  "Trindade",
  "Pantanal",
  "Carvoeira",
  "Córrego Grande",
  "Serrinha",
  "Santa Mônica",
];

const DEFAULT_DISTANCE = 3.5;

export function resolveNeighborhood(locationText) {
  if (!locationText) {
    return { neighborhood: "Florianópolis", distance: DEFAULT_DISTANCE };
  }

  const normalized = locationText.toLowerCase();

  for (const [key, value] of Object.entries(UFSC_NEIGHBORHOODS)) {
    if (normalized.includes(key)) {
      return { neighborhood: value.name, distance: value.distance };
    }
  }

  const parts = locationText.split(/[,\-–]/).map((p) => p.trim());
  const lastPart = parts[parts.length - 1] || locationText;

  return { neighborhood: lastPart, distance: DEFAULT_DISTANCE };
}

export function isNearCampus(distance, maxKm = 4) {
  return distance <= maxKm;
}
