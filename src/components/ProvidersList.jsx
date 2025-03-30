import { useState } from "react";
import SearchBar from "../components/SearchBar";

const ProvidersList = () => {
  const [query, setQuery] = useState("");
  
  const providers = [
    { id: 1, name: "BlaBla Services" },
    { id: 2, name: "Toto Solutions" },
    { id: 3, name: "SubTrack Inc." },
  ];

  // Filter providers based on search input
  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-screen min-h-screen px-10 py-14">
      <h1 className="text-3xl font-bold mb-6">Find a Provider</h1>
      
      {/* Search Bar */}
      <SearchBar onSearch={setQuery} />

      {/* Provider List */}
      <ul className="mt-6 space-y-3">
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <li key={provider.id} className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm">
              {provider.name}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No providers found.</p>
        )}
      </ul>
    </div>
  );
};

export default ProvidersList;
