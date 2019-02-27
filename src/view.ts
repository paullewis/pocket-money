export class View extends HTMLElement {
  private nameInternal: string = 'view';

  /* istanbul ignore next */
  constructor() {
    super();
  }

  get name() {
    return this.nameInternal;
  }

  get otherName() {
    return 'foo';
  }
}
