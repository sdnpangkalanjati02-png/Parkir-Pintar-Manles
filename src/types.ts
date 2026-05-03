/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParkingLog {
  id: string;
  ticketCode: string;
  plateNumber: string;
  entryTime: number;
  exitTime?: number;
  status: 'parked' | 'exited';
  fare?: number;
  paymentMethod?: 'cash' | 'e-money' | 'qris';
  vehicleType: 'car' | 'motorcycle';
  branchId: string;
}

export interface ParkingStats {
  totalCapacity: number;
  occupied: number;
  revenueToday: number;
  entriesToday: number;
}

export interface ParkingConfig {
  hourlyRateCar: number;
  hourlyRateMotorcycle: number;
  baseRateCar: number;
  baseRateMotorcycle: number;
  freeBufferMinutes: number;
  maxDailyRateCar: number;
  maxDailyRateMotorcycle: number;
  overnightCharge: number;
  lostTicketCharge: number;
  // Hardware & Network Settings
  serverIp: string;
  gateway: string;
  gateControllerIp: string;
  gateControllerPort: number;
  manlessStationIp: string;
  printerType: 'thermal' | 'dot-matrix' | 'laser';
  printerPort: string;
  // Company Profile
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogoUrl: string;
}

export type UserRole = 'admin' | 'karyawan' | 'keuangan' | 'direktur';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branchId?: string; // Optional for multi-branch staff
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  code: string;
  mode: 'manual' | 'automatic' | 'hybrid';
  capacity: {
    car: number;
    motorcycle: number;
  };
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  phone: string;
  joinDate: number;
  photoUrl?: string;
}

export interface Member {
  id: string;
  name: string;
  plateNumber: string;
  phone: string;
  vehicleType: 'car' | 'motorcycle';
  expiryDate: number;
  status: 'active' | 'expired';
}

export type HardwareStatus = 'online' | 'offline' | 'error';
export type HardwareType = 'gate' | 'manless_entry' | 'manless_exit' | 'printer' | 'camera' | 'rfid_reader';

export interface HardwareDevice {
  id: string;
  name: string;
  type: HardwareType;
  ipAddress: string;
  port: number;
  status: HardwareStatus;
  branchId: string;
  lastSync?: number;
}

export interface SystemIssue {
  id: string;
  title: string;
  description: string;
  category: 'hardware' | 'network' | 'software' | 'fare' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reporterId: string;
  branchId: string;
  createdAt: number;
  updatedAt: number;
}
