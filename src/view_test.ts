import { View } from './view.js';

customElements.define('x-view', View);

const { assert } = chai;

describe('View', () => {
  it('has a default name', () => {
    const view = new View();
    assert.equal(view.name, 'view');
  });

  it('has another name', () => {
    const view = new View();
    assert.equal(view.otherName, 'foo');
  });
});
