
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
    
    // Call Statens vegvesen API
    const apiUrl = `https://www.vegvesen.no/ws/no/vegvesen/kjoretoy/felles/datautlevering/enkeltoppslag/kjoretoydata?kjennemerke=${encodeURIComponent(cleanPlate)}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "SVV-Authorization": "Apikey " + Deno.env.get("SVV_API_KEY"),
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      
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
    
    // Transform the API response to match our app's data structure
    const transformedData = {
      make: vehicleData.kjoretoydataEier?.merke?.merke || "",
      model: vehicleData.kjoretoydataEier?.modell?.modellType || 
             vehicleData.kjoretoydataEier?.modell?.modellBetegnelse || "",
      year: parseInt(vehicleData.kjoretoydataEier?.forstegangsregistrering?.dato?.substring(0,4)) || null,
      vin: vehicleData.kjoretoydataEier?.understellsnummer || "",
      plate: cleanPlate,
      registrationDate: vehicleData.kjoretoydataEier?.forstegangsregistrering?.dato || null,
      color: vehicleData.kjoretoydataEier?.farge || "",
      weight: vehicleData.kjoretoydataEier?.tekniskData?.vekter?.egenvekt || null,
      engineSize: vehicleData.kjoretoydataEier?.tekniskData?.motor?.slagvolum || null,
      fuelType: vehicleData.kjoretoydataEier?.tekniskData?.motor?.drivstoff?.drivstoffKodeTekst || "",
      ownerStatus: vehicleData.kjoretoydataEier?.registrering?.eier?.eierstatus || ""
    };
    
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
