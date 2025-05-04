
import React, { createContext, useContext, ReactNode } from 'react';

// Translations
export const translations = {
  garage: "Garage",
  vehicles: "Vehicles",
  settings: "Settings",
  addVehicle: "Add Vehicle",
  language: "Language",
  details: "Details",
  logService: "Log Service",
  currentMileage: "Last Logged Mileage", // Updated from "Current Mileage"
  loading: "Loading...",
  deleteVehicle: "Delete Vehicle",
  confirmDelete: "Are you sure you want to delete this vehicle?",
  thisActionCannotBeUndone: "This action cannot be undone.",
  cancel: "Cancel",
  delete: "Delete",
  backToGarage: "Back to Garage",
  successful: "Successful",
  updated: "Updated",
  vehicleImages: "Vehicle Images",
  mainImage: "Main Image",
  uploadImage: "Upload Image",
  manageImages: "Manage Images",
  close: "Close",
  setAsMain: "Set as Main",
  serviceHistory: "Service History",
  specifications: "Specifications",
  technicalSpecifications: "Technical Specifications",
  plate: "Plate",
  vin: "VIN",
  engine: "Engine",
  power: "Power",
  fuelType: "Fuel Type",
  transmission: "Transmission",
  engineCode: "Engine Code",
  weight: "Weight",
  inspectionDates: "Inspection Dates",
  inspectionDue: "Inspection Due",
  lastInspection: "Last Inspection",
  inspectionDueSoon: "Inspection due soon!",
  setMainImage: "Set as Main Image",
  date: "Date",
  title: "Title",
  description: "Description",
  mileage: "Mileage",
  serviceType: "Service Type",
  noServiceHistory: "No service history found",
  noVehiclesFound: "No vehicles found",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  save: "Save",
  pageNotFound: "Page Not Found",
  returnToGarage: "Return to Garage",
  firstReg: "First Reg",
  imported: "Imported",
  make: "Make",
  model: "Model",
  year: "Year",
  color: "Color",
  licensePlate: "License Plate",
  vehicleInformation: "Vehicle Information",
  garageId: "Garage ID",
  garagePin: "Garage PIN",
  garageAccessRequired: "Garage Access Required",
  pleaseEnterGarageId: "Please enter your garage ID",
  pleaseEnterGaragePin: "Please enter your garage PIN",
  createNewGarage: "Create New Garage",
  accessGarage: "Access Garage",
  invalidCredentials: "Invalid garage credentials",
  garagePinShould: "Garage PIN should be at least 4 digits",
  pleaseProvideName: "Please provide your name",
  signOut: "Sign Out",
  newGarageCreated: "New garage created",
  welcome: "Welcome",
  toYourGarage: "to your Garage",
  serviceInformation: "Service Information",
  general: "General",
  oilChange: "Oil Change",
  repair: "Repair",
  maintenance: "Maintenance",
  modification: "Modification",
  inspection: "Inspection",
  other: "Other",
  serviceLogs: "Service Logs",
  serviceDetails: "Service Details",
  serviceCost: "Service Cost",
  optional: "Optional",
  addServiceLog: "Add Service Log",
  addVehicleInstructions: "Enter your vehicle information below",
  pleaseEnterRequiredFields: "Please enter all required fields",
  editVehicle: "Edit Vehicle",
  vehicleSpecifications: "Vehicle Specifications",
  communityData: "Community Data",
  userProvided: "User Provided",
  noSpecifications: "No specifications available for this vehicle",
  addMileageCounter: "Add Mileage Counter",
  mileageCounterAdded: "Mileage counter added",
  mileageCounterDeleted: "Mileage counter deleted",
  name: "Name",
  value: "Value", 
  unit: "Unit",
  hours: "hours",
  counterNamePlaceholder: "e.g. Engine Hours",
  add: "Add",
  pleaseEnterName: "Please enter a name",
  images: "Images",
  parts: "Parts",
  noTasks: "No tasks",
  torque: "Torque",
  toolsRequired: "Tools Required",
  receiptInformation: "Receipt Information",
  invoice: "Invoice",
  amount: "Amount",
  addImageUrl: "Add Image URL",
  printHistory: "Print History",
  noServiceRecords: "No Service Records",
  startLogging: "Start logging services to see history here",
  noPlate: "No Plate", // Added this for NorwegianPlate.tsx
  yourGarage: "Your Garage", // Added for Navigation
  emailGarageId: "Email Garage ID", // Added for Navigation
  exitGarage: "Exit Garage", // Added for Navigation
  emailYourGarageId: "Email Your Garage ID", // Added for Navigation dialog
  emailDescription: "Enter your email to receive your Garage ID", // Added for Navigation dialog
  emailAddress: "Email Address", // Added for Navigation dialog
  sending: "Sending...", // Added for Navigation during email sending
  sendEmail: "Send Email", // Added for Navigation
  areYouSure: "Are you sure?", // Added for DeleteVehicleDialog
  deleteWarning: "This action cannot be undone." // Added for DeleteVehicleDialog
};

// Language context type
type LanguageContextType = {
  t: (key: string) => string;
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider props
interface LanguageProviderProps {
  children: ReactNode;
}

// Provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Translation function
  const t = (key: string): string => {
    return translations[key as keyof typeof translations] || key;
  };

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};
