"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';

interface LoginHistory {
  id: number;
  contactId: number;
  ip: string;
  insertDate: string;
  success: boolean;
}

// Create a loading component
function LoadingState() {
  return <div className="p-4">Loading...</div>;
}

// Create the inner component that uses useSearchParams
function CrmCardContent() {
  const searchParams = useSearchParams();
  const contactId = searchParams.get('contact_id');
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoginHistory = async () => {
      if (!contactId) {
        setError('No contact ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/hubspot/login-history?contact_id=${contactId}`);
        setLoginHistory(response.data);
      } catch (err) {
        setError('Failed to load login history');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoginHistory();
  }, [contactId]);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Login History for Contact #{contactId}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Success</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loginHistory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No login history found</TableCell>
              </TableRow>
            ) : (
              loginHistory.map((login) => (
                <TableRow key={login.id}>
                  <TableCell>{login.ip}</TableCell>
                  <TableCell>{new Date(login.insertDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</TableCell>
                  <TableCell>{login.success ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Main component with Suspense boundary
export default function CrmCardPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CrmCardContent />
    </Suspense>
  );
}