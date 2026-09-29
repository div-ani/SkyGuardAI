/* StationTabs – one button per station; red dot = has an active anomaly */
SkyGuard.StationTabs = function StationTabs({ stations, selectedId, alertIds, onSelect }) {
  const { html } = SkyGuard;
  return html`
    <section className="flex flex-wrap gap-2">
      ${stations.map((station) => html`
        <button key=${station.id}
                className=${'btn ' + (station.id === selectedId ? 'is-active' : '')}
                onClick=${() => onSelect(station.id)}>
          <span className="dot mr-2"
                style=${{ background: alertIds.has(station.id) ? 'var(--bad)' : 'var(--ok)' }}></span>
          ${station.name}
        </button>`)}
    </section>`;
};
