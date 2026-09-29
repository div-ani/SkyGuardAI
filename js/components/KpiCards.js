/* KpiCards – four headline numbers. `stats` comes from App.js */
SkyGuard.KpiCards = function KpiCards({ stats }) {
  const { html } = SkyGuard;

  const cards = [
    { label: 'Stations online',   value: stats.stationsOnline,       color: 'var(--ok)' },
    { label: 'Active anomalies',  value: stats.activeAnomalies,      color: stats.activeAnomalies ? 'var(--bad)' : 'var(--ok)' },
    { label: 'Sensors monitored', value: stats.sensorsMonitored,     color: 'var(--ac)' },
    { label: 'Data quality',      value: stats.dataQuality + '%',    color: 'var(--ok)' },
  ];

  return html`
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      ${cards.map((card) => html`
        <div key=${card.label} className="card p-4">
          <div className="text-xs muted">${card.label}</div>
          <div className="text-3xl font-bold mt-1" style=${{ color: card.color }}>${card.value}</div>
        </div>`)}
    </section>`;
};
