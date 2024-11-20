// 用户状态
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted'
}

// 用户角色
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  RISK_MANAGER = 'risk_manager',
  LOAN_OFFICER = 'loan_officer'
}

// 用户基本信息
export interface UserProfile {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: Date;
  address: Address;
  status: UserStatus;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}

// 地址信息
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// 用户认证信息
export interface UserCredentials {
  userId: string;
  passwordHash: string;
  lastLogin?: Date;
  lastPasswordChange: Date;
  failedLoginAttempts: number;
  mfaEnabled: boolean;
  mfaSecret?: string;
}

// 用户金融信息
export interface UserFinancialProfile {
  userId: string;
  creditScore?: number;
  monthlyIncome: number;
  employmentInfo: {
    employer: string;
    position: string;
    employmentType: 'full-time' | 'part-time' | 'self-employed';
    yearsEmployed: number;
  };
  bankAccounts: BankAccount[];
  lastUpdated: Date;
}

// 银行账户信息
export interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'savings' | 'checking';
  accountNumber: string;
  isVerified: boolean;
  isPrimary: boolean;
} 