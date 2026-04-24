import { useMemo, useState } from "react";

const listings = [
  {
    id: 1,
    title: "Quarto individual mobiliado",
    type: "Quarto",
    neighborhood: "Trindade",
    price: 950,
    distance: 0.8,
    source: "Marketplace",
    foundAt: "Hoje, 08:40",
    score: 94,
    tags: ["perto da UFSC", "contas inclusas"],
  },
  {
    id: 2,
    title: "Kitnet compacta no Pantanal",
    type: "Kitnet",
    neighborhood: "Pantanal",
    price: 1450,
    distance: 1.2,
    source: "OLX",
    foundAt: "Hoje, 07:12",
    score: 88,
    tags: ["recém encontrado", "sem garagem"],
  },
  {
    id: 3,
    title: "Apartamento compartilhado",
    type: "Apartamento",
    neighborhood: "Carvoeira",
    price: 1200,
    distance: 0.7,
    source: "Grupo público",
    foundAt: "Ontem, 21:05",
    score: 91,
    tags: ["bom custo-benefício", "dividir despesas"],
  },
  {
    id: 4,
    title: "Studio arejado próximo ao campus",
    type: "Kitnet",
    neighborhood: "Córrego Grande",
    price: 1750,
    distance: 2.1,
    source: "Imobiliária",
    foundAt: "Ontem, 18:30",
    score: 76,
    tags: ["contrato formal", "atenção ao preço"],
  },
  {
    id: 5,
    title: "Vaga em república estudantil",
    type: "Quarto",
    neighborhood: "Serrinha",
    price: 780,
    distance: 1.6,
    source: "Instagram",
    foundAt: "Hoje, 10:18",
    score: 84,
    tags: ["menor preço", "ambiente estudantil"],
  },
  {
    id: 6,
    title: "Apartamento 2 quartos para dividir",
    type: "Apartamento",
    neighborhood: "Santa Mônica",
    price: 1550,
    distance: 2.8,
    source: "Zap Imóveis",
    foundAt: "Há 2 dias",
    score: 72,
    tags: ["mais espaço", "ônibus próximo"],
  },
];

const neighborhoods = ["Todos", ...new Set(listings.map((item) => item.neighborhood))];
const propertyTypes = ["Todos", ...new Set(listings.map((item) => item.type))];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function App() {
  const [filters, setFilters] = useState({
    type: "Todos",
    neighborhood: "Todos",
    maxPrice: 1800,
    maxDistance: 3,
  });

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
  }, [filters]);

  const bestListing = [...filteredListings].sort((a, b) => b.score - a.score)[0];

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <main>
      <section className="hero section-shell">
        <nav className="topbar" aria-label="Navegação principal">
          <a className="brand" href="#top" aria-label="Moradia UFSC">
            <span>M</span>
            Moradia UFSC
          </a>
          <a className="nav-link" href="#demo">
            Ver demo
          </a>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">MVP de scraping para estudantes</p>
            <h1>Aluguéis perto da UFSC antes que os bons anúncios sumam.</h1>
            <p className="hero-text">
              Uma central que monitora fontes públicas, remove duplicados e mostra preço,
              distância e sinais de custo-benefício para quem precisa morar perto do campus.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#demo">
                Explorar imóveis
              </a>
              <a className="button secondary" href="#how-it-works">
                Como funciona
              </a>
            </div>
            <div className="metrics" aria-label="Indicadores do MVP">
              <span>
                <strong>6</strong> anúncios simulados
              </span>
              <span>
                <strong>3 km</strong> raio inicial
              </span>
              <span>
                <strong>4</strong> fontes monitoradas
              </span>
            </div>
          </div>

          <aside className="signal-card" aria-label="Resumo do melhor anúncio">
            <div className="pulse-dot" />
            <p className="signal-label">Melhor oportunidade agora</p>
            <h2>{bestListing?.title ?? "Nenhum imóvel encontrado"}</h2>
            {bestListing ? (
              <>
                <div className="price-line">
                  <strong>{currency.format(bestListing.price)}</strong>
                  <span>{bestListing.distance.toFixed(1)} km da UFSC</span>
                </div>
                <div className="score-ring">{bestListing.score}</div>
                <p>
                  Score combina preço, distância, bairro e sinais do anúncio para priorizar
                  opções mais úteis para estudantes.
                </p>
              </>
            ) : (
              <p>Ajuste os filtros para ampliar a busca.</p>
            )}
          </aside>
        </div>
      </section>

      <section className="value-strip section-shell" aria-label="Benefícios">
        <article>
          <span>01</span>
          <h3>Busca centralizada</h3>
          <p>Reúne anúncios dispersos em marketplaces, grupos e imobiliárias.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Ranking prático</h3>
          <p>Prioriza distância, preço e sinais úteis para a rotina universitária.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Alertas rápidos</h3>
          <p>Base pronta para avisar quando surgir algo dentro do perfil desejado.</p>
        </article>
      </section>

      <section className="demo section-shell" id="demo">
        <div className="section-heading">
          <p className="eyebrow">Demo filtrável</p>
          <h2>Radar de moradias próximas ao campus</h2>
          <p>
            Dados fictícios para demonstrar a experiência final do produto enquanto o scraper
            real é conectado.
          </p>
        </div>

        <div className="search-panel">
          <label>
            Tipo
            <select value={filters.type} onChange={(event) => updateFilter("type", event.target.value)}>
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
            />
          </label>
        </div>

        <div className="result-bar">
          <strong>{filteredListings.length}</strong> imóveis encontrados no perfil atual
        </div>

        <div className="listing-grid">
          {filteredListings.map((listing) => (
            <article className="listing-card" key={listing.id}>
              <div className="listing-topline">
                <span>{listing.type}</span>
                <strong>{listing.score}</strong>
              </div>
              <h3>{listing.title}</h3>
              <p className="location">{listing.neighborhood} · {listing.distance.toFixed(1)} km da UFSC</p>
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
            </article>
          ))}

          {filteredListings.length === 0 && (
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
            <p>Scrapers buscam anúncios públicos com termos ligados à UFSC e bairros próximos.</p>
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
            <p>Estudantes recebem oportunidades alinhadas ao orçamento e à distância máxima.</p>
          </article>
        </div>
      </section>

      <section className="cta section-shell">
        <div>
          <p className="eyebrow">Próximo passo</p>
          <h2>Valide demanda antes de conectar o scraper real.</h2>
        </div>
        <form className="interest-form" onSubmit={(event) => event.preventDefault()}>
          <input type="email" placeholder="seu@email.com" aria-label="Email" />
          <button type="submit">Quero receber alertas</button>
        </form>
      </section>
    </main>
  );
}

export default App;
