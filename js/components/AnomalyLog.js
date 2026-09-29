/* AnomalyLog – scrollable list of detected anomalies (newest first).
   Clicking an entry jumps the main chart to that station + sensor. */
SkyGuard.AnomalyLog = function AnomalyLog({ entries, onSelect }) {
  const { html, formatValue, formatTime, getSeverity } = SkyGuard;

  const describe = ({ reading, sensor }) =>
    reading.anomalyType === 'stuck'
      ? `Stuck at ${formatValue(reading.value)} ${sensor.unit}`
      : `Spike ${formatValue(reading.value)} ${sensor.unit} (z=${reading.zScore.toFixed(1)})`;

  return html`
    <div className="card p-4 flex flex-col" style=${{ maxHeight: 470 }}>
      <div className="font-semibold text-lg mb-2">
        Anomaly log <span className="muted text-sm font-normal">(${entries.length})</span>
      </div>

      <div className="overflow-y-auto space-y-2 pr-1">
        ${entries.length === 0 && html`<div className="muted text-sm">No anomalies detected.</div>`}

        ${entries.slice(0, 25).map((entry, i) => {
          const severity = getSeverity(entry);
          return html`
            <button key=${i} className="w-full text-left p-2 rounded-lg"
                    style=${{ border: '1px solid var(--bd)', background: 'transparent', color: 'var(--tx)', cursor: 'pointer' }}
                    onClick=${() => onSelect(entry.station.id, entry.sensor.key)}>
              <div className="flex justify-between text-sm">
                <b>${entry.station.name} · ${entry.sensor.name}</b>
                <span style=${{ color: severity.color, fontWeight: 600 }}>${severity.label}</span>
              </div>
              <div className="text-xs muted">${describe(entry)} · ${formatTime(entry.reading.timestamp)}</div>
            </button>`;
        })}
      </div>
    </div>`;
};
