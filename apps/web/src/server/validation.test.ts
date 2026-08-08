import { describe, it, expect } from "vitest";
import { accessRequestInputSchema } from "./validation";
import { ZodError } from "zod";

describe("accessRequestInputSchema validation", () => {
  const validData = {
    fullName: "Adamu Garba",
    email: "adamu@example.com",
    organizationName: "Abuja Cooperative",
    requestedRole: "farmer_or_producer",
    country: "Nigeria",
    useCase: "Enabling remote advisory services for cooperative farmers with language translation support.",
    consent: true,
  };

  it("should successfully parse valid access request input", () => {
    const result = accessRequestInputSchema.parse(validData);
    expect(result.fullName).toBe("Adamu Garba");
    expect(result.email).toBe("adamu@example.com");
  });

  it("should throw an error if email is invalid", () => {
    const invalidData = {
      ...validData,
      email: "not-an-email",
    };
    expect(() => accessRequestInputSchema.parse(invalidData)).toThrow(ZodError);
  });

  it("should throw an error if useCase description is too short", () => {
    const invalidData = {
      ...validData,
      useCase: "Short text",
    };
    expect(() => accessRequestInputSchema.parse(invalidData)).toThrow(ZodError);
  });

  it("should block non-empty honeypot website field", () => {
    const spamData = {
      ...validData,
      website: "http://spam.bot",
    };
    expect(() => accessRequestInputSchema.parse(spamData)).toThrow(ZodError);
  });
});
