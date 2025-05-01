import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import CreditInputForm from './components/CreditInputForm';

const App: React.FC = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>Планировщик выплат по кредиту</h1>
          <p>Введите данные о кредите для расчета графика выплат.</p>
          <CreditInputForm />
        </Col>
      </Row>
    </Container>
  );
};

export default App;