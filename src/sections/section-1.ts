import { clamp } from '../utils/clamp.js';

export default {
  go() {
    const value = clamp(15, 10, 20);
    console.log('Section 1', value);
  }
};
