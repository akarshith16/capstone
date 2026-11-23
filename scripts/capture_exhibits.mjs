import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const distDir = 'C:\\Users\\akars\\.gemini\\antigravity\\scratch\\viaciudad\\dist';
const outputDirDesktop = 'C:\\Users\\akars\\OneDrive\\Desktop';
const outputDirLocal = 'C:\\Users\\akars\\.gemini\\antigravity\\scratch\\viaciudad\\screenshots';
const outputDirBrain = 'C:\\Users\\akars\\.gemini\\antigravity\\brain\\ae8c010e-739e-44bc-a44f-29ffcf5d648e';

[outputDirLocal, outputDirDesktop, outputDirBrain].forEach((dir) => {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    console.warn('Directory check warning:', e.message);
  }
});

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

// Start static server
const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(distDir, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
  }
});

server.listen(5173, '127.0.0.1', async () => {
  console.log('Static server listening on http://127.0.0.1:5173');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--window-size=1440,900',
    'about:blank',
  ]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    // Wait for CDP endpoint
    let cdpReady = false;
    for (let i = 0; i < 20; i++) {
      try {
        const v = await fetch('http://127.0.0.1:9222/json/version');
        if (v.ok) {
          cdpReady = true;
          break;
        }
      } catch {}
      await sleep(300);
    }

    if (!cdpReady) throw new Error('Chrome remote debugging port not available');

    // Find the default page target
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await listRes.json();
    const targetPage = pages.find((p) => p.type === 'page') || pages[0];
    console.log('Target page found:', targetPage.id);

    const ws = new WebSocket(targetPage.webSocketDebuggerUrl);

    let msgId = 1;
    const pendingPromises = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pendingPromises.has(msg.id)) {
        const { resolve, reject } = pendingPromises.get(msg.id);
        pendingPromises.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };

    const send = (method, params = {}) => {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pendingPromises.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    await new Promise((resolve) => (ws.onopen = resolve));
    console.log('WebSocket connected to Chrome DevTools Protocol');

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    // Navigate to local app
    console.log('Navigating to http://127.0.0.1:5173 ...');
    await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });

    // Wait for page load and React hydration
    await sleep(3000);

    const saveScreenshot = async (filename, logLabel) => {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(data, 'base64');

      const targetPaths = [
        path.join(outputDirDesktop, filename),
        path.join(outputDirLocal, filename),
        path.join(outputDirBrain, filename),
      ];

      for (const p of targetPaths) {
        try {
          fs.writeFileSync(p, buffer);
          console.log(`[✓ SAVED] ${logLabel} -> ${p}`);
        } catch (e) {
          console.warn(`Could not save to ${p}:`, e.message);
        }
      }
      return buffer;
    };

    // =========================================================================
    // EXHIBIT C.1 (CITIZEN PORTAL - VIACIUDAD)
    // =========================================================================
    console.log('\n--- Capturing Exhibit C.1: Citizen Portal ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });
    await sleep(1000);

    // Save Exhibit C.1 Landing Screen with Hero Card and Your Reports Tracker
    await saveScreenshot('Exhibit_C1_Citizen_Portal_Landing.png', 'Exhibit C.1 (Landing & Tracker)');

    // Now, navigate through the 4-step wizard to Step 4 ("Check and send")
    // Step 0 -> Step 1: Click "Report noise" button
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Report noise'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(600);

    // Step 1 -> Step 2: Category is selected, click "Continue"
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(600);

    // Step 2 -> Step 3: Location is picked, click "Continue"
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(600);

    // Step 3 -> Step 4: Details filled, click "Continue"
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(800);

    // Capture Step 4: "Check and send" Review Screen
    await saveScreenshot(
      'Exhibit_C1_Citizen_Portal_Step4_Review.png',
      'Exhibit C.1 (Step 4 Check and Send)'
    );

    // Also save as default canonical name requested by user:
    await saveScreenshot(
      'Exhibit_C1_Citizen_Portal_ViaCiudad.png',
      'Exhibit C.1 (Canonical)'
    );

    // =========================================================================
    // EXHIBIT C.2 (MUNICIPAL COMMAND CENTER MAP & TRANSPARENCY BANNER)
    // =========================================================================
    console.log('\n--- Capturing Exhibit C.2: Municipal Command Center ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1500,
      height: 950,
      deviceScaleFactor: 2,
      mobile: false,
    });

    // Switch view to Command Center
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Command Center'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(3500); // Allow Leaflet map, SIVCA stations, and dots to render

    // Expand the Transparency Legend
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Prototype Scope & Transparency Legend'));
        if (btn) btn.click();
      })()`,
    });
    await sleep(1000); // Wait for Framer Motion animation

    await saveScreenshot(
      'Exhibit_C2_Municipal_Command_Center_Map.png',
      'Exhibit C.2 (Acoustic Map & Transparency Legend)'
    );

    // =========================================================================
    // EXHIBIT C.3 (OFFICER TRIAGE MODAL WITH COMPARISON VIEW & EU AI ACT ART. 14)
    // =========================================================================
    console.log('\n--- Capturing Exhibit C.3: Officer Triage Modal ---');
    // Click the first incident in the Triage Feed on the left
    await send('Runtime.evaluate', {
      expression: `(() => {
        const firstIncident = document.querySelector('.flex-1.overflow-y-auto > div > div') ||
                              document.querySelector('.flex-1.overflow-y-auto .group');
        if (firstIncident) firstIncident.click();
      })()`,
    });
    await sleep(1200); // Wait for modal animation

    // In TicketModal, toggle "Compare vs. Without Sensors"
    await send('Runtime.evaluate', {
      expression: `(() => {
        const compareBtn = Array.from(document.querySelectorAll('button')).find(b => 
          b.textContent.includes('Compare vs. Without Sensors') || 
          b.textContent.includes('Without Sensors')
        );
        if (compareBtn) compareBtn.click();
      })()`,
    });
    await sleep(1200); // Wait for side-by-side comparison expansion

    await saveScreenshot(
      'Exhibit_C3_Officer_Triage_Modal.png',
      'Exhibit C.3 (Officer Triage Modal with Comparison View & EU AI Act Art. 14)'
    );

    console.log('\n=== All 3 Exhibit Screenshots Successfully Captured! ===');
    ws.close();
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    chrome.kill();
    server.close();
    process.exit(0);
  }
});
