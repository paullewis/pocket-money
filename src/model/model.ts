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

import * as IDBKeyval from 'idb-keyval';

export enum MoneyRate {
  WEEKLY = 'Weekly',
  MONTHLY = 'Monthly'
}

export enum MoneyDay {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

export interface PersonData {
  id: string;
  name: string;
  rate: MoneyRate;
  day?: MoneyDay;
  amount: number;
  giving?: number;
  image?: Blob;
}

export const person = {
  create(personData: PersonData) {
    return IDBKeyval.set(personData.id, personData);
  },

  retrieve(id: string): Promise<PersonData | undefined> {
    return IDBKeyval.get(id);
  },

  update(personData: PersonData) {
    return IDBKeyval.set(personData.id, personData);
  },

  del(id: string) {
    return IDBKeyval.del(id);
  },

  async getAll(): Promise<PersonData[]> {
    const keys = await IDBKeyval.keys();
    return await Promise.all(keys.map((key) => IDBKeyval.get(key)));
  }
};
