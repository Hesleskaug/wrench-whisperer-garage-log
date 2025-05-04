
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plate } = await req.json();
    
    if (!plate) {
      return new Response(
        JSON.stringify({ error: "License plate is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean the license plate input (remove spaces, etc.)
    const cleanPlate = plate.replace(/\s+/g, '').toUpperCase();
    
    console.log(`Looking up vehicle with plate: ${cleanPlate}`);
    
    // Get API key from environment
    const apiKey = Deno.env.get("SVV_API_KEY");
    if (!apiKey) {
      console.error("SVV_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Call Statens vegvesen API
    const apiUrl = `https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata?kjennemerke=${encodeURIComponent(cleanPlate)}`;
    
    console.log(`Calling Vegvesen API at: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "SVV-Authorization": "Apikey " + apiKey,
        "Accept": "application/json"
      }
    });
    
    console.log(`API response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error details: ${errorText}`);
      
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ error: "Vehicle not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Error fetching vehicle data" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const vehicleData = await response.json();
    console.log("Vehicle data retrieved successfully");
    
    // Check if we have the expected data structure
    if (!vehicleData || !vehicleData.kjoretoydataListe || vehicleData.kjoretoydataListe.length === 0) {
      console.error("Unexpected API response format:", JSON.stringify(vehicleData));
      return new Response(
        JSON.stringify({ error: "Unexpected API response format" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the first vehicle data entry
    const vehicle = vehicleData.kjoretoydataListe[0];
    console.log("Processing vehicle data:", JSON.stringify(vehicle));
    
    // Extract comprehensive information from the response
    const transformedData = {
      // Basic vehicle information
      make: "",
      model: "",
      year: null,
      vin: "",
      plate: cleanPlate,
      registrationDate: null,
      firstRegistrationDate: null, // Added this to track original registration
      importDate: null, // Added to track when it was imported (if applicable)
      
      // Physical characteristics
      color: "",
      weight: null,
      length: null,
      width: null,
      height: null,
      
      // Engine and drivetrain
      engineSize: null,
      enginePower: null,
      fuelType: "",
      engineCode: "",
      transmission: "",
      drivetrain: "",
      
      // Classification and usage
      vehicleCategory: "",
      bodyType: "",
      numberOfDoors: null,
      seatingCapacity: null,
      
      // Technical inspection
      inspectionDue: null,
      lastInspection: null,
      
      // Tires and wheels
      tireSizeFront: "",
      tireSizeRear: "",
      
      // Environmental data
      emissionClass: "",
      co2Emission: null,
      
      // Complete raw data for reference
      rawData: vehicle
    };
    
    // Extract make/brand
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.merke?.[0]?.merke) {
      transformedData.make = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.generelt.merke[0].merke;
    }
    
    // Extract model
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt?.handelsbetegnelse?.[0]) {
      transformedData.model = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.generelt.handelsbetegnelse[0];
    }
    
    // Extract VIN
    if (vehicle.kjoretoyId?.understellsnummer) {
      transformedData.vin = vehicle.kjoretoyId.understellsnummer;
    }
    
    // Extract original first registration date worldwide
    if (vehicle.godkjenning?.forstegangsGodkjenning?.forstegangRegistrertDato) {
      transformedData.firstRegistrationDate = vehicle.godkjenning.forstegangsGodkjenning.forstegangRegistrertDato;
      
      // Use the original first registration date for year, not the import date
      const originalYear = parseInt(vehicle.godkjenning.forstegangsGodkjenning.forstegangRegistrertDato.substring(0, 4), 10);
      if (!isNaN(originalYear)) {
        transformedData.year = originalYear;
      }
    }
    
    // Extract registration date in Norway (could be import date)
    if (vehicle.forstegangsregistrering?.registrertForstegangNorgeDato) {
      transformedData.registrationDate = vehicle.forstegangsregistrering.registrertForstegangNorgeDato;
      
      // If we don't have a manufacturing year from original registration, use this as fallback
      if (!transformedData.year) {
        transformedData.year = parseInt(vehicle.forstegangsregistrering.registrertForstegangNorgeDato.substring(0, 4), 10);
      }
      
      // If import information exists, set import date
      if (vehicle.godkjenning?.forstegangsGodkjenning?.bruktimport) {
        transformedData.importDate = vehicle.forstegangsregistrering.registrertForstegangNorgeDato;
      }
    }
    
    // Extract color
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.karosseriOgLasteplan?.rFarge?.[0]?.kodeNavn) {
      transformedData.color = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.karosseriOgLasteplan.rFarge[0].kodeNavn;
    }
    
    // Extract weight
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.vekter?.egenvekt) {
      transformedData.weight = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.vekter.egenvekt;
    }
    
    // Extract dimensions
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.dimensjoner?.lengde) {
      transformedData.length = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.dimensjoner.lengde;
    }
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.dimensjoner?.bredde) {
      transformedData.width = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.dimensjoner.bredde;
    }
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.dimensjoner?.hoyde) {
      transformedData.height = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.dimensjoner.hoyde;
    }
    
    // Extract engine size
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.motorOgDrivverk?.motor?.[0]?.slagvolum) {
      transformedData.engineSize = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor[0].slagvolum;
    }
    
    // Extract engine power
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.motorOgDrivverk?.motor?.[0]?.drivstoff?.[0]?.maksNettoEffekt) {
      transformedData.enginePower = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor[0].drivstoff[0].maksNettoEffekt;
    }
    
    // Extract fuel type
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.motorOgDrivverk?.motor?.[0]?.drivstoff?.[0]?.drivstoffKode?.kodeNavn) {
      transformedData.fuelType = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor[0].drivstoff[0].drivstoffKode.kodeNavn;
    }
    
    // Extract engine code
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.motorOgDrivverk?.motor?.[0]?.motorKode) {
      transformedData.engineCode = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor[0].motorKode;
    }
    
    // Extract transmission type
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.motorOgDrivverk?.girkassetype?.kodeNavn) {
      transformedData.transmission = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.girkassetype.kodeNavn;
    }
    
    // Extract vehicle category
    if (vehicle.godkjenning?.tekniskGodkjenning?.kjoretoyklassifisering?.beskrivelse) {
      transformedData.vehicleCategory = vehicle.godkjenning.tekniskGodkjenning.kjoretoyklassifisering.beskrivelse;
    }
    
    // Extract body type
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.karosseriOgLasteplan?.karosseritype?.kodeNavn) {
      transformedData.bodyType = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.karosseriOgLasteplan.karosseritype.kodeNavn;
    }
    
    // Extract number of doors
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.karosseriOgLasteplan?.antallDorer?.[0]) {
      transformedData.numberOfDoors = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.karosseriOgLasteplan.antallDorer[0];
    }
    
    // Extract seating capacity
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.persontall?.sitteplasserTotalt) {
      transformedData.seatingCapacity = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.persontall.sitteplasserTotalt;
    }
    
    // Extract technical inspection dates
    if (vehicle.periodiskKjoretoyKontroll?.kontrollfrist) {
      transformedData.inspectionDue = vehicle.periodiskKjoretoyKontroll.kontrollfrist;
    }
    if (vehicle.periodiskKjoretoyKontroll?.sistGodkjent) {
      transformedData.lastInspection = vehicle.periodiskKjoretoyKontroll.sistGodkjent;
    }
    
    // Extract tire sizes
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.dekkOgFelg?.akselDekkOgFelgKombinasjon?.[0]?.akselDekkOgFelg?.[0]?.dekkdimensjon) {
      transformedData.tireSizeFront = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.dekkOgFelg.akselDekkOgFelgKombinasjon[0].akselDekkOgFelg[0].dekkdimensjon;
    }
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.dekkOgFelg?.akselDekkOgFelgKombinasjon?.[0]?.akselDekkOgFelg?.[1]?.dekkdimensjon) {
      transformedData.tireSizeRear = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.dekkOgFelg.akselDekkOgFelgKombinasjon[0].akselDekkOgFelg[1].dekkdimensjon;
    }
    
    // Extract emission data
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.miljodata?.euroKlasse?.kodeNavn) {
      transformedData.emissionClass = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.miljodata.euroKlasse.kodeNavn;
    }
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.miljodata?.miljoOgdrivstoffGruppe?.[0]?.forbrukOgUtslipp?.[0]?.co2BlandetKjoring) {
      transformedData.co2Emission = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.miljodata.miljoOgdrivstoffGruppe[0].forbrukOgUtslipp[0].co2BlandetKjoring;
    }
    
    // Log the full transformed data
    console.log("Transformed vehicle data:", JSON.stringify(transformedData));
    
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in vehicle lookup:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
