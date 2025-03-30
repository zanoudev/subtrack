const Settings = () => {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
  
        {/* Account Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Account</h2>
          <div className="bg-white p-4 shadow-md rounded-md">Account settings go here...</div>
        </section>
  
        {/* Personal Information Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
          <div className="bg-white p-4 shadow-md rounded-md">Personal details go here...</div>
        </section>
  
        {/* Billing Information Section */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Billing Information</h2>
          <div className="bg-white p-4 shadow-md rounded-md">Billing info goes here...</div>
        </section>
      </div>
    );
  };
  
  export default Settings;
  