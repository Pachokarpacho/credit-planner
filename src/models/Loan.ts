import Big from 'big.js';

export class Loan {
  principalAmount: Big;
  annualRate: Big;
  termMonths: number;

  constructor(principalAmount: number, annualRate: number, termMonths: number) {
    this.principalAmount = new Big(principalAmount);
    this.annualRate = new Big(annualRate);
    this.termMonths = termMonths;
  }

  getMonthlyRate(): Big {
    return this.annualRate.div(12).div(100);
  }

  calcAnnuityPayment(): Big {
    const rate = this.getMonthlyRate();
    const factor = rate.plus(1).pow(this.termMonths);
    return this.principalAmount.times(rate.times(factor)).div(factor.minus(1)).round(2);
  }
}
// import Big from 'big.js';

// export class Loan {
//   principalAmount: Big;
//   annualRate: Big;
//   termMonths: number;

//   constructor(principalAmount: number, annualRate: number, termMonths: number) {
//     this.principalAmount = new Big(principalAmount);
//     this.annualRate = new Big(annualRate);
//     this.termMonths = termMonths;
//   }

//   getMonthlyRate(): Big {
//     return this.annualRate.div(12).div(100); // Месячная ставка = годовая / 12 / 100
//   }

//   calcAnnuityPayment(): Big {
//     const monthlyRate = this.getMonthlyRate();
//     const ratePlusOne = monthlyRate.plus(1);
//     const power = ratePlusOne.pow(this.termMonths);
//     const numerator = this.principalAmount.times(monthlyRate).times(power);
//     const denominator = power.minus(1);
//     return numerator.div(denominator).round(2); // Аннуитетный платеж
//   }

//   calcDiffPayment(month: number): Big {
//     const monthlyRate = this.getMonthlyRate();
//     const remainingMonths = this.termMonths - month + 1;
//     const basePayment = this.principalAmount.div(this.termMonths);
//     const interest = this.principalAmount
//       .times(monthlyRate)
//       .times(remainingMonths)
//       .div(this.termMonths);
//     return basePayment.plus(interest).round(2); // Дифференцированный платеж
//   }
// }