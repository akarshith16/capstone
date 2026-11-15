# Chulapo Calma prototype (ViaCiudad noise module)

IE Capstone, Group 1, with Annorak Intelligence. Two screens share one report pipeline:

- **Resident app** at `/report`, the screen a Madrid resident uses to report noise (João Aguiar-Branco).
- **Operator dashboard** at `/`, the map and work orders officers use (Akarshith).

Version for the 16 Nov 2026 prototype submission: tag [`prototype-2026-11-15`](../../tree/prototype-2026-11-15).

## What is real, what is simulated, what is planned

| Function | Status in this version | How it works |
| --- | --- | --- |
| Resident report (type, pin, timing, details) | Real | Four-step form, no account needed. Saved to Supabase and pushed live to every open dashboard. |
| Sync between resident app and dashboard | Real | Supabase table `incidents` with realtime updates. Without Supabase keys it falls back to tabs of one browser. |
| Duplicate grouping | Real | Open reports within 150 m in the last 60 min are grouped and listed on the case (`src/lib/triage.ts`). |
| Priority | Real rule, not validated | From the resident's answers (happening now, recurring) and duplicate grouping. Sensor data is never an input. |
| Sensor context | Context only | Distance to the nearest SIVCA station within 1 km, and the date that day's average is published (the next day). No readings are loaded. A station's daily average describes the area, not what happened at one address. |
| No nearby station | Real path | The case says so and continues on the resident's report alone. |
| Routing | Simulated | A rule-based suggestion by noise type and timing. No dispatch system is connected; every case waits for officer sign-off. |
| Officer actions (warning, fine, seizure) | Simulated | The officer's choice is recorded on the case; nothing is sent to the city. |
| Sample cases on the map | Sample data | Generated in the browser, marked "Sample data", never stored. |
| Analytics forecasts | Illustrative | Labelled on screen as not model output. |
| Loading SIVCA daily open data | Planned | For the pilot. |
| Voice reports through Chulapo | Planned | Suggested by Annorak. |

Station names and coordinates in `src/data/sivca_dataset.ts` have not yet been checked against the official
SIVCA station list.

## Comparison mode: plain intake without sensors

Open `/report?flow=simple` to run the same intake and routing with no sensor step. Priority and route come
from the same rules in both flows, so the comparison shows what the sensor context adds to an officer's
decision and what it does not.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: add Supabase keys for cross-device sync
npm run dev
```

Then open `http://localhost:5173/report` (resident) and `http://localhost:5173/` (dashboard) side by side.
