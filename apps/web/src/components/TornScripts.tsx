import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Load scripts from the repository
        const loadScripts = async () => {
            setLoading(true);
            setError(null);

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
                    
                    if (!response.ok) {
                        throw new Error(`Failed to load script from ${dir}: ${response.statusText}`);
                    }

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
                    setError(`Failed to load some scripts. Please try again later.`);
                }
            }

            setScripts(loadedScripts);
            setLoading(false);
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
            try {
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
                toast.success(`${selectedScript.name} installed successfully`);
            } catch (error) {
                console.error('Error installing script:', error);
                toast.error('Failed to install script');
            }
        }
    };

    if (loading) {
        return (
            <div className="torn-scripts">
                <div className="loading">Loading scripts...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="torn-scripts">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="torn-scripts">
            <h2>Torn City Userscripts</h2>
            
            <div className="scripts-controls">
                <div className="search-box">
                    <Input
                        type="text"
                        placeholder="Search scripts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="category-filter">
                    <Button
                        variant={!selectedCategory ? "default" : "outline"}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </Button>
                    {categories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="scripts-grid">
                {filteredScripts.map(script => (
                    <Card key={script.name} className="script-card">
                        <CardHeader>
                            <CardTitle>{script.name}</CardTitle>
                            <span className="category-badge">{script.category}</span>
                        </CardHeader>
                        <CardContent>
                            <p className="script-description">{script.description}</p>
                            <div className="script-actions">
                                <Button
                                    onClick={() => handleInstall(script)}
                                    disabled={installedScripts.includes(script.name)}
                                    variant={installedScripts.includes(script.name) ? "secondary" : "default"}
                                >
                                    {installedScripts.includes(script.name) ? "Installed" : "Install"}
                                </Button>
                                <Button
                                    variant="outline"
                                    asChild
                                >
                                    <a
                                        href={script.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="view-source"
                                    >
                                        View Source
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {showInstallModal && selectedScript && (
                <div className="install-modal">
                    <div className="modal-content">
                        <h3>Install {selectedScript.name}</h3>
                        <p>This will install the userscript directly to your browser. Make sure you have a userscript manager (like Tampermonkey) installed.</p>
                        <div className="modal-actions">
                            <Button onClick={confirmInstall}>Install Now</Button>
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setShowInstallModal(false);
                                    setSelectedScript(null);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 