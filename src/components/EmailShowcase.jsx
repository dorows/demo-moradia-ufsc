import { useState } from "react";

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;

const PREVIEW_ALERTS = [
  { title: "Kitnet Trindade", price: "R$ 1.050", time: "agora" },
  { title: "Quarto Pantanal", price: "R$ 780", time: "há 2h" },
  { title: "Apto Carvoeira", price: "R$ 1.200", time: "hoje" },
];

export default function EmailShowcase() {
  const [email, setEmail] = useState("");
  const [formStatus, setFormStatus] = useState("idle");

  async function handleSubmit(event) {
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

      if (!response.ok) throw new Error("Falha ao enviar");

      setEmail("");
      setFormStatus("success");
    } catch {
      setFormStatus("error");
    }
  }

  return (
    <section className="email-showcase section-shell" id="waitlist" aria-label="Lista de espera">
      <div className="email-showcase__glow" aria-hidden="true" />

      <div className="email-showcase__grid">
        <div className="email-showcase__copy">
          <p className="eyebrow">Alertas personalizados</p>
          <h2>Seja o primeiro a saber quando surgir a moradia ideal</h2>
          <p>
            Cadastre seu email e receba avisos quando encontrarmos algo no seu perfil — perto da
            UFSC, no seu orçamento, antes que o anúncio suma.
          </p>

          <ul className="email-perks">
            <li>Prioridade no beta de alertas</li>
            <li>Sem spam — só oportunidades relevantes</li>
            <li>Cancele quando quiser</li>
          </ul>
        </div>

        <div className="email-showcase__stage">
          <div className="email-preview" aria-hidden="true">
            <div className="email-preview__phone">
              <div className="email-preview__notch" />
              <div className="email-preview__screen">
                <p className="email-preview__title">Moradia UFSC</p>
                <p className="email-preview__subtitle">3 novos alertas</p>
                {PREVIEW_ALERTS.map((alert, index) => (
                  <div
                    className="email-preview__alert"
                    key={alert.title}
                    style={{ "--alert-index": index }}
                  >
                    <span className="email-preview__dot" />
                    <div>
                      <strong>{alert.title}</strong>
                      <small>{alert.price} · {alert.time}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form
            className={`email-form ${formStatus === "success" ? "is-success" : ""}`}
            onSubmit={handleSubmit}
          >
            <div className="email-form__field">
              <label htmlFor="waitlist-email">Seu melhor email</label>
              <div className="email-form__input-wrap">
                <svg className="email-form__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M4 6h16v12H4V6zm0 0l8 7 8-7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  id="waitlist-email"
                  type="email"
                  placeholder="estudante@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={formStatus === "submitting" || formStatus === "success"}
                />
              </div>
            </div>

            <button
              type="submit"
              className="button primary email-form__submit"
              disabled={formStatus === "submitting" || formStatus === "success"}
            >
              <span className="email-form__submit-text">
                {formStatus === "submitting"
                  ? "Enviando…"
                  : formStatus === "success"
                    ? "Cadastrado!"
                    : "Entrar na lista de espera"}
              </span>
              {formStatus === "success" && (
                <span className="email-form__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>

            {formStatus === "success" && (
              <p className="form-feedback form-feedback--success">
                Você está na lista! Avisaremos quando houver novidades.
              </p>
            )}
            {formStatus === "error" && (
              <p className="form-feedback form-feedback--error">
                Não foi possível enviar. Tente novamente em instantes.
              </p>
            )}
            {formStatus === "missing-config" && (
              <p className="form-feedback form-feedback--error">
                Configure VITE_FORMSPREE_ID no Vercel para ativar o formulário.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
