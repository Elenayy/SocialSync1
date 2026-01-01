
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' is used to load all variables regardless of the `VITE_` prefix.
  // Fix: Cast process to any to access cwd() to avoid type errors in restricted environments
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // This shim allows process.env.API_KEY to work in your frontend code
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});
