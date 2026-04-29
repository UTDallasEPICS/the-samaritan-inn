export const USER_ROLES = ["resident", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  caseWorkerName: string;
  salesforceAccountId: string;
  role: string;
  email: string;
  password: string;
};

export type ValidationIssue = {
  field: keyof CreateUserInput;
  message: string;
};

export const PASSWORD_MIN_LENGTH = 8;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  resident: "Resident",
  admin: "Admin",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isUserRole(role: string): role is UserRole {
  return USER_ROLES.includes(role as UserRole);
}

export function normalizeCreateUserInput(
  input: Partial<CreateUserInput>
): CreateUserInput {
  return {
    firstName: input.firstName?.trim() ?? "",
    lastName: input.lastName?.trim() ?? "",
    caseWorkerName: input.caseWorkerName?.trim() ?? "",
    salesforceAccountId: input.salesforceAccountId?.trim() ?? "",
    role: input.role?.trim().toLowerCase() ?? "",
    email: input.email?.trim().toLowerCase() ?? "",
    password: input.password ?? "",
  };
}

export function formatDisplayName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

export function validateCreateUserInput(
  input: Partial<CreateUserInput>
): ValidationIssue[] {
  const normalized = normalizeCreateUserInput(input);
  const issues: ValidationIssue[] = [];

  if (!normalized.firstName) {
    issues.push({ field: "firstName", message: "First name is required" });
  }

  if (!normalized.lastName) {
    issues.push({ field: "lastName", message: "Last name is required" });
  }

  if (!normalized.caseWorkerName) {
    issues.push({
      field: "caseWorkerName",
      message: "Case worker name is required",
    });
  }

  if (!normalized.salesforceAccountId) {
    issues.push({
      field: "salesforceAccountId",
      message: "Salesforce account ID is required",
    });
  }

  if (!normalized.role) {
    issues.push({ field: "role", message: "Role is required" });
  } else if (!isUserRole(normalized.role)) {
    issues.push({ field: "role", message: "Role is invalid" });
  }

  if (!normalized.email) {
    issues.push({ field: "email", message: "Email is required" });
  } else if (!EMAIL_REGEX.test(normalized.email)) {
    issues.push({ field: "email", message: "Email format is invalid" });
  }

  if (!normalized.password) {
    issues.push({ field: "password", message: "Password is required" });
  } else if (normalized.password.length < PASSWORD_MIN_LENGTH) {
    issues.push({
      field: "password",
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    });
  }

  return issues;
}
