define("./chunk-e19a07e8.js",['exports', './chunk-f605c39c'], function (exports, __chunk_1) { 'use strict';

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
  const duration = 300;
  class SectionElement extends HTMLElement {
      constructor() {
          super(...arguments);
          this.root = this.attachShadow({ mode: 'open' });
      }
      async show(hostElement, routeData) {
          if (!this.mainSource) {
              throw new Error('Unable to show section, no source element provided');
          }
          const el = this.mainSource.cloneNode(true);
          this.root.innerHTML = '';
          this.root.appendChild(el);
          hostElement.innerHTML = '';
          hostElement.appendChild(this);
          if (this.styleSource) {
              const style = this.styleSource.cloneNode(true);
              style.dataset.injected = 'true';
              this.root.appendChild(style);
          }
          return __chunk_1.fade({ el: hostElement, from: 0, to: 1, duration });
      }
      async hide(hostElement) {
          await __chunk_1.fade({ el: hostElement, from: 1, to: 0, duration });
          const injectedStyles = this.root.querySelectorAll('style[data-injected="true"]');
          for (const style of injectedStyles) {
              style.remove();
          }
      }
      adopt({ main, style }) {
          this.mainSource = main;
          this.styleSource = style;
      }
  }

  exports.SectionElement = SectionElement;

});
