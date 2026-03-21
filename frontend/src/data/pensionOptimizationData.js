const returnRates = {
  conservative: {
    "lump-sum": 0.06,
    phased: 0.05,
    annuity: 0.04,
    "joint-life": 0.04,
  },
  moderate: {
    "lump-sum": 0.08,
    phased: 0.07,
    annuity: 0.04,
    "joint-life": 0.04,
  },
  aggressive: {
    "lump-sum": 0.1,
    phased: 0.09,
    annuity: 0.04,
    "joint-life": 0.04,
  },
};

export { returnRates };
