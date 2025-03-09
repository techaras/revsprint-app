export default function InstallSuccessPage() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Installation Successful!</h1>
          <p className="text-gray-600 mb-6">
            RevSprint has been successfully installed to your HubSpot account.
          </p>
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">What&apos;s Next?</h2>
            <p className="text-gray-600 mb-4">
              You&apos;ll now be able to see login activity for your contacts directly in HubSpot.
            </p>
            <p className="text-sm text-gray-500">
              You can close this window and return to HubSpot.
            </p>
          </div>
        </div>
      </div>
    );
  }
