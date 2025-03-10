import { NextRequest, NextResponse } from 'next/server';
import { HubSpotAPI } from '@/lib/hubspot';
import { HubSpotAccountService } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  // Get the code from the URL query params
  const code = request.nextUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Get client config from environment variables
    const clientId = process.env.HUBSPOT_CLIENT_ID || '';
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET || '';
    const redirectUrl = process.env.HUBSPOT_REDIRECT_URL || 'http://localhost:3000/api/hubspot/install';

    // Initialize HubSpot API
    const hubspotAPI = new HubSpotAPI();
    
    // Exchange code for tokens
    const tokenResponse = await hubspotAPI.requestTokenUsingCode(
      code,
      clientId,
      clientSecret,
      redirectUrl
    );

    // Check if we got the access token
    if (tokenResponse.access_token) {
      // Create HubSpot API instance with the new token
      const hubspotAPIWithToken = new HubSpotAPI(tokenResponse.access_token);
      
      // Get HubSpot account info
      const accountInfo = await hubspotAPIWithToken.getAccountInfo();
      
      if (!accountInfo.portalId) {
        console.error('Failed to get portal ID from HubSpot:', accountInfo);
        return NextResponse.json({ error: 'Could not retrieve HubSpot account information' }, { status: 500 });
      }
      
      // Save the account with portal ID
      await HubSpotAccountService.saveAccount(
        accountInfo.portalId.toString(),
        accountInfo.portalName || null,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        tokenResponse.expires_in || 86400 // Default to 24 hours if not provided
      );
      
      // Redirect to success page
      return NextResponse.redirect(new URL('/hubspot/install-success', request.url));
    } else {
      // Handle error case
      console.error('Token response error:', tokenResponse);
      return NextResponse.json(tokenResponse, { status: 400 });
    }
  } catch (error) {
    console.error('Install error:', error);
    return NextResponse.json({ error: 'Installation failed' }, { status: 500 });
  }
}