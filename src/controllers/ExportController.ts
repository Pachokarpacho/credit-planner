import Big from 'big.js';
import html2pdf from 'html2pdf.js';
import { PaymentSchedule } from '../models/PaymentSchedule';

export class ExportController {
  private schedule: PaymentSchedule;
  private extraPayments: {
    [key: number]: { amount: Big; recalcType: 'reduceTerm' | 'reducePayment' | null };
  };

  // 🔁 Добавлены словари перевода
  private paymentTypeLabels: { [key: string]: string } = {
    annuity: 'Аннуитетный',
    differentiated: 'Дифференцированный',
  };

  private recalcTypeLabels: { [key: string]: string } = {
    reduceTerm: 'Срок',
    reducePayment: 'Платеж',
  };

  constructor(
    schedule: PaymentSchedule,
    extraPayments: {
      [key: number]: { amount: Big; recalcType: 'reduceTerm' | 'reducePayment' | null };
    }
  ) {
    this.schedule = schedule;
    this.extraPayments = extraPayments;
  }

  exportToPDF() {
    // Создаем HTML таблицу
    const tableHtml = `
      <h2>Информация о кредите</h2>
      <p>Сумма кредита: ${this.schedule.loan.principalAmount.toFixed(2)} руб.</p>
      <p>Годовая ставка: ${this.schedule.loan.annualRate.toFixed(2)}%</p>
      <p>Срок: ${this.schedule.loan.termMonths} месяцев</p>
      <p>Тип платежа: ${this.paymentTypeLabels[this.schedule.paymentType] || this.schedule.paymentType}</p>
      <p>Дата экспорта: ${new Date().toLocaleDateString('ru-RU')}</p>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr style="background-color: #2980b9; color: white;">
            <th style="border: 1px solid #ddd; padding: 4px; text-align: center;">Месяц</th>
            <th style="border: 1px solid #ddd; padding: 4px; text-align: center;">Платеж (руб.)</th>
            <th style="border: 1px solid #ddd; padding: 4px; text-align: center;">Проценты (руб.)</th>
            <th style="border: 1px solid #ddd; padding: 4px; text-align: center;">Основной долг (руб.)</th>
            <th style="border: 1px solid #ddd; padding: 4px; text-align: center;">Доп. платеж (руб.)</th>
            <th style="border: 1px solid #ddd; padding: 4px; text-align: center;">Вид перерасчета</th>
            <th style="border: 1px solid #ddd; padding: 4px; text-align: center;">Остаток до доп. платежа (руб.)</th>
            <th style="border: 1px solid #ddd; padding: 4px; text-align: center;">Остаток после доп. платежа (руб.)</th>
          </tr>
        </thead>
        <tbody>
          ${this.schedule.payments
            .map((payment) => {
              const extra = this.extraPayments[payment.month];
              const recalcType =
                extra?.recalcType !== null && extra?.recalcType !== undefined
                  ? this.recalcTypeLabels[extra.recalcType as 'reduceTerm' | 'reducePayment'] || extra.recalcType
                  : '';
              return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${payment.month}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${new Big(payment.amount).toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${new Big(payment.interest).toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${new Big(payment.principal).toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${extra?.amount?.toFixed(2) || '0.00'}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${recalcType}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${new Big(payment.balance).toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center;">${new Big(payment.balanceAfterRepayment).toFixed(2)}</td>
                </tr>
              `;
            })
            .join('')}
        </tbody>
      </table>
    `;

    // Настраиваем экспорт в PDF
    html2pdf()
      .from(tableHtml)
      .set({
        margin: [10, 10, 10, 10],
        filename: 'payment_schedule.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      })
      .save();
  }
}
