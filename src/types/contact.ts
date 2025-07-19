export interface Contact {
  _id: string
  name: {
    firstName: string
    lastName: string
    displayName: string
    slug: string
  }
  description: string
  phone: {
    number: string
    countryCode: string
  }
  tagID: string
  userID: string
  createdAt: string
  updatedAt: string
  // Populated fields
  tag?: {
    _id: string
    name: string
    color: string
  }
  user?: {
    _id: string
    userName: {
      firstName: string
      lastName: string
      displayName: string
    }
    contactInfo: {
      email: {
        email: string
      }
    }
    userInfo: {
      profilePicture?: string
    }
    role: string
  }
}

export interface SubUser {
  _id: string
  superAdminID: string
  name: {
    firstName: string
    lastName: string
    displayName: string
    slug: string
  }
  contactInfo: {
    email: {
      email: string
      verified: boolean
    }
    phone: {
      countryCode: string
      phoneNumber: string
      verified: boolean
    }
  }
  permissions: string[]
  status: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface ContactMethod {
  type: 'phone' | 'email' | 'whatsapp'
  value: string
  verified?: boolean
  primary?: boolean
}

export interface ContactFilters {
  searchTerm: string
  tags: string[]
  roles: string[]
  contactTypes: string[] // phone, email, whatsapp
}

export const DEFAULT_CONTACT_FILTERS: ContactFilters = {
  searchTerm: '',
  tags: [],
  roles: [],
  contactTypes: []
}

export const hasContactMethods = (item: Contact | SubUser): boolean => {
  const isSubUser = 'superAdminID' in item
  
  if (isSubUser) {
    const subUser = item as SubUser
    return !!(subUser.contactInfo.email.email || subUser.contactInfo.phone.phoneNumber)
  } else {
    const contact = item as Contact
    return !!(contact.user?.contactInfo.email.email || contact.phone.number)
  }
}

export const getAvailableContactMethods = (item: Contact | SubUser): string[] => {
  const isSubUser = 'superAdminID' in item
  const methods: string[] = []
  
  if (isSubUser) {
    const subUser = item as SubUser
    if (subUser.contactInfo.email.email) methods.push('email')
    if (subUser.contactInfo.phone.phoneNumber) methods.push('phone', 'whatsapp')
  } else {
    const contact = item as Contact
    if (contact.user?.contactInfo.email.email) methods.push('email')
    if (contact.phone.number) methods.push('phone', 'whatsapp')
  }
  
  return methods
}
