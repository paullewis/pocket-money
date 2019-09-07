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

import { Section } from './section.js';

interface DynamicSection {
  section: Promise<{
    default: Section
  }>;
  element: Promise<HTMLElement>;
}

const routes = new Map<string, Section>();
const routeLoaders = new Map<string, () => DynamicSection>();

let hostElement: HTMLElement;
let currentSectionPathName: string;
let currentSection: Section;
let blockSectionSwap = false;

export function register(name: string, sectionLoader: () => DynamicSection) {
  routeLoaders.set(name, sectionLoader);
}

export async function init(host: HTMLElement) {
  hostElement = host;
  await go();
  hijackLinks();
  window.addEventListener('popstate', () => go());
}

function hijackLinks() {
  document.body.addEventListener('click', (evt) => {
    const target = evt.target as HTMLElement;

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
  const section = routes.get(pathname);
  if (!section) {
    const loader = routeLoaders.get(pathname);
    if (!loader) {
      // 404.
      throw new Error(`Unknown route: ${pathname}`);
    }

    // Load and store the section.
    const sectionToLoad = loader();
    const [loadedSection, element] = await Promise.all([
      sectionToLoad.section,
      sectionToLoad.element
    ]);

    // Store it for next time.
    loadedSection.default.adopt(element);
    routes.set(pathname, loadedSection.default);
  }

  if (pathname === currentSectionPathName) {
    return;
  }

  currentSectionPathName = pathname;
  animationSectionChange();
}

async function animationSectionChange() {
  if (blockSectionSwap) {
    return;
  }

  // Block multiple calls.
  blockSectionSwap = true;
  if (currentSection) {
    await currentSection.hide(hostElement);
  }

  const section = routes.get(currentSectionPathName);
  if (!section) {
    throw new Error(`Failure to load section: ${currentSectionPathName}`);
  }
  currentSection = section;
  blockSectionSwap = false;
  await section.show(hostElement);
}
