import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CreditInputForm from './components/CreditInputForm';
import { PaymentSchedule } from './models/PaymentSchedule';
import { ExportController } from './controllers/ExportController';
import Big from 'big.js';

const App: React.FC = () => {
  const handleExport = (schedule: PaymentSchedule) => {
    const extraPayments: { [key: number]: { amount: Big; recalcType: 'reduceTerm' | 'reducePayment' | null } } = {};
    schedule.additionalPayments.forEach((payment) => {
      extraPayments[payment.month] = {
        amount: payment.amount,
        recalcType: payment.recalcType,
      };
    });
    const exportController = new ExportController(schedule, extraPayments);
    exportController.exportToPDF();
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Планировщик выплат по кредиту</h1>
          <p>Введите данные о кредите для расчета графика выплат.</p>
          <CreditInputForm onExport={handleExport} />
        </Col>
      </Row>
    </Container>
  );
};

export default App;