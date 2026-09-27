const calculateAgeAtEndOfYear = (birthDate) => {
  const birth = new Date(birthDate);

  const referenceDate = new Date(
    new Date().getFullYear(),
    11,
    31
  );

  let age =
    referenceDate.getFullYear() -
    birth.getFullYear();

  const birthMonth = birth.getMonth();
  const birthDay = birth.getDate();

  const referenceMonth = referenceDate.getMonth();
  const referenceDay = referenceDate.getDate();

  if (
    referenceMonth < birthMonth ||
    (
      referenceMonth === birthMonth &&
      referenceDay < birthDay
    )
  ) {
    age--;
  }

  return age;
};


const isMedicalCertificateValid = (validUntil) => {
  if (!validUntil) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expirationDate = new Date(validUntil);
  expirationDate.setHours(0, 0, 0, 0);

  return expirationDate >= today;
};


const checkMemberEligibility = (
  member,
  activity
) => {

  const age = calculateAgeAtEndOfYear(
    member.birth_date
  );

  // Age check
  if (
    age < activity.age_min ||
    age > activity.age_max
  ) {
    return {
      eligible: false,
      medicalCompliant:
        isMedicalCertificateValid(
          member.medical_certificate_valid_until
        ),
      age,
      message:
        "Member age is not eligible for this activity",
    };
  }

  // Medical certificate does NOT block
  // administrative registration.
  const medicalCompliant =
    isMedicalCertificateValid(
      member.medical_certificate_valid_until
    );

  return {
    eligible: true,
    medicalCompliant,
    age,
    message: medicalCompliant
      ? "Member is eligible"
      : "Member is eligible but medical certificate is not compliant",
  };
};


module.exports = {
  calculateAgeAtEndOfYear,
  isMedicalCertificateValid,
  checkMemberEligibility,
};