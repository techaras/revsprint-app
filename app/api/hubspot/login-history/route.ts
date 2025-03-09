import { NextRequest, NextResponse } from 'next/server';
import { LoginService } from '@/lib/db-service';

export async function GET(request: NextRequest) {
  // Get the contact ID from the URL query params
  const contactId = request.nextUrl.searchParams.get('contact_id');
  
  if (!contactId) {
    return NextResponse.json({ error: 'No contact ID provided' }, { status: 400 });
  }

  try {
    // Get login history for this contact
    const loginHistory = await LoginService.getLoginHistory(parseInt(contactId));
    
    return NextResponse.json(loginHistory);
  } catch (error) {
    console.error('Login history error:', error);
    return NextResponse.json({ error: 'Failed to retrieve login history' }, { status: 500 });
  }
}