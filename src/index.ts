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

import { fade } from './utils/fade.js';
import { Section } from './utils/section.js';

class Home implements Section {
  private elSource!: HTMLElement;
  private el!: HTMLElement;

  async show(hostElement: HTMLElement) {
    console.log('Home show');

    this.el = this.elSource.cloneNode(true) as HTMLElement;
    hostElement.innerHTML = '';
    hostElement.appendChild(this.el);

    return fade({ el: hostElement, from: 0, to: 1 });
  }

  async hide(hostElement: HTMLElement) {
    console.log('Home hide');
    return fade({ el: hostElement, from: 1, to: 0 });
  }

  adopt(elSource: HTMLElement) {
    this.elSource = elSource;
  }
}

customElements.define('pm-home', Home);

export default new Home();
