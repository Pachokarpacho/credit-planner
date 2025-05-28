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
        <Col>
        <div className='forms-wrapper'style={{marginTop: '5px',}}>
          <h1>Особенности досрочного погашения</h1>
          <div>
          <p className='text'>При частично досрочном погашении возможно два типа списаний:
          </p>
          <p className='text'>- в день очередного платежа. В этом случае сумма долга просто уменьшается на сумму внеочередного платежа;
          </p>
          <p className='text'>- между двумя очередными платежами. Проценты на сумму долга начисляются каждый день, а гасятся раз в месяц. К моменту досрочного платежа накапливается некая сумма процентов, которая будет погашена за счет средств, предназначенных на досрочный платеж. И только оставшаяся сумма пойдет на погашение основного долга. В следующем же месяце процентная часть очередного платежа будет меньше, ведь часть процентов за этот месяц уже уплачена.
          </p>
          <p className='text'>После внесения внеочередного платежа меняется график последующих погашений кредита. Сумма основного долга уменьшается и следом за ней изменяется один из двух параметров: сумма ежемесячного платежа или срок кредита. Выбор всегда за клиентом банка. С учетом вашего выбора банк делает перерасчет кредита и формирует новый график платежей. Имейте это ввиду и получайте новый график платежей в офисе банка или в программе интернет-банк (если такую возможность предоставляет банк). Данное приложение также позволяет выбрать любой вариант и производит расчет с учетом выбора. После расчета вам будет представлен подробный график платежей с учетом указанных досрочных погашений.
          </p>
          <p></p>
          </div>
        </div>
        </Col>
      </Row>
    </Container>
  );
};

export default App;