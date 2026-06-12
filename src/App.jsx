import { useCallback, useEffect, useMemo, useState } from "react";
import AiBestDealModal from "./components/AiBestDealModal.jsx";
import AiSearch from "./components/AiSearch.jsx";
import AnimatedRange from "./components/AnimatedRange.jsx";
import AnimatedSelect from "./components/AnimatedSelect.jsx";
import EmailShowcase from "./components/EmailShowcase.jsx";
import OlxShowcase from "./components/OlxShowcase.jsx";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatUpdatedAt(isoString) {
  if (!isoString) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function ListingSkeleton() {
  return (
    <article className="listing-card listing-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line" />
      <div className="skeleton skeleton-stats" />
      <div className="skeleton skeleton-line medium" />
    </article>
  );
}

function App() {
  const [listings, setListings] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "Todos",
    neighborhood: "Todos",
    maxPrice: 1800,
    maxDistance: 3,
  });
  const [aiRankedIds, setAiRankedIds] = useState(null);
  const [aiScores, setAiScores] = useState({});
  const [aiBestPick, setAiBestPick] = useState(null);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/listings");
      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao carregar anúncios`);
      }

      const data = await response.json();
      setListings(data.listings ?? []);
      setMeta(data.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar anúncios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  useEffect(() => {
    setAiRankedIds(null);
    setAiScores({});
    setAiBestPick(null);
  }, [filters]);

  const propertyTypes = useMemo(
    () => ["Todos", ...new Set(listings.map((item) => item.type))],
    [listings]
  );

  const neighborhoods = useMemo(
    () => ["Todos", ...new Set(listings.map((item) => item.neighborhood))],
    [listings]
  );

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesType = filters.type === "Todos" || listing.type === filters.type;
      const matchesNeighborhood =
        filters.neighborhood === "Todos" || listing.neighborhood === filters.neighborhood;

      return (
        matchesType &&
        matchesNeighborhood &&
        listing.price <= filters.maxPrice &&
        listing.distance <= filters.maxDistance
      );
    });
  }, [filters, listings]);

  const displayedListings = useMemo(() => {
    if (!aiRankedIds?.length) {
      return [...filteredListings].sort((a, b) => b.score - a.score);
    }

    const orderMap = new Map(aiRankedIds.map((id, index) => [id, index]));
    return [...filteredListings].sort((a, b) => {
      const rankA = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const rankB = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return rankA - rankB;
    });
  }, [filteredListings, aiRankedIds]);

  function handleAiRerank(orderedIds, scores, query) {
    setAiRankedIds(orderedIds);
    setAiScores(scores);

    const topId = orderedIds[0];
    const listing = filteredListings.find((item) => item.id === topId);
    if (listing) {
      setAiBestPick({ listing, relevance: scores[topId], query });
    }
  }

  function handleAiClear() {
    setAiRankedIds(null);
    setAiScores({});
    setAiBestPick(null);
  }

  const bestListing = [...filteredListings].sort((a, b) => b.score - a.score)[0];
  const featuredListing = bestListing ?? listings[0];
  const animatedListings = featuredListing
    ? [
        featuredListing,
        ...listings.filter((listing) => listing.id !== featuredListing.id).slice(0, 3),
      ]
    : [];

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main id="top">
      <section className="hero section-shell">
        <nav className="topbar" aria-label="Navegação principal">
          <a className="brand" href="#top" aria-label="Moradias UFSC">
            <img className="brand__logo" src="/logo.png" alt="" width={36} height={36} />
            Moradias UFSC
          </a>
          <div className="topbar__links">
            <a className="nav-link" href="#olx">
              OLX ao vivo
            </a>
            <a className="nav-link nav-link--accent" href="#demo">
              Explorar
            </a>
          </div>
        </nav>

        <div className="hero__content">
          <p className="eyebrow">
            <span className="eyebrow__pulse" aria-hidden="true" />
            Beta · Florianópolis
          </p>
          <h1>
            Moradia perto da <em>UFSC</em>, antes que suma.
          </h1>
          <p className="hero-text">
            Agregamos anúncios da OLX, calculamos distância do campus e ranqueamos por
            custo-benefício — tudo num só lugar para estudantes.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#demo">
              Ver imóveis
              <span className="button__arrow" aria-hidden="true">→</span>
            </a>
            <a className="button secondary" href="#waitlist">
              Receber alertas
            </a>
          </div>
          <div className="metrics" aria-label="Indicadores">
            <article className="metric-chip">
              <strong>{loading ? "…" : listings.length}</strong>
              <span>ao vivo</span>
            </article>
            <article className="metric-chip">
              <strong>3 km</strong>
              <span>raio UFSC</span>
            </article>
            <article className="metric-chip metric-chip--live">
              <strong>OLX</strong>
              <span>conectado</span>
            </article>
          </div>
        </div>
      </section>

      <OlxShowcase
        listings={listings}
        meta={meta}
        featuredListing={featuredListing}
        animatedListings={animatedListings}
      />

      <section className="demo section-shell" id="demo">
        <div className="section-heading">
          <p className="eyebrow">Filtros inteligentes</p>
          <h2>Encontre seu perfil de moradia</h2>
          <p>
            Ajuste tipo, bairro, preço e distância. Os resultados atualizam instantaneamente.
            {meta?.updatedAt && (
              <> Última sync: {formatUpdatedAt(meta.updatedAt)}.</>
            )}
          </p>
          {error && (
            <div className="status-banner status-banner--error">
              <span>{error}</span>
              <button type="button" className="button secondary small" onClick={loadListings}>
                Tentar novamente
              </button>
            </div>
          )}
        </div>

        <AiSearch
          listings={filteredListings}
          onRerank={handleAiRerank}
          onClear={handleAiClear}
          disabled={loading}
        />

        <div className="filter-deck">
          <AnimatedSelect
            label="Tipo de imóvel"
            value={filters.type}
            options={propertyTypes}
            onChange={(value) => updateFilter("type", value)}
            disabled={loading}
            icon="⌂"
          />
          <AnimatedSelect
            label="Bairro"
            value={filters.neighborhood}
            options={neighborhoods}
            onChange={(value) => updateFilter("neighborhood", value)}
            disabled={loading}
            icon="◎"
          />
          <AnimatedRange
            label="Preço máximo"
            value={filters.maxPrice}
            min={700}
            max={2200}
            step={50}
            formatValue={(v) => currency.format(v)}
            onChange={(value) => updateFilter("maxPrice", value)}
            disabled={loading}
          />
          <AnimatedRange
            label="Distância máxima"
            value={filters.maxDistance}
            min={0.5}
            max={4}
            step={0.1}
            formatValue={(v) => `${v.toFixed(1)} km`}
            onChange={(value) => updateFilter("maxDistance", value)}
            disabled={loading}
          />
        </div>

        <div className="result-bar">
          <span className="result-bar__count">
            <strong>{loading ? "…" : filteredListings.length}</strong>
          </span>
          <span>imóveis no seu perfil</span>
        </div>

        <div className="listing-grid">
          {loading &&
            Array.from({ length: 6 }).map((_, index) => <ListingSkeleton key={index} />)}

          {!loading &&
            displayedListings.map((listing, index) => (
              <a
                className="listing-card listing-card--link"
                href={listing.url}
                key={listing.id}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver ${listing.title} na OLX`}
                style={{ "--card-index": index % 6 }}
              >
                <div className="listing-card__header">
                  <span className="listing-card__type">{listing.type}</span>
                  <div className="listing-card__badges">
                    {aiRankedIds && aiScores[listing.id] != null && (
                      <span className="listing-card__ai" title="Relevância da busca por IA">
                        IA
                      </span>
                    )}
                    <span className="listing-card__score" title="Score de custo-benefício">
                      {listing.score}
                    </span>
                  </div>
                </div>
                <h3>{listing.title}</h3>
                <div className="listing-card__stats">
                  <div>
                    <strong>{currency.format(listing.price)}</strong>
                    <span>aluguel/mês</span>
                  </div>
                  <div>
                    <strong>{listing.distance.toFixed(1)} km</strong>
                    <span>da UFSC</span>
                  </div>
                  <div>
                    <strong>{listing.neighborhood}</strong>
                    <span>bairro</span>
                  </div>
                </div>
                <div className="tag-list">
                  {listing.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="listing-card__meta">
                  <span>{listing.source}</span>
                  <span>{listing.foundAt}</span>
                </div>
                <div className="listing-card__cta-bar">
                  Ver fotos e detalhes na OLX
                  <span aria-hidden="true">→</span>
                </div>
              </a>
            ))}

          {!loading && displayedListings.length === 0 && (
            <div className="empty-state">
              <h3>Nenhum imóvel nesse recorte</h3>
              <p>Amplie o preço ou a distância para ver mais oportunidades.</p>
            </div>
          )}
        </div>
      </section>

      <section className="workflow section-shell" id="how-it-works">
        <div className="section-heading compact">
          <p className="eyebrow">Como funciona</p>
          <h2>Simples de usar, poderoso por baixo</h2>
        </div>
        <div className="workflow-grid">
          <article>
            <span>01</span>
            <h3>Monitoramos</h3>
            <p>Scraper busca anúncios da OLX nos bairros próximos à UFSC.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Organizamos</h3>
            <p>Preço, tipo, bairro e distância do campus em formato único.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Ranqueamos</h3>
            <p>Score combina custo, proximidade e recência do anúncio.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Alertamos</h3>
            <p>Lista de espera para avisos quando surgir algo no seu perfil.</p>
          </article>
        </div>
      </section>

      <EmailShowcase />

      <AiBestDealModal pick={aiBestPick} onClose={() => setAiBestPick(null)} />
    </main>
  );
}

export default App;
