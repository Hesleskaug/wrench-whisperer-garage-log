export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  plate?: string;
  mileage: number;
  image?: string;
  bodyType?: string; 
  specs?: VehicleSpecs;
  fuelType?: string; // Add fuelType directly to Vehicle for accessibility
}

export interface ReceiptInfo {
  store: string;
  invoiceNumber?: string;
  date?: string;
  amount?: number;
  images?: string[];
  note?: string;
  websiteUrl?: string;
}

export interface ServiceTask {
  id: string;
  description: string;
  completed: boolean;
  notes?: string;
  toolsRequired?: string[];
  torqueSpec?: string;
  receipt?: ReceiptInfo;
  images?: string[];
}

export interface ServiceLog {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  serviceType: string;
  description: string;
  parts: string[];
  cost: number;
  tasks: ServiceTask[];
  nextDueMileage?: number; // Add this field to fix the build error
  nextDueDate?: string;    // Add this field to fix the build error
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
  // New specification fields
  engineType?: string;
  enginePower?: string;
  engineSize?: string;
  engineCode?: string;
  transmission?: string;
  tireSize?: string;
  wheelSize?: string;
  alternatorOutput?: string;
  fuseBoxLocations?: string;
  frontBrakeType?: string;
  rearBrakeType?: string;
  brakeFluidType?: string;
  additionalNotes?: string;
  fuelType?: string; // Added fuelType to VehicleSpecs
}

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    make: 'Volvo',
    model: 'V70',
    year: 2018,
    plate: 'AB12345',
    mileage: 78500,
    bodyType: 'Station Wagon',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80',
    fuelType: 'Diesel' // Added fuelType
  },
  {
    id: '2',
    make: 'Toyota',
    model: 'RAV4',
    year: 2020,
    plate: 'CD67890',
    mileage: 45200,
    bodyType: 'SUV',
    image: 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
    fuelType: 'E5' // Added fuelType
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
    cost: 1200,
    tasks: [
      { 
        id: '1-1', 
        description: 'Place oil drain pan under the oil pan', 
        completed: true 
      },
      { 
        id: '1-2', 
        description: 'Remove oil drain plug (17mm socket)', 
        completed: true,
        torqueSpec: '25 Nm',
        toolsRequired: ['17mm socket', 'Torque wrench', 'Oil drain pan']
      },
      { 
        id: '1-3', 
        description: 'Remove oil filter using oil filter wrench', 
        completed: true,
        toolsRequired: ['Oil filter wrench']
      },
      { 
        id: '1-4', 
        description: 'Install new oil filter (pre-fill with oil and lubricate gasket)', 
        completed: true,
        receipt: {
          store: 'Auto Parts Store',
          invoiceNumber: 'INV-56789',
          date: '2023-11-14',
          amount: 150
        },
        images: [
          'https://images.unsplash.com/photo-1635768680691-593148bcbbd2?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1676218075639-9d47246e2fcb?q=80&w=600&auto=format&fit=crop'
        ]
      },
      { 
        id: '1-5', 
        description: 'Reinstall drain plug with new washer', 
        completed: true,
        torqueSpec: '25 Nm',
        notes: 'Always use a new crush washer'
      },
      { 
        id: '1-6', 
        description: 'Fill with 5L of new oil', 
        completed: true,
        receipt: {
          store: 'Auto Parts Store',
          invoiceNumber: 'INV-56789',
          date: '2023-11-14',
          amount: 899
        }
      },
      { 
        id: '1-7', 
        description: 'Start engine and check for leaks', 
        completed: true 
      }
    ]
  },
  {
    id: '2',
    vehicleId: '1',
    date: '2023-09-05',
    mileage: 72500,
    serviceType: 'Brake Service',
    description: 'Replaced front brake pads and rotors',
    parts: ['Brembo brake pads', 'Bosch rotors'],
    cost: 3500,
    tasks: [
      { 
        id: '2-1', 
        description: 'Jack up car and remove wheel', 
        completed: true,
        toolsRequired: ['Jack', 'Jack stands', '19mm socket']
      },
      { 
        id: '2-2', 
        description: 'Remove caliper bolts (14mm) and hang caliper with wire', 
        completed: true,
        torqueSpec: '28 Nm',
        toolsRequired: ['14mm socket', 'Wire or bungee cord']
      },
      { 
        id: '2-3', 
        description: 'Remove caliper bracket bolts (17mm)', 
        completed: true,
        torqueSpec: '120 Nm',
        toolsRequired: ['17mm socket', 'Breaker bar']
      },
      { 
        id: '2-4', 
        description: 'Remove old rotor (may need hammer if stuck)', 
        completed: true,
        toolsRequired: ['Rubber mallet']
      },
      { 
        id: '2-5', 
        description: 'Clean hub face and install new rotor', 
        completed: true,
        toolsRequired: ['Wire brush', 'Brake cleaner']
      },
      { 
        id: '2-6', 
        description: 'Install caliper bracket with new bolts', 
        completed: true,
        torqueSpec: '120 Nm',
        notes: 'Apply thread locker to bolts'
      },
      { 
        id: '2-7', 
        description: 'Install new brake pads with anti-squeal paste on backs', 
        completed: true 
      },
      { 
        id: '2-8', 
        description: 'Compress caliper piston and reinstall caliper', 
        completed: true,
        toolsRequired: ['Caliper piston tool or C-clamp']
      },
      { 
        id: '2-9', 
        description: 'Reinstall wheel and torque lug nuts in star pattern', 
        completed: true,
        torqueSpec: '140 Nm',
        notes: 'Retorque after 50-100km of driving'
      }
    ]
  },
  {
    id: '3',
    vehicleId: '2',
    date: '2023-12-02',
    mileage: 45000,
    serviceType: 'Regular Maintenance',
    description: 'Oil change, air filter replacement, and tire rotation',
    parts: ['Oil filter', 'Air filter', '4.5L Mobil 1 0W-20'],
    cost: 1500,
    tasks: [
      { 
        id: '3-1', 
        description: 'Change oil and filter', 
        completed: true 
      },
      { 
        id: '3-2', 
        description: 'Replace air filter', 
        completed: true,
        notes: 'Filter located in airbox on driver side'
      },
      { 
        id: '3-3', 
        description: 'Rotate tires (front to back, same side)', 
        completed: true,
        torqueSpec: '103 Nm',
        toolsRequired: ['Torque wrench', '21mm socket', 'Jack', 'Jack stands']
      }
    ]
  }
];

