import Big from 'big.js';
import { Loan } from '../models/Loan';
import { PaymentSchedule } from '../models/PaymentSchedule';
import { AdditionalPayment } from '../models/AdditionalPayment';
import { Payment } from '../models/Payment';

export class RecalculationController {
  private loan: Loan;
  private schedule: PaymentSchedule;

  constructor(loan: Loan, schedule: PaymentSchedule) {
    this.loan = loan;
    this.schedule = schedule;
  }

  handleRecalcChange(monthIndex: number, extra: Big, recalcType: 'reduceTerm' | 'reducePayment') {
    const month = monthIndex + 1;
    // Удаляем существующий платеж для этого месяца, если он есть
    this.schedule.removeAdditionalPayment(month);

    // Добавляем новый платеж
    const additionalPayment = new AdditionalPayment(month, extra, recalcType);
    this.schedule.addAdditionalPayment(additionalPayment);

    // Пересчитываем график
    this.schedule.recalculate();
  }

  removeAdditionalPayment(month: number) {
    this.schedule.removeAdditionalPayment(month);
    this.schedule.recalculate();
  }

  getUpdatedSchedule(): PaymentSchedule {
    const newSchedule = new PaymentSchedule(this.loan, this.schedule.paymentType);
    newSchedule.payments = this.schedule.payments.map(
      (payment) =>
        new Payment(
          payment.month,
          payment.amount.toNumber(),
          payment.interest.toNumber(),
          payment.principal.toNumber(),
          payment.balance.toNumber(),
          payment.extraPayment.toNumber(),
          payment.recalcMode
        )
    );
    newSchedule.payments.forEach((p, index) => {
      p.balanceAfterRepayment = this.schedule.payments[index].balanceAfterRepayment;
      p.previousBalance = this.schedule.payments[index].previousBalance;
    });
    newSchedule.additionalPayments = [...this.schedule.additionalPayments];
    return newSchedule;
  }
}