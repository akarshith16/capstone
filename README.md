# Chulapo Calma (VíaCiudad) — Multi-Agent Municipal Noise Triage & Predictive Telemetry

> **Academic Assessment Submission Release:** `v1.0-submission-2026-11-23`  
> **Target Municipality:** Ayuntamiento de Madrid — Policía Municipal (092) & Dirección General de Sostenibilidad  
> **Regulatory Alignment:** Ley 37/2003 del Ruido, Madrid OPCAT, Directiva Europea 2002/49/CE, EU Artificial Intelligence Act (Art. 14)

---

## 1. Executive Overview

**Chulapo Calma** is a human-in-the-loop multi-agent decision support system designed to modernize municipal acoustic noise management in Madrid. It replaces fragmented, slow, and uncoordinated complaint processes with an integrated agentic pipeline:

```
[Citizen Voice / Chat] ──► [Chulapo: Gemini 1.5 Flash NLP]
                                      │
                                      ▼
                        [Sentinel: 31 SIVCA Stations] ──► Haversine Distance (m) + 20-min Cluster Check
                                      │
                                      ▼
                        [Decider: Asymmetric Scoring] ──► Priority Uplift (Fairness Invariant: Never Downgrades)
                                      │
                                      ▼
                        [Officer Triage Dashboard]   ──► EU AI Act Human Sign-Off (Approve / Modify / Reject)
                                      │
                                      ▼
                        [Coordinator & Feedback]    ──► 092 / DG Sostenibilidad Dispatch + Citizen Notification
```

---

## 2. Prototype Scope & Transparency Matrix

In accordance with academic assessment feedback, all platform capabilities are explicitly categorized into three distinct operational states:

| Architecture Layer / Feature | Status | Implementation Details in Prototype |
| :--- | :---: | :--- |
| **Chulapo Citizen Intake** | `[REAL]` | Google Gemini 1.5 Flash structured entity extraction (District, street, category, timestamp, anonymous vs. Cl@ve identified toggle). Zero arbitrary jitter. |
| **SIVCA Network Distance Matching** | `[REAL]` | Haversine geodesic distance calculation (in meters) to Madrid's **31 official fixed SIVCA stations**. Distance threshold set to 500m. |
| **Historical Open Data Lookup** | `[REAL]` | Direct local ingestion of validated official night averages ($L_n$ 23:00–07:00 dBA) from Madrid's `datos.madrid.es` monthly bulletins. |
| **Spatial-Temporal Clustering** | `[REAL]` | Deterministic 20-minute rolling window tracking duplicate reports within 400m / same street to prevent redundant dispatch. |
| **Asymmetric Priority Scoring** | `[REAL]` | Decider raises priority on sensor saturation ($>65$ dBA) or multi-resident clusters ($\ge 4$ notices); **never lowers priority** when sensor is quiet or out-of-range. |
| **Mandatory Human Officer Sign-Off** | `[REAL]` | EU AI Act Art. 14 compliance: Officer must Approve, Modify (with mandatory written override justification), or Reject. Logs officer badge, decision, and elapsed review time. |
| **Baseline vs. Enriched Comparison** | `[REAL]` | Side-by-side assessment toggle showing operational delta between traditional 311 intake and Chulapo Calma sensor enrichment. |
| **Deterministic Verification Suite** | `[REAL]` | Standalone reproducible test runner (`npm run test:triage` & in-app modal) executing 8 test cases with Markdown/JSON export. |
| **Contextual Night Spike Slider** | `[SIMULATED]` | Explicitly labeled `[SIMULATED]` slider (60–95 dBA) allowing evaluators to inject synthetic acoustic spikes to test triage escalation. |
| **Departmental Dispatch Timers** | `[SIMULATED]` | Timed asynchronous state transitions simulating CAD ticket generation for Policía Municipal (092) and DG Sostenibilidad. |
| **Closed-Loop Citizen Notification** | `[SIMULATED]` | Simulated resident push notification inside the chat drawer upon municipal ticket resolution. |
| **IBM watsonx Enterprise Stack** | `[PLANNED]` | Enterprise roadmap architecture: `watsonx.data` (acoustic lakehouse), `watsonx.governance` (bias/drift tracking), and `watsonx Orchestrate`. |
| **Live Hourly Streaming SIVCA API** | `[PLANNED]` | Direct integration with municipal IoT gateways once Ayuntamiento de Madrid transitions from batch open data to sub-second streaming. |
| **Official Cl@ve e-ID Gateway** | `[PLANNED]` | Production PKI connector for Spain's Cl@ve identification system under Ley 39/2015 for legally binding sanction acts. |
| **Two-Way 092 CAD Integration** | `[PLANNED]` | Direct bi-directional webhook connector with Policía Municipal Computer-Aided Dispatch consoles. |

