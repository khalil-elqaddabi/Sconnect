// src/services/pricingService.js

// A. Calculate initial price based on residency
const calculateInitialPrice = (basePrice, isResident) => {
  if (isResident) {
    return basePrice;
  }

  return basePrice * 1.35;
};


// B. Calculate family discount
const calculateFamilyDiscount = (familyRegistrationsCount) => {
  if (familyRegistrationsCount === 1) {
    return 0;
  }

  if (familyRegistrationsCount === 2) {
    return 0.15;
  }

  if (familyRegistrationsCount >= 3) {
    return 0.30;
  }

  return 0;
};


// C. Calculate Family Quotient discount
const calculateFamilyQuotientDiscount = (familyQuotient) => {
  if (familyQuotient < 600) {
    return 0.40;
  }

  if (familyQuotient <= 900) {
    return 0.20;
  }

  return 0;
};


// D. Calculate Pass'Sport deduction
const applyPassSport = (price, hasPassSport) => {
  if (!hasPassSport) {
    return price;
  }

  return price - 50;
};


// Apply the minimum price of 15€
const applyMinimumPrice = (price) => {
  return Math.max(price, 15);
};


// E. Calculate 3-payment schedule
const calculatePaymentSchedule = (totalPrice) => {
  const firstPayment = Math.round(totalPrice * 0.40 * 100) / 100;
  const secondPayment = Math.round(totalPrice * 0.30 * 100) / 100;

  const thirdPayment =
    Math.round(
      (totalPrice - firstPayment - secondPayment) * 100
    ) / 100;

  return {
    payment1: firstPayment,
    payment2: secondPayment,
    payment3: thirdPayment,
  };
};


// Complete pricing calculation
const calculateFinalPrice = ({
  basePrice,
  isResident,
  familyRegistrationsCount,
  familyQuotient,
  hasPassSport,
}) => {

  // 1. Initial price
  let price = calculateInitialPrice(
    basePrice,
    isResident
  );

  // 2. Family discount
  const familyDiscount = calculateFamilyDiscount(
    familyRegistrationsCount
  );

  price = price * (1 - familyDiscount);

  // 3. Family quotient discount
  const quotientDiscount =
    calculateFamilyQuotientDiscount(
      familyQuotient
    );

  price = price * (1 - quotientDiscount);

  // 4. Pass'Sport
  price = applyPassSport(
    price,
    hasPassSport
  );

  // 5. Minimum price
  price = applyMinimumPrice(price);

  // Round final price to cents
  price = Math.round(price * 100) / 100;

  return {
    basePrice,
    initialPrice: calculateInitialPrice(
      basePrice,
      isResident
    ),
    familyDiscount,
    quotientDiscount,
    passSportDiscount: hasPassSport ? 50 : 0,
    finalPrice: price,
    paymentSchedule: calculatePaymentSchedule(price),
  };
};


module.exports = {
  calculateInitialPrice,
  calculateFamilyDiscount,
  calculateFamilyQuotientDiscount,
  applyPassSport,
  applyMinimumPrice,
  calculatePaymentSchedule,
  calculateFinalPrice,
};