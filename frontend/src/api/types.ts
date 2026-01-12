export interface UserInfo {
  id: number;
  username: string;
  role: 'DVKH' | 'NPP';
  distributor?: string;
  fullName: string;
  distributors?: string[];
  customerId?: number;
  customerName?: string;
  creditLimit?: number;
  creditUsed?: number;
}

export interface LoginResponse {
  accessToken: string;
  user: UserInfo;
}

export interface Order {
  id: number;
  product: string;
  quantity: number;
  status: 'draft' | 'confirmed' | 'shipped';
  customer: string;
  distributor: string;
  deliveryDate: string;
  expiresAt?: string;
  isLocked: boolean;
  deliveryMethod?: string;
  serviceType?: string;
  cementType?: string;
  vehicle?: string;
  trailer?: string;
  transactionType?: string;
  pickupLocation?: string;
  store?: string;
  region?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  creditHold: number;
}

export interface Shipment {
  id: number;
  orderId: number;
  code: string;
  pickupLocation: string;
  dropoffLocation: string;
  vehicle: string;
  status: 'draft' | 'scheduled' | 'delivered';
  inspectionStatus?: 'pending' | 'approved' | 'rejected';
  inspectedBy?: string;
  inspectedAt?: string;
  receivedBy?: string;
  receivedAt?: string;
  notes?: string;
  order?: {
    id: number;
    product: string;
    quantity: number;
  };
}
