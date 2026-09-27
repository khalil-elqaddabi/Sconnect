const memberSelect =
  document.getElementById("member_id");

const activitySelect =
  document.getElementById("activity_id");

const residentCheckbox =
  document.querySelector(
    'input[name="isResident"]'
  );

const passSportCheckbox =
  document.querySelector(
    'input[name="hasPassSport"]'
  );

const priceElement =
  document.getElementById("dynamic-price");


const calculateDynamicPrice = () => {

  const selectedActivity =
    activitySelect.options[
      activitySelect.selectedIndex
    ];


  const selectedMember =
    memberSelect.options[
      memberSelect.selectedIndex
    ];


  if (
    !selectedActivity ||
    !selectedActivity.dataset.price ||
    !selectedMember ||
    !selectedMember.dataset.familyQuotient
  ) {

    priceElement.textContent =
      "Price: 0.00 €";

    return;
  }


  let price =
    Number(
      selectedActivity.dataset.price
    );


  const familyQuotient =
    Number(
      selectedMember.dataset.familyQuotient
    );


  const familyRegistrationsCount =
    Number(
      selectedMember.dataset
        .familyRegistrationsCount
    );


  // Resident / Non-resident

  if (!residentCheckbox.checked) {

    price *= 1.35;

  }


  // Family discount

  if (
    familyRegistrationsCount === 2
  ) {

    price *= 0.85;

  } else if (
    familyRegistrationsCount >= 3
  ) {

    price *= 0.70;

  }


  // Family quotient discount

  if (familyQuotient < 600) {

    price *= 0.60;

  } else if (
    familyQuotient <= 900
  ) {

    price *= 0.80;

  }


  // Pass'Sport

  if (passSportCheckbox.checked) {

    price -= 50;

  }


  // Minimum price

  price =
    Math.max(price, 15);


  // Round to 2 decimals

  price =
    Math.round(price * 100) / 100;


  priceElement.textContent =
    `Price: ${price.toFixed(2)} €`;
};



activitySelect.addEventListener(
  "change",
  calculateDynamicPrice
);


memberSelect.addEventListener(
  "change",
  calculateDynamicPrice
);


residentCheckbox.addEventListener(
  "change",
  calculateDynamicPrice
);


passSportCheckbox.addEventListener(
  "change",
  calculateDynamicPrice
);


calculateDynamicPrice();