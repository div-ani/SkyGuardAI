/* Header – title, live/paused indicator, pause button, theme toggle */
SkyGuard.Header = function Header({ isLive, onToggleLive, onToggleTheme }) {
  const { html } = SkyGuard;
  return html`
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-xs muted font-medium tracking-wide">
          SIH 2026 · PS 26073 · DISASTER MANAGEMENT
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">
          🌦️ SkyGuard AI
          <span className="muted text-base font-normal">
            AI/ML anomaly detection for Automatic Weather Stations
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-2 text-sm muted">
          <span className=${'dot ' + (isLive ? 'dot-pulse' : '')}
                style=${{ background: isLive ? 'var(--ok)' : 'var(--mu)' }}></span>
          ${isLive ? 'Live' : 'Paused'}
        </span>
        <button className="btn" onClick=${onToggleLive}>${isLive ? 'Pause' : 'Resume'}</button>
        <button className="btn" onClick=${onToggleTheme}>◐ Theme</button>
      </div>
    </header>`;
};
