import Big from 'big.js';

export class Payment {
  month: number;
  amount: Big;
  interest: Big;
  principal: Big;
  balance: Big; // Остаток до вычета дополнительного платежа
  extraPayment: Big;
  recalcMode: 'reduceTerm' | 'reducePayment' | null;
  balanceAfterRepayment: Big;
  previousBalance: Big;

  constructor(
    month: number,
    amount: number,
    interest: number,
    principal: number,
    balance: number, // Остаток до вычета дополнительного платежа
    extraPayment: number = 0,
    recalcMode: 'reduceTerm' | 'reducePayment' | null = null
  ) {
    this.month = month;
    this.amount = new Big(amount);
    this.interest = new Big(interest);
    this.principal = new Big(principal);
    this.balance = new Big(balance);
    this.extraPayment = new Big(extraPayment);
    this.recalcMode = recalcMode;
    this.balanceAfterRepayment = this.balance.minus(this.extraPayment).round(2);
    this.previousBalance = month === 1 ? new Big(1000000) : this.balance.plus(this.principal).round(2); // Для 1-го месяца остаток = сумма кредита
  }
}
// import Big from 'big.js';

// export class Payment {
//   month: number;
//   amount: Big;
//   interest: Big;
//   principal: Big;
//   balance: Big;
//   extraPayment: Big;
//   recalcMode: 'reduceTerm' | 'reducePayment' | null;
//   balanceAfterRepayment: Big;
//   previousBalance: Big;

//   constructor(
//     month: number,
//     amount: number,
//     interest: number,
//     principal: number,
//     balance: number,
//     extraPayment: number = 0,
//     recalcMode: 'reduceTerm' | 'reducePayment' | null = null
//   ) {
//     this.month = month;
//     this.amount = new Big(amount);
//     this.interest = new Big(interest);
//     this.principal = new Big(principal);
//     this.balance = new Big(balance);
//     this.extraPayment = new Big(extraPayment);
//     this.recalcMode = recalcMode;
//     this.balanceAfterRepayment = new Big(balance);
//     this.previousBalance = new Big(balance);
//   }
// }