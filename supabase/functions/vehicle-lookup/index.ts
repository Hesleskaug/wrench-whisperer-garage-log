
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
    
    // Extract relevant information from the response
    const transformedData = {
      make: "",
      model: "",
      year: null,
      vin: "",
      plate: cleanPlate,
      registrationDate: null,
      color: "",
      weight: null,
      engineSize: null,
      fuelType: "",
      ownerStatus: ""
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
    
    // Extract registration date
    if (vehicle.forstegangsregistrering?.registrertForstegangNorgeDato) {
      transformedData.registrationDate = vehicle.forstegangsregistrering.registrertForstegangNorgeDato;
      // Extract year from registration date
      transformedData.year = parseInt(vehicle.forstegangsregistrering.registrertForstegangNorgeDato.substring(0, 4), 10);
    }
    
    // Extract color
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.karosseriOgLasteplan?.rFarge?.[0]?.kodeNavn) {
      transformedData.color = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.karosseriOgLasteplan.rFarge[0].kodeNavn;
    }
    
    // Extract weight
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.vekter?.egenvekt) {
      transformedData.weight = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.vekter.egenvekt;
    }
    
    // Extract engine size
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.motorOgDrivverk?.motor?.[0]?.slagvolum) {
      transformedData.engineSize = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor[0].slagvolum;
    }
    
    // Extract fuel type
    if (vehicle.godkjenning?.tekniskGodkjenning?.tekniskeData?.motorOgDrivverk?.motor?.[0]?.drivstoff?.[0]?.drivstoffKode?.kodeNavn) {
      transformedData.fuelType = vehicle.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor[0].drivstoff[0].drivstoffKode.kodeNavn;
    }
    
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
