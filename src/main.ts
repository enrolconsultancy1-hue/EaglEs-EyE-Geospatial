/**
 * EaglEs EyE — Client Main Entrypoint
 * Phase 1: Gateway Link & Tactical HUD Initialization
 */

function initClock(): void {
  const clockEl = document.getElementById('hudClock');
  if (!clockEl) return;

  const update = () => {
    const now = new Date();
    clockEl.textContent = now.toTimeString().split(' ')[0] + ' UTC';
  };

  update();
  setInterval(update, 1000);
}

async function checkGatewayHealth(): Promise<void> {
  const statusText = document.getElementById('gatewayStatusText');
  const pingDot = document.getElementById('pingDot');
  if (!statusText || !pingDot) return;

  try {
    const response = await fetch('/api/health');
    if (!response.ok)
      throw new Error(`Gateway returned HTTP ${response.status}`);
    const data = await response.json();

    pingDot.classList.add('connected');
    statusText.textContent = `Gateway ONLINE (${data.service} v${data.version})`;
  } catch (err) {
    pingDot.classList.remove('connected');
    statusText.textContent = `Gateway OFFLINE (Awaiting backend connection)`;
    console.warn('Gateway health check failed:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🦅 EaglEs EyE Tactical Console Bootstrapping...');
  initClock();
  checkGatewayHealth();
  // Poll health every 10 seconds
  setInterval(checkGatewayHealth, 10000);
});
