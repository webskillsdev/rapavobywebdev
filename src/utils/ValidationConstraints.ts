import { validate } from "validate.js";

interface Constraints {
  [key: string]: {
    presence?: { allowEmpty: boolean };
    format?: { pattern: RegExp; message: string; flags?: string };
    email?: boolean;
    length?: { minimum: number; message: string };
    numericality?: { message: string };
  };
}

export const validateString = (
  id: string,
  value: string,
): string | undefined => {
  const constraints: Constraints = {
    [id]: {
      presence: {
        allowEmpty: false,
      },
    },
  };

  if (value !== "") {
    constraints[id].format = {
      pattern: /.+/i,
      message: "Value can't be blank.",
    };
  }

  const validationResult = validate({ [id]: value }, constraints);
  return validationResult && validationResult[id]?.[0];
};

export const validateEmail = (
  id: string,
  value: string,
): string | undefined => {
  const constraints: Constraints = {
    [id]: {
      presence: {
        allowEmpty: false,
      },
    },
  };

  if (value !== "") {
    constraints[id].email = true;
  }

  const validationResult = validate({ [id]: value }, constraints);
  return validationResult && validationResult[id]?.[0];
};

export const validatePassword = (
  id: string,
  value: string,
): string | undefined => {
  const constraints: Constraints = {
    [id]: {
      presence: {
        allowEmpty: false,
      },
    },
  };

  if (value !== "") {
    constraints[id].length = {
      minimum: 6,
      message: "must be at least 6 characters",
    };
  }

  const validationResult = validate({ [id]: value }, constraints);
  return validationResult && validationResult[id]?.[0];
};

export const validateNumber = (
  id: string,
  value: string,
): string | undefined => {
  const constraints: Constraints = {
    [id]: {
      presence: {
        allowEmpty: false,
      },
      numericality: {
        message: "Value must be a valid number.",
      },
    },
  };

  const validationResult = validate({ [id]: value }, constraints);
  return validationResult && validationResult[id]?.[0];
};

export const validateCreditCardNumber = (id: string, value: string) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
    format: {
      pattern: /^(?:\d{4}-){3}\d{4}$|^\d{16}$/,
      message: "Invalid credit card number.",
    },
  };

  const validationResult = validate({ [id]: value }, { [id]: constraints });
  return validationResult && validationResult[id];
};

export const validateCVV = (id: string, value: string) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
    format: {
      pattern: /^[0-9]{3,4}$/,
      message: "Invalid CVV.",
    },
  };

  const validationResult = validate({ [id]: value }, { [id]: constraints });
  return validationResult && validationResult[id];
};

export const validateExpiryDate = (id: string, value: string) => {
  const constraints = {
    presence: {
      allowEmpty: false,
    },
    format: {
      pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/,
      message: "Invalid expiry date. Please use MM/YY format.",
    },
  };

  const validationResult = validate({ [id]: value }, { [id]: constraints });
  return validationResult && validationResult[id];
};

export const formatPrice = (value: string): string => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, "");

  // Format with commas
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const _formatPrice = (value: string): string => {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
};

export const formatMonthYear = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};


export const timeAgo = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();

  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  if (weeks < 4) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  return `${years} year${years === 1 ? "" : "s"} ago`;
};