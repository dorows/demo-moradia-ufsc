import { useCallback, useEffect, useMemo, useState } from "react";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;

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
      <div className="skeleton skeleton-thumb" />
      <div className="skeleton skeleton-line short" />
      <div className="skeleton skeleton-line" />
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
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState("idle");

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

  const propertyTypes = useMemo(() => {
    return ["Todos", ...new Set(listings.map((item) => item.type))];
  }, [listings]);

  const neighborhoods = useMemo(() => {
    return ["Todos", ...new Set(listings.map((item) => item.neighborhood))];
  }, [listings]);

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

  async function handleEmailSubmit(event) {
    event.preventDefault();

    if (!FORMSPREE_ID) {
      setFormStatus("missing-config");
      return;
    }

    setFormStatus("submitting");

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar");
      }

      setEmail("");
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  }

  return (
    <main id="top">
      <section className="hero section-shell">
        <nav className="topbar" aria-label="Navegação principal">
          <a className="brand" href="#top" aria-label="Moradia UFSC">
            <span>M</span>
            Moradia UFSC
          </a>
          <a className="nav-link" href="#demo">
            Ver imóveis
          </a>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Beta para estudantes da UFSC</p>
            <h1>Aluguéis perto da UFSC antes que os bons anúncios sumam.</h1>
            <p className="hero-text">
              Monitoramos a OLX, ranqueamos por preço e distância do campus e mostramos
              o que importa para quem precisa morar perto da universidade.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#demo">
                Explorar imóveis
              </a>
              <a className="button secondary" href="#how-it-works">
                Como funciona
              </a>
            </div>
            <div className="metrics" aria-label="Indicadores do beta">
              <span>
                <strong>{loading ? "…" : listings.length}</strong> anúncios ao vivo
              </span>
              <span>
                <strong>3 km</strong> raio inicial
              </span>
              <span>
                <strong>1</strong> fonte ativa (OLX)
              </span>
            </div>
          </div>

          <aside className="signal-card animated-signal" aria-label="Fluxo de scraping em tempo real">
            <div className="signal-header">
              <div>
                <span className="status-pill">
                  <span aria-hidden="true" />
                  {meta?.source === "olx" ? "Scraper ativo" : "Modo demonstração"}
                </span>
                <p className="signal-label">
                  {meta?.updatedAt
                    ? `Atualizado ${formatUpdatedAt(meta.updatedAt)}`
                    : "Carregando feed…"}
                </p>
              </div>
              <div className="scan-indicator" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="scrape-window">
              <div className="window-bar" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="scan-line" aria-hidden="true" />
              <div className="feed-list">
                {animatedListings.length > 0 ? (
                  animatedListings.map((listing, index) => (
                    <div
                      className={`feed-row ${index === 0 ? "is-selected" : ""}`}
                      key={listing.id}
                    >
                      <span className="source-dot" aria-hidden="true" />
                      <div>
                        <strong>
                          {listing.type} em {listing.neighborhood}
                        </strong>
                        <small>
                          {listing.source} · {listing.foundAt}
                        </small>
                      </div>
                      <b>{currency.format(listing.price)}</b>
                    </div>
                  ))
                ) : (
                  <div className="feed-row feed-row--placeholder">
                    <span className="source-dot" aria-hidden="true" />
                    <div>
                      <strong>Aguardando anúncios…</strong>
                      <small>OLX · Florianópolis</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pipeline-steps" aria-label="Etapas automatizadas">
              <span>Coletar</span>
              <i aria-hidden="true" />
              <span>Limpar</span>
              <i aria-hidden="true" />
              <span>Rankear</span>
            </div>

            {featuredListing && (
              <div className="alert-preview">
                <div className="score-badge">
                  <small>score</small>
                  <strong>{featuredListing.score}</strong>
                </div>
                <div>
                  <p className="alert-kicker">Melhor do momento</p>
                  <h2>{featuredListing.title}</h2>
                  <div className="alert-tags">
                    <span>{featuredListing.distance.toFixed(1)} km da UFSC</span>
                    <span>{currency.format(featuredListing.price)}</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="value-strip section-shell" aria-label="Benefícios">
        <article>
          <span>01</span>
          <h3>Busca centralizada</h3>
          <p>Começamos pela OLX e expandimos para outras fontes em breve.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Ranking prático</h3>
          <p>Prioriza distância, preço e anúncios recém-publicados.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Alertas em breve</h3>
          <p>Cadastre seu email para ser avisado quando novas fontes entrarem.</p>
        </article>
      </section>

      <section className="demo section-shell" id="demo">
        <div className="section-heading">
          <p className="eyebrow">Radar ao vivo</p>
          <h2>Moradias próximas ao campus</h2>
          <p>
            Anúncios reais da OLX para Florianópolis, filtrados pelos bairros perto da UFSC.
            {meta?.updatedAt && (
              <>
                {" "}
                Última atualização: {formatUpdatedAt(meta.updatedAt)}.
              </>
            )}
          </p>
          {meta?.message && <p className="status-banner">{meta.message}</p>}
          {error && (
            <div className="status-banner status-banner--error">
              <span>{error}</span>
              <button type="button" className="button secondary small" onClick={loadListings}>
                Tentar novamente
              </button>
            </div>
          )}
        </div>

        <div className="search-panel">
          <label>
            Tipo
            <select
              value={filters.type}
              onChange={(event) => updateFilter("type", event.target.value)}
              disabled={loading}
            >
              {propertyTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label>
            Bairro
            <select
              value={filters.neighborhood}
              onChange={(event) => updateFilter("neighborhood", event.target.value)}
              disabled={loading}
            >
              {neighborhoods.map((neighborhood) => (
                <option key={neighborhood}>{neighborhood}</option>
              ))}
            </select>
          </label>

          <label>
            Até {currency.format(filters.maxPrice)}
            <input
              type="range"
              min="700"
              max="2200"
              step="50"
              value={filters.maxPrice}
              onChange={(event) => updateFilter("maxPrice", Number(event.target.value))}
              disabled={loading}
            />
          </label>

          <label>
            Até {filters.maxDistance.toFixed(1)} km
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.1"
              value={filters.maxDistance}
              onChange={(event) => updateFilter("maxDistance", Number(event.target.value))}
              disabled={loading}
            />
          </label>
        </div>

        <div className="result-bar">
          <strong>{loading ? "…" : filteredListings.length}</strong> imóveis encontrados no
          perfil atual
        </div>

        <div className="listing-grid">
          {loading &&
            Array.from({ length: 6 }).map((_, index) => <ListingSkeleton key={index} />)}

          {!loading &&
            filteredListings.map((listing) => (
              <a
                className="listing-card listing-card--link"
                href={listing.url}
                key={listing.id}
                target="_blank"
                rel="noopener noreferrer"
              >
                {listing.imageUrl && (
                  <img
                    className="listing-thumb"
                    src={listing.imageUrl}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div className="listing-topline">
                  <span>{listing.type}</span>
                  <strong>{listing.score}</strong>
                </div>
                <h3>{listing.title}</h3>
                <p className="location">
                  {listing.neighborhood} · {listing.distance.toFixed(1)} km da UFSC
                </p>
                <div className="listing-price">{currency.format(listing.price)}</div>
                <div className="tag-list">
                  {listing.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <footer>
                  <span>{listing.source}</span>
                  <span>{listing.foundAt}</span>
                </footer>
              </a>
            ))}

          {!loading && filteredListings.length === 0 && (
            <div className="empty-state">
              <h3>Nenhum imóvel nesse recorte</h3>
              <p>Amplie o preço ou a distância para visualizar mais oportunidades.</p>
            </div>
          )}
        </div>
      </section>

      <section className="workflow section-shell" id="how-it-works">
        <div className="section-heading compact">
          <p className="eyebrow">Como funciona</p>
          <h2>Do anúncio bruto ao alerta útil</h2>
        </div>
        <div className="workflow-grid">
          <article>
            <span>Coletar</span>
            <p>Buscamos anúncios públicos na OLX com foco nos bairros da UFSC.</p>
          </article>
          <article>
            <span>Normalizar</span>
            <p>Preço, tipo, localização, fonte e data entram em um formato único.</p>
          </article>
          <article>
            <span>Priorizar</span>
            <p>O ranking destaca anúncios baratos, próximos e recém-publicados.</p>
          </article>
          <article>
            <span>Alertar</span>
            <p>Em breve: avisos por email quando surgir algo no seu perfil.</p>
          </article>
        </div>
      </section>

      <section className="cta section-shell">
        <div>
          <p className="eyebrow">Lista de espera</p>
          <h2>Quer receber alertas quando surgir a moradia ideal?</h2>
        </div>
        <form className="interest-form" onSubmit={handleEmailSubmit}>
          <input
            type="email"
            placeholder="seu@email.com"
            aria-label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={formStatus === "submitting"}
          />
          <button type="submit" disabled={formStatus === "submitting"}>
            {formStatus === "submitting" ? "Enviando…" : "Quero receber alertas"}
          </button>
        </form>
        {formStatus === "success" && (
          <p className="form-feedback form-feedback--success">
            Email cadastrado! Avisaremos quando houver novidades.
          </p>
        )}
        {formStatus === "error" && (
          <p className="form-feedback form-feedback--error">
            Não foi possível enviar. Tente novamente em instantes.
          </p>
        )}
        {formStatus === "missing-config" && (
          <p className="form-feedback form-feedback--error">
            Formulário ainda não configurado. Defina VITE_FORMSPREE_ID no Vercel.
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
