import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import Big from 'big.js';

interface RecalculationInputFormProps {
  onAddPayment: (monthIndex: number, extra: Big, recalcType: 'reduceTerm' | 'reducePayment') => void;
  maxMonth: number;
}

const RecalculationInputForm: React.FC<RecalculationInputFormProps> = ({ onAddPayment, maxMonth }) => {
  const [month, setMonth] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [recalculationType, setRecalculationType] = useState<'reduceTerm' | 'reducePayment'>('reduceTerm');

  const handleAddPayment = () => {
    if (month <= 0 || amount <= 0) {
      alert('Пожалуйста, введите корректные данные.');
      return;
    }
    if (month > maxMonth) {
      alert(`Месяц не может быть больше ${maxMonth}.`);
      return;
    }

    const extra = new Big(amount);
    onAddPayment(month - 1, extra, recalculationType);
    setMonth(1);
    setAmount(0);
  };

  return (
    <Form className="mt-4">
      <h4>Добавить дополнительный платеж</h4>
      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Месяц платежа</Form.Label>
            <Form.Control
              type="number"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              placeholder="Введите месяц"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Сумма (руб.)</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Введите сумму"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Тип перерасчета</Form.Label>
            <Form.Select
              value={recalculationType}
              onChange={(e) => setRecalculationType(e.target.value as 'reduceTerm' | 'reducePayment')}
            >
              <option value="reduceTerm">Уменьшение срока</option>
              <option value="reducePayment">Уменьшение платежа</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Button variant="success" onClick={handleAddPayment}>
        Добавить платеж
      </Button>
    </Form>
  );
};

export default RecalculationInputForm;
// import React, { useState } from 'react';
// import { Form, Button, Row, Col } from 'react-bootstrap';
// import Big from 'big.js';

// interface RecalculationInputFormProps {
//   onAddPayment: (monthIndex: number, extra: Big, recalcType: 'reduceTerm' | 'reducePayment') => void;
//   maxMonth: number; // Добавляем maxMonth в интерфейс
// }

// const RecalculationInputForm: React.FC<RecalculationInputFormProps> = ({ onAddPayment, maxMonth }) => {
//   const [month, setMonth] = useState<number>(1);
//   const [amount, setAmount] = useState<number>(0);
//   const [recalculationType, setRecalculationType] = useState<'reduceTerm' | 'reducePayment'>('reduceTerm');

//   const handleAddPayment = () => {
//     if (month <= 0 || amount <= 0) {
//       alert('Пожалуйста, введите корректные данные.');
//       return;
//     }
//     if (month > maxMonth) {
//       alert(`Месяц не может быть больше ${maxMonth}.`);
//       return;
//     }

//     const extra = new Big(amount);
//     console.log('Adding payment:', { monthIndex: month - 1, extra: extra.toString(), recalcType: recalculationType });
//     onAddPayment(month - 1, extra, recalculationType);
//     setMonth(1);
//     setAmount(0);
//   };

//   return (
//     <Form className="mt-4">
//       <h4>Добавить дополнительный платеж</h4>
//       <Row>
//         <Col md={4}>
//           <Form.Group className="mb-3">
//             <Form.Label>Месяц платежа</Form.Label>
//             <Form.Control
//               type="number"
//               value={month}
//               onChange={(e) => setMonth(Number(e.target.value))}
//               placeholder="Введите месяц"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={4}>
//           <Form.Group className="mb-3">
//             <Form.Label>Сумма (руб.)</Form.Label>
//             <Form.Control
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(Number(e.target.value))}
//               placeholder="Введите сумму"
//             />
//           </Form.Group>
//         </Col>
//         <Col md={4}>
//           <Form.Group className="mb-3">
//             <Form.Label>Тип перерасчета</Form.Label>
//             <Form.Select
//               value={recalculationType}
//               onChange={(e) => setRecalculationType(e.target.value as 'reduceTerm' | 'reducePayment')}
//             >
//               <option value="reduceTerm">Уменьшение срока</option>
//               <option value="reducePayment">Уменьшение платежа</option>
//             </Form.Select>
//           </Form.Group>
//         </Col>
//       </Row>
//       <Button variant="success" onClick={handleAddPayment}>
//         Добавить платеж
//       </Button>
//     </Form>
//   );
// };

// export default RecalculationInputForm;