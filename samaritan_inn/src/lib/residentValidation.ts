// Required resident fields and their rules. Shared by the Add resident form
// (instant feedback) and POST /api/admin/residents (the real enforcement).

export type ResidentInput = {
  name: string;
  email: string;
};

export type ResidentErrors = Partial<Record<keyof ResidentInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateResident(input: ResidentInput): ResidentErrors {
  const errors: ResidentErrors = {};
  const name = input.name.trim();
  if (name.length < 2 || name.length > 100) {
    errors.name = "Enter the resident's full name (2–100 characters).";
  }
  if (!EMAIL_PATTERN.test(input.email.trim())) {
    errors.email = 'Enter a valid email address, like name@example.com.';
  }
  return errors;
}
