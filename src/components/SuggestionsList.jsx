import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import CategoryChip from "./CategoryChip";

const SuggestionsList = ({ providers, preferences = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!providers || providers.length === 0) return null;

  // collect all unique categories
  const categories = useMemo(() => {
    const allCats = providers.map((p) => p.category || "Uncategorized");
    const unique = Array.from(new Set(allCats));
    return ["All", "For me", ...unique];
  }, [providers]);

  // filter providers by selected chip
  const filteredProviders = useMemo(() => {
    if (selectedCategory === "All") return providers;

    if (selectedCategory === "For me") {
      return providers.filter((p) =>
        preferences.includes(p.category || "Uncategorized")
      );
    }

    return providers.filter(
      (p) => (p.category || "Uncategorized") === selectedCategory
    );
  }, [providers, selectedCategory, preferences]);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Suggested Services</h2>

      {/* chips row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <CategoryChip
            key={cat}
            category={cat}
            isSelected={cat === selectedCategory}
            onClick={setSelectedCategory}
          />
        ))}
      </div>

      {/* results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
          >
            {provider.coverImageUrl && (
              <img
                src={provider.coverImageUrl}
                alt={`${provider.businessName} cover`}
                className="w-full h-36 object-cover rounded-md mb-3"
              />
            )}
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              {provider.businessName}
            </h4>
            <p className="text-sm text-gray-500 mb-3">{provider.bio}</p>
            <Link
              to={`/provider-page/${provider.id}`}
              className="text-blue-500 hover:underline text-sm"
            >
              View Full Profile
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SuggestionsList;
