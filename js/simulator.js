/* ==========================================================
   simulator.js – fake sensor data so the UI works without a backend

   >>> To use real data, replace `advanceData` with a fetch() to
       your API and return the same {stationId:{sensorKey:[...]}} shape.
   Each reading looks like: { value: 28.4, timestamp: 1730000000000 }
   ========================================================== */

const MINUTE = 60 * 1000;

/** A believable value: base + location offset + daily wave + random noise */
function generateValue(station, sensor, step) {
  const offset = station.offsets[sensor.key] || 0;
  const wave = sensor.swing * Math.sin(step / 14 + station.phase);
  const noise = (Math.random() - 0.5) * sensor.noise;
  const value = Math.max(0, sensor.base + offset + wave + noise);
  return sensor.key === 'hum' ? Math.min(100, value) : value;   // humidity max 100 %
}

/** Builds the starting history for every station and sensor */
SkyGuard.createInitialData = function () {
  const { HISTORY_LENGTH } = SkyGuard.CONFIG;
  const now = Date.now();
  const data = {};

  SkyGuard.STATIONS.forEach((station) => {
    data[station.id] = {};
    SkyGuard.SENSORS.forEach((sensor) => {
      data[station.id][sensor.key] = Array.from({ length: HISTORY_LENGTH }, (_, i) => ({
        value: generateValue(station, sensor, i),
        timestamp: now - (HISTORY_LENGTH - i) * MINUTE,
      }));
    });
  });

  // Plant the demo spikes
  SkyGuard.SEEDED_SPIKES.forEach(({ stationId, sensorKey, index, delta }) => {
    const reading = data[stationId][sensorKey][index];
    reading.value = Math.max(0, reading.value + delta);
  });

  return data;
};

/** Faults waiting to be applied to the next reading (used by the demo buttons) */
SkyGuard.createFaultState = () => ({ pendingSpikes: {}, stuckTicksLeft: {} });

SkyGuard.queueSpike = function (faults, stationId, sensor) {
  const direction = Math.random() < 0.5 ? 1 : -1;
  faults.pendingSpikes[stationId + sensor.key] =
    direction * sensor.swing * SkyGuard.CONFIG.INJECTED_SPIKE_SIZE;
};

SkyGuard.queueStuck = function (faults, stationId, sensor) {
  faults.stuckTicksLeft[stationId + sensor.key] = SkyGuard.CONFIG.INJECTED_STUCK_TICKS;
};

/** Returns a NEW data object with one more reading per sensor (oldest dropped) */
SkyGuard.advanceData = function (data, step, faults) {
  const { RANDOM_SPIKE_CHANCE } = SkyGuard.CONFIG;
  const next = {};

  SkyGuard.STATIONS.forEach((station) => {
    next[station.id] = {};
    SkyGuard.SENSORS.forEach((sensor) => {
      const key = station.id + sensor.key;
      const series = data[station.id][sensor.key];
      const last = series[series.length - 1];
      let value;

      if (faults.stuckTicksLeft[key] > 0) {              // stuck: repeat last value
        value = last.value;
        faults.stuckTicksLeft[key] -= 1;
      } else {
        value = generateValue(station, sensor, step);
        if (faults.pendingSpikes[key]) {                 // injected spike
          value = Math.max(0, value + faults.pendingSpikes[key]);
          delete faults.pendingSpikes[key];
        } else if (Math.random() < RANDOM_SPIKE_CHANCE) { // rare natural spike
          const direction = Math.random() < 0.5 ? 1 : -1;
          value = Math.max(0, value + direction * sensor.swing * (3 + Math.random() * 3));
        }
      }

      next[station.id][sensor.key] = [
        ...series.slice(1),
        { value, timestamp: last.timestamp + MINUTE },
      ];
    });
  });

  return next;
};
