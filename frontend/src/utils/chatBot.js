import { calculateRiskToleranceFromZerodha } from "./pensionCalculation";
import { getReturnRate } from "./pensionCalculation";

export const generateBotResponse = async (
  userMessage,
  formData,
  userData,
  scenarios
) => {
  const message = userMessage?.toLowerCase() || "";


  // Step 1: Basic Information
  if (
    message.includes("basic information") ||
    message.includes("start") ||
    message.includes("profile") ||
    message.includes("get started") ||
    (!userData.name && !userData.email && !userData.age)
  ) {
    return {
      content:
        "Great! Let's start by collecting your basic information. This will help me personalize your retirement planning.",
      component: "basic-info-form",
    };
  }

  // After basic info form submission
  if (formData?.formName === "basic-info-form") {
    return {
      content:
        "Perfect! Now let's understand your current income and employment details. This information is crucial for calculating your retirement scenarios.",
      component: "income-status-form",
      updateUserData: formData,
    };
  }

  // After income status form submission
  if (formData?.formName === "income-status-form") {
    return {
      content:
        "Excellent! Now let's plan your retirement goals and lifestyle preferences. This will help me create the perfect retirement strategy for you.",
      component: "retirement-info-form",
      updateUserData: formData,
    };
  }

  // After retirement info form submission - Go to Life Expectancy Assessment
  if (formData?.formName == "retirement-info-form") {
    return {
      content:
        "Great progress! Now let's assess your health profile to better estimate your life expectancy. This helps in creating more accurate retirement scenarios.",
      component: "life-expectancy-form",
      updateUserData: formData,
    };
  }

  // After life expectancy form submission - Go to Risk Tolerance Analysis
  if (formData?.formName === "life-expectancy-form") {
    return {
      content:
        "Almost done! Now let's determine your risk tolerance. You can either connect your Zerodha account for automatic analysis or enter your details manually.",
      component: "risk-tolerance-form",
      updateUserData: {
        ...formData,
        formName: "risk-tolerance-form", // prevent locking into same form
        isSkipped: formData.isSkipped || false,
      },
    };
  }

  // After risk tolerance form submission
  if (formData?.formName === "risk-tolerance-form") {
    const scenarios = generateScenarios(userData, formData);
    return {
      content:
        formData.mode === "zerodha"
          ? "Perfect! I've analyzed your Zerodha portfolio data and calculated your risk tolerance automatically. Here are your personalized retirement scenarios:"
          : "Excellent! Based on your investment portfolio details, here are your personalized retirement scenarios:",
      component: "scenario-visualization",
      data: { scenarios },
      updateUserData: { ...formData, formName: "scenario-visualization" }, // prevent loop
      updateScenarios: scenarios,
    };
  }

  // Risk tolerance specific queries
  if (formData?.formName === "scenario-visualization") {
    if (userData.mode === "zerodha" || userData.mode === "manual") {
      return {
        content:
          "Based on your risk tolerance analysis, here are some insights about your investment profile:",
        component: "recommendation",
        data: getRiskRecommendation(userData),
      };
    } else {
      return {
        content:
          "Let me help you determine your risk tolerance. Choose between Zerodha integration or manual entry:",
        component: "risk-tolerance-form",
      };
    }
  }

  // Zerodha connection queries
  if (
    message.includes("zerodha") ||
    message.includes("trading") ||
    message.includes("connect account") ||
    message.includes("login")
  ) {
    return {
      content:
        "I can help you connect your Zerodha account to automatically analyze your portfolio and calculate your risk tolerance. This will provide more accurate recommendations.",
      component: "risk-tolerance-form",
    };
  }

  // Manual entry queries
  if (
    message.includes("manual") ||
    message.includes("enter manually") ||
    message.includes("without zerodha")
  ) {
    return {
      content:
        "No problem! You can enter your investment details manually. Let me guide you through this:",
      component: "risk-tolerance-form",
    };
  }

  // Chart requests
  if (
    message.includes("chart") ||
    message.includes("comparison") ||
    message.includes("graph") ||
    message.includes("visual")
  ) {
    if (scenarios && scenarios.length > 0) {
      return {
        content:
          "Here's a detailed comparison chart of your retirement scenarios based on your risk tolerance analysis:",
        component: "comparison-chart",
        data: { scenarios, chartType: "income" },
      };
    } else {
      return {
        content:
          "I'd be happy to show you comparison charts! First, let me collect your information to generate scenarios.",
        component: "basic-info-form",
      };
    }
  }

  // Specific scenario analysis
  if (
    message.includes("lump sum") ||
    message.includes("annuity") ||
    message.includes("phased")
  ) {
    const scenarioType = message.includes("lump sum")
      ? "lump-sum"
      : message.includes("annuity")
      ? "annuity"
      : "phased";

    return {
      content: `Based on your risk profile, let me explain the ${scenarioType.replace(
        "-",
        " "
      )} strategy in detail:`,
      component: "recommendation",
      data: getScenarioRecommendation(scenarioType, scenarios, userData),
    };
  }

  // Tax questions
  if (message.includes("tax") || message.includes("taxation")) {
    return {
      content:
        "Tax implications are crucial in retirement planning. Here's what you need to know based on your risk profile:",
      component: "recommendation",
      data: getTaxRecommendation(scenarios, userData),
    };
  }

  // Update profile - redirect to appropriate step
  if (
    message.includes("update") ||
    message.includes("change") ||
    message.includes("modify") ||
    message.includes("calculate")
  ) {
    if (!userData.name || !userData.email) {
      return {
        content: "Let's update your basic information:",
        component: "basic-info-form",
      };
    } else if (!userData.currentSalary) {
      return {
        content: "Let's update your income and employment details:",
        component: "income-status-form",
      };
    } else if (!userData.plannedRetirementAge) {
      return {
        content: "Let's update your retirement planning information:",
        component: "retirement-info-form",
      };
    } else if (!userData.height) {
      return {
        content: "Let's update your health and life expectancy information:",
        component: "life-expectancy-form",
      };
    } else if (!userData.mode) {
      return {
        content: "Let's update your risk tolerance analysis:",
        component: "risk-tolerance-form",
      };
    } else {
      return {
        content:
          "Let's review your entire profile. You can update any information and skip sections that are already correct:",
        component: "basic-info-form",
      };
    }
  }

  // Check if user has completed all steps
  const hasBasicInfo = userData.name && userData.email && userData.age;
  const hasIncomeInfo = userData.currentSalary;
  const hasRetirementInfo =
    userData.plannedRetirementAge && userData.retirementLifestyle;
  
  // Fix: Check both userData AND formData for health info
  const hasHealthInfo = 
    (userData.height && userData.weight && userData.gender) || 
    userData.isSkipped || 
    userData.predictedLifeExpectancy ||
    userData.formName === "life-expectancy-form" ||
    // NEW: Also check if health data was just submitted in formData
    (formData?.height && formData?.weight && formData?.gender) ||
    formData?.isSkipped ||
    formData?.predictedLifeExpectancy;
    
  const hasRiskAnalysis =
    userData.mode === "zerodha" || userData.mode === "manual";


  // Progressive flow based on completion
  if (!hasBasicInfo) {
    return {
      content:
        "Welcome! I'm here to help create your personalized retirement plan. Let's start by getting to know you:",
      component: "basic-info-form",
    };
  } else if (!hasIncomeInfo) {
    return {
      content:
        "I have your basic information. Now let's gather your income and employment details:",
      component: "income-status-form",
    };
  } else if (!hasRetirementInfo) {
    return {
      content:
        "Great progress! Let's finalize your retirement planning preferences:",
      component: "retirement-info-form",
    };
  } else if (!hasHealthInfo) {
    return {
      content:
        "Now let's assess your health profile to better estimate your life expectancy:",
      component: "life-expectancy-form",
    };
  } else if (!hasRiskAnalysis) {
    return {
      content:
        "Almost there! Let's determine your risk tolerance. Choose between connecting your Zerodha account for automatic analysis or entering details manually:",
      component: "risk-tolerance-form",
    };
  }

  // Default response with quick actions for completed profiles
  return {
    isFallback: true,
  };
};

