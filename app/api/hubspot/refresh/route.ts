import { NextResponse } from 'next/server';
import { HubSpotAPI } from '@/lib/hubspot';
import { ConfigService } from '@/lib/db-service';

export async function GET() {
    try {
    // Get client config from environment variables
    const clientId = process.env.HUBSPOT_CLIENT_ID || '';
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET || '';
    const redirectUrl = process.env.HUBSPOT_REDIRECT_URL || 'http://localhost:3000/api/hubspot/install';

    // Get the refresh token from the database
    const refreshToken = await ConfigService.getConfig('refresh_token');
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token found' }, { status: 400 });
    }

    // Initialize HubSpot API
    const hubspotAPI = new HubSpotAPI();
    
    // Refresh the token
    const tokenResponse = await hubspotAPI.refreshToken(
      refreshToken,
      clientId,
      clientSecret,
      redirectUrl
    );

    // Check if we got the new access token
    if (tokenResponse.access_token) {
      // Save tokens to database
      await ConfigService.saveTokens(tokenResponse.access_token, tokenResponse.refresh_token);
      
      return NextResponse.json({ message: 'Token refreshed successfully' });
    } else {
      // Handle error case
      console.error('Token refresh error:', tokenResponse);
      return NextResponse.json(tokenResponse, { status: 400 });
    }
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}