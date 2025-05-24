export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.email = data.email || "";
    this.phone = data.phone || "";
    this.role = data.role || "owner";
    this.createdAt = data.createdAt || new Date().toISOString();
    this.lastLogin = data.lastLogin || null;
  }

  // Frontend validation methods (for immediate feedback)
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password) {
    // Password must be at least 8 characters, contain uppercase, lowercase, number, and special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
  }

  static validateName(name) {
    return name && name.trim().length >= 2 && name.trim().length <= 50;
  }

  // Get validation errors for frontend
  getValidationErrors() {
    const errors = [];

    if (!User.validateName(this.firstName)) {
      errors.push("First name must be between 2 and 50 characters");
    }

    if (!User.validateName(this.lastName)) {
      errors.push("Last name must be between 2 and 50 characters");
    }

    if (!User.validateEmail(this.email)) {
      errors.push("Please enter a valid email address");
    }

    if (!User.validatePhone(this.phone)) {
      errors.push("Please enter a valid phone number");
    }

    return errors;
  }

  // Get full name
  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Convert to API payload
  toApiPayload() {
    return {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim().toLowerCase(),
      phone: this.phone.trim(),
      role: this.role,
    };
  }
}
