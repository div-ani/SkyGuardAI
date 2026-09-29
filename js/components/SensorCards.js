/* SensorCards – one card per sensor for the selected station:
   latest value, Normal/Anomaly badge and a sparkline. Click to select. */
SkyGuard.SensorCards = function SensorCards({ sensors, readingsBySensor, selectedKey, threshold, onSelect }) {
  const { html, Chart, formatValue } = SkyGuard;
  const { ACTIVE_LOOKBACK } = SkyGuard.CONFIG;

  return html`
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      ${sensors.map((sensor) => {
        const readings = readingsBySensor[sensor.key];
        const latest = readings[readings.length - 1];
        const hasAnomaly = readings.slice(-ACTIVE_LOOKBACK).some((r) => r.anomalyType);

        return html`
          <button key=${sensor.key} className="card p-3 text-left"
                  style=${{ cursor: 'pointer', color: 'var(--tx)', outline: sensor.key === selectedKey ? '2px solid var(--ac)' : 'none' }}
                  onClick=${() => onSelect(sensor.key)}>
            <div className="flex justify-between items-baseline">
              <span className="text-sm muted">${sensor.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                    style=${{ background: hasAnomaly ? 'var(--bad)' : 'var(--ok)', color: '#fff' }}>
                ${hasAnomaly ? 'Anomaly' : 'Normal'}
              </span>
            </div>
            <div className="text-2xl font-bold">
              ${formatValue(latest.value)} <span className="text-sm muted font-normal">${sensor.unit}</span>
            </div>
            <${Chart} size="small" readings=${readings} color=${sensor.color}
                      unit=${sensor.unit} threshold=${threshold} />
          </button>`;
      })}
    </section>`;
};
