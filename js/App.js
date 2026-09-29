/* ==========================================================
   App – the root component. It:
     1. gets live data (useSensorStream)
     2. runs anomaly detection on it
     3. hands the results to the display components
   ========================================================== */
SkyGuard.App = function App() {
  const { useState, useMemo } = React;
  const { html, CONFIG, STATIONS, SENSORS } = SkyGuard;

  /* ---- state ---- */
  const { data, isLive, setIsLive, injectSpike, injectStuck } = SkyGuard.useSensorStream();
  const toggleTheme = SkyGuard.useTheme();
  const [threshold, setThreshold] = useState(CONFIG.DEFAULT_THRESHOLD);
  const [selection, setSelection] = useState({ stationId: 'LKO', sensorKey: 'temp' });

  /* ---- derived data (recalculated only when data or threshold change) ---- */
  const detections = useMemo(() => SkyGuard.analyseAll(data, threshold), [data, threshold]);
  const logEntries = useMemo(() => SkyGuard.buildLog(detections), [detections]);

  const activeEntries = logEntries.filter((e) => e.index >= CONFIG.HISTORY_LENGTH - CONFIG.ACTIVE_LOOKBACK);
  const alertStationIds = new Set(activeEntries.map((e) => e.station.id));

  const totalReadings = STATIONS.length * SENSORS.length * CONFIG.HISTORY_LENGTH;
  const flaggedReadings = STATIONS.reduce((sum, st) =>
    sum + SENSORS.reduce((s, se) => s + detections[st.id][se.key].filter((r) => r.anomalyType).length, 0), 0);

  const stats = {
    stationsOnline: `${STATIONS.length}/${STATIONS.length}`,
    activeAnomalies: activeEntries.length,
    sensorsMonitored: STATIONS.length * SENSORS.length,
    dataQuality: (100 * (1 - flaggedReadings / totalReadings)).toFixed(1),
  };

  /* ---- what is currently selected ---- */
  const station = STATIONS.find((s) => s.id === selection.stationId);
  const sensor = SENSORS.find((s) => s.key === selection.sensorKey);

  /* ---- layout ---- */
  return html`
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      <${SkyGuard.Header} isLive=${isLive} onToggleLive=${() => setIsLive(!isLive)} onToggleTheme=${toggleTheme} />

      <${SkyGuard.KpiCards} stats=${stats} />

      <${SkyGuard.StationTabs} stations=${STATIONS} selectedId=${station.id} alertIds=${alertStationIds}
          onSelect=${(stationId) => setSelection({ ...selection, stationId })} />

      <section className="grid lg:grid-cols-3 gap-4">
        <${SkyGuard.MainChartPanel} station=${station} sensor=${sensor}
            readings=${detections[station.id][sensor.key]}
            threshold=${threshold} onThresholdChange=${setThreshold}
            onInjectSpike=${() => injectSpike(station.id, sensor)}
            onInjectStuck=${() => injectStuck(station.id, sensor)} />

        <${SkyGuard.AnomalyLog} entries=${logEntries}
            onSelect=${(stationId, sensorKey) => setSelection({ stationId, sensorKey })} />
      </section>

      <${SkyGuard.SensorCards} sensors=${SENSORS} readingsBySensor=${detections[station.id]}
          selectedKey=${sensor.key} threshold=${threshold}
          onSelect=${(sensorKey) => setSelection({ ...selection, sensorKey })} />

      <footer className="text-xs muted text-center pb-2">
        Frontend prototype · simulated sensor stream · detection: rolling z-score + stuck-value check
      </footer>
    </div>`;
};