const generateScenarios = (userData, formData) => {
  const pensionBalance = parseInt(
    userData.pensionBalance || formData.pensionBalance
  );
  const currentAge = parseInt(userData.age || formData.age);
  const retirementAge = parseInt(
    userData.plannedRetirementAge || formData.plannedRetirementAge
  );
  const monthlyExpense = parseInt(
    userData.monthlyRetirementExpense || formData.monthlyRetirementExpense
  );
  const retirementLifestyle =
    userData.retirementLifestyle || formData.retirementLifestyle;
  const legacyGoal = userData.legacyGoal || formData.legacyGoal;

  // Risk tolerance handling for both modes
  let riskTolerance;
  if (formData.mode === "zerodha") {
    // For Zerodha mode, calculate risk tolerance from portfolio data
    riskTolerance = calculateRiskToleranceFromZerodha(userData, formData);
  } else {
    // For manual mode, use a default moderate risk tolerance
    riskTolerance = "moderate";
  }

  const yearsToRetirement = retirementAge - currentAge;
  const yearsInRetirement = 80 - retirementAge; // Assuming life expectancy of 80

  // Calculate current investment portfolio total
  const totalCurrentInvestments =
    parseInt(
      userData.fixedDepositAmount || formData.fixedDepositAmount || "0"
    ) +
    parseInt(userData.mutualFundAmount || formData.mutualFundAmount || "0") +
    parseInt(
      userData.stockInvestmentAmount || formData.stockInvestmentAmount || "0"
    );

  // Generate scenarios with risk-adjusted calculations
  const scenarios = [
    {
      id: "lump-sum",
      name: "Lump Sum Withdrawal",
      description:
        "Take the entire pension amount and manage investments yourself",
      totalValue: pensionBalance,
      monthlyIncome: Math.round(
        (pensionBalance * getReturnRate(riskTolerance, "lump-sum")) / 12
      ),
      taxImplication: Math.round(pensionBalance * 0.3),
      pros: [
        "Complete control over investments",
        "Flexibility for emergencies",
        "Potential for higher returns",
        "Can leave larger inheritance",
      ],
      cons: [
        "High market risk",
        "Immediate heavy tax burden",
        "Risk of outliving savings",
        "Requires investment expertise",
      ],
      riskLevel: "High",
      suitability: calculateSuitability(
        "lump-sum",
        retirementLifestyle,
        legacyGoal,
        monthlyExpense,
        Math.round(
          (pensionBalance * getReturnRate(riskTolerance, "lump-sum")) / 12
        ),
        riskTolerance
      ),
      riskScore: getRiskScore("lump-sum"),
      mode: formData.mode || "manual",
    },
    {
      id: "annuity",
      name: "Life Annuity",
      description: "Convert pension to guaranteed monthly income for life",
      totalValue: pensionBalance,
      monthlyIncome: Math.round(
        (pensionBalance / (yearsInRetirement * 12)) * 1.1
      ),
      taxImplication: Math.round(pensionBalance * 0.1),
      pros: [
        "Guaranteed income for life",
        "Protection against longevity risk",
        "Lower tax burden",
        "Peace of mind",
      ],
      cons: [
        "No liquidity access",
        "Fixed payments (inflation risk)",
        "No inheritance value",
        "Lower potential returns",
      ],
      riskLevel: "Low",
      suitability: calculateSuitability(
        "annuity",
        retirementLifestyle,
        legacyGoal,
        monthlyExpense,
        Math.round((pensionBalance / (yearsInRetirement * 12)) * 1.1),
        riskTolerance
      ),
      riskScore: getRiskScore("annuity"),
      mode: formData.mode || "manual",
    },
    {
      id: "phased",
      name: "Phased Withdrawal",
      description: "Systematic withdrawal with remaining amount invested",
      totalValue: pensionBalance,
      monthlyIncome: Math.round(
        (pensionBalance * getReturnRate(riskTolerance, "phased")) / 12
      ),
      taxImplication: Math.round(pensionBalance * 0.15),
      pros: [
        "Balanced risk approach",
        "Some liquidity maintained",
        "Potential for growth",
        "Moderate inheritance",
      ],
      cons: [
        "Market risk on remaining balance",
        "Complex management required",
        "Sequence of returns risk",
        "Not guaranteed for life",
      ],
      riskLevel: "Medium",
      suitability: calculateSuitability(
        "phased",
        retirementLifestyle,
        legacyGoal,
        monthlyExpense,
        Math.round(
          (pensionBalance * getReturnRate(riskTolerance, "phased")) / 12
        ),
        riskTolerance
      ),
      riskScore: getRiskScore("phased"),
      mode: formData.mode || "manual",
    },
  ];

  // Add joint-life if married
  if (
    userData.maritalStatus === "married" ||
    formData.maritalStatus === "married"
  ) {
    scenarios.push({
      id: "joint-life",
      name: "Joint Life Annuity",
      description: "Guaranteed income for both spouse and you",
      totalValue: pensionBalance,
      monthlyIncome: Math.round(
        (pensionBalance / (yearsInRetirement * 12)) * 0.9
      ),
      taxImplication: Math.round(pensionBalance * 0.1),
      pros: [
        "Spouse protection guaranteed",
        "Income for both lives",
        "Lower tax burden",
        "Family security",
      ],
      cons: [
        "Lower monthly payments",
        "No liquidity access",
        "Complex survivor benefits",
        "No inheritance",
      ],
      riskLevel: "Low",
      suitability: calculateSuitability(
        "joint-life",
        retirementLifestyle,
        legacyGoal,
        monthlyExpense,
        Math.round((pensionBalance / (yearsInRetirement * 12)) * 0.9),
        riskTolerance
      ),
      riskScore: getRiskScore("joint-life"),
      mode: formData.mode || "manual",
    });
  }

  // Sort scenarios by suitability score (highest first)
  scenarios.sort((a, b) => b.suitability - a.suitability);

  return scenarios;
};

