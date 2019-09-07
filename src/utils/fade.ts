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

import { clamp } from './clamp.js';

function ease(value: number, pow = 3) {
  return 1 - Math.pow(1 - value, pow);
}

const fades = new Map<HTMLElement, number>();
export function fade({ el = document.body, from = 1, to = 0, duration = 300 }): Promise<void> {
  return new Promise((resolve) => {
    const existingAnimation = fades.get(el);
    if (typeof existingAnimation !== 'undefined') {
      from = existingAnimation;
    }

    const start = performance.now();
    const update = () => {
      const time = (performance.now() - start) / duration;
      const position = ease(clamp(time, 0, 1));
      const newOpacity = from + (to - from) * position;
      el.style.opacity = String(newOpacity);

      if (position === 1) {
        resolve();
        fades.delete(el);
      } else {
        requestAnimationFrame(update);
        fades.set(el, newOpacity);
      }
    };

    // Start the animation.
    requestAnimationFrame(update);
    fades.set(el, 0);
  });
}
