import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss(), hydrogen(), oxygen(), reactRouter()],
  resolve: {
    alias: {
      // Vite's native tsconfig path resolver does not cover JavaScript
      // projects that use jsconfig.json, so define Hydrogen's app alias here.
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
    tsconfigPaths: true,
  },
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        'react-router > set-cookie-parser',
        'react-router > cookie',
        'react-router',
      ],
    },
  },
  server: {
    // Allow any Host header, so tunnelled dev URLs (Cloudflare
    // *.trycloudflare.com, ngrok, Shopify's own *.tryhydrogen.dev) are not
    // rejected with a 403 by Vite's host-validation middleware.
    //
    // `true` is the allow-any value: the option is typed `string[] | true`, and
    // the array form only ever matches literal hostnames or a leading-dot
    // suffix. A string such as 'all' is NOT special-cased — it would match the
    // single host named "all" and tunnels would still be refused.
    //
    // This disables the DNS-rebinding protection on the dev server. To keep it,
    // list the domains instead: ['.tryhydrogen.dev', '.trycloudflare.com'].
    allowedHosts: true,
  },
});
