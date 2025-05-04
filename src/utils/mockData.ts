
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  plate?: string;
  mileage: number;
  image?: string;
}

export interface ServiceLog {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  serviceType: string;
  description: string;
  parts?: string[];
  cost?: number;
}

export interface VehicleSpecs {
  id: string;
  vehicleId: string;
  wheelTorque: string;
  oilCapacity: string;
  oilType: string;
  tirePressureFront: string;
  tirePressureRear: string;
  batterySize: string;
  sparkPlugGap?: string;
  coolantType?: string;
  additionalNotes?: string;
}

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Volvo',
    model: 'V70',
    year: 2018,
    plate: 'AB12345',
    mileage: 78500,
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80'
  },
  {
    id: '2',
    make: 'Toyota',
    model: 'RAV4',
    year: 2020,
    plate: 'CD67890',
    mileage: 45200,
    image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80'
  }
];

export const mockServiceLogs: ServiceLog[] = [
  {
    id: '1',
    vehicleId: '1',
    date: '2023-11-15',
    mileage: 75000,
    serviceType: 'Oil Change',
    description: 'Changed oil and filter',
    parts: ['Oil filter', '5L Castrol Edge 5W-30'],
    cost: 1200
  },
  {
    id: '2',
    vehicleId: '1',
    date: '2023-09-05',
    mileage: 72500,
    serviceType: 'Brake Service',
    description: 'Replaced front brake pads and rotors',
    parts: ['Brembo brake pads', 'Bosch rotors'],
    cost: 3500
  },
  {
    id: '3',
    vehicleId: '2',
    date: '2023-12-02',
    mileage: 45000,
    serviceType: 'Regular Maintenance',
    description: 'Oil change, air filter replacement, and tire rotation',
    parts: ['Oil filter', 'Air filter', '4.5L Mobil 1 0W-20'],
    cost: 1500
  }
];

export const mockVehicleSpecs: VehicleSpecs[] = [
  {
    id: '1',
    vehicleId: '1',
    wheelTorque: '140 Nm',
    oilCapacity: '5.2 L',
    oilType: '5W-30',
    tirePressureFront: '2.4 bar (35 psi)',
    tirePressureRear: '2.4 bar (35 psi)',
    batterySize: '70AH 760A',
    sparkPlugGap: '0.7-0.8 mm',
    coolantType: 'Volvo Blue Coolant',
  },
  {
    id: '2',
    vehicleId: '2',
    wheelTorque: '103 Nm',
    oilCapacity: '4.5 L',
    oilType: '0W-20',
    tirePressureFront: '2.5 bar (36 psi)',
    tirePressureRear: '2.5 bar (36 psi)',
    batterySize: '60AH 590A',
    sparkPlugGap: '1.0-1.1 mm',
    coolantType: 'Toyota Super Long Life Coolant',
  }
];
