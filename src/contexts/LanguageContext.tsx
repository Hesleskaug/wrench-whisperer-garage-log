
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
  no: {
    // Navigation
    "garage": "Garasje",
    "yourGarage": "Din Garasje",
    "accessGarage": "Åpne Garasje",
    "emailGarageId": "Send Garasje-ID på e-post",
    "settings": "Innstillinger",
    "exitGarage": "Forlat Garasje",

    // Vehicle Card
    "details": "Detaljer",
    "logService": "Logg Service",
    "currentMileage": "Nåværende Kilometerstand",
    "noPlate": "Ingen Skiltnr.",
    
    // Vehicle Details Page
    "backToGarage": "Tilbake til Garasjen",
    "technicalSpecifications": "Tekniske Spesifikasjoner",
    "engine": "Motor",
    "power": "Effekt",
    "fuelType": "Drivstoff",
    "transmission": "Girkasse",
    "engineCode": "Motorkode",
    "weight": "Vekt",
    "inspectionDates": "Kontrollfrister",
    "inspectionDue": "EU-kontroll frist",
    "lastInspection": "Siste EU-kontroll",
    "inspectionDueSoon": "EU-kontroll snart",
    "plate": "Registreringsnummer",
    "vin": "Understellsnummer",
    
    // Service History
    "serviceHistory": "Service Historikk",
    "specifications": "Spesifikasjoner",
    "firstReg": "Første Reg",
    "imported": "Importert",
    
    // Image Management
    "manageImages": "Administrer Bilder",
    "close": "Lukk",
    "vehicleImages": "Kjøretøybilder",
    "uploadImage": "Last opp Bilde",
    "addImageUrl": "Legg til Bilde URL",
    "add": "Legg til",
    "cancel": "Avbryt",
    "mainImage": "Hovedbilde",
    
    // Service Tasks
    "noTasks": "Ingen oppgaver registrert for denne servicen",
    "toolsRequired": "Verktøy nødvendig",
    "torque": "Moment",
    "receiptInformation": "Kvitteringsinformasjon",
    "invoice": "Faktura",
    "date": "Dato",
    "amount": "Beløp",
    "images": "Bilder",
    
    // Delete Dialog
    "areYouSure": "Er du sikker?",
    "deleteWarning": "Dette vil permanent slette kjøretøyet og all servicehistorikk fra garasjen din. Denne handlingen kan ikke angres.",
    "delete": "Slett",
    
    // Email Dialog
    "emailYourGarageId": "Send Garasje-ID på e-post",
    "emailDescription": "Send Garasje-ID til din e-postadresse for sikkerhetskopiering.",
    "emailAddress": "E-postadresse",
    "sendEmail": "Send E-post",
    "sending": "Sender...",
    
    // Language
    "language": "Språk", 
    "norwegian": "Norsk",
    "english": "Engelsk",
    
    // Generic
    "loading": "Laster inn..."
  },
  en: {
    // Navigation
    "garage": "Garage",
    "yourGarage": "Your Garage",
    "accessGarage": "Access Garage",
    "emailGarageId": "Email Garage ID",
    "settings": "Settings",
    "exitGarage": "Exit Garage",

    // Vehicle Card
    "details": "Details",
    "logService": "Log Service",
    "currentMileage": "Current Mileage",
    "noPlate": "No Plate",
    
    // Vehicle Details Page
    "backToGarage": "Back to Garage",
    "technicalSpecifications": "Technical Specifications",
    "engine": "Engine",
    "power": "Power",
    "fuelType": "Fuel Type",
    "transmission": "Transmission",
    "engineCode": "Engine Code",
    "weight": "Weight",
    "inspectionDates": "Inspection Dates",
    "inspectionDue": "Inspection Due",
    "lastInspection": "Last Inspection",
    "inspectionDueSoon": "Inspection due soon",
    "plate": "Plate Number",
    "vin": "VIN",
    
    // Service History
    "serviceHistory": "Service History",
    "specifications": "Specifications",
    "firstReg": "First Reg",
    "imported": "Imported",
    
    // Image Management
    "manageImages": "Manage Images",
    "close": "Close",
    "vehicleImages": "Vehicle Images",
    "uploadImage": "Upload Image",
    "addImageUrl": "Add Image URL",
    "add": "Add",
    "cancel": "Cancel",
    "mainImage": "Main Image",
    
    // Service Tasks
    "noTasks": "No tasks recorded for this service",
    "toolsRequired": "Tools Required",
    "torque": "Torque",
    "receiptInformation": "Receipt Information",
    "invoice": "Invoice",
    "date": "Date",
    "amount": "Amount",
    "images": "Images",
    
    // Delete Dialog
    "areYouSure": "Are you sure?",
    "deleteWarning": "This will permanently delete the vehicle and all its service history from your garage. This action cannot be undone.",
    "delete": "Delete",
    
    // Email Dialog
    "emailYourGarageId": "Email your Garage ID",
    "emailDescription": "Send your Garage ID to your email address for safekeeping.",
    "emailAddress": "Email address",
    "sendEmail": "Send Email",
    "sending": "Sending...",
    
    // Language
    "language": "Language", 
    "norwegian": "Norwegian",
    "english": "English",
    
    // Generic
    "loading": "Loading..."
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
