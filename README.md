# SkyGuard AI – SIH 2026 PS 26073
Frontend dashboard for AI/ML anomaly detection on Automatic Weather Stations.

**Run it:** open `index.html` in a browser (internet needed once for the CDN libraries).

**Stack:** HTML · CSS (theme in `css/styles.css`) · JavaScript (data + detection) · Tailwind CSS (layout classes) · React (components).

## Where to change things
| I want to…                          | Edit                          |
|-------------------------------------|-------------------------------|
| Add a station / sensor, tune limits | `js/config.js`                |
| Change colours / dark theme         | `css/styles.css`              |
| Use my ML model for detection       | `js/detector.js`              |
| Use real data instead of fake data  | `js/simulator.js`             |
| Change the page layout              | `js/App.js`                   |
| Change one panel                    | matching file in `js/components/` |

Scripts are loaded in order from `index.html`; all shared code lives on one `SkyGuard` object.
