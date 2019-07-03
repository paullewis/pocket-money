import { clamp } from '../utils/clamp.js';

export default {
  go() {
    const value = clamp(1, 10, 20);
    console.log('Section 2', value);
  }
};
