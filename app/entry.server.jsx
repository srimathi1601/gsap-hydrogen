import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {HydrogenRouterContextProvider} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    // Inter, used by the Sportstech header
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    // fontSrc overrides default-src for fonts, so keep Shopify's CDN in it
    fontSrc: ["'self'", 'https://cdn.shopify.com', 'https://fonts.gstatic.com'],
    // ── three.js + Draco, for the prototype's 3D viewer ────────────────
    // public/models/stread-pro.glb declares KHR_draco_mesh_compression, so
    // three's DRACOLoader (public/js/three/addons/loaders/DRACOLoader.js)
    // decodes it in a Worker it builds from a blob: URL, backed by the
    // WebAssembly decoder in public/js/three/draco/.
    //
    // Under the default policy both are refused, which is why
    // public/js/three3d.js:43 fell back to the poster image and the
    // "3D ansehen" overlay hung on its loading text.
    //
    // Scope note: `blob:` here is same-origin by construction — it only
    // permits workers/scripts from blobs this document itself created. It
    // does NOT widen the policy to any external origin. 'wasm-unsafe-eval'
    // permits WebAssembly compilation only; it does not re-enable eval().
    //
    // cdn.shopify.com is in Hydrogen's own script-src default, and naming
    // scriptSrc here replaces that default rather than extending it. Without
    // it the consent-tracking-api script is refused and useCustomerPrivacy
    // logs "Unable to load the Customer Privacy API" on every page.
    scriptSrc: [
      "'self'",
      "'wasm-unsafe-eval'",
      'blob:',
      'https://cdn.shopify.com',
    ],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'blob:'],
    // The GLB embeds its 8 textures as JPEG bufferViews rather than
    // external files. GLTFLoader turns each one into an object URL
    // (public/js/three/addons/loaders/GLTFLoader.js:3444):
    //
    //   const blob = new Blob([bufferView], {type: sourceDef.mimeType});
    //   sourceURI = URL.createObjectURL(blob);
    //
    // and then loads it with ImageBitmapLoader where createImageBitmap
    // exists (a fetch -> connect-src) or TextureLoader otherwise (an
    // <img> -> img-src). Neither inherits blob: from default-src, so every
    // texture was refused and the model drew untextured white/grey while
    // its geometry rendered fine.
    //
    // NOTE: unlike connectSrc, Hydrogen does NOT merge its defaults into
    // imgSrc — declaring it replaces the default-src fallback outright, so
    // Shopify's CDN has to be repeated here or every product image 404s
    // on the other routes. Verified against the emitted header.
    imgSrc: [
      "'self'",
      'blob:',
      'data:',
      'https://cdn.shopify.com',
      'https://shopify.com',
      'http://localhost:*',
    ],
    connectSrc: ["'self'", 'blob:'],
    // The Key Features deck streams the product clips from the live
    // storefront's Shopify CDN (public/js/app.js, const VID). Media does not
    // inherit from default-src once this is declared, so 'self' is repeated.
    mediaSrc: [
      "'self'",
      'blob:',
      'data:',
      'https://www.sportstech.de',
      'https://cdn.shopify.com',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/hydrogen').HydrogenRouterContextProvider} HydrogenRouterContextProvider */
/** @typedef {import('react-router').EntryContext} EntryContext */
