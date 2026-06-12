import { useEffect, useRef } from "react";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export default function AiBestDealModal({ pick, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!pick) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [pick, onClose]);

  if (!pick) {
    return null;
  }

  const { listing, relevance, query } = pick;
  const relevancePercent =
    relevance != null ? `${Math.round(relevance * 100)}%` : null;

  return (
    <div className="ai-modal" role="presentation" onClick={onClose}>
      <div
        className="ai-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          className="ai-modal__close"
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>

        <p className="eyebrow">Melhor opção para você</p>
        <h2 id="ai-modal-title">A IA encontrou o melhor negócio</h2>
        {query && (
          <p className="ai-modal__query">
            Para: <em>{query}</em>
          </p>
        )}

        <article className="ai-modal__card">
          <div className="ai-modal__card-header">
            <span className="listing-card__type">{listing.type}</span>
            <div className="listing-card__badges">
              <span className="listing-card__ai">IA</span>
              {relevancePercent && (
                <span className="ai-modal__relevance" title="Relevância da busca">
                  {relevancePercent}
                </span>
              )}
              <span className="listing-card__score" title="Score de custo-benefício">
                {listing.score}
              </span>
            </div>
          </div>

          <h3>{listing.title}</h3>

          <div className="listing-card__stats ai-modal__stats">
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

          {listing.tags?.length > 0 && (
            <div className="tag-list">
              {listing.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </article>

        <div className="ai-modal__actions">
          <a
            className="button primary"
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver fotos e detalhes na OLX
            <span className="button__arrow" aria-hidden="true">
              →
            </span>
          </a>
          <button type="button" className="button secondary" onClick={onClose}>
            Ver todos os resultados
          </button>
        </div>
      </div>
    </div>
  );
}
