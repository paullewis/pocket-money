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
import { ease } from './ease.js';

interface Position {
  h: number;
  w: number;
  x: number;
  y: number;
}
const defaultPos: Position = {
  h: 1,
  w: 1,
  x: 0,
  y: 0,
};
const moves = new Map<HTMLElement, Position>();
export function move({ el = document.body, from = defaultPos, to = defaultPos, duration = 300 }): Promise<void> {
  return new Promise((resolve) => {
    const existingAnimation = moves.get(el);
    if (typeof existingAnimation !== 'undefined') {
      from = existingAnimation;
    }

    // Prep the element for animation.
    el.style.backfaceVisibility = 'hidden';
    el.style.transformOrigin = 'top left';

    const start = performance.now();
    const update = () => {
      const time = (performance.now() - start) / duration;
      const position = ease(clamp(time, 0, 1));
      const x = from.x + (to.x - from.x) * position;
      const y = from.y + (to.y - from.y) * position;
      const w = from.w + (to.w - from.w) * position;
      const h = from.h + (to.h - from.h) * position;

      el.style.transform = `translate(${x}px, ${y}px) scale(${w}, ${h})`;

      if (position === 1) {
        resolve();
        moves.delete(el);
        el.style.backfaceVisibility = 'visible';
      } else {
        requestAnimationFrame(update);
        moves.set(el, { x, y, w, h });
      }
    };

    // Start the animation.
    requestAnimationFrame(update);
    moves.set(el, {x: 0, y: 0, w: 1, h: 1});
  });
}
