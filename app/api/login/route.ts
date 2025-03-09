import { NextRequest, NextResponse } from 'next/server';
import { HubSpotAPI } from '@/lib/hubspot';
import { ConfigService, LoginService } from '@/lib/db-service';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Get access token from database
    const accessToken = await ConfigService.getConfig('access_token');
    
    if (!accessToken) {
      return NextResponse.json({ message: 'Application not authorized with HubSpot' }, { status: 401 });
    }

    // Initialize HubSpot API with access token
    const hubspotAPI = new HubSpotAPI(accessToken);
    
    // Look for user by email in HubSpot
    const contactResults = await hubspotAPI.getContactByEmail(email);
    
    // Check if we found a contact
    if (contactResults.status === 'error' || !contactResults.vid) {
      return NextResponse.json({ 
        message: contactResults.message || 'No contact found with that email' 
      }, { status: 404 });
    }

    // Verify credentials
    const isSuccess = await LoginService.verifyCredentials(email, password);
    
    // Record login attempt
    await LoginService.recordLoginAttempt(
        contactResults.vid,
        request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1',
        isSuccess
      );

    if (isSuccess) {
      return NextResponse.json({ 
        message: 'Login successful',
        contactId: contactResults.vid 
      });
    } else {
      return NextResponse.json({ 
        message: 'Invalid credentials' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}