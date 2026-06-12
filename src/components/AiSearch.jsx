import { useState } from "react";

export default function AiSearch({ listings, onRerank, onClear, disabled }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmed = query.trim();
    if (!trimmed || disabled || listings.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rerank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          listings: listings.map(
            ({ id, title, type, neighborhood, price, distance, tags }) => ({
              id,
              title,
              type,
              neighborhood,
              price,
              distance,
              tags,
            })
          ),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || `Erro ${response.status}`);
      }

      onRerank(data.orderedIds ?? [], data.scores ?? {}, trimmed);
      setReply(data.reply ?? "");
      setActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na busca por IA");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setQuery("");
    setReply("");
    setError(null);
    setActive(false);
    onClear();
  }

  return (
    <div className="ai-search">
      <p className="eyebrow">Busca com IA</p>
      <form className="ai-search__form" onSubmit={handleSubmit}>
        <label className="ai-search__field">
          <span className="visually-hidden">Descreva o que você busca</span>
          <input
            type="search"
            className="ai-search__input"
            placeholder="Ex: quarto barato perto da UFSC em Trindade"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={disabled || loading}
            maxLength={200}
          />
        </label>
        <button
          type="submit"
          className="button primary ai-search__submit"
          disabled={disabled || loading || !query.trim() || listings.length === 0}
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {reply && !error && <p className="ai-search__reply">{reply}</p>}

      {error && (
        <div className="status-banner status-banner--error ai-search__error">
          <span>{error}</span>
        </div>
      )}

      {active && !loading && (
        <button type="button" className="ai-search__clear" onClick={handleClear}>
          Limpar busca IA
        </button>
      )}
    </div>
  );
}
