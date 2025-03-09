export default function InstallPage() {
    const installUrl = "https://app.hubspot.com/oauth/authorize?client_id=b914ff0c-4e60-4ec6-acf6-6ba60777fcba&redirect_uri=http://localhost:3000/api/hubspot/install&scope=crm.objects.contacts.write%20oauth%20crm.objects.contacts.read";
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-6 max-w-2xl p-8">
          <h1 className="text-3xl font-bold">RevSprint for HubSpot</h1>
          <p className="text-gray-600">Track user login activity and display insights directly in your HubSpot contact records</p>
          <a 
            href={installUrl} 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Install in HubSpot
          </a>
        </div>
      </div>
    );
  }
  