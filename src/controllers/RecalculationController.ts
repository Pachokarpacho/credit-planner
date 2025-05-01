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
    const additionalPayment = new AdditionalPayment(month, extra.toNumber(), recalcType);
    this.schedule.addAdditionalPayment(additionalPayment);
  }

  removeAdditionalPayment(month: number) {
    this.schedule.removeAdditionalPayment(month);
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
// import Big from 'big.js';
// import { Loan } from '../models/Loan';
// import { PaymentSchedule } from '../models/PaymentSchedule';
// import { Payment } from '../models/Payment';

// export class RecalculationController {
//   private loan: Loan;
//   private schedule: PaymentSchedule;

//   constructor(loan: Loan, schedule: PaymentSchedule) {
//     this.loan = loan;
//     this.schedule = schedule;
//   }

//   handleRecalcChange(monthIndex: number, extra: Big, recalcType: 'reduceTerm' | 'reducePayment') {
//     console.log('Payments length:', this.schedule.payments.length, 'Requested monthIndex:', monthIndex);
//     const payment = this.schedule.payments[monthIndex];
//     if (!payment) {
//       console.log('Payment not found at monthIndex:', monthIndex);
//       return;
//     }

//     const updatedPayment = new Payment(
//       payment.month,
//       payment.amount.toNumber(),
//       payment.interest.toNumber(),
//       payment.principal.toNumber(),
//       payment.balance.toNumber(),
//       extra.toNumber(),
//       recalcType
//     );
//     updatedPayment.balanceAfterRepayment = payment.balance.minus(extra).round(2);
//     updatedPayment.previousBalance = payment.balance;

//     this.schedule.payments[monthIndex] = updatedPayment;
//     console.log('Updated payment:', {
//       extraPayment: updatedPayment.extraPayment.toString(),
//       balanceAfterRepayment: updatedPayment.balanceAfterRepayment.toString(),
//     });

//     this.recalculate(monthIndex);
//   }

//   private recalculate(startIndex: number) {
//     const payment = this.schedule.payments[startIndex];
//     if (!payment.recalcMode) return;

//     let remainingBalance = payment.balanceAfterRepayment;
//     console.log('Recalculating with remainingBalance:', remainingBalance.toString());
//     if (remainingBalance.lte(0)) {
//       console.log('Balance <= 0, slicing payments up to:', startIndex + 1);
//       this.schedule.payments = this.schedule.payments.slice(0, startIndex + 1);
//       return;
//     }

//     const remainingMonths = this.loan.termMonths - startIndex - 1;
//     if (remainingMonths <= 0) {
//       console.log('No remaining months to recalculate');
//       return;
//     }

//     let newSchedule: PaymentSchedule;
//     if (payment.recalcMode === 'reduceTerm') {
//       newSchedule = this.createReducedTermSchedule(remainingBalance, startIndex + 1);
//     } else {
//       newSchedule = this.createReducedPaymentSchedule(remainingBalance, startIndex + 1);
//     }

//     console.log('New schedule payments length:', newSchedule.payments.length);
//     this.schedule.payments = [
//       ...this.schedule.payments.slice(0, startIndex + 1),
//       ...newSchedule.payments,
//     ];
//     console.log('Updated payments length:', this.schedule.payments.length);
//   }

//   private createReducedTermSchedule(balance: Big, startMonth: number): PaymentSchedule {
//     const monthlyRate = this.loan.getMonthlyRate();
//     const currentPayment = this.schedule.payments[0].amount; // Исходный аннуитетный платеж
//     let remainingBalance = balance;
//     const newPayments: Payment[] = [];
//     let month = startMonth; // Начинаем с 4, если startMonth = 4

//     while (remainingBalance.gt(0)) {
//       const interest = remainingBalance.times(monthlyRate).round(2);
//       let paymentAmount = currentPayment;
//       let principal = paymentAmount.minus(interest).round(2);

//       if (remainingBalance.lte(paymentAmount)) {
//         paymentAmount = remainingBalance.plus(interest).round(2);
//         principal = remainingBalance;
//       }

//       remainingBalance = remainingBalance.minus(principal).round(2);

//       const payment = new Payment(
//         month,
//         paymentAmount.toNumber(),
//         interest.toNumber(),
//         principal.toNumber(),
//         remainingBalance.toNumber()
//       );
//       payment.balanceAfterRepayment = remainingBalance;
//       payment.previousBalance = remainingBalance.plus(principal);

//       newPayments.push(payment);
//       month++;

//       if (remainingBalance.lte(0)) break;
//     }

//     const newSchedule = new PaymentSchedule(this.loan, 'annuity');
//     newSchedule.payments = newPayments;
//     return newSchedule;
//   }

//   private createReducedPaymentSchedule(balance: Big, startMonth: number): PaymentSchedule {
//     const totalMonths = this.loan.termMonths;
//     const remainingMonths = totalMonths - (startMonth - 1); // Например, 12 - (4-1) = 9

//     // Создаем новый график с оставшимся балансом и оставшимся сроком
//     const newLoan = new Loan(balance.toNumber(), this.loan.annualRate.toNumber(), remainingMonths);
//     const newSchedule = new PaymentSchedule(newLoan, 'annuity');

//     // Присваиваем номера месяцев, начиная с startMonth
//     newSchedule.payments.forEach((p, index) => {
//       p.month = startMonth + index;
//     });

//     // Ограничиваем количество платежей, чтобы общее количество месяцев не превышало totalMonths
//     if (newSchedule.payments.length > remainingMonths) {
//       newSchedule.payments = newSchedule.payments.slice(0, remainingMonths);
//     }

//     // Дополнительная проверка: общее количество месяцев не должно превышать исходный срок
//     if (startMonth + newSchedule.payments.length - 1 > totalMonths) {
//       newSchedule.payments = newSchedule.payments.slice(0, totalMonths - startMonth + 1);
//     }

//     return newSchedule;
//   }

//   getUpdatedSchedule(): PaymentSchedule {
//     const newSchedule = new PaymentSchedule(this.loan, this.schedule.payments[0]?.recalcMode || 'annuity');
//     newSchedule.payments = this.schedule.payments.map(
//       (payment) =>
//         new Payment(
//           payment.month,
//           payment.amount.toNumber(),
//           payment.interest.toNumber(),
//           payment.principal.toNumber(),
//           payment.balance.toNumber(),
//           payment.extraPayment.toNumber(),
//           payment.recalcMode
//         )
//     );
//     newSchedule.payments.forEach((p, index) => {
//       p.balanceAfterRepayment = this.schedule.payments[index].balanceAfterRepayment;
//       p.previousBalance = this.schedule.payments[index].previousBalance;
//     });
//     return newSchedule;
//   }
// }