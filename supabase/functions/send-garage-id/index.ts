
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": 
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, garageId } = await req.json();
    
    if (!email || !garageId) {
      return new Response(
        JSON.stringify({ error: "Email and garage ID are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Simple email simulation for demo purposes
    // In a real app, you would use a service like Resend, SendGrid, etc.
    console.log(`Simulating email to: ${email}`);
    console.log(`Subject: Your Wrench Whisperer Garage ID`);
    console.log(`Body: Your garage ID is: ${garageId}`);
    
    // In a real implementation, we'd use an email service here
    // This is just a placeholder to demonstrate the flow
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in send-garage-id function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
