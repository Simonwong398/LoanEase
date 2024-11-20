interface ProvidentFundAccount {
  monthlyIncome: number;        // 月收入
  monthlyContribution: number;  // 月缴存额
  balance: number;              // 账户余额
  contributionYears: number;    // 缴存年限
}

interface ProvidentFundLimit {
  maxAmount: number;            // 最高可贷额度
  maxTerm: number;             // 最长贷款年限
  reasonCode: string;          // 额度限制原因代码
}

export const calculateProvidentFundLimit = (
  account: ProvidentFundAccount,
  cityId: string
): ProvidentFundLimit => {
  // 基于月收入计算还款能力
  const monthlyPaymentCapacity = account.monthlyIncome * 0.5;
  
  // 基于缴存计算额度
  const contributionBasedLimit = account.monthlyContribution * 12 * 15;
  
  // 基于余额计算额度
  const balanceBasedLimit = account.balance * 10;
  
  // 获取最小值作为最终额度
  const maxAmount = Math.min(
    contributionBasedLimit,
    balanceBasedLimit,
    1200000 // 公积金贷款上限
  );

  // 根据缴存年限确定最长贷款期限
  let maxTerm = 30;
  if (account.contributionYears < 1) {
    maxTerm = 15;
  } else if (account.contributionYears < 3) {
    maxTerm = 20;
  } else if (account.contributionYears < 5) {
    maxTerm = 25;
  }

  // 确定额度限制原因
  let reasonCode = 'NORMAL';
  if (maxAmount === contributionBasedLimit) {
    reasonCode = 'CONTRIBUTION_LIMIT';
  } else if (maxAmount === balanceBasedLimit) {
    reasonCode = 'BALANCE_LIMIT';
  } else if (maxAmount === 1200000) {
    reasonCode = 'POLICY_LIMIT';
  }

  return {
    maxAmount,
    maxTerm,
    reasonCode
  };
}; 