---

## 3. Data Integrity & SIVCA Open Data Mechanics

### Open Data Cadence Disclosure
Madrid's open data repository ([datos.madrid.es](https://datos.madrid.es/dataset/215885-0-contaminacion-ruido)) publishes validated **post-period aggregates**:
- **$L_d$ (Día):** 07:00–19:00 average
- **$L_e$ (Tarde):** 19:00–23:00 average
- **$L_n$ (Noche):** 23:00–07:00 average

> **Important:** The municipal open data portal does **NOT** provide real-time streaming telemetry. In production, Chulapo Calma connects to the post-period baseline for contextual sanity-checking. To evaluate the live decision pipeline, the prototype includes an explicit **Verification Data Mode** toggle with three clear options:
> 1. **Historical Open Data (Real SIVCA Record):** Utilizes the actual validated monthly $L_n$ value for the closest station.
> 2. **Simulated Night Spike [SIMULATED]:** Contextual slider allowing evaluators to inject elevated decibel readings ($60–95$ dBA).
> 3. **No Sensor Coverage / >500m Out-of-Range [FALLBACK]:** Demonstrates fallback logic when a complaint occurs beyond fixed sensor coverage (>500m). Sentinel flags the street as a candidate for Madrid's **17 Mobile SIVCA Stations (UMMA)**, preserves complaint priority without downgrade, and relies on neighbour clustering.

---

## 4. Legal & Regulatory Terminology Framework

Previous versions of the prototype incorrectly referenced a "55 dB EU legal night limit". This has been refactored across all prompts, logic, and interfaces:

* **EU Directive 2002/49/EC:** The 55 dBA ($L_{night}$) value is an **environmental strategic planning and acoustic mapping target**, *not* an enforceable individual sanction limit.
* **National & Municipal Law:** Actionable legal noise limits in Madrid are strictly governed by Spain's **Ley 37/2003, del Ruido** and Madrid's **OPCAT** (*Ordenanza de Protección contra la Contaminación Acústica y Térmica*), alongside specific ZPAE (*Zonas de Protección Acústica Especial*) decrees for Centro, Gaztambide, and Trafalgar-Ríos Rosas.
* **Evidentiary Inviolability:** Formal administrative sanctions and fines can **only be issued based on in-person sonometric measurements** conducted by certified Policía Municipal or DG Sostenibilidad officers using calibrated Type 1 sonometers. Ambient SIVCA data serves exclusively as an **asymmetric contextual triage indicator**.
* **EU AI Act Article 14 Compliance:** Automated algorithmic decisions cannot execute fines or venue closures. The system mandates human officer review with explicit approval, modification (override reason logged), or rejection before dispatch.

---

## 5. Deterministic Verification Suite (Appendix C)

To satisfy the academic assessment reproducibility criteria, Chulapo Calma includes an automated verification suite containing 8 deterministic test cases:

