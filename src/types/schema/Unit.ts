export interface Unit {
  _id: string;
  number: string;
  description: string;
  processingCost: number;
  location: {
    address: string;
    city: string;
    country: string;
  };
  unitMedia: string[];
  unitStatus: "available" | "reserved" | "under_maintenance";
  unitType: {
    name: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  _id: string;
  contractId: string;
  renterName: string;
  unitId: string;
  unitNumber: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "terminated";
}

export type RentalFormValues = {
  unitID: string;
  contractNumber: string;
  moveTypeID: string;
  startDate: string;
  endDate: string;
  rentalSourceID: string;
  startPrice: number;
  currentPrice: number;
  status: "active" | "completed" | "cancelled";
  securityDeposit: number;
  rentalAmount: number;
  isMonthly: boolean;
  monthsCount: number;
  roommates: number;
  notes: string;
  periodicIncrease: {
    increaseValue: number;
    periodicDuration: number;
    isPercentage: boolean;
  };
  participants: {
    owner: { userID: string };
    tentant: { userID: string };
  };
};