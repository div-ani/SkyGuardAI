/* MainChartPanel – big chart for the selected station + sensor,
   with the demo buttons and the sensitivity slider */
SkyGuard.MainChartPanel = function MainChartPanel(props) {
  const { html, Chart } = SkyGuard;
  const { station, sensor, readings, threshold, onThresholdChange, onInjectSpike, onInjectStuck } = props;

  return html`
    <div className="card p-4 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div>
          <div className="font-semibold text-lg">${sensor.name} · ${station.name}</div>
          <div className="text-xs muted">
            Shaded band = expected range (rolling mean ± ${threshold.toFixed(1)}σ) · red dots = flagged readings
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick=${onInjectSpike}>⚡ Inject spike</button>
          <button className="btn" onClick=${onInjectStuck}>⏸ Stuck sensor</button>
        </div>
      </div>

      <${Chart} size="large" readings=${readings} color=${sensor.color}
                unit=${sensor.unit} threshold=${threshold} />

      <div className="flex items-center gap-3 mt-3 text-sm">
        <span className="muted">Sensitivity (z-threshold)</span>
        <input type="range" min="2" max="6" step="0.1" value=${threshold}
               onChange=${(e) => onThresholdChange(Number(e.target.value))}
               style=${{ accentColor: 'var(--ac)' }} />
        <b>${threshold.toFixed(1)}σ</b>
      </div>
    </div>`;
};
