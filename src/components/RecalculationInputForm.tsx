import React, { useState } from 'react';
import { Form, Button} from 'react-bootstrap';
import Big from 'big.js';
import CustomTooltip from './CustomTooltip'; // Импортируйте кастомный компонент
import '../index.css';

interface RecalculationInputFormProps {
  onAddPayment: (monthIndex: number, extra: Big, recalcType: 'reduceTerm' | 'reducePayment') => void;
  maxMonth: number;
}

const RecalculationInputForm: React.FC<RecalculationInputFormProps> = ({ onAddPayment, maxMonth }) => {
  const [monthIndex, setMonthIndex] = useState<number>(1);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [recalcType, setRecalcType] = useState<'reduceTerm' | 'reducePayment'>('reduceTerm');

  const handleSubmit = () => {
    if (monthIndex < 1 || monthIndex > maxMonth || !extraPayment || Number(extraPayment) <= 0) return;
    onAddPayment(monthIndex-1, new Big(extraPayment), recalcType);
    setExtraPayment(0);
    setMonthIndex(1);
  };

  return (
    <div className="form-container mb-3">
      <Form>
        <div className="form-row">
          <Form.Group className="form-group">
            <Form.Label className="form-label">Месяц</Form.Label>
            <Form.Control
              type="number"
              value={monthIndex}
              onChange={(e) => setMonthIndex(Number(e.target.value))}
              placeholder="Введите месяц"
              className="form-control"
              min="1"
              max={maxMonth}
              style={{fontSize: '1rem'}}
            />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label className="form-label">Доп. платеж (руб.)</Form.Label>
            <Form.Control
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              placeholder="Введите сумму"
              className="form-control"
              min="0"
              style={{fontSize: '1rem'}}
            />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label className="form-label">Тип перерасчета</Form.Label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Form.Select
                value={recalcType}
                onChange={(e) => setRecalcType(e.target.value as 'reduceTerm' | 'reducePayment')}
                className="form-select"
                style={{fontSize: '1rem'}}
              >
                <option value="reduceTerm">Уменьшение срока</option>
                <option value="reducePayment">Уменьшение платежа</option>
              </Form.Select>
              <CustomTooltip
                text="При выборе перерасчета на уменьшение срока, если это возможно, уменьшится количество месяцев кредита, при этом сохраняя сумму ежемесячного платежа. При выборе перерасчета на уменьшение платежа сохранится количество месяцев кредита, но уменьшатся последующие ежемесячные платежи."
                id="recalc-type-tooltip"
                
              />
            </div>
          </Form.Group>
          <Button variant="primary" onClick={handleSubmit} className="btn-primary" style={{fontSize: '1rem'}}>
            Добавить платеж
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RecalculationInputForm;