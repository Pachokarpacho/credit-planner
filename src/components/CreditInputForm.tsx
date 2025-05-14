import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import Big from 'big.js';
import { Loan } from '../models/Loan';
import { PaymentSchedule } from '../models/PaymentSchedule';
import PaymentScheduleTable from './PaymentScheduleTable';
import RecalculationInputForm from './RecalculationInputForm';
import { RecalculationController } from '../controllers/RecalculationController';
import '../index.css';

interface CreditInputFormProps {
  onExport: (schedule: PaymentSchedule) => void;
}

const CreditInputForm: React.FC<CreditInputFormProps> = ({ onExport }) => {
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [annualRate, setAnnualRate] = useState<number>(0);
  const [termMonths, setTermMonths] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'annuity' | 'differentiated'>('annuity');
  const [schedule, setSchedule] = useState<PaymentSchedule | null>(null);
  const [controller, setController] = useState<RecalculationController | null>(null);

  const handleCalculate = () => {
    if (loanAmount <= 0 || annualRate <= 0 || termMonths <= 0) {
      setSchedule(null);
      setController(null);
      return;
    }
    const loan = new Loan(loanAmount, annualRate, termMonths);
    const newSchedule = new PaymentSchedule(loan, paymentType);
    const newController = new RecalculationController(loan, newSchedule);
    setSchedule(newSchedule);
    setController(newController);
  };

  const handleAddPayment = (monthIndex: number, extra: Big, recalcType: 'reduceTerm' | 'reducePayment') => {
    if (!controller) {
      console.log('Controller is null!');
      return;
    }
    controller.handleRecalcChange(monthIndex, extra, recalcType);
    const updatedSchedule = controller.getUpdatedSchedule();
    setSchedule(updatedSchedule);
  };

  const handleRemovePayment = (month: number) => {
    if (!controller) {
      console.log('Controller is null!');
      return;
    }
    controller.removeAdditionalPayment(month);
    const updatedSchedule = controller.getUpdatedSchedule();
    setSchedule(updatedSchedule);
  };

  const handlePaymentTypeChange = (value: string) => {
    if (value === 'annuity' || value === 'differentiated') {
      setPaymentType(value);
    } else {
      console.warn(`Unexpected payment type: ${value}`);
      setPaymentType('annuity');
    }
  };

  const handleUpdateSchedule = (updatedSchedule: PaymentSchedule) => {
    setSchedule(updatedSchedule);
    const newController = new RecalculationController(updatedSchedule.loan, updatedSchedule);
    setController(newController);
  };

  return (
    <div>
      <div className="forms-wrapper">
        <div className="forms-container">
          <div className={`form-container credit-data ${schedule ? '' : ''}`}>
            <div className="form-header">Данные кредита</div>
            <Form>
              <div className="form-row">
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Сумма кредита (руб.)</Form.Label>
                  <Form.Control
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    placeholder="Введите сумму"
                    className="form-control"
                  />
                </Form.Group>
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Годовая ставка (%)</Form.Label>
                  <Form.Control
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    placeholder="Введите ставку"
                    className="form-control"
                  />
                </Form.Group>
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Срок кредита (месяцы)</Form.Label>
                  <Form.Control
                    type="number"
                    value={termMonths}
                    onChange={(e) => setTermMonths(Number(e.target.value))}
                    placeholder="Введите срок"
                    className="form-control"
                  />
                </Form.Group>
                <Form.Group className="form-group">
                  <Form.Label className="form-label">Тип платежа</Form.Label>
                  <Form.Select
                    value={paymentType}
                    onChange={(e) => handlePaymentTypeChange(e.target.value)}
                    className="form-select"
                  >
                    <option value="annuity">Аннуитетный</option>
                    <option value="differentiated">Дифференцированный</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" onClick={handleCalculate} className="btn-primary">
                  Рассчитать
                </Button>
              </div>
            </Form>
          </div>

          {schedule && (
            <div className="form-container extra-payment">
              <div className="form-header">Добавить дополнительный платеж</div>
              <RecalculationInputForm onAddPayment={handleAddPayment} maxMonth={schedule.loan.termMonths} />
            </div>
          )}
        </div>
      </div>

      {schedule && (
        <>
          <PaymentScheduleTable
            schedule={schedule}
            onUpdateSchedule={handleUpdateSchedule}
            onRemovePayment={handleRemovePayment}
            onExport={() => onExport(schedule)}
          />
          <div>
            {schedule.additionalPayments.map((payment, index) => (
              <Button
                key={index}
                variant="danger"
                className="me-2 mb-2 btn-primary"
                style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                onClick={() => handleRemovePayment(payment.month)}
              >
                Удалить доп. платеж за {payment.month} месяц
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CreditInputForm;