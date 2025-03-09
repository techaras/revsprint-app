import { NextRequest, NextResponse } from 'next/server';
// import { HubSpotAPI } from '@/lib/hubspot';
import { LoginService } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  // Get the object ID from the URL query params
  const objectId = request.nextUrl.searchParams.get('hs_object_id');
  
  if (!objectId) {
    return NextResponse.json({ error: 'No object ID provided' }, { status: 400 });
  }

  try {
    // Get client config
    // const clientSecret = process.env.HUBSPOT_CLIENT_SECRET || '';
    
    // Initialize HubSpot API
    // const hubspotAPI = new HubSpotAPI();
    
    // Optional: Validate the request is coming from HubSpot
    // This is a simplified implementation - in production, you would implement proper validation
    // const isValidRequest = hubspotAPI.validateCRMCardRequest(clientSecret, request);
    // if (!isValidRequest) {
    //   return NextResponse.json({ error: 'Unauthorized request' }, { status: 401 });
    // }

    // Get login statistics for this contact
    const contactId = parseInt(objectId);
    const loginStats = await LoginService.getLoginStats(contactId);

    // Format the response for HubSpot CRM card
    const response = {
      results: [
        {
          objectId: contactId,
          title: "RevSprint - Contact Login Summary",
          created: new Date().toISOString().split('T')[0],
          description: "Login Success",
          properties: [
            {
              label: "Successful Login Percentage",
              dataType: "STRING",
              value: `${loginStats.successPercentage.toFixed(1)}%`,
            },
            {
              label: "Total IPs",
              dataType: "STRING",
              value: `${loginStats.totalIps}`,
            }
          ],
          actions: [
            {
              type: "IFRAME",
              width: 890,
              height: 748,
              uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/hubspot/crm-card?contact_id=${contactId}`,
              label: "Login History"
            }
          ]
        }
      ]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('CRM card error:', error);
    return NextResponse.json({ error: 'Failed to generate CRM card data' }, { status: 500 });
  }
}