1. **Test 1: Malasaña Bar Cluster near Plaza del Carmen (~450m)**  
   *Target:* Verifies that 5 resident reports within 20 minutes near station `SN-MAD-08` ($<500$m) trigger an asymmetric priority escalation to `Critical` routed to Policía Municipal (092 - Priority Patrol).
2. **Test 2: Side-Street Complaint >600m from Fixed Station (Mobile UMMA Fallback)**  
   *Target:* Verifies that distance $>500$m flags `isOutOfRange: true`, `mobileCandidate: true` (candidate for Madrid's 17 UMMA mobile stations), and **does NOT penalize citizen priority**.
3. **Test 3: Asymmetric Fairness Check (Quiet SIVCA Sensor vs. Loud Party)**  
   *Target:* Verifies that a quiet ambient sensor (e.g. 47.9 dBA at Casa de Campo) **never downgrades** an interior party complaint. Outdoor sensors cannot disconfirm indoor disturbances.
4. **Test 4: Single Isolated Low-Severity Report (Watchlist)**  
   *Target:* Verifies that an isolated traffic noise complaint with no clusters routes to `DG Sostenibilidad (Environmental Inspectors / Watchlist)`.
5. **Test 5: Anonymous Triage Report vs. Formal Named Denuncia Mode**  
   *Target:* Verifies privacy-preserving operational triage for anonymous submissions while maintaining Cl@ve e-ID compliance for formal sanction requests under Ley 39/2015.
6. **Test 6: Duplicate Report Merging within 20-Minute Rolling Window**  
   *Target:* Verifies that consecutive complaints on the same street (Calle de la Palma) merge into a single ticket, incrementing cluster density instead of dispatching duplicate police cars.
7. **Test 7: Human Officer Override Flow & Justification Capture**  
   *Target:* Verifies that an officer can override Decider's priority (e.g. Moderate $\rightarrow$ High), logging their officer badge, justification reason, and review elapsed time under EU AI Act Art. 14.
8. **Test 8: Baseline (No Sensor Enrichment) vs. Chulapo Calma Comparison**  
   *Target:* Verifies the measurable operational delta between legacy unverified 311 intake and sensor-enriched cluster triage.

### Running the Tests via CLI
```bash
npm run test:triage
```
*Expected Result: 8/8 tests passed (100% SUCCESS).*

### Running the Tests In-App
1. Click **"Verificación Apéndice C"** in the top navigation bar.
2. Inspect individual test cards, actual outputs, and metrics.
3. Click **"Exportar Markdown"** or **"JSON"** to download the verification log for academic inclusion.

---

## 6. Installation & Local Development

### Prerequisites
* Node.js $\ge$ 20.0 (Node 22 LTS recommended)
* npm $\ge$ 10.0

### Setup
```bash
# Clone the repository
git clone https://github.com/akarshith16/capstone.git
cd capstone

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example or set your Google Gemini API key:
echo "VITE_GEMINI_API_KEY=your_gemini_api_key_here" > .env

# Run development server
npm run dev

# Run deterministic triage test suite
npm run test:triage

# Build production bundle
npm run build
```

---

## 7. Release Notes — `v1.0-submission-2026-11-23`

* **Tag:** `v1.0-submission-2026-11-23`
* **Release Date:** November 23, 2026
* **Scope of Changes:**
  - Removed all random number generation from Sentinel and Decider workflows.
  - Implemented exact Haversine geodesic distance calculations across all 31 Madrid SIVCA stations.
  - Added Madrid Open Data post-period aggregates notice and 3-mode Verification Data selector.
  - Corrected EU 2002/49/EC, Ley 37/2003, and OPCAT regulatory terminology across codebase and prompts.
  - Added collapsible Prototype Scope & Transparency Legend banner with `[REAL]`, `[SIMULATED]`, and `[PLANNED]` badges.
  - Implemented Officer Side-by-Side Assessment ("With vs. Without Sensor Enrichment") view.
  - Delivered 8/8 automated deterministic test suite with CLI and in-app Markdown/JSON export for Appendix C.
