/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "112ac213acccb2c46eb97e8ac589934e"
  }, {
    "url": "pwa-512x512.png",
    "revision": "fb392692ded04c8949e0e0d9873f7dec"
  }, {
    "url": "pwa-192x192.png",
    "revision": "a4d7457396497094dbbb719eef3fcdff"
  }, {
    "url": "index.html",
    "revision": "3d0f3b913a749fd19ebac0c60481759f"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "508961d8a7aee6610982182d01ba3f4d"
  }, {
    "url": "data/ajwibah.json",
    "revision": "d6d109ea240473f39754978cff2da3d4"
  }, {
    "url": "assets/web-DMmXoh4p.js",
    "revision": null
  }, {
    "url": "assets/web-CoWYCYOg.js",
    "revision": null
  }, {
    "url": "assets/web-B4WovBbK.js",
    "revision": null
  }, {
    "url": "assets/rolldown-runtime-WkwZ5CU-.js",
    "revision": null
  }, {
    "url": "assets/react-vendor-BPeuUvaN.js",
    "revision": null
  }, {
    "url": "assets/index-DFL1ZBV5.js",
    "revision": null
  }, {
    "url": "assets/index-CGizEKEu.css",
    "revision": null
  }, {
    "url": "assets/icons-vendor-rMFaRoX5.js",
    "revision": null
  }, {
    "url": "assets/esm-O5tJr5XM.js",
    "revision": null
  }, {
    "url": "assets/ShareModal-f_NRzeZE.js",
    "revision": null
  }, {
    "url": "assets/QuestionDetailModal-Ck3pqwQ2.js",
    "revision": null
  }, {
    "url": "assets/BookmarksNotesView-r2u-SiPX.js",
    "revision": null
  }, {
    "url": "assets/AboutView-DEBlblSF.js",
    "revision": null
  }, {
    "url": "assets/aistudio/a______________________11e307c1.webp",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "508961d8a7aee6610982182d01ba3f4d"
  }, {
    "url": "pwa-192x192.png",
    "revision": "a4d7457396497094dbbb719eef3fcdff"
  }, {
    "url": "pwa-512x512.png",
    "revision": "fb392692ded04c8949e0e0d9873f7dec"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "112ac213acccb2c46eb97e8ac589934e"
  }, {
    "url": "data/ajwibah.json",
    "revision": "d6d109ea240473f39754978cff2da3d4"
  }, {
    "url": "assets/aistudio/a______________________11e307c1.webp",
    "revision": "947429fe47356a46a45c09cf111762e7"
  }, {
    "url": "manifest.webmanifest",
    "revision": "a5da4d66c5c133c308a14ac1dbaee13a"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-css",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-woff",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 30,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
