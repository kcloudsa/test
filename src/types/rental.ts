export interface RentalParticipant {
  userID: string
  role: 'owner' | 'tentant'
}

export interface PeriodicIncrease {
  increaseValue: number
  periodicDuration: number
  isPercentage: boolean
}

export interface RentalSource {
  name: string
  description: string
}

export interface MoveType {
  name: string
  description: string
}

export interface Rental {
  _id: string
  unitID: string
  contractNumber: string
  moveTypeID: string
  startDate: string
  endDate: string
  rentalSourceID: string
  startPrice: number
  currentPrice: number
  status: 'active' | 'completed' | 'cancelled'
  securityDeposit: number
  rentalAmount: number
  isMonthly: boolean
  monthsCount: number
  roommates: number
  notes: string
  periodicIncrease: PeriodicIncrease
  participats: {
    owner: RentalParticipant
    tentant: RentalParticipant
  }
  createdAt: string
  updatedAt: string
  restMonthsLeft: number
  rentalSource: RentalSource
  moveType: MoveType
}

export interface MaintenanceRequest {
  _id: string
  unitID: string
  reportedBy: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  reportedByUser: {
    name: string
    email: string
  }
}

export interface UnitMove {
  _id: string
  unitID: string
  moveTypeID: string
  rentalID?: string
  maintenanceID?: string
  userID: string
  moveDate: string
  writeDate: string
  debit: number
  credit: number
  description: string
  createdAt: string
  updatedAt: string
  moveType: MoveType
}

export interface Unit {
  _id: string
  number: string
  description: string
  processingCost: number
  location: {
    address: string
    city: string
    country: string
  }
  unitMedia: string[]
  unitStatus: 'available' | 'reserved' | 'under_maintenance'
  unitType: {
    name: string
    tags: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface RentalFilters {
  status: string[]
  rentalSource: string[]
  priceRange: {
    min: number
    max: number
  }
  monthsLeft: {
    min: number
    max: number
  }
  isMonthly: boolean | null
  roommates: {
    min: number
    max: number
  }
  startDateRange: {
    from: string
    to: string
  }
  endDateRange: {
    from: string
    to: string
  }
  searchTerm: string
}

export const DEFAULT_FILTERS: RentalFilters = {
  status: [],
  rentalSource: [],
  priceRange: { min: 0, max: 10000 },
  monthsLeft: { min: 0, max: 24 },
  isMonthly: null,
  roommates: { min: 0, max: 10 },
  startDateRange: { from: '', to: '' },
  endDateRange: { from: '', to: '' },
  searchTerm: ''
}
