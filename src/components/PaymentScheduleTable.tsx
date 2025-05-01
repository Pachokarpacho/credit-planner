import React from 'react';
import { Table } from 'react-bootstrap';
import { PaymentSchedule } from '../models/PaymentSchedule';
//import Big from 'big.js';

interface PaymentScheduleTableProps {
  schedule: PaymentSchedule;
}

const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({ schedule }) => {
  // Найдем индекс последнего платежа, где остаток долга становится 0
  let lastNonZeroBalanceIndex = schedule.payments.length - 1;
  for (let i = 0; i < schedule.payments.length; i++) {
    if (schedule.payments[i].balanceAfterRepayment.lte(0)) {
      lastNonZeroBalanceIndex = i;
      break;
    }
  }

  // Отображаем все платежи до того месяца, где остаток становится 0 (включительно)
  const filteredPayments = schedule.payments.filter(
    (payment, index) => index <= lastNonZeroBalanceIndex
  );

  return (
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr>
          <th>Месяц</th>
          <th>Платеж (руб.)</th>
          <th>Проценты (руб.)</th>
          <th>Основной долг (руб.)</th>
          <th>Доп. платеж (руб.)</th>
          <th>Остаток до доп. платежа (руб.)</th>
          <th>Остаток после доп. платежа (руб.)</th>
        </tr>
      </thead>
      <tbody>
        {filteredPayments.map((payment) => (
          <tr key={payment.month}>
            <td>{payment.month}</td>
            <td>{payment.amount.toFixed(2)}</td>
            <td>{payment.interest.toFixed(2)}</td>
            <td>{payment.principal.toFixed(2)}</td>
            <td>{payment.extraPayment.toFixed(2)}</td>
            <td>{payment.balance.toFixed(2)}</td>
            <td>{payment.balanceAfterRepayment.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default PaymentScheduleTable;
// import React from 'react';
// import { Table } from 'react-bootstrap';
// import { PaymentSchedule } from '../models/PaymentSchedule';

// interface PaymentScheduleTableProps {
//   schedule: PaymentSchedule;
// }

// const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({ schedule }) => {
//   return (
//     <Table striped bordered hover className="mt-3">
//       <thead>
//         <tr>
//           <th>Месяц</th>
//           <th>Платеж (руб.)</th>
//           <th>Проценты (руб.)</th>
//           <th>Основной долг (руб.)</th>
//           <th>Дополнительный платеж (руб.)</th>
//           <th>Остаток после доп. платежа (руб.)</th>
//         </tr>
//       </thead>
//       <tbody>
//         {schedule.payments.map((payment) => (
//           <tr key={payment.month}>
//             <td>{payment.month}</td>
//             <td>{payment.amount.toFixed(2)}</td>
//             <td>{payment.interest.toFixed(2)}</td>
//             <td>{payment.principal.toFixed(2)}</td>
//             <td>{payment.extraPayment.toFixed(2)}</td>
//             <td>{payment.balanceAfterRepayment.toFixed(2)}</td>
//           </tr>
//         ))}
//       </tbody>
//     </Table>
//   );
// };

// export default PaymentScheduleTable;