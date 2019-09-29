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

import { html, render } from 'lit-html';
import { person } from './model/model.js';
import { SectionElement } from './utils/section.js';

class Home extends SectionElement {

  async show(hostElement: HTMLElement, routeData: {}) {
    const show = super.show(hostElement, routeData);

    const list = this.root.querySelector('.person-list') as HTMLElement;
    const persons = await person.getAll();

    let tmpl;
    if (!persons.length) {
      tmpl = html`No persons stored.`;
    } else {
      tmpl = html`<ul>
      ${persons.map((personData) => {
        return html`
        <li>
          <a href="/details/${personData.id}/">
            <img class="avatar" data-name="${personData.id}"
                src="/static/images/person.jpg" width="300" height="300">
            ${personData.name}
          </a>
        <li>`;
      })}
      </ul>`;
    }

    render(tmpl, list);

    return show;
  }

}

customElements.define('pm-home', Home);

export default new Home();