// Helper function to get risk scores
const getRiskScore = (scenarioType) => {
  const riskScores = {
    "lump-sum": 85,
    phased: 60,
    annuity: 25,
    "joint-life": 20,
  };
  return riskScores[scenarioType] || 50;
};

const calculateSuitability = (
  scenarioType,
  lifestyle,
  legacyGoal,
  monthlyExpense,
  scenarioIncome,
  riskTolerance
) => {
  let score = 50; // Base score

  // Income adequacy check
  const incomeRatio = scenarioIncome / monthlyExpense;
  if (incomeRatio >= 1.2) score += 25;
  else if (incomeRatio >= 1.0) score += 15;
  else if (incomeRatio >= 0.8) score += 5;
  else score -= 10;

  // Lifestyle matching
  if (lifestyle === "minimalistic") {
    if (scenarioType === "annuity" || scenarioType === "joint-life")
      score += 20;
    if (scenarioType === "lump-sum") score -= 10;
  } else if (lifestyle === "comfortable") {
    if (scenarioType === "phased") score += 20;
    if (scenarioType === "annuity") score += 10;
  } else if (lifestyle === "lavish") {
    if (scenarioType === "lump-sum") score += 20;
    if (scenarioType === "phased") score += 10;
    if (scenarioType === "annuity") score -= 10;
  }

  // Legacy goal matching
  if (legacyGoal === "maximize-income") {
    if (scenarioType === "annuity") score += 15;
  } else if (legacyGoal === "substantial-legacy") {
    if (scenarioType === "lump-sum") score += 20;
    if (scenarioType === "annuity") score -= 15;
  } else if (legacyGoal === "moderate-legacy") {
    if (scenarioType === "phased") score += 15;
  }

  // Risk tolerance matching (UPDATED for simplified approach)
  if (riskTolerance === "conservative") {
    if (scenarioType === "annuity" || scenarioType === "joint-life")
      score += 30;
    if (scenarioType === "lump-sum") score -= 25;
    if (scenarioType === "phased") score += 10;
  } else if (riskTolerance === "moderate") {
    if (scenarioType === "phased") score += 30;
    if (scenarioType === "annuity") score += 15;
    if (scenarioType === "lump-sum") score += 10;
  } else if (riskTolerance === "aggressive") {
    if (scenarioType === "lump-sum") score += 30;
    if (scenarioType === "phased") score += 20;
    if (scenarioType === "annuity") score -= 20;
  }

  return Math.min(Math.max(score, 10), 95); // Keep between 10-95%
};

