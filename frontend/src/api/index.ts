import { api } from './client';
import { LoginResponse, Order, Shipment, UserInfo } from './types';

export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function fetchOrders(params: { product?: string; status?: string } = {}) {
  const { data } = await api.get<Order[]>('/orders', { params });
  return data;
}

export async function createOrder(input: any) {
  const { data } = await api.post<Order>('/orders', input);
  return data;
}

export async function approveOrder(id: number, approve: boolean, approver: string) {
  const { data } = await api.patch<Order>(`/orders/${id}/approve`, { approve, approver });
  return data;
}

export async function fetchShipments(params: {
  orderId?: number;
  code?: string;
  vehicle?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  status?: string;
  product?: string;
  from?: string;
  to?: string;
} = {}) {
  const { data } = await api.get<Shipment[]>('/shipments', {
    params,
  });
  return data;
}

export async function createShipment(input: {
  orderId: number;
  pickupLocation: string;
  dropoffLocation: string;
  vehicle: string;
  notes?: string;
}) {
  const { data } = await api.post<Shipment>('/shipments', input);
  return data;
}

export async function updateShipment(id: number, input: Partial<Shipment>) {
  const { data } = await api.patch<Shipment>(`/shipments/${id}`, input);
  return data;
}

export async function deleteShipment(id: number) {
  const { data } = await api.delete(`/shipments/${id}`);
  return data;
}

export async function copyShipment(id: number) {
  const { data } = await api.post<Shipment>(`/shipments/${id}/copy`);
  return data;
}

export async function receiveShipment(id: number) {
  const { data } = await api.post(`/shipments/${id}/receive`);
  return data as { shipment: Shipment; invoice: any };
}

export async function inspectShipment(id: number, approve: boolean) {
  const { data } = await api.post(`/shipments/${id}/inspect`, { approve });
  return data as Shipment;
}

export async function checkShipmentCode(code: string) {
  const { data } = await api.get('/shipments/check/code', { params: { code } });
  return data as Shipment | null;
}

export async function exportFile(path: string, params: Record<string, string | number | undefined> = {}) {
  const response = await api.get(path, { params, responseType: 'blob' });
  return response.data as Blob;
}

export async function fetchInvoiceReport(params: Record<string, string> = {}) {
  const { data } = await api.get<
    {
      invoiceNo: string;
      customer: string;
      amount: number;
      dueDate: string;
      status: string;
    }[]
  >('/reports/invoices', { params });
  return data;
}

export async function fetchShipmentReport() {
  const { data } = await api.get<
    {
      code: string;
      product: string;
      quantity: number;
      pickupLocation: string;
      dropoffLocation: string;
      date: string;
      status: string;
    }[]
  >('/reports/shipments');
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return data;
}

export async function fetchProfile() {
  const { data } = await api.get<UserInfo>('/account/profile');
  return data;
}

export async function setDistributor(distributor: string) {
  const { data } = await api.post('/account/distributor', { distributor });
  return data;
}

export async function exportCsv(path: string, params: Record<string, string | number | undefined> = {}) {
  const response = await api.get(path, {
    params,
    responseType: 'blob',
  });
  return response.data as Blob;
}

export async function fetchCatalog(type?: string) {
  const { data } = await api.get('/catalog', { params: type ? { type } : {} });
  return data as { id: number; type: string; name: string }[];
}

export async function fetchCustomers() {
  const { data } = await api.get('/customers');
  return data;
}

export async function fetchCustomerAccounts() {
  const { data } = await api.get('/customers/accounts');
  return data as any[];
}

export async function createCustomer(input: any) {
  const { data } = await api.post('/customers', input);
  return data;
}

export async function createCustomerAccount(customerId: number, username: string, password: string) {
  const { data } = await api.post(`/customers/${customerId}/account`, { username, password });
  return data;
}

export async function resetCustomerPassword(username: string, password: string) {
  const { data } = await api.post('/customers/reset-password', { username, password });
  return data;
}

export async function fetchShipmentDetailReport(params: Record<string, string> = {}) {
  const { data } = await api.get('/reports/shipments/detail', { params });
  return data as any[];
}

export async function fetchCustomerCreditReport() {
  const { data } = await api.get('/reports/customers/credit');
  return data as any[];
}

export async function fetchCustomerInvoicesReport(customer?: string) {
  const { data } = await api.get('/reports/customers/invoices', { params: customer ? { customer } : {} });
  return data as any[];
}

export async function fetchInventoryReport() {
  const { data } = await api.get('/reports/inventory');
  return data as { promotion: any[]; consignment: any[] };
}

export async function fetchInvoices(customer?: string) {
  const { data } = await api.get('/invoices', { params: customer ? { customer } : {} });
  return data as any[];
}

export async function createManualInvoice(input: any) {
  const { data } = await api.post('/invoices/manual', input);
  return data;
}
