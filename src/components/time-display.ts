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

export class TimeDisplay extends HTMLElement {
  private readonly root = this.attachShadow({mode: 'open'});
  private readonly onSlotChangeBound = this.onSlotChange.bind(this);
  private output: HTMLElement;
  private slottedValue: HTMLElement;
  private timeSlot: HTMLSlotElement;

  constructor() {
    super();

    this.root.innerHTML = `
      <div id="slotted-value">
        <slot></slot>
      </div>
      <div id="output"></div>
    `;

    this.slottedValue = this.root.querySelector('#slotted-value') as HTMLElement;
    this.output = this.root.querySelector('#output')! as HTMLElement;
    this.timeSlot = this.root.querySelector('slot')! as HTMLSlotElement;
  }

  connectedCallback() {
    this.timeSlot.addEventListener('slotchange', this.onSlotChangeBound);
    this.onSlotChange();
  }

  disconnectedCallback() {
    this.timeSlot.removeEventListener('slotchange', this.onSlotChangeBound);
  }

  private fade(el: HTMLElement, { from = 1, to = 0 } = {}) {
    return new Promise((resolve) => {
      const animation = el.animate([
        { opacity: from }, { opacity: to }
      ], { duration: 300, easing: 'cubic-bezier(0, 0, 0.3, 1)' });

      animation.onfinish = resolve;
    });
  }

  private async onSlotChange() {
    const textValue = this.getAttribute('value') || this.textContent || '';
    const dateTime = Date.parse(textValue.trim());
    if (Number.isNaN(dateTime)) {
      // Invalid date.
      return;
    }

    const value = new Date(dateTime);
    const supportsRelativeTimeFormat = ('RelativeTimeFormat' in Intl);
    const supportsDateTimeFormat = ('DateTimeFormat' in Intl);

    if (!supportsDateTimeFormat && !supportsRelativeTimeFormat) {
      return;
    }

    // Fade out everything.
    await Promise.all([
      this.fade(this.output, { from: 1, to: 0 }),
      this.fade(this.slottedValue, { from: 1, to: 0 })
    ]);

    // Permanently hide the original slotted value.
    this.slottedValue.style.display = 'none';

    if (supportsRelativeTimeFormat) {
      this.updateRelativeValue(value);
    } else if (supportsDateTimeFormat) {
      this.useAbsoluteValue(value);
    }

    await this.fade(this.output, { from: 0, to: 1 });
  }

  private useAbsoluteValue(start: Date) {
    const formatter = new Intl.DateTimeFormat(navigator.language);
    this.output.textContent = formatter.format(start);
  }

  private updateRelativeValue(start: Date) {
    const now = new Date();
    const timeDiffInMilliseconds = start.getTime() - now.getTime();

    let unit = 'second';
    let value = timeDiffInMilliseconds / 1000;

    // Convert to minutes if more than 60sec.
    if (Math.abs(value) > 60) {
      value /= 60;
      unit = 'minute';

      // Convert to hours if more than 60min.
      if (Math.abs(value) > 60) {
        value /= 60;
        unit = 'hour';

        // Convert to days if more than 24hr.
        if (Math.abs(value) > 24) {
          value /= 24;
          unit = 'day';

          // Convert to weeks if more than 7d.
          if (Math.abs(value) > 7) {
            value /= 7;
            unit = 'week';
          }
        }
      }
    }

    const formatter = new Intl.RelativeTimeFormat(navigator.language);
    this.output.textContent = formatter.format(Math.floor(value), unit);
  }
}
