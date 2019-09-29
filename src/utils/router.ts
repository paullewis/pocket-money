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

import * as RouteMatcher from './route-matcher.js';
import { Section } from './section.js';

interface DynamicSection {
  section: Promise<{
    default: Section
  }>;
  elements: Promise<{ main: HTMLElement, style?: Element }>;
}

const routes = new Map<string, Section>();
const routeLoaders = new Map<string, () => DynamicSection>();

let hostElement: HTMLElement;
let currentSectionPathName: string;
let currentSection: Section;
let blockSectionSwap = false;

export function register(route: string | string[], sectionLoader: () => DynamicSection) {
  if (typeof route === 'string') {
    route = [route];
  }

  for (const singleRoute of route) {
    RouteMatcher.register(singleRoute);
    routeLoaders.set(singleRoute, sectionLoader);
  }
}

export async function init(host: HTMLElement) {
  hostElement = host;
  await go();
  hijackLinks();
  window.addEventListener('popstate', () => go());
}

export async function home() {
  history.replaceState(undefined, '', '/');
  return go();
}

function getNearestAnchorIfPossible(els: HTMLElement[]) {
  return els.find((el) => el.tagName === 'A') || els[0];
}

function hijackLinks() {
  document.body.addEventListener('click', (evt) => {
    const target = getNearestAnchorIfPossible(evt.path) as HTMLElement;

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
  const routeData = RouteMatcher.match(pathname);
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

async function animationSectionChange(routeData: {}) {
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
