/* ==========================================================
   config.js – every setting and piece of static data lives here.
   Add a station or sensor by adding one object to the lists.
   ========================================================== */
window.SkyGuard = window.SkyGuard || {};   // single global namespace for the whole app

SkyGuard.CONFIG = {
  HISTORY_LENGTH: 120,        // readings kept per sensor
  TICK_MS: 1800,              // how often a new reading arrives
  DEFAULT_THRESHOLD: 3.5,     // z-score above which a reading is a spike
  DETECTION_WINDOW: 25,       // past readings used to judge the next one
  STUCK_RUN: 6,               // identical readings in a row = stuck sensor
  RANDOM_SPIKE_CHANCE: 0.008, // chance per tick of a natural random spike
  ACTIVE_LOOKBACK: 20,        // "active" anomaly = within the last N readings
  LOG_LOOKBACK: 60,           // anomaly log shows the last N readings
  INJECTED_SPIKE_SIZE: 5,     // injected spike = 5 x the sensor's normal swing
  INJECTED_STUCK_TICKS: 10,   // how long an injected stuck fault lasts
};

/* Sensors. base = typical value, swing = daily up/down range, noise = jitter */
SkyGuard.SENSORS = [
  { key: 'temp', name: 'Temperature',     unit: '°C',    base: 29,   swing: 5,   noise: 0.6, color: '#f97316' },
  { key: 'hum',  name: 'Humidity',        unit: '%',     base: 62,   swing: 14,  noise: 2,   color: '#38bdf8' },
  { key: 'pres', name: 'Pressure',        unit: 'hPa',   base: 1008, swing: 2.5, noise: 0.3, color: '#a78bfa' },
  { key: 'wind', name: 'Wind speed',      unit: 'km/h',  base: 14,   swing: 6,   noise: 2.5, color: '#34d399' },
  { key: 'rain', name: 'Rainfall',        unit: 'mm',    base: 2,    swing: 1,   noise: 0.6, color: '#60a5fa' },
  { key: 'sol',  name: 'Solar radiation', unit: 'W/m²',  base: 420,  swing: 380, noise: 30,  color: '#facc15' },
];

/* Stations. offsets = how this location differs from a sensor's base value */
SkyGuard.STATIONS = [
  { id: 'LKO', name: 'Lucknow',     phase: 0, offsets: { temp: 0,   hum: 0,    pres: 0 } },
  { id: 'KDR', name: 'Kedarnath',   phase: 1, offsets: { temp: -16, hum: 19,   pres: 24 } },
  { id: 'MAA', name: 'Chennai',     phase: 2, offsets: { temp: 3,   hum: -3.6, pres: -4.5 } },
  { id: 'JSA', name: 'Jaisalmer',   phase: 3, offsets: { temp: 6,   hum: -7.2, pres: -9 } },
  { id: 'CHE', name: 'Cherrapunji', phase: 4, offsets: { temp: -3,  hum: 3.6,  pres: 4.5 } },
];

/* Spikes planted in the starting data so the charts show anomalies on load */
SkyGuard.SEEDED_SPIKES = [
  { stationId: 'LKO', sensorKey: 'temp', index: 95,  delta: 9 },
  { stationId: 'KDR', sensorKey: 'pres', index: 82,  delta: -14 },
  { stationId: 'JSA', sensorKey: 'wind', index: 105, delta: 40 },
  { stationId: 'CHE', sensorKey: 'rain', index: 98,  delta: 18 },
  { stationId: 'LKO', sensorKey: 'hum',  index: 108, delta: -30 },
  { stationId: 'MAA', sensorKey: 'sol',  index: 88,  delta: 500 },
];
