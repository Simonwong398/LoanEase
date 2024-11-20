export const translations = {
  en: {
    loanCalculator: 'Loan Calculator',
    loanType: {
      placeholder: 'Select loan type',
      house: 'House Loan',
      car: 'Car Loan',
      personal: 'Personal Loan'
    },
    input: {
      amount: 'Loan Amount',
      rate: 'Annual Interest Rate (%)',
      term: 'Loan Term (Years)',
      amountPlaceholder: 'Enter loan amount',
      ratePlaceholder: 'Enter annual rate',
      termPlaceholder: 'Enter loan term'
    },
    calculate: 'Calculate',
    results: {
      monthlyPayment: 'Monthly Payment: ¥',
      totalPayment: 'Total Payment: ¥',
      totalInterest: 'Total Interest: ¥'
    },
    feedback: {
      button: 'Send Feedback',
      title: 'Help us improve',
      description: 'We value your feedback'
    }
  },
  es: {
    loanCalculator: 'Calculadora de Préstamos',
    loanType: {
      placeholder: 'Seleccionar tipo de préstamo',
      house: 'Préstamo Hipotecario',
      car: 'Préstamo de Auto',
      personal: 'Préstamo Personal'
    },
    input: {
      amount: 'Monto del Préstamo',
      rate: 'Tasa de Interés Anual (%)',
      term: 'Plazo del Préstamo (Años)',
      amountPlaceholder: 'Ingrese el monto',
      ratePlaceholder: 'Ingrese la tasa anual',
      termPlaceholder: 'Ingrese el plazo'
    },
    calculate: 'Calcular',
    results: {
      monthlyPayment: 'Pago Mensual: ¥',
      totalPayment: 'Pago Total: ¥',
      totalInterest: 'Interés Total: ¥'
    },
    feedback: {
      button: 'Enviar Comentarios',
      title: 'Ayúdanos a mejorar',
      description: 'Valoramos tus comentarios'
    }
  },
  zh: {
    loanCalculator: '贷款计算器',
    loanType: {
      placeholder: '请选择贷款类型',
      house: '房贷',
      car: '车贷',
      personal: '个人贷款',
      commercialHouse: {
        name: '首套房商贷',
        description: '首次购房商业贷款，基准利率较低'
      },
      commercialSecondHouse: {
        name: '二套房商贷',
        description: '二套房商业贷款，利率有所上浮'
      },
      providentFund: {
        name: '公积金贷款',
        description: '使用住房公积金账户申请的贷款，利率最优惠'
      }
    },
    input: {
      amount: '贷款金额',
      rate: '年利率 (%)',
      term: '贷款期限 (年)',
      amountPlaceholder: '请输入贷款金额',
      ratePlaceholder: '请输入年利率',
      termPlaceholder: '请输入贷款期限'
    },
    calculate: '计算',
    results: {
      monthlyPayment: '月供：¥',
      totalPayment: '总还款：¥',
      totalInterest: '总利息：¥'
    },
    feedback: {
      button: '发送反馈',
      title: '帮助我们改进',
      description: '我们重视您的反馈'
    },
    combinedLoan: {
      title: '组合贷款计算',
      calculate: '计算组合贷款',
      totalMonthly: '每月总还款',
      totalPayment: '总还款金额',
      totalInterest: '总利息支出'
    },
    tips: {
      house: {
        commercial: {
          firstHome: '首套房贷款利率为LPR+基点（当前LPR为4.2%）',
          secondHome: '二套房贷款利率在首套房基础上上浮',
          lpr: 'LPR可能随市场情况调整，影响实际贷款利率',
          restriction: '部分城市可能有限购政策，请查询当地规定'
        },
        providentFund: {
          rate: '公积金贷款执行全国统一利率3.1%',
          limit: '贷款额度受个人公积金账户余额限制',
          combine: '可与商业贷款组合，优化总体利率成本'
        }
      }
    },
    downPayment: {
      title: '首付计算',
      totalPrice: '房屋总价',
      rate: '首付比例',
      amount: '首付金额',
      loanAmount: '贷款金额',
      note: '注：首付比例根据城市政策和购房类型自动计算'
    },
    restrictions: {
      title: '{city}购房限制政策',
      firstHome: '首套房购买条件',
      secondHome: '二套房购买条件',
      warning: '请确保您符合当地购房条件，否则可能无法办理贷款',
      understand: '我已了解',
      checkEligibility: '查看购房资格'
    },
    paymentComparison: {
      title: '还款方式对比',
      method: '还款方式',
      monthlyPayment: '月供',
      totalInterest: '总利息',
      equalPayment: '等额本息',
      equalPrincipal: '等额本金',
      monthlyDecreasing: '首月还款额，逐月递减',
      monthlyTrend: '月供变化趋势',
      difference: '两种方式对比',
      equalPaymentDesc: '每月还款额固定，前期还款压力小',
      equalPrincipalDesc: '每月本金固定，总利息较少'
    },
    navigation: {
      calculator: '计算器',
      history: '历史记录',
      settings: '设置'
    },
    history: {
      title: '计算历史',
      empty: '暂无历史记录',
      clearAll: '清空历史',
      export: '导出',
      delete: '删除',
      date: '日期',
      type: '类型',
      amount: '金额',
      monthlyPayment: '月供',
      totalInterest: '总利息'
    },
    settings: {
      language: '语言',
      theme: {
        title: '主题',
        light: '浅色',
        dark: '深色',
        system: '跟随系统'
      },
      defaults: {
        title: '默认设置',
        loanType: '贷款类型',
        city: '城市',
        term: '期限'
      },
      display: {
        title: '显示设置',
        showChart: '显示图表',
        showSchedule: '显示还款计划'
      },
      reset: '重置所有设置',
      resetConfirm: '确定要重置所有设置吗？'
    }
  }
}; 