
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const smsapiToken = Deno.env.get('SMSAPI_TOKEN')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CampaignMessage {
  id: string;
  campaign_id: string;
  booking_id: string;
  customer_id: string;
  profile_id: string;
  message_content: string;
  communication_method: 'sms' | 'viber';
  status: string;
  response_token: string;
  expires_at: string;
}

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing campaign messages...');

    // Get all active campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select(`
        *,
        profiles:profile_id (
          business_name,
          sms_provider_config,
          viber_config
        )
      `)
      .eq('is_active', true);

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      throw campaignsError;
    }

    console.log(`Found ${campaigns?.length || 0} active campaigns`);

    for (const campaign of campaigns || []) {
      await processCampaign(campaign);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Campaign messages processed' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error processing campaign messages:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function processCampaign(campaign: any) {
  console.log(`Processing campaign: ${campaign.name} (${campaign.trigger_type})`);

  let bookingsQuery = supabase
    .from('bookings')
    .select(`
      *,
      customers:customer_id (*),
      services:service_id (*),
      staff_members:staff_id (*)
    `)
    .eq('profile_id', campaign.profile_id)
    .eq('status', 'scheduled');

  // Apply trigger-specific filters
  const now = new Date();
  const triggerConfig = campaign.trigger_config;

  switch (campaign.trigger_type) {
    case 'specific_datetime':
      const targetDateTime = new Date(triggerConfig.datetime);
      const timeDiff = Math.abs(targetDateTime.getTime() - now.getTime());
      // Send if within 5 minutes of target time
      if (timeDiff > 5 * 60 * 1000) return;
      break;

    case 'before_booking':
      const daysBefore = triggerConfig.days || 1;
      const beforeDate = new Date();
      beforeDate.setDate(beforeDate.getDate() + daysBefore);
      
      // Send to bookings that are exactly X days away
      const startOfDay = new Date(beforeDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(beforeDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      bookingsQuery = bookingsQuery
        .gte('booking_time', startOfDay.toISOString())
        .lte('booking_time', endOfDay.toISOString());
      break;

    case 'after_booking':
      const daysAfter = triggerConfig.days || 21;
      const afterDate = new Date();
      afterDate.setDate(afterDate.getDate() - daysAfter);
      
      // Send to customers whose last booking was exactly X days ago
      bookingsQuery = bookingsQuery
        .eq('status', 'completed')
        .gte('booking_time', new Date(afterDate.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .lte('booking_time', afterDate.toISOString());
      break;

    default:
      console.log(`Unsupported trigger type: ${campaign.trigger_type}`);
      return;
  }

  const { data: bookings, error: bookingsError } = await bookingsQuery;

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
    return;
  }

  console.log(`Found ${bookings?.length || 0} bookings for campaign ${campaign.name}`);

  for (const booking of bookings || []) {
    await createCampaignMessage(campaign, booking);
  }
}

async function createCampaignMessage(campaign: any, booking: any) {
  // Check if message already sent for this booking/campaign combination
  const { data: existingMessage } = await supabase
    .from('campaign_messages')
    .select('id')
    .eq('campaign_id', campaign.id)
    .eq('booking_id', booking.id)
    .single();

  if (existingMessage) {
    console.log(`Message already sent for booking ${booking.id} and campaign ${campaign.id}`);
    return;
  }

  // Validate customer phone number for SMS campaigns
  if (campaign.communication_method === 'sms' && !isValidPhoneNumber(booking.customers?.phone)) {
    console.log(`Invalid phone number for customer ${booking.customer_id}: ${booking.customers?.phone}`);
    return;
  }

  // Generate personalized message content
  const messageContent = personalizeMessage(campaign.message, booking, campaign.profiles);

  // Create campaign message record
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Messages expire in 7 days

  const { data: campaignMessage, error: messageError } = await supabase
    .from('campaign_messages')
    .insert({
      campaign_id: campaign.id,
      booking_id: booking.id,
      customer_id: booking.customer_id,
      profile_id: campaign.profile_id,
      message_content: messageContent,
      communication_method: campaign.communication_method,
      response_token: generateResponseToken(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (messageError) {
    console.error('Error creating campaign message:', messageError);
    return;
  }

  console.log(`Created campaign message ${campaignMessage.id} for booking ${booking.id}`);

  // Send the message
  await sendMessage(campaignMessage, campaign.profiles, booking);
}

function personalizeMessage(template: string, booking: any, profile: any): string {
  const bookingTime = new Date(booking.booking_time);
  const formattedTime = bookingTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return template
    .replace(/{customer_name}/g, booking.customers?.full_name || 'Valued Customer')
    .replace(/{service_name}/g, booking.services?.name || 'Your Service')
    .replace(/{booking_time}/g, formattedTime)
    .replace(/{business_name}/g, profile?.business_name || 'Our Business')
    .replace(/{staff_name}/g, booking.staff_members?.full_name || 'Our Team');
}

function isValidPhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid international number (7-15 digits)
  return cleaned.length >= 7 && cleaned.length <= 15;
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If number doesn't start with country code, assume it's Greek (+30)
  if (!cleaned.startsWith('30') && cleaned.length === 10) {
    cleaned = '30' + cleaned;
  }
  
  return cleaned;
}

async function sendMessage(campaignMessage: CampaignMessage, profile: any, booking: any) {
  console.log(`Sending ${campaignMessage.communication_method} message for campaign message ${campaignMessage.id}`);

  if (campaignMessage.communication_method === 'sms') {
    await sendSMSMessage(campaignMessage, profile, booking);
  } else if (campaignMessage.communication_method === 'viber') {
    await sendViberMessage(campaignMessage, profile, booking);
  }
}

async function sendSMSMessage(campaignMessage: CampaignMessage, profile: any, booking: any) {
  try {
    if (!smsapiToken) {
      throw new Error('SMSAPI token not configured');
    }

    const smsConfig = profile?.sms_provider_config || {};
    const senderName = smsConfig.sender_name || profile?.business_name || 'Business';
    const customerPhone = booking.customers?.phone;

    if (!customerPhone) {
      throw new Error('Customer phone number not available');
    }

    const formattedPhone = formatPhoneNumber(customerPhone);
    
    // Create response URL
    const responseUrl = `${supabaseUrl.replace('/rest/v1', '')}/functions/v1/handle-campaign-response?token=${campaignMessage.response_token}`;
    
    // Add response options to message
    const fullMessage = `${campaignMessage.message_content}\n\nRespond: ${responseUrl}`;

    const smsData = {
      to: formattedPhone,
      message: fullMessage,
      from: senderName.substring(0, 11), // SMSAPI sender name limit
      format: 'json'
    };

    console.log(`Sending SMS to ${formattedPhone} from ${senderName}`);
    console.log(`Message: ${fullMessage.substring(0, 50)}...`);

    const response = await fetch('https://api.smsapi.com/sms.do', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${smsapiToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(smsData).toString(),
    });

    const responseData = await response.json();

    if (response.ok && responseData.count > 0) {
      // Update message status to sent
      await supabase
        .from('campaign_messages')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', campaignMessage.id);

      console.log(`SMS sent successfully for campaign message ${campaignMessage.id}`);
      console.log(`SMSAPI Response:`, responseData);
    } else {
      throw new Error(`SMSAPI Error: ${responseData.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    
    // Update message status to failed
    await supabase
      .from('campaign_messages')
      .update({ 
        status: 'failed',
        sent_at: new Date().toISOString()
      })
      .eq('id', campaignMessage.id);
  }
}

async function sendViberMessage(campaignMessage: CampaignMessage, profile: any, booking: any) {
  console.log(`Viber integration not yet implemented for campaign message ${campaignMessage.id}`);
  
  // Update message status to sent (placeholder)
  await supabase
    .from('campaign_messages')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString()
    })
    .eq('id', campaignMessage.id);
}

function generateResponseToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(serve_handler);
