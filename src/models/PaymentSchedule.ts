import Big from 'big.js';
import { Loan } from './Loan';
import { Payment } from './Payment';
import { AdditionalPayment } from './AdditionalPayment';

export class PaymentSchedule {
  loan: Loan;
  paymentType: 'annuity' | 'differentiated';
  payments: Payment[];
  additionalPayments: AdditionalPayment[];

  constructor(loan: Loan, paymentType: 'annuity' | 'differentiated') {
    this.loan = loan;
    this.paymentType = paymentType;
    this.payments = [];
    this.additionalPayments = [];
    this.recalculate();
  }

  addAdditionalPayment(payment: AdditionalPayment) {
    this.additionalPayments = this.additionalPayments.filter(p => p.month !== payment.month);
    this.additionalPayments.push(payment);
    this.additionalPayments.sort((a, b) => a.month - b.month);
    this.recalculate();
  }

  removeAdditionalPayment(month: number) {
    this.additionalPayments = this.additionalPayments.filter(p => p.month !== month);
    this.recalculate();
  }

  recalculate() {
    this.payments = [];
    let balance = new Big(this.loan.principalAmount);
    let monthlyRate = this.loan.getMonthlyRate();
    let termMonths = this.loan.termMonths;
    let remainingMonths = termMonths;
    let currentPayment = new Big(0);
    let monthlyPrincipal: Big | null = null;

    if (this.paymentType === 'annuity') {
      currentPayment = this.loan.calcAnnuityPayment();
    } else if (this.paymentType === 'differentiated') {
      monthlyPrincipal = new Big(this.loan.principalAmount).div(this.loan.termMonths).round(2);
    } else {
      throw new Error(`Unsupported payment type: ${this.paymentType}`);
    }

    let lastPaymentMonth = termMonths;

    for (let month = 1; month <= termMonths; month++) {
      const extraPayment = this.additionalPayments.find(p => p.month === month);
      let extra = extraPayment ? extraPayment.amount : new Big(0);
      let recalcType = extraPayment ? extraPayment.recalcType : null;

      if (balance.lte(0)) {
        lastPaymentMonth = month - 1;
        break;
      }

      let interest = balance.times(monthlyRate).round(2);
      let principal: Big;

      if (this.paymentType === 'annuity') {
        principal = currentPayment.minus(interest).round(2);
        if (principal.gt(balance)) {
          principal = balance;
          currentPayment = principal.plus(interest).round(2);
        }
      } else {
        principal = monthlyPrincipal!;
        if (principal.gt(balance)) principal = balance;
        currentPayment = principal.plus(interest).round(2);
      }

      const balanceBeforeExtra = balance.minus(principal).round(2);
      balance = balanceBeforeExtra.minus(extra).round(2);
      if (balance.lte(0)) {
        balance = new Big(0);
        remainingMonths = month;
        lastPaymentMonth = month;
      }

      const payment = new Payment(
        month,
        currentPayment.toNumber(),
        interest.toNumber(),
        principal.toNumber(),
        balanceBeforeExtra.toNumber(),
        extra.toNumber(),
        recalcType
      );
      payment.balanceAfterRepayment = balance;
      this.payments.push(payment);

      if (extra.gt(0) && recalcType && balance.gt(0)) {
        if (this.paymentType === 'annuity') {
          if (recalcType === 'reduceTerm') {
            let newTerm = 0;
            let tempBalance = balance;
            while (tempBalance.gt(0)) {
              const tempInterest = tempBalance.times(monthlyRate).round(2);
              let tempPrincipal = currentPayment.minus(tempInterest).round(2);
              if (tempPrincipal.gt(tempBalance)) tempPrincipal = tempBalance;
              tempBalance = tempBalance.minus(tempPrincipal).round(2);
              newTerm++;
              if (tempBalance.lte(0)) break;
            }
            remainingMonths = month + newTerm;
            lastPaymentMonth = remainingMonths;
          } else if (recalcType === 'reducePayment') {
            const remainingMonthsAfter = remainingMonths - month;
            if (remainingMonthsAfter > 0) {
              const newLoan = new Loan(balance.toNumber(), this.loan.annualRate.toNumber(), remainingMonthsAfter);
              currentPayment = newLoan.calcAnnuityPayment();
            }
          }
        } else {
          if (recalcType === 'reduceTerm') {
            const newTerm = Math.ceil(balance.div(monthlyPrincipal!).toNumber());
            remainingMonths = month + newTerm;
            lastPaymentMonth = remainingMonths;
          } else if (recalcType === 'reducePayment') {
            const remainingMonthsAfter = remainingMonths - month;
            if (remainingMonthsAfter > 0) {
              monthlyPrincipal = balance.div(remainingMonthsAfter).round(2);
              lastPaymentMonth = remainingMonths; // Срок не меняется
            }
          }
        }
      }

      if (month === remainingMonths) {
        lastPaymentMonth = remainingMonths;
        break;
      }
    }

    // Корректировка для "Уменьшение платежа" в дифференцированном расчете
    if (this.paymentType === 'differentiated' && lastPaymentMonth < termMonths) {
      const lastPayment = this.payments[this.payments.length - 1];
      if (lastPayment.recalcMode === 'reducePayment') {
        // Продолжаем добавлять платежи до конца срока
        for (let month = lastPayment.month + 1; month <= termMonths; month++) {
          const extraPayment = this.additionalPayments.find(p => p.month === month);
          let extra = extraPayment ? extraPayment.amount : new Big(0);
          let recalcType = extraPayment ? extraPayment.recalcType : null;

          if (balance.lte(0)) break;

          const interest = balance.times(monthlyRate).round(2);
          let principal = monthlyPrincipal!;
          if (principal.gt(balance)) principal = balance;

          const balanceBeforeExtra = balance.minus(principal).round(2);
          balance = balanceBeforeExtra.minus(extra).round(2);
          if (balance.lte(0)) balance = new Big(0);

          const payment = new Payment(
            month,
            principal.plus(interest).toNumber(),
            interest.toNumber(),
            principal.toNumber(),
            balanceBeforeExtra.toNumber(),
            extra.toNumber(),
            recalcType
          );
          payment.balanceAfterRepayment = balance;
          this.payments.push(payment);
          lastPaymentMonth = month;
        }
      }
    }

    // Добавляем последний платеж, если остаток не нулевой
    if (balance.gt(0) && lastPaymentMonth < termMonths) {
      const interest = balance.times(monthlyRate).round(2);
      const principal = balance;
      const paymentAmount = principal.plus(interest).round(2);

      const payment = new Payment(
        lastPaymentMonth + 1,
        paymentAmount.toNumber(),
        interest.toNumber(),
        principal.toNumber(),
        balance.toNumber(),
        0,
        null
      );
      payment.balanceAfterRepayment = new Big(0);
      this.payments.push(payment);
      lastPaymentMonth++;
    }

    if (lastPaymentMonth < this.payments.length) {
      this.payments = this.payments.slice(0, lastPaymentMonth);
    }
  }
}