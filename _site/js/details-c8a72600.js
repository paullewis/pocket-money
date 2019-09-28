define("./details-c8a72600.js",['exports', './chunk-f605c39c', './chunk-e19a07e8'], function (exports, __chunk_1, __chunk_2) { 'use strict';

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
  const defaultPos = {
      h: 1,
      w: 1,
      x: 0,
      y: 0,
  };
  const moves = new Map();
  function move({ el = document.body, from = defaultPos, to = defaultPos, duration = 300 }) {
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
              const position = __chunk_1.ease(__chunk_1.clamp(time, 0, 1));
              const x = from.x + (to.x - from.x) * position;
              const y = from.y + (to.y - from.y) * position;
              const w = from.w + (to.w - from.w) * position;
              const h = from.h + (to.h - from.h) * position;
              el.style.transform = `translate(${x}px, ${y}px) scale(${w}, ${h})`;
              if (position === 1) {
                  resolve();
                  moves.delete(el);
                  el.style.backfaceVisibility = 'visible';
              }
              else {
                  requestAnimationFrame(update);
                  moves.set(el, { x, y, w, h });
              }
          };
          // Start the animation.
          requestAnimationFrame(update);
          moves.set(el, { x: 0, y: 0, w: 1, h: 1 });
      });
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
  class Details extends __chunk_2.SectionElement {
      async beforeShow(hostElement, routeData) {
          const { name } = routeData.data;
          if (!name) {
              return;
          }
          const home = hostElement.querySelector('pm-home');
          if (!home) {
              return;
          }
          const element = home.shadowRoot.querySelector(`[data-name="${name}"]`);
          if (!element) {
              return;
          }
          // Copy the image for the view transition.
          this.avatarCopy = element.cloneNode(true);
          const { left, top } = element.getBoundingClientRect();
          this.avatarCopy.style.position = 'fixed';
          this.avatarCopy.style.left = `${left}px`;
          this.avatarCopy.style.top = `${top}px`;
          document.body.appendChild(this.avatarCopy);
      }
      async show(hostElement, routeData) {
          const show = super.show(hostElement, routeData);
          if (routeData.data.name) {
              this.root.querySelector('h1').textContent = routeData.data.name;
          }
          const avatar = this.root.querySelector('img');
          if (!avatar) {
              return;
          }
          avatar.src = '/static/images/person.jpg';
          if (this.avatarCopy) {
              // 1. Calculate the difference between avatar and copy.
              const to = this.calculateDiff(avatar, this.avatarCopy);
              // 2. Hide the avatar.
              avatar.style.display = 'none';
              // 3. Animate the copy into place.
              await move({ el: this.avatarCopy, to });
              // 4. Hide the copy and restore the avatar.
              this.removeAvatarCopy();
              avatar.style.display = 'block';
          }
          return show;
      }
      async hide(hostElement) {
          if (this.avatarCopy) {
              await __chunk_1.fade({ el: this.avatarCopy, to: 0, duration: 200 });
              this.removeAvatarCopy();
          }
          return super.hide(hostElement);
      }
      removeAvatarCopy() {
          if (!this.avatarCopy) {
              return;
          }
          this.avatarCopy.remove();
          this.avatarCopy = undefined;
      }
      calculateDiff(src, dest) {
          const srcBounds = src.getBoundingClientRect();
          const destBounds = dest.getBoundingClientRect();
          return {
              h: srcBounds.height / destBounds.height,
              w: srcBounds.width / destBounds.width,
              x: srcBounds.left - destBounds.left,
              y: srcBounds.top - destBounds.top,
          };
      }
  }
  customElements.define('pm-details', Details);
  var details = new Details();

  exports.default = details;

});
