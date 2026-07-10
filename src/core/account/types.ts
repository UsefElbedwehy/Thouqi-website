/** Account domain models. */
export interface CustomerProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: "customer" | "admin";
  locale: string;
}

export interface Address {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  area: string | null;
  countryCode: string;
  phone: string | null;
  isDefault: boolean;
}
