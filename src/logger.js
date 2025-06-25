export function logDebug(msg, data = null) {
  const panel = document.getElementById('debugPanel');
  const pre = document.createElement('pre');
  pre.textContent = `[DEBUG] ${msg}` + (data ? `:\n${JSON.stringify(data, null, 2)}` : '');
  panel.appendChild(pre);
  panel.scrollTop = panel.scrollHeight;
}
