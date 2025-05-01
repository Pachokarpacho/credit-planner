import Big from 'big.js';

export class AdditionalPayment {
  month: number;
  amount: Big;
  recalcType: 'reduceTerm' | 'reducePayment';

  constructor(month: number, amount: number, recalcType: 'reduceTerm' | 'reducePayment') {
    this.month = month;
    this.amount = new Big(amount);
    this.recalcType = recalcType;
  }
}