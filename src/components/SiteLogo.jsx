import logoAscii from "../assets/logo-ascii.txt?raw";

export default function SiteLogo() {
  return (
    <header className="site-logo" aria-label="Moradias UFSC">
      <div className="site-logo__mark">
        <img className="site-logo__img" src="/logo.png" alt="" width={72} height={72} />
        <div className="site-logo__wordmark">
          <strong>Moradias UFSC</strong>
          <span>Chave para morar perto do campus</span>
        </div>
      </div>
      <div className="site-logo__ascii-wrap" aria-hidden="true">
        <pre className="site-logo__ascii">{logoAscii.trimEnd()}</pre>
      </div>
    </header>
  );
}
