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
  const singleRequire = async name => {
    if (name !== 'require') {
      name = name + '.js';
    }
    if (!registry[name]) {
      
        await new Promise(async resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            
              script.src = '/js' + name.slice(1)
            
            // Ya never know
            script.defer = true;
            document.head.appendChild(script);
            script.onload = resolve;
          } else {
            importScripts(name);
            resolve();
          }
        });
      

      if (!registry[name]) {
        throw new Error(`Module ${name} didn’t register its module`);
      }
    }
    return registry[name];
  };

  const require = async (names, resolve) => {
    const modules = await Promise.all(names.map(singleRequire));
    resolve(modules.length === 1 ? modules[0] : modules);
  };

  const registry = {
    require: Promise.resolve(require)
  };

  self.define = (moduleName, depsNames, factory) => {
    if (registry[moduleName]) {
      // Module is already loading or loaded.
      return;
    }
    registry[moduleName] = new Promise(async resolve => {
      let exports = {};
      const module = {
        
          uri: location.origin + '/js' + moduleName.slice(1)
        
      };
      const deps = await Promise.all(
        depsNames.map(depName => {
          if (depName === "exports") {
            return exports;
          }
          if (depName === "module") {
            return module;
          }
          return singleRequire(depName);
        })
      );
      const facValue = factory(...deps);
      if(!exports.default) {
        exports.default = facValue;
      }
      resolve(exports);
    });
  };
}
define("./bootstrap.js",['require'], function (require) { 'use strict';

  /**
   * Copyright (c) 2019 Paul Lewis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */
  async function getHtml(path) {
      const response = await fetch(path);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const main = doc.querySelector('main');
      const style = doc.querySelector('style[data-injected="true"]') || undefined;
      if (!main) {
          throw new Error('Unable to find main');
      }
      document.adoptNode(main);
      if (style) {
          document.adoptNode(style);
      }
      return { main, style };
  }

  const root = new Map();
  function register(route) {
      const parts = route.split('/');
      let node = root;
      for (const part of parts) {
          if (part === '') {
              continue;
          }
          let value = node.get(part);
          if (!value) {
              value = new Map();
              node.set(part, value);
          }
          node = value;
      }
  }
  function match(route) {
      const data = {};
      // Special-case the root.
      if (route === '/') {
          return { path: '/' };
      }
      let node = root;
      const parts = route.split('/');
      const path = [];
      for (const part of parts) {
          if (part === '') {
              continue;
          }
          const value = node.get(part);
          if (value) {
              node = value;
              data[part] = part;
              path.push(part);
          }
          else {
              // No absolute match - check for wildcards.
              for (const key of node.keys()) {
                  if (key.startsWith(':')) {
                      data[key.substr(1)] = part;
                      path.push(key);
                      node = node.get(key);
                      break;
                  }
              }
          }
      }
      // No matches whatsoever.
      if (Object.keys(data).length === 0) {
          return null;
      }
      return {
          data,
          path: `/${path.join('/')}/`,
      };
  }

  /**
   * Copyright (c) 2019 Paul Lewis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */
  const routes = new Map();
  const routeLoaders = new Map();
  let hostElement;
  let currentSectionPathName;
  let currentSection;
  let blockSectionSwap = false;
  function register$1(route, sectionLoader) {
      if (typeof route === 'string') {
          route = [route];
      }
      for (const singleRoute of route) {
          register(singleRoute);
          routeLoaders.set(singleRoute, sectionLoader);
      }
  }
  async function init(host) {
      hostElement = host;
      await go();
      hijackLinks();
      window.addEventListener('popstate', () => go());
  }
  function hijackLinks() {
      document.body.addEventListener('click', (evt) => {
          const target = evt.target;
          // 1. Is an anchor.
          if (target.tagName !== 'A') {
              return;
          }
          // 2. With an href.
          const href = target.getAttribute('href');
          if (!href) {
              return;
          }
          // 3. On the same origin.
          const targetUrl = new URL(href, window.location.toString());
          if (targetUrl.host !== window.location.host) {
              return;
          }
          // Okay, now handle the anchor.
          evt.preventDefault();
          if (targetUrl.pathname === currentSectionPathName) {
              return;
          }
          history.pushState(undefined, '', targetUrl.toString());
          go();
      });
  }
  async function go(pathname = window.location.pathname) {
      const routeData = match(pathname);
      if (!routeData) {
          throw new Error(`Unknown route: ${pathname}`);
      }
      const section = routes.get(routeData.path);
      if (!section) {
          const loader = routeLoaders.get(routeData.path);
          if (!loader) {
              // 404.
              throw new Error(`Unknown route: ${pathname}`);
          }
          // Load and store the section.
          const sectionToLoad = loader();
          const [loadedSection, elements] = await Promise.all([
              sectionToLoad.section,
              sectionToLoad.elements
          ]);
          // Store it for next time.
          loadedSection.default.adopt(elements);
          routes.set(pathname, loadedSection.default);
      }
      if (pathname === currentSectionPathName) {
          return;
      }
      currentSectionPathName = pathname;
      animationSectionChange(routeData);
  }
  async function animationSectionChange(routeData) {
      if (blockSectionSwap) {
          return;
      }
      // Block multiple calls.
      blockSectionSwap = true;
      // Before starting the hide of any current section, check with the
      // incoming section if there is any beforeShow to execute.
      const potentialNewSection = routes.get(currentSectionPathName);
      if (!potentialNewSection) {
          throw new Error(`Failure to load section: ${currentSectionPathName}`);
      }
      if (potentialNewSection.beforeShow) {
          await potentialNewSection.beforeShow(hostElement, routeData);
      }
      // Now hide the current section.
      if (currentSection) {
          await currentSection.hide(hostElement);
      }
      const section = routes.get(currentSectionPathName);
      if (!section) {
          throw new Error(`Failure to load section: ${currentSectionPathName}`);
      }
      currentSection = section;
      blockSectionSwap = false;
      await section.show(hostElement, routeData);
  }

  /**
   * Copyright (c) 2019 Paul Lewis
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */
  async function init$1() {
      register$1('/', () => {
          return {
              elements: getHtml('/index.html'),
              section: new Promise(function (resolve, reject) { require(['./index-9f77a641'], resolve, reject) }),
          };
      });
      register$1('/settings/', () => {
          return {
              elements: getHtml('/settings/index.html'),
              section: new Promise(function (resolve, reject) { require(['./settings-b64eabf0'], resolve, reject) })
          };
      });
      register$1(['/details/', '/details/:name/'], () => {
          return {
              elements: getHtml('/details/index.html'),
              section: new Promise(function (resolve, reject) { require(['./details-b93a9da5'], resolve, reject) })
          };
      });
      const host = document.querySelector('main');
      if (!host) {
          throw new Error('No <main>!');
      }
      await init(host);
  }
  init$1();

});
