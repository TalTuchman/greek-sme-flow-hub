
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const action = url.searchParams.get('action') || 'view';

    if (!token) {
      return new Response(generateErrorHTML('Invalid or missing response token'), {
        status: 400,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    // Find the campaign message by response token
    const { data: campaignMessage, error: messageError } = await supabase
      .from('campaign_messages')
      .select(`
        *,
        bookings:booking_id (*),
        customers:customer_id (*),
        campaigns:campaign_id (*)
      `)
      .eq('response_token', token)
      .single();

    if (messageError || !campaignMessage) {
      return new Response(generateErrorHTML('Invalid response token or message not found'), {
        status: 404,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    // Check if token has expired
    const expiresAt = new Date(campaignMessage.expires_at);
    if (new Date() > expiresAt) {
      return new Response(generateErrorHTML('This response link has expired'), {
        status: 410,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    if (req.method === 'GET') {
      // Show response form
      return new Response(generateResponseHTML(campaignMessage, action), {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    if (req.method === 'POST') {
      // Handle form submission
      const formData = await req.formData();
      const responseType = formData.get('response_type') as string;
      const newBookingTime = formData.get('new_booking_time') as string;
      
      // Record the response
      const { data: messageResponse, error: responseError } = await supabase
        .from('message_responses')
        .insert({
          campaign_message_id: campaignMessage.id,
          booking_id: campaignMessage.booking_id,
          response_type: responseType,
          client_ip: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown',
        })
        .select()
        .single();

      if (responseError) {
        throw responseError;
      }

      // Handle different response types
      switch (responseType) {
        case 'approve':
          // No additional action needed for approval
          break;

        case 'cancel':
          // Update booking status to cancelled
          await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', campaignMessage.booking_id);
          break;

        case 'modify':
          if (newBookingTime) {
            // Create booking modification request
            await supabase
              .from('booking_modification_requests')
              .insert({
                original_booking_id: campaignMessage.booking_id,
                message_response_id: messageResponse.id,
                requested_booking_time: newBookingTime,
              });
          }
          break;
      }

      return new Response(generateSuccessHTML(responseType), {
        status: 200,
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  } catch (error) {
    console.error('Error handling campaign response:', error);
    return new Response(generateErrorHTML('An error occurred while processing your response'), {
      status: 500,
      headers: { 'Content-Type': 'text/html', ...corsHeaders },
    });
  }
};

function generateResponseHTML(campaignMessage: any, action: string): string {
  const booking = campaignMessage.bookings;
  const customer = campaignMessage.customers;
  const bookingTime = new Date(booking.booking_time);
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Response</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; margin-bottom: 30px; }
        .booking-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .btn-group { display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap; }
        button { padding: 12px 24px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
        .btn-primary { background: #007bff; color: white; }
        .btn-success { background: #28a745; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-warning { background: #ffc107; color: black; }
        .modify-form { display: none; margin-top: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        input[type="datetime-local"] { padding: 10px; border: 1px solid #ddd; border-radius: 5px; width: 100%; }
        .hidden { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Response</h1>
          <p>Hello ${customer.full_name}!</p>
        </div>
        
        <div class="booking-details">
          <h3>Booking Details</h3>
          <p><strong>Date & Time:</strong> ${bookingTime.toLocaleString()}</p>
          <p><strong>Service:</strong> ${booking.services?.name || 'Service details'}</p>
          ${booking.staff_members ? `<p><strong>Staff:</strong> ${booking.staff_members.full_name}</p>` : ''}
          ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        </div>

        <form method="POST">
          <div class="btn-group">
            <button type="button" class="btn-success" onclick="submitResponse('approve')">
              ✓ Confirm Booking
            </button>
            <button type="button" class="btn-warning" onclick="showModifyForm()">
              📅 Request New Time
            </button>
            <button type="button" class="btn-danger" onclick="submitResponse('cancel')">
              ✗ Cancel Booking
            </button>
          </div>

          <div id="modifyForm" class="modify-form">
            <h4>Request New Booking Time</h4>
            <input type="datetime-local" name="new_booking_time" required>
            <div style="margin-top: 15px;">
              <button type="button" class="btn-primary" onclick="submitModification()">Submit Request</button>
              <button type="button" class="btn btn-secondary" onclick="hideModifyForm()">Cancel</button>
            </div>
          </div>

          <input type="hidden" name="response_type" id="responseType">
        </form>
      </div>

      <script>
        function submitResponse(type) {
          document.getElementById('responseType').value = type;
          document.querySelector('form').submit();
        }

        function showModifyForm() {
          document.getElementById('modifyForm').style.display = 'block';
        }

        function hideModifyForm() {
          document.getElementById('modifyForm').style.display = 'none';
        }

        function submitModification() {
          const newTime = document.querySelector('input[name="new_booking_time"]').value;
          if (!newTime) {
            alert('Please select a new booking time');
            return;
          }
          document.getElementById('responseType').value = 'modify';
          document.querySelector('form').submit();
        }
      </script>
    </body>
    </html>
  `;
}

function generateSuccessHTML(responseType: string): string {
  const messages = {
    approve: 'Your booking has been confirmed! Thank you.',
    cancel: 'Your booking has been cancelled. We hope to see you again soon.',
    modify: 'Your request for a new booking time has been submitted. We will contact you soon to confirm the new appointment.'
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Response Received</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .success { color: #28a745; font-size: 48px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">✓</div>
        <h1>Thank You!</h1>
        <p>${messages[responseType] || 'Your response has been recorded.'}</p>
      </div>
    </body>
    </html>
  `;
}

function generateErrorHTML(message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .error { color: #dc3545; font-size: 48px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error">✗</div>
        <h1>Error</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}

serve(serve_handler);
