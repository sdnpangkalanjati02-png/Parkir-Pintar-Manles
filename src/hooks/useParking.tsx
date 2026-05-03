/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, 
  setDoc, query, where, getDoc, getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ParkingLog, ParkingConfig, ParkingStats, Branch, HardwareDevice, SystemIssue, Member, Employee } from '../types';

interface ParkingContextType {
  logs: ParkingLog[];
  allLogs: ParkingLog[];
  config: ParkingConfig;
  stats: ParkingStats;
  branches: Branch[];
  hardware: HardwareDevice[];
  currentBranchId: string;
  setCurrentBranchId: (id: string) => void;
  entry: (plate: string, vehicleType: 'car' | 'motorcycle') => ParkingLog;
  exit: (ticketCode: string, paymentMethod: ParkingLog['paymentMethod']) => { log: ParkingLog; fare: number } | null;
  updateConfig: (newConfig: ParkingConfig) => void;
  resetData: () => void;
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  updateBranch: (branch: Branch) => void;
  addHardware: (device: Omit<HardwareDevice, 'id'>) => void;
  updateHardware: (device: HardwareDevice) => void;
  deleteHardware: (id: string) => void;
  issues: SystemIssue[];
  reportIssue: (issue: Omit<SystemIssue, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateIssue: (issue: SystemIssue) => void;
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'status'>) => void;
  updateMember: (member: Member) => void;
  deleteMember: (id: string) => void;
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (id: string) => void;
}

const DEFAULT_BRANCHES: Branch[] = [
  { 
    id: 'b1', 
    name: 'Cabang Jakarta Pusat', 
    location: 'Gambir', 
    status: 'active', 
    code: 'JKT01',
    mode: 'automatic',
    capacity: { car: 100, motorcycle: 200 }
  },
  { 
    id: 'b2', 
    name: 'Cabang Bandung', 
    location: 'Dago', 
    status: 'active', 
    code: 'BDG01',
    mode: 'hybrid',
    capacity: { car: 50, motorcycle: 100 }
  },
  { 
    id: 'b3', 
    name: 'Cabang Surabaya', 
    location: 'Gubeng', 
    status: 'active', 
    code: 'SBY01',
    mode: 'manual',
    capacity: { car: 80, motorcycle: 150 }
  },
];

const DEFAULT_HARDWARE: HardwareDevice[] = [
  { id: 'h1', name: 'Main Gate In', type: 'manless_entry', ipAddress: '192.168.1.50', port: 8080, status: 'online', branchId: 'b1' },
  { id: 'h2', name: 'Main Gate Out', type: 'manless_exit', ipAddress: '192.168.1.51', port: 8080, status: 'online', branchId: 'b1' },
  { id: 'h3', name: 'Lobby Printer', type: 'printer', ipAddress: '192.168.1.101', port: 9100, status: 'online', branchId: 'b1' },
];

const DEFAULT_CONFIG: ParkingConfig = {
  hourlyRateCar: 5000,
  hourlyRateMotorcycle: 2000,
  baseRateCar: 3000,
  baseRateMotorcycle: 1000,
  freeBufferMinutes: 10,
  maxDailyRateCar: 50000,
  maxDailyRateMotorcycle: 20000,
  overnightCharge: 15000,
  lostTicketCharge: 25000,
  serverIp: '192.168.1.100',
  gateway: '192.168.1.1',
  gateControllerIp: '192.168.1.50',
  gateControllerPort: 8080,
  manlessStationIp: '192.168.1.51',
  printerType: 'thermal',
  printerPort: 'COM1',
  companyName: 'PARK PINTAR INDONESIA',
  companyAddress: 'Jl. Sudirman Kav 52-53, Jakarta Selatan',
  companyPhone: '+62 21 555 1234',
  companyEmail: 'info@parkpintar.id',
  companyLogoUrl: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c70?q=80&w=100&auto=format&fit=crop',
};

const ParkingContext = createContext<ParkingContextType | undefined>(undefined);

