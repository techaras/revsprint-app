import { NextRequest, NextResponse } from 'next/server';
import { HubSpotAPI } from '@/lib/hubspot';
import { ConfigService, HubSpotAccountService } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  try {
    // Get client config from environment variables
    const clientId = process.env.HUBSPOT_CLIENT_ID || '';
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET || '';
    const redirectUrl = process.env.HUBSPOT_REDIRECT_URL || 'http://localhost:3000/api/hubspot/install';
    
    // Check if a specific portal ID is requested
    const portalId = request.nextUrl.searchParams.get('portalId');
    
    // Get the refresh token from the database - either from a specific account or global config
    let refreshToken = '';
    let accountId: number | null = null;
    
    if (portalId) {
      // Try to find the account
      const account = await HubSpotAccountService.getAccountByPortalId(portalId);
      if (account) {
        refreshToken = account.refreshToken;
        accountId = account.id;
      }
    }
    
    // Fall back to global config if no account-specific token was found
    if (!refreshToken) {
      refreshToken = await ConfigService.getConfig('refresh_token');
    }
    
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
      if (accountId) {
        // Update tokens for the specific account
        await HubSpotAccountService.updateAccountTokens(
          accountId,
          tokenResponse.access_token,
          tokenResponse.refresh_token,
          tokenResponse.expires_in || 86400
        );
      } else {
        // Fall back to updating global config
        await ConfigService.updateConfig('access_token', tokenResponse.access_token);
        await ConfigService.updateConfig('refresh_token', tokenResponse.refresh_token);
      }
      
      return NextResponse.json({ 
        message: 'Token refreshed successfully',
        portalId: portalId || 'global'
      });
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