import React, { useState, useEffect } from "react";

interface Script {
    name: string;
    description: string;
    url: string;
    category: string;
}

const scripts: Script[] = [
    {
        name: "Clean Travel Screen",
        description: "Clears away clutter on the travel screen for a more inconspicuous look in public spaces.",
        url: "https://greasyfork.org/en/scripts/386587-clean-travel",
        category: "UI Enhancement"
    },
    {
        name: "Don't Train",
        description: "Disables training buttons in the gym to prevent accidental training when saving for chains.",
        url: "https://greasyfork.org/en/scripts/383075-don-t-train",
        category: "Gameplay"
    },
    {
        name: "Fill Vault",
        description: "Adds customizable buttons to prefill vault fields with set values.",
        url: "https://greasyfork.org/en/scripts/386032-fill-bank-vault",
        category: "Banking"
    },
    {
        name: "Filter - Faction",
        description: "Creates filters to hide people from the faction list based on status.",
        url: "https://greasyfork.org/en/scripts/375473-faction-filter",
        category: "Filtering"
    },
    {
        name: "Filter - Hall of Fame",
        description: "Creates filters for the hall of fame list based on selected category.",
        url: "https://greasyfork.org/en/scripts/375338-hall-of-fame-filter",
        category: "Filtering"
    },
    {
        name: "Filter - Hospital",
        description: "Creates filters to hide people from the hospital page based on status.",
        url: "https://greasyfork.org/en/scripts/386757-hospital-filter",
        category: "Filtering"
    },
    {
        name: "Max Buy",
        description: "Automatically fills quantity to maximum amount in shops and bazaars.",
        url: "https://greasyfork.org/en/scripts/398361-max-buy",
        category: "Shopping"
    },
    {
        name: "Racing Filter",
        description: "Filters races based on criteria like password protection and entry cost.",
        url: "https://greasyfork.org/en/scripts/389105-race-filter",
        category: "Racing"
    },
    {
        name: "Racing - Prefill Create Race",
        description: "Lets you set up templates for race creation with custom presets.",
        url: "https://greasyfork.org/en/scripts/393632-torn-custom-race-presets",
        category: "Racing"
    },
    {
        name: "Racing - Select Correct Car",
        description: "Automatically selects the appropriate car for specific race tracks.",
        url: "https://greasyfork.org/en/scripts/398078-auto-select-car",
        category: "Racing"
    }
];

const TornScripts: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [installedScripts, setInstalledScripts] = useState<string[]>([]);

    const categories = ["All", ...new Set(scripts.map(script => script.category))];

    const filteredScripts = scripts.filter(script => {
        const matchesCategory = selectedCategory === "All" || script.category === selectedCategory;
        const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            script.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleInstall = (scriptUrl: string) => {
        window.open(scriptUrl, "_blank");
        setInstalledScripts(prev => [...prev, scriptUrl]);
    };

    return (
        <div className="torn-scripts">
            <h2>Torn Userscripts</h2>
            <div className="scripts-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search scripts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="category-filter">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={selectedCategory === category ? "active" : ""}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            <div className="scripts-grid">
                {filteredScripts.map(script => (
                    <div key={script.url} className="script-card">
                        <div className="script-header">
                            <h3>{script.name}</h3>
                            <span className="category-badge">{script.category}</span>
                        </div>
                        <p className="script-description">{script.description}</p>
                        <div className="script-actions">
                            <button
                                className={installedScripts.includes(script.url) ? "installed" : ""}
                                onClick={() => handleInstall(script.url)}
                            >
                                {installedScripts.includes(script.url) ? "Installed" : "Install"}
                            </button>
                            <a
                                href={script.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view-source"
                            >
                                View Source
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TornScripts; 