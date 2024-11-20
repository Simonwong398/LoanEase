export interface LoanTypeConfig {
  id: string;
  defaultRate: number;
  maxTerm: number;
  minAmount: number;
  maxAmount: number;
  description: string;
  tips: string[];
  canCombine?: boolean;
  combinableWith?: string[];
}

export const loanTypes: Record<string, LoanTypeConfig> = {
  commercialHouse: {
    id: 'commercialHouse',
    defaultRate: 4.2,
    maxTerm: 30,
    minAmount: 100000,
    maxAmount: 10000000,
    description: 'loanType.commercialHouse.description',
    tips: [
      'tips.house.commercial.firstHome',
      'tips.house.commercial.secondHome',
      'tips.house.commercial.lpr'
    ],
    canCombine: true,
    combinableWith: ['providentFund']
  },
  providentFund: {
    id: 'providentFund',
    defaultRate: 3.1,
    maxTerm: 30,
    minAmount: 50000,
    maxAmount: 1200000,
    description: 'loanType.providentFund.description',
    tips: [
      'tips.house.providentFund.rate',
      'tips.house.providentFund.limit',
      'tips.house.providentFund.combine'
    ],
    canCombine: true,
    combinableWith: ['commercialHouse']
  },
  commercialSecondHouse: {
    id: 'commercialSecondHouse',
    defaultRate: 5.2,
    maxTerm: 30,
    minAmount: 100000,
    maxAmount: 10000000,
    description: 'loanType.commercialSecondHouse.description',
    tips: [
      'tips.house.commercial.secondHome',
      'tips.house.commercial.lpr',
      'tips.house.commercial.restriction'
    ],
    canCombine: true,
    combinableWith: ['providentFund']
  }
}; 