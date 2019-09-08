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

import { clear, match, register } from './route-matcher.js';

const { assert } = chai;

describe('Route Matcher', () => {
  beforeEach(() => clear());

  it('does not match undefined routes', () => {
    assert.isNull(match('/foo/'));
  });

  it('matches exact routes', () => {
    register('/foo/');
    assert.deepEqual(match('/foo/'), { data: { foo: 'foo' }, path: '/foo/' } );

    register('/');
    assert.isDefined(match('/'));
  });

  it('fills data parts', () => {
    register('/foo/:value/:match/');
    const expected = {
      data: {
        foo: 'foo',
        match: 'baz',
        value: 'bar',
      },
      path: '/foo/:value/:match/'
    };
    assert.deepEqual(match('/foo/bar/baz/'), expected);
  });

  it('matches literals before data parts', () => {
    register('/foo/bar/:match/');
    register('/foo/:value/:match/');

    const expected = {
      data: {
        bar: 'bar',
        foo: 'foo',
        match: 'baz',
      },
      path: '/foo/bar/:match/'
    };

    assert.deepEqual(match('/foo/bar/baz/'), expected);
  });

  it('matches partials', () => {
    register('/foo/:value/:match/');
    const expected = {
      data: {
        foo: 'foo',
        value: 'bar',
      },
      path: '/foo/:value/'
    };

    assert.deepEqual(match('/foo/bar/'), expected);
  });

  it('matches with slashes', () => {
    register('foo');
    const expected = {
      data: {
        foo: 'foo'
      },
      path: '/foo/'
    };

    assert.deepEqual(match('/foo/'), expected);
  });
});
