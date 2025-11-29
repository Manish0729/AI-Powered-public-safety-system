const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/alerts'

export function connectAlerts(onMessage) {
  const ws = new WebSocket(WS_URL)
  ws.onopen = () => {
    // optionally send ping
    try { ws.send('ping') } catch {}
  }
  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data)
      onMessage(data)
    } catch {
      // Fallback for plain text
      onMessage({ raw: evt.data })
    }
  }
  ws.onerror = () => {}
  ws.onclose = () => {}
  return ws
}
