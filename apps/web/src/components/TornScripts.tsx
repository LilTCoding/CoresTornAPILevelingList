import { useState, useEffect } from "react";
import "./TornScripts.css";

interface Script {
    name: string;
    description: string;
    url: string;
    category: string;
    code: string;
}

const categories = [
    "Travel",
    "Training",
    "Banking",
    "Filtering",
    "Racing",
    "Shopping",
    "UI Enhancement",
    "Other"
];

export default function TornScripts() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [installedScripts, setInstalledScripts] = useState<string[]>([]);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [selectedScript, setSelectedScript] = useState<Script | null>(null);
    const [scripts, setScripts] = useState<Script[]>([]);

    useEffect(() => {
        // Load scripts from the repository
        const loadScripts = async () => {
            const scriptDirs = [
                "clean-travel",
                "dont-train",
                "fill-vault",
                "filter-elimination",
                "filter-faction",
                "filter-hof",
                "filter-hospital",
                "max-buy",
                "racing-filter",
                "racing-prefills",
                "racing-select-car",
                "dont-hunt"
            ];

            const loadedScripts: Script[] = [];

            for (const dir of scriptDirs) {
                try {
                    const response = await fetch(`/torn_userscripts/${dir}/${dir.replace(/-/g, '_')}.js`);
                    const code = await response.text();
                    
                    // Extract metadata from the userscript header
                    const nameMatch = code.match(/@name\s+(.+)/);
                    const descriptionMatch = code.match(/@description\s+(.+)/);
                    const downloadURLMatch = code.match(/@downloadURL\s+(.+)/);
                    
                    const name = nameMatch ? nameMatch[1].trim() : dir;
                    const description = descriptionMatch ? descriptionMatch[1].trim() : "";
                    const url = downloadURLMatch ? downloadURLMatch[1].trim() : `https://github.com/cryosis7/torn_userscripts/tree/master/${dir}`;
                    
                    // Determine category based on script name and description
                    let category = "Other";
                    if (dir.includes("travel")) category = "Travel";
                    else if (dir.includes("train")) category = "Training";
                    else if (dir.includes("vault")) category = "Banking";
                    else if (dir.includes("filter")) category = "Filtering";
                    else if (dir.includes("racing")) category = "Racing";
                    else if (dir.includes("buy")) category = "Shopping";
                    else if (dir.includes("clean")) category = "UI Enhancement";

                    loadedScripts.push({
                        name,
                        description,
                        url,
                        category,
                        code
                    });
                } catch (error) {
                    console.error(`Failed to load script from ${dir}:`, error);
                }
            }

            setScripts(loadedScripts);
        };

        loadScripts();
    }, []);

    const filteredScripts = scripts.filter(script => {
        const matchesCategory = !selectedCategory || script.category === selectedCategory;
        const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            script.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleInstall = (script: Script) => {
        setSelectedScript(script);
        setShowInstallModal(true);
    };

    const confirmInstall = () => {
        if (selectedScript) {
            // Create a blob with the script content
            const blob = new Blob([selectedScript.code], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedScript.name}.user.js`;

            // Trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);

            // Update installed scripts
            setInstalledScripts(prev => [...prev, selectedScript.name]);
            setShowInstallModal(false);
            setSelectedScript(null);
        }
    };

    return (
        <div className="torn-scripts">
            <h2>Torn City Userscripts</h2>
            
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
                    <button
                        className={!selectedCategory ? "active" : ""}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </button>
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
                    <div key={script.name} className="script-card">
                        <div className="script-header">
                            <h3>{script.name}</h3>
                            <span className="category-badge">{script.category}</span>
                        </div>
                        <p className="script-description">{script.description}</p>
                        <div className="script-actions">
                            <button
                                onClick={() => handleInstall(script)}
                                disabled={installedScripts.includes(script.name)}
                                className={installedScripts.includes(script.name) ? "installed" : ""}
                            >
                                {installedScripts.includes(script.name) ? "Installed" : "Install"}
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

            {showInstallModal && selectedScript && (
                <div className="install-modal">
                    <div className="modal-content">
                        <h3>Install {selectedScript.name}</h3>
                        <p>This will install the userscript directly to your browser. Make sure you have a userscript manager (like Tampermonkey) installed.</p>
                        <div className="modal-actions">
                            <button onClick={confirmInstall}>Install Now</button>
                            <button onClick={() => {
                                setShowInstallModal(false);
                                setSelectedScript(null);
                            }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 