// Updated risk-based recommendation function
const getRiskRecommendation = (userData) => {
  const totalInvestments =
    parseInt(userData.fixedDepositAmount || "0") +
    parseInt(userData.mutualFundAmount || "0") +
    parseInt(userData.stockInvestmentAmount || "0");

  let riskProfile = "Balanced";
  let recommendations = [];
  let analysisMethod =
    userData.mode === "zerodha"
      ? "Zerodha Portfolio Analysis"
      : "Manual Assessment";

  if (userData.mode === "zerodha") {
    riskProfile = "Auto-Calculated from Portfolio";
    recommendations = [
      "Risk tolerance calculated from your actual Zerodha portfolio",
      "Analysis based on your investment behavior and holdings",
      "Recommendations optimized for your trading patterns",
      "Scenarios aligned with your proven investment style",
    ];
  } else {
    // For manual mode, use a default moderate risk profile
    riskProfile = "Moderate";
    recommendations = [
      "Balanced approach with phased withdrawal",
      "Mix of guaranteed and market-linked options",
      "Diversified investment portfolio",
      "Regular review and rebalancing",
    ];
  }

  return {
    title: `Your Risk Profile: ${riskProfile}`,
    subtitle: `Analysis Method: ${analysisMethod}`,
    main: {
      type: userData.mode === "zerodha" ? "info" : "success",
      title:
        userData.mode === "zerodha"
          ? "Portfolio-Based Analysis"
          : `Current Investment Portfolio: ₹${totalInvestments.toLocaleString(
              "en-IN"
            )}`,
      content:
        userData.mode === "zerodha"
          ? "Risk tolerance automatically calculated from your Zerodha portfolio data and investment behavior"
          : "Risk assessment based on your investment portfolio details",
    },
    points: recommendations.map((rec) => ({
      type: "info",
      title: "Recommendation",
      content: rec,
    })),
    actions:
      userData.mode === "zerodha"
        ? [
            "Review auto-calculated risk assessment",
            "Validate recommendations against your comfort level",
            "Consider portfolio rebalancing if needed",
            "Monitor investment performance regularly",
          ]
        : [
            "Review your investment allocation",
            "Consider rebalancing based on recommendations",
            "Consult with a financial advisor",
            "Monitor and adjust as needed",
          ],
  };
};

