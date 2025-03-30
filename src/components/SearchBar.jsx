import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { fetchAllProviders } from "../firebase/firestoreProviders"
import { Link } from "react-router-dom";


const SearchBar = ({ onSearch, onSearchResultSelect }) => {
  const [query, setQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const [providers, setProviders] = useState([]);

  // Fetch providers from Firestore when component mounts
  useEffect(() => {
    const getProviders = async () => {
      try {
        const allProviders = await fetchAllProviders();
        setProviders(allProviders);
      } catch (error) {
        console.error("Error fetching providers: ", error);
      }
    };

    getProviders();
  }, []);

  // Filter providers using the businessName property
  const filteredProviders = providers.filter((p) =>
    p.businessName.toLowerCase().includes(query.toLowerCase())
  );

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
    setShowAutocomplete(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowAutocomplete(false);
  };

  const handleProviderClick = (provider) => {
    setQuery(provider.businessName);
    setShowAutocomplete(false);
    onSearchResultSelect(provider);
  };

  return (
    <div className="w-full max-w-md flex flex-col relative">
      <form
        className="w-full flex items-center border border-lightgray rounded-lg overflow-hidden shadow-sm"
        onSubmit={handleSearchSubmit}
      >
        <input
          type="text"
          className="w-full p-3 text-black focus:outline-none"
          placeholder="Search for a business..."
          value={query}
          onChange={handleChange}
        />
        <button type="submit" className="p-3 bg-white hover:bg-lightgray transition">
          <FaSearch className="text-primary" />
        </button>
      </form>

      {showAutocomplete && query && filteredProviders.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 z-10">
          {filteredProviders.map((provider) => (
            <Link
              key={provider.id}
              to={`/provider-page/${provider.id}`}
              className="block cursor-pointer hover:bg-gray-100 p-2"
            >
              <p className="text-black">{provider.businessName}</p>
              <p className="text-sm text-gray-500">{provider.category}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
