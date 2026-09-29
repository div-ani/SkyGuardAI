/* ==========================================================
   detector.js – anomaly detection (pure JavaScript, no React)

   >>> To plug in your own ML model, replace `detectAnomalies`.
       It must return the same array shape (see the return value). <<<
   ========================================================== */

/**
 * Checks every reading against the readings just before it.
 *   Spike : value is far from the rolling mean (|z-score| > threshold)
 *   Stuck : the same value repeated several times in a row
 *
 * @param {{value:number, timestamp:number}[]} readings
 * @param {number} threshold  z-score limit
 * @returns {{value, timestamp, mean, std, zScore, anomalyType}[]}
 *          anomalyType is 'spike', 'stuck' or null
 */
SkyGuard.detectAnomalies = function (readings, threshold) {
  const { DETECTION_WINDOW, STUCK_RUN } = SkyGuard.CONFIG;

  return readings.map((reading, i) => {
    const result = { ...reading, mean: null, std: null, zScore: 0, anomalyType: null };

    // Spike check – needs enough history first
    if (i >= DETECTION_WINDOW) {
      const past = readings.slice(i - DETECTION_WINDOW, i).map((r) => r.value);
      const mean = past.reduce((sum, v) => sum + v, 0) / past.length;
      const variance = past.reduce((sum, v) => sum + (v - mean) ** 2, 0) / past.length;
      const std = Math.max(Math.sqrt(variance), 0.001);   // avoid dividing by 0

      result.mean = mean;
      result.std = std;
      result.zScore = (reading.value - mean) / std;
      if (Math.abs(result.zScore) > threshold) result.anomalyType = 'spike';
    }

    // Stuck-sensor check
    if (i >= STUCK_RUN - 1 && reading.value > 0) {
      const recent = readings.slice(i - STUCK_RUN + 1, i + 1);
      if (recent.every((r) => r.value === reading.value)) result.anomalyType = 'stuck';
    }

    return result;
  });
};

/** Runs detection for every station + sensor. Returns detections[stationId][sensorKey] */
SkyGuard.analyseAll = function (data, threshold) {
  const detections = {};
  SkyGuard.STATIONS.forEach((station) => {
    detections[station.id] = {};
    SkyGuard.SENSORS.forEach((sensor) => {
      detections[station.id][sensor.key] =
        SkyGuard.detectAnomalies(data[station.id][sensor.key], threshold);
    });
  });
  return detections;
};

/** Flattens all anomalies into one list for the log, newest first */
SkyGuard.buildLog = function (detections) {
  const { HISTORY_LENGTH, LOG_LOOKBACK } = SkyGuard.CONFIG;
  const entries = [];

  SkyGuard.STATIONS.forEach((station) => SkyGuard.SENSORS.forEach((sensor) => {
    const series = detections[station.id][sensor.key];
    series.forEach((reading, index) => {
      if (index < HISTORY_LENGTH - LOG_LOOKBACK || !reading.anomalyType) return;
      // a long stuck run is one event, so only list where it starts
      const continuesStuckRun = reading.anomalyType === 'stuck' && series[index - 1].anomalyType === 'stuck';
      if (!continuesStuckRun) entries.push({ station, sensor, reading, index });
    });
  }));

  return entries.sort((a, b) => b.reading.timestamp - a.reading.timestamp || b.index - a.index);
};

/** Label + colour for an anomaly log entry */
SkyGuard.getSeverity = function (entry) {
  const z = Math.abs(entry.reading.zScore);
  if (entry.reading.anomalyType === 'stuck' || z > 4.5) {
    return z > 6 ? { label: 'High', color: 'var(--bad)' } : { label: 'Medium', color: 'var(--warn)' };
  }
  return { label: 'Low', color: 'var(--ac)' };
};
