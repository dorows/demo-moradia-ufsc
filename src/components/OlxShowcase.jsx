const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatUpdatedAt(isoString) {
  if (!isoString) return "agora";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(isoString));
}

export default function OlxShowcase({
  listings,
  meta,
  featuredListing,
  animatedListings,
  loading,
}) {
  const isLive = meta?.source === "olx";
  const marqueeListings = [...listings, ...listings].slice(0, 16);

  return (
    <section className="olx-showcase section-shell" id="olx" aria-label="Showcase OLX ao vivo">
      <div className="olx-showcase__glow" aria-hidden="true" />

      <header className="olx-showcase__header">
        <div className="olx-showcase__brand">
          <span className="olx-badge">
            <span className="olx-badge__dot" />
            OLX
          </span>
          <p className="eyebrow">Fonte conectada</p>
          <h2>Radar ao vivo da OLX perto da UFSC</h2>
          <p>
            Coletamos anúncios públicos, normalizamos preço e distância do campus e ranqueamos
            o que faz sentido para estudantes — atualizado{" "}
            {meta?.updatedAt ? formatUpdatedAt(meta.updatedAt) : "em tempo real"}.
          </p>
        </div>

        <div className="olx-stats">
          <article className="olx-stat">
            <strong>{loading ? "…" : listings.length}</strong>
            <span>anúncios indexados</span>
          </article>
          <article className="olx-stat">
            <strong>{isLive ? "LIVE" : "DEMO"}</strong>
            <span>{isLive ? "scraper ativo" : "modo fallback"}</span>
          </article>
          <article className="olx-stat">
            <strong>~30m</strong>
            <span>cache inteligente</span>
          </article>
        </div>
      </header>

      <div className="olx-pipeline" aria-label="Pipeline de dados">
        <div className="olx-pipeline__step">
          <span className="olx-pipeline__icon">01</span>
          <div>
            <strong>Coletar</strong>
            <small>olx.com.br · Florianópolis</small>
          </div>
        </div>
        <div className="olx-pipeline__beam" aria-hidden="true">
          <span />
        </div>
        <div className="olx-pipeline__step">
          <span className="olx-pipeline__icon">02</span>
          <div>
            <strong>Normalizar</strong>
            <small>preço · bairro · tipo</small>
          </div>
        </div>
        <div className="olx-pipeline__beam" aria-hidden="true">
          <span />
        </div>
        <div className="olx-pipeline__step">
          <span className="olx-pipeline__icon">03</span>
          <div>
            <strong>Rankear</strong>
            <small>distância UFSC + custo</small>
          </div>
        </div>
      </div>

      {marqueeListings.length > 0 && (
        <div className="olx-marquee" aria-hidden="true">
          <div className="olx-marquee__track">
            {marqueeListings.map((listing, index) => (
              <span className="olx-marquee__chip" key={`${listing.id}-${index}`}>
                {listing.neighborhood} · {currency.format(listing.price)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="olx-showcase__grid">
        <aside className="olx-terminal animated-signal" aria-label="Feed OLX em tempo real">
          <div className="olx-terminal__bar">
            <span />
            <span />
            <span />
            <p>moradia-ufsc · scraper</p>
          </div>

          <div className="olx-terminal__scan" aria-hidden="true" />

          <div className="feed-list">
            {animatedListings.length > 0 ? (
              animatedListings.map((listing, index) => (
                <div
                  className={`feed-row ${index === 0 ? "is-selected" : ""}`}
                  key={listing.id}
                  style={{ "--row-index": index }}
                >
                  <span className="source-dot" aria-hidden="true" />
                  <div>
                    <strong>
                      {listing.type} · {listing.neighborhood}
                    </strong>
                    <small>
                      OLX · {listing.foundAt}
                    </small>
                  </div>
                  <b>{currency.format(listing.price)}</b>
                </div>
              ))
            ) : (
              <div className="feed-row feed-row--placeholder">
                <span className="source-dot" aria-hidden="true" />
                <div>
                  <strong>Sincronizando feed…</strong>
                  <small>OLX · Florianópolis</small>
                </div>
              </div>
            )}
          </div>
        </aside>

        {featuredListing && (
          <article className="olx-featured">
            <div className="olx-featured__badge">Melhor score agora</div>
            <div className="olx-featured__score-ring">
              <strong>{featuredListing.score}</strong>
              <span>score</span>
            </div>
            <h3>{featuredListing.title}</h3>
            <div className="olx-featured__stats">
              <div>
                <strong>{currency.format(featuredListing.price)}</strong>
                <span>/mês</span>
              </div>
              <div>
                <strong>{featuredListing.distance.toFixed(1)} km</strong>
                <span>da UFSC</span>
              </div>
              <div>
                <strong>{featuredListing.neighborhood}</strong>
                <span>bairro</span>
              </div>
            </div>
            <div className="tag-list">
              {featuredListing.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <a
              href={featuredListing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="olx-featured__cta"
            >
              Abrir anúncio completo na OLX →
            </a>
          </article>
        )}
      </div>

      {meta?.message && <p className="status-banner">{meta.message}</p>}
    </section>
  );
}
