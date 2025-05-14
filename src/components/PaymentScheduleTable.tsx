import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { PaymentSchedule } from '../models/PaymentSchedule';
import Big from 'big.js';
import { RecalculationController } from '../controllers/RecalculationController';

interface PaymentScheduleTableProps {
  schedule: PaymentSchedule;
  onUpdateSchedule: (updatedSchedule: PaymentSchedule) => void;
  onRemovePayment: (month: number) => void;
}

const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({ schedule, onUpdateSchedule, onRemovePayment }) => {
  const [extraPayments, setExtraPayments] = useState<{ [key: number]: { amount: Big; recalcType: 'reduceTerm' | 'reducePayment' | null } }>({});
  const [localSchedule, setLocalSchedule] = useState(schedule);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(12);

  // Эффект для синхронизации localSchedule и extraPayments
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

  // Отдельный эффект для проверки текущей страницы
  useEffect(() => {
    const totalRows = localSchedule.payments.length;
    const totalPages = rowsPerPage === 0 ? 1 : Math.ceil(totalRows / rowsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [localSchedule, rowsPerPage, currentPage]); // Теперь currentPage включен

  const handleExtraPaymentChange = (month: number, value: string) => {
    const amount = value ? new Big(value) : new Big(0);
    if (amount.lt(0)) return;

    setExtraPayments((prev) => {
      const updatedPayments = { ...prev };
      const currentPayment = prev[month] || { amount: new Big(0), recalcType: null };

      if (amount.eq(0) && currentPayment.amount.gt(0)) {
        onRemovePayment(month);
      } else if (!amount.eq(0)) {
        updatedPayments[month] = {
          amount,
          recalcType: currentPayment.recalcType || null,
        };

        if (updatedPayments[month].recalcType) {
          triggerRecalculation(month, amount, updatedPayments[month].recalcType);
        }
      }

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

        const totalRows = newSchedule.payments.length;
        const totalPages = rowsPerPage === 0 ? 1 : Math.ceil(totalRows / rowsPerPage);
        if (currentPage > totalPages) {
          setCurrentPage(totalPages);
        }
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

      const totalRows = newSchedule.payments.length;
      const totalPages = rowsPerPage === 0 ? 1 : Math.ceil(totalRows / rowsPerPage);
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
    }
  };

  const totalRows = localSchedule.payments.length;
  const totalPages = rowsPerPage === 0 ? 1 : Math.ceil(totalRows / rowsPerPage);

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'all') {
      setRowsPerPage(0);
    } else {
      setRowsPerPage(Number(value));
    }
    setCurrentPage(1);
  };

  const getPaginatedData = () => {
    const startIndex = rowsPerPage === 0 ? 0 : (currentPage - 1) * rowsPerPage;
    const endIndex = rowsPerPage === 0 ? localSchedule.payments.length : startIndex + rowsPerPage;
    return localSchedule.payments.slice(startIndex, endIndex);
  };

  const filteredPayments = getPaginatedData();

  const renderPageButtons = () => {
    const pageButtons = [];
    const maxButtonsToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    if (startPage > 1) {
      pageButtons.push(
        <Button
          key={1}
          variant="outline-primary"
          onClick={() => setCurrentPage(1)}
          className="me-1"
          style={{ minWidth: '40px' }}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pageButtons.push(<span key="start-ellipsis" className="me-1">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={currentPage === i ? 'primary' : 'outline-primary'}
          onClick={() => setCurrentPage(i)}
          className="me-1"
          style={{ minWidth: '40px' }}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(<span key="end-ellipsis" className="me-1">...</span>);
      }
      pageButtons.push(
        <Button
          key={totalPages}
          variant="outline-primary"
          onClick={() => setCurrentPage(totalPages)}
          className="me-1"
          style={{ minWidth: '40px' }}
        >
          {totalPages}
        </Button>
      );
    }

    return pageButtons;
  };

  return (
    <div className="mt-3">
      <Table striped bordered hover>
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
                  min="0"
                />
              </td>
              <td>
                <select
                  value={extraPayments[payment.month]?.recalcType || ''}
                  onChange={(e) => handleRecalcTypeChange(payment.month, e.target.value as 'reduceTerm' | 'reducePayment')}
                  className="form-select"
                  disabled={!(extraPayments[payment.month]?.amount && extraPayments[payment.month].amount.gt(0))}
                >
                  <option value="" disabled>
                    Выберите...
                  </option>
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

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <span>Записей на странице: </span>
          <select
            value={rowsPerPage === 0 ? 'all' : rowsPerPage.toString()}
            onChange={handleRowsPerPageChange}
            className="form-select"
            style={{ display: 'inline-block', width: 'auto' }}
          >
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="all">Вся таблица</option>
          </select>
        </div>
        <div>{renderPageButtons()}</div>
      </div>
    </div>
  );
};

export default PaymentScheduleTable;