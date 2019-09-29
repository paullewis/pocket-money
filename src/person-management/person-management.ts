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

import { Toast } from '../components/toast.js';
import { MoneyDay, MoneyRate, person, PersonData } from '../model/model.js';
import { id } from '../utils/id.js';
import { SectionElement } from '../utils/section.js';

interface RouteData {
  data: {
    id?: string;
  };
}

const DEFAULT_GIVING = 10;

class PersonManagement extends SectionElement {
  private form!: HTMLFormElement;
  private isEdit = false;
  private personData!: PersonData | undefined;

  async show(hostElement: HTMLElement, routeData: RouteData) {
    if (routeData.data.id) {
      this.personData = await person.retrieve(routeData.data.id);
    }

    // Mark as edit if needed.
    this.isEdit = (typeof this.personData !== 'undefined');

    // Show the form and populate it.
    const show = super.show(hostElement, routeData);
    this.form = this.root.querySelector('form') as HTMLFormElement;
    if (!this.form) {
      throw new Error('No form found');
    }

    this.populateForm();

    // Listen for updates.
    let isUpdating = false;
    this.form.addEventListener('submit', async (evt) => {
      evt.preventDefault();

      if (isUpdating) {
        return;
      }

      isUpdating = true;
      try {
        await this.processFormData();
        Toast.create(`👍 ${ this.isEdit ? 'Updated' : 'Added'} successfully`);
      } catch (e) {
        Toast.create(`👎 ${ this.isEdit ? 'Update' : 'Add'} failed`);
      }
      isUpdating = false;
    });

    return show;
  }

  private populateForm() {
    const personName = this.form.querySelector('#person-name') as HTMLInputElement;
    const rate = this.form.querySelector('#pocket-money-rate') as HTMLSelectElement;
    const day = this.form.querySelector('#pocket-money-day') as HTMLSelectElement;
    const amount = this.form.querySelector('#pocket-money-amount') as HTMLInputElement;
    const giving = this.form.querySelector('#pocket-money-percentage') as HTMLInputElement;
    const personId = this.form.querySelector('#person-id') as HTMLInputElement;

    // Create a new entry.
    if (!this.personData) {
      personId.value = id();
      return;
    }

    personId.value = this.personData.id;
    personName.value = this.personData.name;
    switch (this.personData.rate) {
      case MoneyRate.MONTHLY: rate.value = 'Monthly'; break;
      case MoneyRate.WEEKLY: rate.value = 'Weekly'; break;
    }

    switch (this.personData.day) {
      case MoneyDay.MONDAY: day.value = 'Monday'; break;
      case MoneyDay.TUESDAY: day.value = 'Tuesday'; break;
      case MoneyDay.WEDNESDAY: day.value = 'Wednesday'; break;
      case MoneyDay.THURSDAY: day.value = 'Thursday'; break;
      case MoneyDay.FRIDAY: day.value = 'Friday'; break;
      case MoneyDay.SATURDAY: day.value = 'Saturday'; break;
      case MoneyDay.SUNDAY: day.value = 'Sunday'; break;
    }

    amount.value = this.personData.amount.toString();
    giving.value = (this.personData.giving || DEFAULT_GIVING).toString();
  }

  private processFormData() {
    const personName = this.form.querySelector('#person-name') as HTMLInputElement;
    const rate = this.form.querySelector('#pocket-money-rate') as HTMLSelectElement;
    const day = this.form.querySelector('#pocket-money-day') as HTMLSelectElement;
    const amount = this.form.querySelector('#pocket-money-amount') as HTMLInputElement;
    const giving = this.form.querySelector('#pocket-money-percentage') as HTMLInputElement;
    const personId = this.form.querySelector('#person-id') as HTMLInputElement;

    if (!personName.value) {
      throw new Error('Name is empty');
    }

    if (!amount.value) {
      throw new Error('Amount is empty');
    }

    if (!personId.value) {
      throw new Error('ID is empty');
    }

    let dayValue = MoneyDay.SATURDAY;
    switch (day.value) {
      case 'Monday': dayValue = MoneyDay.MONDAY; break;
      case 'Tuesday': dayValue = MoneyDay.TUESDAY; break;
      case 'Wednesday': dayValue = MoneyDay.WEDNESDAY; break;
      case 'Thursday': dayValue = MoneyDay.THURSDAY; break;
      case 'Friday': dayValue = MoneyDay.FRIDAY; break;
      case 'Saturday': dayValue = MoneyDay.SATURDAY; break;
      case 'Sunday': dayValue = MoneyDay.SUNDAY; break;
    }

    let rateValue = MoneyRate.WEEKLY;
    switch (rate.value) {
      case 'Monthly': rateValue = MoneyRate.MONTHLY; break;
      case 'Weekly': rateValue = MoneyRate.WEEKLY; break;
    }

    const transactions = this.personData ? this.personData.transactions : [];
    this.personData = {
      amount: Number(amount.value),
      day: dayValue,
      giving: Number(giving.value),
      id: personId.value,
      name: personName.value,
      rate: rateValue,
      transactions
    };

    if (this.isEdit) {
      return person.update(this.personData);
    } else {
      return person.create(this.personData);
    }
  }
}

customElements.define('pm-person-management', PersonManagement);

export default new PersonManagement();