// Keep existing recommendation functions with risk factor integration
const getScenarioRecommendation = (scenarioType, scenarios, userData) => {
  const scenario = scenarios?.find((s) => s.id === scenarioType);

  if (!scenario) {
    return {
      title: "Scenario Analysis",
      main: {
        type: "info",
        title: "Strategy Overview",
        content:
          "Let me first generate your personalized scenarios to provide detailed analysis.",
      },
    };
  }

  const riskTolerance =
    userData.mode === "zerodha" ? "auto-calculated" : "moderate";
  const riskAlignment =
    riskTolerance === "auto-calculated" ||
    (riskTolerance === "moderate" && scenario.riskLevel === "Medium") ||
    (riskTolerance === "conservative" && scenario.riskLevel === "Low") ||
    (riskTolerance === "aggressive" && scenario.riskLevel === "High");

  return {
    title: `${scenario.name} Analysis`,
    subtitle:
      userData.mode === "zerodha"
        ? "Based on your Zerodha portfolio analysis"
        : "Based on your investment portfolio",
    main: {
      type:
        scenario.suitability >= 80
          ? "success"
          : riskAlignment
          ? "info"
          : "warning",
      title: `${scenario.suitability}% Suitability Match`,
      content: `${scenario.description} ${
        riskAlignment
          ? "(Aligned with your risk profile)"
          : "(Consider risk level carefully)"
      }`,
    },
    points: [
      {
        type: "success",
        title: "Monthly Income",
        content: `₹${scenario.monthlyIncome.toLocaleString("en-IN")} per month`,
      },
      {
        type: "warning",
        title: "Tax Impact",
        content: `₹${scenario.taxImplication.toLocaleString(
          "en-IN"
        )} total tax liability`,
      },
      {
        type: riskAlignment ? "success" : "warning",
        title: "Risk Level",
        content: `${scenario.riskLevel} risk strategy (${scenario.riskScore}% risk score)`,
      },
      {
        type: "info",
        title: "Analysis Method",
        content:
          userData.mode === "zerodha"
            ? "Based on Zerodha portfolio data"
            : "Based on investment portfolio details",
      },
    ],
    actions: [
      "Review all pros and cons carefully",
      userData.mode === "zerodha"
        ? "Validate against your comfort level"
        : "Consider your risk tolerance alignment",
      "Evaluate tax implications",
      "Consult with a financial advisor",
    ],
  };
};

const getTaxRecommendation = (scenarios, userData) => {
  const riskBasedTaxStrategy =
    userData.mode === "zerodha"
      ? "Tax strategy optimized based on your actual portfolio behavior and holdings"
      : "Balanced approach with phased withdrawals for tax optimization";

  return {
    title: "Tax Optimization Strategy",
    subtitle:
      userData.mode === "zerodha"
        ? "Based on Zerodha portfolio analysis"
        : "Based on your investment portfolio",
    main: {
      type: "warning",
      title: "Tax Planning is Critical",
      content:
        "Different withdrawal strategies have significantly different tax implications. Your risk profile affects the optimal tax strategy.",
    },
    points: [
      {
        type: "success",
        title: "Annuity Benefits",
        content:
          "Annuities typically have lower immediate tax burden as income is spread over time",
      },
      {
        type: "warning",
        title: "Lump Sum Impact",
        content:
          "Taking a lump sum can push you into higher tax brackets, increasing your overall tax rate",
      },
      {
        type: "info",
        title: "Your Recommended Strategy",
        content: riskBasedTaxStrategy,
      },
      {
        type: "info",
        title: "Analysis Method",
        content:
          userData.mode === "zerodha"
            ? "Recommendations based on your Zerodha portfolio data"
            : "Recommendations based on your investment portfolio",
      },
    ],
    actions: [
      "Calculate tax impact for each scenario",
      "Consider spreading withdrawals across tax years",
      userData.mode === "zerodha"
        ? "Review portfolio-based tax strategies"
        : "Explore tax-efficient options",
      "Consult with a tax professional",
    ],
  };
};
