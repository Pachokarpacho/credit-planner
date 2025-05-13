import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import { PaymentSchedule } from '../models/PaymentSchedule';
import Big from 'big.js';
import { RecalculationController } from '../controllers/RecalculationController';

interface PaymentScheduleTableProps {
  schedule: PaymentSchedule;
  onUpdateSchedule: (updatedSchedule: PaymentSchedule) => void;
}

const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({ schedule, onUpdateSchedule }) => {
  const [extraPayments, setExtraPayments] = useState<{ [key: number]: { amount: Big; recalcType: 'reduceTerm' | 'reducePayment' | null } }>({});
  const [localSchedule, setLocalSchedule] = useState(schedule);

  useEffect(() => {
    setLocalSchedule(schedule);
    const updatedExtraPayments: { [key: number]: { amount: Big; recalcType: 'reduceTerm' | 'reducePayment' | null } } = {};
    schedule.additionalPayments.forEach((payment) => {
      updatedExtraPayments[payment.month] = {
        amount: payment.amount,
        recalcType: payment.recalcType,
      };
    });
    setExtraPayments(updatedExtraPayments);
  }, [schedule]);

  const handleExtraPaymentChange = (month: number, value: string) => {
    const amount = value ? new Big(value) : new Big(0);
    if (amount.lt(0)) return;
    setExtraPayments((prev) => {
      const updatedPayments = {
        ...prev,
        [month]: { 
          amount, 
          recalcType: prev[month]?.recalcType || null,
        },
      };
      triggerRecalculation(month, amount, updatedPayments[month]?.recalcType);
      return updatedPayments;
    });
  };

  const handleRecalcTypeChange = (month: number, value: 'reduceTerm' | 'reducePayment') => {
    setExtraPayments((prev) => {
      const updatedPayments = {
        ...prev,
        [month]: { 
          amount: prev[month]?.amount || new Big(0), 
          recalcType: value,
        },
      };
      const updatedSchedule = new PaymentSchedule(localSchedule.loan, localSchedule.paymentType);
      updatedSchedule.payments = [...localSchedule.payments];
      updatedSchedule.additionalPayments = localSchedule.additionalPayments.filter((p) => p.month !== month);

      if (updatedPayments[month].amount.gt(0)) {
        const controller = new RecalculationController(updatedSchedule.loan, updatedSchedule);
        controller.handleRecalcChange(month - 1, updatedPayments[month].amount, value);
        const newSchedule = controller.getUpdatedSchedule();
        setLocalSchedule(newSchedule);
        onUpdateSchedule(newSchedule);
      } else {
        setLocalSchedule(updatedSchedule);
        onUpdateSchedule(updatedSchedule);
      }
      return updatedPayments;
    });
  };

  const triggerRecalculation = (month: number, amount: Big, recalcType: 'reduceTerm' | 'reducePayment' | null) => {
    if (amount.gt(0) && recalcType) {
      const updatedSchedule = new PaymentSchedule(localSchedule.loan, localSchedule.paymentType);
      updatedSchedule.payments = [...localSchedule.payments];
      updatedSchedule.additionalPayments = localSchedule.additionalPayments.filter((p) => p.month !== month);

      const controller = new RecalculationController(updatedSchedule.loan, updatedSchedule);
      controller.handleRecalcChange(month - 1, amount, recalcType);
      const newSchedule = controller.getUpdatedSchedule();
      setLocalSchedule(newSchedule);
      onUpdateSchedule(newSchedule);
    }
  };

  const filteredPayments = localSchedule.payments;

  return (
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr>
          <th>Месяц</th>
          <th>Платеж (руб.)</th>
          <th>Проценты (руб.)</th>
          <th>Основной долг (руб.)</th>
          <th>Доп. платеж (руб.)</th>
          <th>Вид перерасчета</th>
          <th>Остаток до доп. платежа (руб.)</th>
          <th>Остаток после доп. платежа (руб.)</th>
        </tr>
      </thead>
      <tbody>
        {filteredPayments.map((payment) => (
          <tr key={payment.month}>
            <td>{payment.month}</td>
            <td>{new Big(payment.amount).toFixed(2)}</td>
            <td>{new Big(payment.interest).toFixed(2)}</td>
            <td>{new Big(payment.principal).toFixed(2)}</td>
            <td>
              <input
                type="number"
                value={extraPayments[payment.month]?.amount.toString() || ''}
                onChange={(e) => handleExtraPaymentChange(payment.month, e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="form-control"
              />
            </td>
            <td>
              <select
                value={extraPayments[payment.month]?.recalcType || ''}
                onChange={(e) => handleRecalcTypeChange(payment.month, e.target.value as 'reduceTerm' | 'reducePayment')}
                className="form-select"
              >
                <option value="" disabled={!!extraPayments[payment.month]?.recalcType}>Выберите...</option>
                <option value="reduceTerm">Уменьшение срока</option>
                <option value="reducePayment">Уменьшение платежа</option>
              </select>
            </td>
            <td>{new Big(payment.balance).toFixed(2)}</td>
            <td>{new Big(payment.balanceAfterRepayment).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default PaymentScheduleTable;