export const mockVehicleSpecs: VehicleSpecs[] = [
  {
    id: '1',
    vehicleId: '1',
    engineType: '2.0L Turbocharged 4-cylinder',
    enginePower: '250 hp @ 5500 rpm',
    engineSize: '1969cc',
    engineCode: 'B4204T23',
    transmission: '8-speed Automatic',
    wheelTorque: '140 Nm',
    oilCapacity: '5.2 L',
    oilType: '5W-30',
    tirePressureFront: '2.4 bar (35 psi)',
    tirePressureRear: '2.4 bar (35 psi)',
    batterySize: '70AH 760A',
    sparkPlugGap: '0.7-0.8 mm',
    coolantType: 'Volvo Blue Coolant',
    tireSize: '235/45R18',
    wheelSize: '18 x 8J',
    alternatorOutput: '180A',
    fuseBoxLocations: 'Under dashboard and in engine compartment',
    frontBrakeType: 'Ventilated discs, 345mm',
    rearBrakeType: 'Solid discs, 320mm',
    brakeFluidType: 'DOT 4',
    additionalNotes: 'Timing belt replacement recommended at 120,000 km. Requires special tool for oil filter removal.',
    fuelType: 'Diesel' // Added fuelType
  },
  {
    id: '2',
    vehicleId: '2',
    engineType: '2.5L Dynamic Force 4-cylinder',
    enginePower: '203 hp @ 6600 rpm',
    engineSize: '2487cc',
    engineCode: 'A25A-FKS',
    transmission: 'CVT Automatic',
    wheelTorque: '103 Nm',
    oilCapacity: '4.5 L',
    oilType: '0W-20',
    tirePressureFront: '2.5 bar (36 psi)',
    tirePressureRear: '2.5 bar (36 psi)',
    batterySize: '60AH 590A',
    sparkPlugGap: '1.0-1.1 mm',
    coolantType: 'Toyota Super Long Life Coolant',
    tireSize: '225/65R17',
    wheelSize: '17 x 7J',
    alternatorOutput: '150A',
    fuseBoxLocations: 'Under dashboard and in engine compartment',
    frontBrakeType: 'Ventilated discs, 320mm',
    rearBrakeType: 'Solid discs, 281mm',
    brakeFluidType: 'DOT 3',
    additionalNotes: 'Uses Toyota maintenance-free timing chain. Hybrid model requires different service procedures.',
    fuelType: 'E5' // Added fuelType
  }
];
