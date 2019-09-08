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

module.exports = function(config) {
  config.set({
    frameworks: ['karma-typescript', 'mocha', 'chai'],
    files: [
      'node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js',
      { pattern: 'src/**/*.ts', include: true }
    ],
    preprocessors: {
      '**/*.ts': 'karma-typescript'
    },
    plugins: [
      'karma-typescript',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-chai'
    ],
    reporters: ['progress'],
    karmaTypescriptConfig: {
      compilerOptions: {
        target: 'es5',
        esModuleInterop: true,
        downlevelIteration: true
      },
      exclude: [
        'node_modules',
        '*_test.ts'
      ]
    },
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
};
