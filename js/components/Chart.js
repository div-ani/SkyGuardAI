/* ==========================================================
   Chart – an SVG line chart with spike markers.
   size="large": axes, expected-range band, hover tooltip
   size="small": compact sparkline
   ========================================================== */
(function () {
  const { useState } = React;
  const { html, formatValue, formatTime } = SkyGuard;

  // Drawing area for each size (all numbers are SVG units)
  const LAYOUTS = {
    large: { width: 640, height: 260, left: 44, right: 8, top: 14, bottom: 22 },
    small: { width: 300, height: 70,  left: 4,  right: 4, top: 6,  bottom: 6 },
  };

  /* ---- helpers: turn readings into x/y positions and SVG paths ---- */

  function makeScales(readings, layout) {
    const values = readings.map((r) => r.value);
    const padding = (Math.max(...values) - Math.min(...values)) * 0.12 || 1;
    const min = Math.min(...values) - padding;
    const max = Math.max(...values) + padding;
    const { width, height, left, right, top, bottom } = layout;

    const x = (i) => left + (i * (width - left - right)) / (readings.length - 1);
    const y = (v) => {
      const position = top + (1 - (v - min) / (max - min)) * (height - top - bottom);
      return Math.min(height - bottom, Math.max(top, position));   // keep inside chart
    };
    return { x, y, min, max };
  }

  function makeLinePath(readings, { x, y }) {
    return readings
      .map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(r.value).toFixed(1)}`)
      .join('');
  }

  // Shaded "expected range" = rolling mean ± threshold × std
  function makeBandPath(readings, { x, y }, threshold) {
    const ready = readings.map((_, i) => i).filter((i) => readings[i].mean !== null);
    if (!ready.length) return '';
    const point = (i, sign) =>
      `${x(i).toFixed(1)} ${y(readings[i].mean + sign * threshold * readings[i].std).toFixed(1)}`;
    const upper = ready.map((i) => point(i, +1));
    const lower = ready.slice().reverse().map((i) => point(i, -1));
    return `M${upper.join('L')}L${lower.join('L')}Z`;
  }

  /* ---- small pieces of the chart ---- */

  function GridLines({ scales, layout }) {
    return [0, 1, 2, 3].map((n) => {
      const value = scales.min + ((scales.max - scales.min) * n) / 3;
      const y = scales.y(value);
      return html`<g key=${n}>
        <line x1=${layout.left} x2=${layout.width - layout.right} y1=${y} y2=${y}
              stroke="var(--bd)" strokeDasharray="3 4" />
        <text x=${layout.left - 6} y=${y + 4} textAnchor="end" fontSize="10" fill="var(--mu)">
          ${formatValue(value)}
        </text>
      </g>`;
    });
  }

  function TimeLabels({ readings, scales, layout }) {
    const last = readings.length - 1;
    return [0, Math.floor(last / 2), last].map((i) => html`
      <text key=${i} x=${scales.x(i)} y=${layout.height - 6} fontSize="10" fill="var(--mu)"
            textAnchor=${i === 0 ? 'start' : i === last ? 'end' : 'middle'}>
        ${formatTime(readings[i].timestamp)}
      </text>`);
  }

  function Tooltip({ reading, index, scales, layout, color, unit }) {
    const x = scales.x(index);
    const boxX = Math.min(Math.max(x - 70, layout.left), layout.width - layout.right - 140);
    const isAnomaly = Boolean(reading.anomalyType);
    const note = reading.anomalyType === 'stuck' ? 'Stuck sensor' : `Spike z=${reading.zScore.toFixed(1)}`;

    return html`<g>
      <line x1=${x} x2=${x} y1=${layout.top} y2=${layout.height - layout.bottom}
            stroke="var(--mu)" strokeDasharray="2 3" />
      <circle cx=${x} cy=${scales.y(reading.value)} r="4" fill=${isAnomaly ? 'var(--bad)' : color} />
      <g transform=${`translate(${boxX},${layout.top})`}>
        <rect width="140" height=${isAnomaly ? 38 : 26} rx="6" fill="var(--card)" stroke="var(--bd)" />
        <text x="8" y="17" fontSize="11" fill="var(--tx)">
          ${formatValue(reading.value)} ${unit} · ${formatTime(reading.timestamp)}
        </text>
        ${isAnomaly && html`<text x="8" y="31" fontSize="10" fill="var(--bad)">${note}</text>`}
      </g>
    </g>`;
  }

  /* ---- the chart itself ---- */

  SkyGuard.Chart = function Chart({ readings, color, unit, threshold, size }) {
    const [hoverIndex, setHoverIndex] = useState(null);
    const isLarge = size === 'large';
    const layout = LAYOUTS[size];
    const scales = makeScales(readings, layout);
    const linePath = makeLinePath(readings, scales);
    const areaPath = `${linePath}L${scales.x(readings.length - 1)} ${layout.height - layout.bottom}` +
                     `L${scales.x(0)} ${layout.height - layout.bottom}Z`;

    // Mouse position -> nearest reading index
    const handleMouseMove = (event) => {
      const box = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * layout.width;
      const step = (layout.width - layout.left - layout.right) / (readings.length - 1);
      setHoverIndex(Math.max(0, Math.min(readings.length - 1, Math.round((x - layout.left) / step))));
    };

    return html`
      <svg viewBox=${`0 0 ${layout.width} ${layout.height}`} className="w-full block"
           onMouseMove=${isLarge ? handleMouseMove : null}
           onMouseLeave=${() => setHoverIndex(null)}>

        ${isLarge && html`<${GridLines} scales=${scales} layout=${layout} />`}
        ${isLarge && html`<${TimeLabels} readings=${readings} scales=${scales} layout=${layout} />`}
        ${isLarge && html`<path d=${makeBandPath(readings, scales, threshold)} fill=${color} opacity="0.13" />`}

        <path d=${areaPath} fill=${color} opacity=${isLarge ? 0.07 : 0.1} />
        <path d=${linePath} fill="none" stroke=${color} strokeWidth=${isLarge ? 2 : 1.6} strokeLinejoin="round" />

        ${readings.map((r, i) => r.anomalyType && html`
          <circle key=${i} cx=${scales.x(i)} cy=${scales.y(r.value)} r=${isLarge ? 5 : 3}
                  fill="var(--bad)" stroke="var(--card)" strokeWidth="1.5" />`)}

        ${hoverIndex !== null && html`<${Tooltip} reading=${readings[hoverIndex]} index=${hoverIndex}
              scales=${scales} layout=${layout} color=${color} unit=${unit} />`}
      </svg>`;
  };
})();
