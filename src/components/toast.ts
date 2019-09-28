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

import { cancelFade, fade } from '../utils/fade.js';

let toastInstance: Toast | undefined;

export class Toast extends HTMLElement {
  static create(message: string) {
    if (!toastInstance) {
      toastInstance = new Toast();
    } else {
      toastInstance.resetFadeTimeout();
    }

    toastInstance.textContent = message;
  }

  private readonly root = this.attachShadow({mode: 'open'});
  private fadeIdx = -1;

  constructor() {
    super();

    this.root.innerHTML = `
      <style>
        #slotted-value {
          padding: 9px;
          color: #FFF;
          background: #444;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
      </style>
      <div id="slotted-value">
        <slot></slot>
      </div>
    `;

    this.resetFadeTimeout();
  }

  resetFadeTimeout() {
    cancelFade({ el: this, opacity: 1 });
    clearTimeout(this.fadeIdx);
    this.fadeIdx = setTimeout(() => fade({ el: this }), 1000) as unknown as number;
  }
}
