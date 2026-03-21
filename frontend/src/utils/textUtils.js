const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

function toProperCase(str) {
  if (!str) {
    return "";
  }

  return str
    .split(" ")
    .map((word) => {
      if (word.length === 0) {
        return "";
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function numberToWordsUS(num) {
  if (num === 0) return "zero";

  const belowTwenty = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const thousands = ["", "thousand", "million", "billion"];

  function helper(n) {
    if (n === 0) return "";
    else if (n < 20) return belowTwenty[n] + " ";
    else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
    else
      return belowTwenty[Math.floor(n / 100)] + " hundred " + helper(n % 100);
  }

  let res = "";
  let i = 0;

  while (num > 0) {
    if (num % 1000 !== 0) {
      res = helper(num % 1000) + thousands[i] + " " + res;
    }
    num = Math.floor(num / 1000);
    i++;
  }

  const finalRes = res.trim().replace(/\s+/g, " ");
  return toProperCase(finalRes);
}

function numberToWords(num) {
  if (num === 0) return "zero";

  const belowTwenty = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const units = [
    { value: 1000000000000, str: "kharab" },
    { value: 10000000000, str: "arab" },
    { value: 10000000, str: "crore" },
    { value: 100000, str: "lakh" },
    { value: 1000, str: "thousand" },
    { value: 100, str: "hundred" },
  ];

  function helper(n) {
    if (n === 0) return "";
    else if (n < 20) return belowTwenty[n] + " ";
    else if (n < 100) return tens[Math.floor(n / 10)] + " " + helper(n % 10);
    else
      return belowTwenty[Math.floor(n / 100)] + " hundred " + helper(n % 100);
  }

  let res = "";
  for (let u of units) {
    if (num >= u.value) {
      const count = Math.floor(num / u.value);
      res += helper(count) + u.str + " ";
      num %= u.value;
    }
  }
  if (num > 0) res += helper(num);

  const finalRes = res.trim().replace(/\s+/g, " ");
  return toProperCase(finalRes);
}

export { calculateAge, numberToWords, numberToWordsUS };