export function ParkingProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<ParkingLog[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [hardware, setHardware] = useState<HardwareDevice[]>([]);
  const [issues, setIssues] = useState<SystemIssue[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<string>('');
  const [config, setConfig] = useState<ParkingConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Global Config
  useEffect(() => {
    const configDoc = doc(db, 'configs', 'main');
    return onSnapshot(configDoc, (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as ParkingConfig);
      } else {
        // Initialize if doesn't exist
        setDoc(configDoc, DEFAULT_CONFIG).catch(e => handleFirestoreError(e, OperationType.WRITE, 'configs/main'));
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'configs/main'));
  }, []);

  // Sync Branches
  useEffect(() => {
    return onSnapshot(collection(db, 'branches'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Branch));
      setBranches(data);
      if (data.length > 0 && !currentBranchId) {
        setCurrentBranchId(data[0].id);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'branches'));
  }, [currentBranchId]);

  // Sync Hardware
  useEffect(() => {
    return onSnapshot(collection(db, 'hardware'), (snapshot) => {
      setHardware(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as HardwareDevice)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'hardware'));
  }, []);

  // Sync Logs
  useEffect(() => {
    return onSnapshot(collection(db, 'logs'), (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ParkingLog)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'logs'));
  }, []);

  // Sync Issues
  useEffect(() => {
    return onSnapshot(collection(db, 'issues'), (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as SystemIssue)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'issues'));
  }, []);

  // Sync Members
  useEffect(() => {
    return onSnapshot(collection(db, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'members'));
  }, []);

  // Sync Employees
  useEffect(() => {
    return onSnapshot(collection(db, 'employees'), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Employee)));
      setIsLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'employees'));
  }, []);

  const entry = useCallback(async (plate: string, vehicleType: 'car' | 'motorcycle') => {
    const id = crypto.randomUUID();
    const newLog: ParkingLog = {
      id,
      ticketCode: `PK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      plateNumber: plate.toUpperCase(),
      entryTime: Date.now(),
      status: 'parked',
      vehicleType,
      branchId: currentBranchId,
    };
    
    try {
      await setDoc(doc(db, 'logs', id), newLog);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `logs/${id}`);
    }
    return newLog;
  }, [currentBranchId]);

  const calculateFare = (entryTime: number, vehicleType: 'car' | 'motorcycle') => {
    const durationMs = Date.now() - entryTime;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    
    if (durationMinutes <= config.freeBufferMinutes) return 0;
    
    const baseRate = vehicleType === 'car' ? config.baseRateCar : config.baseRateMotorcycle;
    const hourlyRate = vehicleType === 'car' ? config.hourlyRateCar : config.hourlyRateMotorcycle;
    
    const durationHours = Math.ceil(durationMinutes / 60);
    return baseRate + (Math.max(0, durationHours - 1) * hourlyRate);
  };

  const exit = useCallback(async (ticketCode: string, paymentMethod: ParkingLog['paymentMethod']) => {
    const q = query(collection(db, 'logs'), 
      where('ticketCode', '==', ticketCode),
      where('status', '==', 'parked'),
      where('branchId', '==', currentBranchId)
    );
    
    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const logDoc = snapshot.docs[0];
      const log = { ...logDoc.data(), id: logDoc.id } as ParkingLog;
      const fare = calculateFare(log.entryTime, log.vehicleType);
      
      const updatedLog: ParkingLog = {
        ...log,
        status: 'exited',
        exitTime: Date.now(),
        fare,
        paymentMethod,
      };

      await updateDoc(logDoc.ref, {
        status: 'exited',
        exitTime: updatedLog.exitTime,
        fare: updatedLog.fare,
        paymentMethod: updatedLog.paymentMethod
      });
      
      return { log: updatedLog, fare };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `logs/query_exit`);
      return null;
    }
  }, [config, currentBranchId]);

  const updateConfig = async (newConfig: ParkingConfig) => {
    try {
      await setDoc(doc(db, 'configs', 'main'), newConfig);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'configs/main');
    }
  };
  
  const resetData = async () => {
    // In a real app we might not want to delete all logs from firestore easily
    // but for this app's "Reset" functionality:
    try {
      const snapshot = await getDocs(collection(db, 'logs'));
      const deletions = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletions);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'logs/reset');
    }
  };

  const addBranch = async (branch: Omit<Branch, 'id'>) => {
    try {
      await addDoc(collection(db, 'branches'), branch);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'branches');
    }
  };

  const updateBranch = async (branch: Branch) => {
    try {
      const { id, ...data } = branch;
      await updateDoc(doc(db, 'branches', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `branches/${branch.id}`);
    }
  };

  const addHardware = async (device: Omit<HardwareDevice, 'id'>) => {
    try {
      await addDoc(collection(db, 'hardware'), { ...device, lastSync: Date.now() });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'hardware');
    }
  };

  const updateHardware = async (device: HardwareDevice) => {
    try {
      const { id, ...data } = device;
      await updateDoc(doc(db, 'hardware', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `hardware/${device.id}`);
    }
  };

  const deleteHardware = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hardware', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `hardware/${id}`);
    }
  };

  const reportIssue = async (issueData: Omit<SystemIssue, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const id = crypto.randomUUID();
    const newIssue = {
      ...issueData,
      status: 'open',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'issues', id), newIssue);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `issues/${id}`);
    }
  };

  const updateIssue = async (issue: SystemIssue) => {
    try {
      const { id, ...data } = issue;
      await updateDoc(doc(db, 'issues', id), { ...data, updatedAt: Date.now() });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `issues/${issue.id}`);
    }
  };

  const addMember = async (memberData: Omit<Member, 'id' | 'status'>) => {
    const id = crypto.randomUUID();
    const newMember = {
      ...memberData,
      status: memberData.expiryDate > Date.now() ? 'active' : 'expired'
    };
    try {
      await setDoc(doc(db, 'members', id), newMember);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `members/${id}`);
    }
  };

  const updateMember = async (member: Member) => {
    try {
      const { id, ...data } = member;
      await updateDoc(doc(db, 'members', id), {
        ...data,
        status: member.expiryDate > Date.now() ? 'active' : 'expired'
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `members/${member.id}`);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'members', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `members/${id}`);
    }
  };

  const addEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      await addDoc(collection(db, 'employees'), employeeData);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'employees');
    }
  };

  const updateEmployee = async (employee: Employee) => {
    try {
      const { id, ...data } = employee;
      await updateDoc(doc(db, 'employees', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `employees/${employee.id}`);
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'employees', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `employees/${id}`);
    }
  };

  // Filtered views based on current branch
  const filteredLogs = logs.filter(l => l.branchId === currentBranchId);
  const filteredHardware = hardware.filter(h => h.branchId === currentBranchId);
  const currentBranch = branches.find(b => b.id === currentBranchId);
  const occupied = filteredLogs.filter(l => l.status === 'parked').length;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const revenueToday = filteredLogs
    .filter(l => l.status === 'exited' && (l.exitTime || 0) >= todayStart)
    .reduce((sum, l) => sum + (l.fare || 0), 0);
  const entriesToday = filteredLogs.filter(l => l.entryTime >= todayStart).length;

  const stats: ParkingStats = {
    totalCapacity: currentBranch ? (currentBranch.capacity.car + currentBranch.capacity.motorcycle) : 200, 
    occupied,
    revenueToday,
    entriesToday,
  };

  return (
    <ParkingContext.Provider value={{ 
      logs: filteredLogs, 
      allLogs: logs,
      config, 
      stats, 
      branches,
      hardware: filteredHardware,
      currentBranchId,
      setCurrentBranchId,
      entry, 
      exit, 
      updateConfig, 
      resetData,
      addBranch,
      updateBranch,
      addHardware,
      updateHardware,
      deleteHardware,
      issues,
      reportIssue,
      updateIssue,
      members,
      addMember,
      updateMember,
      deleteMember,
      employees,
      addEmployee,
      updateEmployee,
      deleteEmployee
    }}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking() {
  const context = useContext(ParkingContext);
  if (!context) throw new Error('useParking must be used within ParkingProvider');
  return context;
}
