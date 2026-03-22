import axios from 'axios';

const AUTO_PING_INTERVAL = 5 * 1000; // 5 Seconds (as requested to prevent Render sleep)

export const startSelfPinging = (port: number | string) => {
  const url = `http://localhost:${port}/health`;
  
  console.log(`[Stay-Alive] Self-pinging initialized every 5 seconds at ${url}`);

  setInterval(async () => {
    try {
      const response = await axios.get(url);
      console.log(`[Rent-Stay-Alive] Ping result: ${response.data.status}`);
    } catch (err: any) {
      console.error('[Rent-Stay-Alive] Ping failed:', err.message);
    }
  }, AUTO_PING_INTERVAL);
};
