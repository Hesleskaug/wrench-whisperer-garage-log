import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Available languages
export type Language = 'no' | 'en';

// Language context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
export const translations = {
  en: {
    garage: "Garage",
    vehicles: "Vehicles",
    settings: "Settings",
    addVehicle: "Add Vehicle",
    language: "Language",
    details: "Details",
    logService: "Log Service",
    currentMileage: "Current Mileage",
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
  },
  no: {
    garage: "Garasje",
    vehicles: "Kjøretøy",
    settings: "Innstillinger",
    addVehicle: "Legg til kjøretøy",
    language: "Språk",
    details: "Detaljer",
    logService: "Registrer service",
    currentMileage: "Nåværende kilometerstand",
    loading: "Laster...",
    deleteVehicle: "Slett kjøretøy",
    confirmDelete: "Er du sikker på at du vil slette dette kjøretøyet?",
    thisActionCannotBeUndone: "Denne handlingen kan ikke angres.",
    cancel: "Avbryt",
    delete: "Slett",
    backToGarage: "Tilbake til garasjen",
    successful: "Vellykket",
    updated: "Oppdatert",
    vehicleImages: "Kjøretøybilder",
    mainImage: "Hovedbilde",
    uploadImage: "Last opp bilde",
    manageImages: "Administrer bilder",
    close: "Lukk",
    setAsMain: "Sett som hovedbilde",
    serviceHistory: "Servicehistorikk",
    specifications: "Spesifikasjoner",
    technicalSpecifications: "Tekniske spesifikasjoner",
    plate: "Registreringsnummer",
    vin: "Understellsnummer",
    engine: "Motor",
    power: "Effekt",
    fuelType: "Drivstoff",
    transmission: "Girkasse",
    engineCode: "Motorkode",
    weight: "Vekt",
    inspectionDates: "EU-kontrolldatoer",
    inspectionDue: "EU-kontroll frist",
    lastInspection: "Siste EU-kontroll",
    inspectionDueSoon: "EU-kontroll forfaller snart!",
    setMainImage: "Sett som hovedbilde",
    date: "Dato",
    title: "Tittel",
    description: "Beskrivelse",
    mileage: "Kilometerstand",
    serviceType: "Servicetype",
    noServiceHistory: "Ingen servicehistorikk funnet",
    noVehiclesFound: "Ingen kjøretøy funnet",
    firstName: "Fornavn",
    lastName: "Etternavn",
    email: "E-post",
    phone: "Telefon",
    save: "Lagre",
    pageNotFound: "Siden ble ikke funnet",
    returnToGarage: "Tilbake til garasjen",
    firstReg: "Første reg",
    imported: "Importert",
    make: "Merke",
    model: "Modell",
    year: "Årsmodell",
    color: "Farge",
    licensePlate: "Registreringsnummer",
    vehicleInformation: "Kjøretøyinformasjon",
    garageId: "Garasje-ID",
    garagePin: "Garasje-PIN",
    garageAccessRequired: "Garasjetilgang kreves",
    pleaseEnterGarageId: "Vennligst skriv inn garasje-ID",
    pleaseEnterGaragePin: "Vennligst skriv inn garasje-PIN",
    createNewGarage: "Opprett ny garasje",
    accessGarage: "Få tilgang til garasje",
    invalidCredentials: "Ugyldige garsjeopplysninger",
    garagePinShould: "Garasje-PIN bør være minst 4 siffer",
    pleaseProvideName: "Vennligst oppgi navnet ditt",
    signOut: "Logg ut",
    newGarageCreated: "Ny garasje opprettet",
    welcome: "Velkommen",
    toYourGarage: "til garasjen din",
    serviceInformation: "Serviceinformasjon",
    general: "Generelt",
    oilChange: "Oljeskift",
    repair: "Reparasjon",
    maintenance: "Vedlikehold",
    modification: "Modifikasjon",
    inspection: "Inspeksjon",
    other: "Annet",
    serviceLogs: "Servicelogger",
    serviceDetails: "Servicedetaljer",
    serviceCost: "Servicekostnad",
    optional: "Valgfritt",
    addServiceLog: "Legg til servicelog",
    addVehicleInstructions: "Skriv inn kjøretøyinformasjonen din nedenfor",
    pleaseEnterRequiredFields: "Vennligst fyll ut alle påkrevde felter",
    editVehicle: "Rediger kjøretøy",
    vehicleSpecifications: "Kjøretøyspesifikasjoner",
    communityData: "Fellesskapsdata",
    userProvided: "Brukeroppgitt",
    noSpecifications: "Ingen spesifikasjoner tilgjengelig for dette kjøretøyet",
    addMileageCounter: "Legg til kilometerteller",
    mileageCounterAdded: "Kilometerteller lagt til",
    mileageCounterDeleted: "Kilometerteller slettet",
    name: "Navn",
    value: "Verdi", 
    unit: "Enhet",
    hours: "timer",
    counterNamePlaceholder: "f.eks. Motortimer",
    add: "Legg til",
    pleaseEnterName: "Vennligst skriv inn et navn",
  }
};

// Provider props
interface LanguageProviderProps {
  children: ReactNode;
}

// Provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Default to Norwegian
  const [language, setLanguage] = useState<Language>('no');

  // Load language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'no' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

export { useLanguage, LanguageProvider };
