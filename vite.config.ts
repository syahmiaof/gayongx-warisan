import { defineConfig } from 'vite';
export default defineConfig({
  plugins: [
    {
      name: 'social-canonical',
      transformIndexHtml(html) {
        const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
        const origin = process.env.SITE_URL || (host ? `https://${host}` : 'http://127.0.0.1:5173');
        const url = new URL(origin).origin;
        return html
          .replaceAll(
            'content="/branding/social-preview.png"',
            `content="${url}/branding/social-preview.png"`,
          )
          .replace(
            '</head>',
            `<link rel="canonical" href="${url}/" /><meta property="og:url" content="${url}/" /></head>`,
          );
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'phaser';
        },
      },
    },
  },
});
