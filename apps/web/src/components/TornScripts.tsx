import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { executeScript } from "@/api/scripts";
import "./TornScripts.css";

interface Script {
    name: string;
    description: string;
    url: string;
    category: string;
    code: string;
    isRunning?: boolean;
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

const scriptDirs = [
    "attack-link-in-stats",
    "autofill-item-send",
    "clean-travel",
    "dont-hunt",
    "dont-train",
    "fill-vault",
    "filter-elimination",
    "filter-faction",
    "filter-hof",
    "filter-hospital",
    "filter-overseas",
    "gym-tab-hider",
    "massive-chain-timer",
    "max-buy",
    "poker-username-links",
    "racing-filter",
    "racing-prefills",
    "warning_on_join_attack",
    "racing-select-car"
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
    const [partialWarning, setPartialWarning] = useState<string | null>(null);
    const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set());
    const [loadingProgress, setLoadingProgress] = useState(0);

    const loadScripts = async () => {
        setLoading(true);
        setError(null);
        setPartialWarning(null);
        setLoadingProgress(0);
        const loadedScripts: Script[] = [];
        let failedCount = 0;
        const totalScripts = scriptDirs.length;

        for (let i = 0; i < scriptDirs.length; i++) {
            const dir = scriptDirs[i];
            try {
                // Determine the correct script filename
                let scriptFile;
                if (dir.includes('_')) {
                    scriptFile = `${dir}.user.js`;
                } else if (dir === 'filter-faction') {
                    scriptFile = 'Faction_Filter.js';
                } else {
                    scriptFile = `${dir.replace(/-/g, '_')}.js`;
                }

                const response = await fetch(`/torntoolsbycore/${dir}/${scriptFile}`);
                if (!response.ok) {
                    throw new Error(`Failed to load script from ${dir}: ${response.statusText}`);
                }

                const code = await response.text();
                const nameMatch = code.match(/@name\s+(.+)/);
                const descriptionMatch = code.match(/@description\s+(.+)/);
                const downloadURLMatch = code.match(/@downloadURL\s+(.+)/);

                const name = nameMatch ? nameMatch[1].trim() : dir;
                const description = descriptionMatch ? descriptionMatch[1].trim() : "";
                const url = downloadURLMatch ? downloadURLMatch[1].trim() : `https://github.com/cryosis7/torn_userscripts/tree/master/${dir}`;

                // Determine category based on script name and description
                let category = "Other";
                const lowerName = name.toLowerCase();
                const lowerDesc = description.toLowerCase();

                if (lowerName.includes("travel") || lowerDesc.includes("travel")) category = "Travel";
                else if (lowerName.includes("train") || lowerDesc.includes("train")) category = "Training";
                else if (lowerName.includes("vault") || lowerDesc.includes("vault")) category = "Banking";
                else if (lowerName.includes("filter") || lowerDesc.includes("filter")) category = "Filtering";
                else if (lowerName.includes("racing") || lowerDesc.includes("racing")) category = "Racing";
                else if (lowerName.includes("buy") || lowerDesc.includes("buy")) category = "Shopping";
                else if (lowerName.includes("clean") || lowerDesc.includes("clean")) category = "UI Enhancement";

                loadedScripts.push({ name, description, url, category, code });
                setLoadingProgress(((i + 1) / totalScripts) * 100);
            } catch (error) {
                console.error(`Failed to load script from ${dir}:`, error);
                failedCount++;
                setLoadingProgress(((i + 1) / totalScripts) * 100);
            }
        }

        // Sort scripts by name
        loadedScripts.sort((a, b) => a.name.localeCompare(b.name));
        setScripts(loadedScripts);
        setLoading(false);

        if (failedCount === totalScripts) {
            setError("Failed to load all scripts. Please try again later.");
        } else if (failedCount > 0) {
            setPartialWarning(`Failed to load ${failedCount} script(s). Some scripts may be missing.`);
        }
    };

    useEffect(() => {
        loadScripts();
    }, []);

    const handleStart = async (script: Script) => {
        try {
            setRunningScripts(prev => new Set([...prev, script.name]));
            const result = await executeScript(script.name);
            
            if (result.success) {
                toast.success(`Script ${script.name} started successfully`);
                if (result.output) {
                    toast.info(result.output);
                }
            } else {
                toast.error(result.message || 'Failed to start script');
                setRunningScripts(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(script.name);
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Error starting script:', error);
            toast.error('Failed to start script');
            setRunningScripts(prev => {
                const newSet = new Set(prev);
                newSet.delete(script.name);
                return newSet;
            });
        }
    };

    const handleStop = async (script: Script) => {
        try {
            setRunningScripts(prev => {
                const newSet = new Set(prev);
                newSet.delete(script.name);
                return newSet;
            });
            toast.success(`Script ${script.name} stopped`);
        } catch (error) {
            console.error('Error stopping script:', error);
            toast.error('Failed to stop script');
        }
    };

    const filteredScripts = scripts.filter(script => {
        const matchesCategory = !selectedCategory || script.category === selectedCategory;
        const matchesSearch = script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            script.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <div className="torn-scripts">
                <div className="loading">
                    <div>Loading scripts...</div>
                    <div className="loading-progress">
                        <div 
                            className="loading-progress-bar" 
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                    <div>{Math.round(loadingProgress)}%</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="torn-scripts">
                <div className="error">{error}</div>
                <button onClick={loadScripts} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="torn-scripts">
            <h2>Torn City Userscripts</h2>
            {partialWarning && <div className="warning">{partialWarning}</div>}
            
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
                                    onClick={() => handleStart(script)}
                                    disabled={runningScripts.has(script.name)}
                                    variant="default"
                                    className="start-btn"
                                >
                                    {runningScripts.has(script.name) ? "Running..." : "Start"}
                                </Button>
                                <Button
                                    onClick={() => handleStop(script)}
                                    disabled={!runningScripts.has(script.name)}
                                    variant="destructive"
                                    className="stop-btn"
                                >
                                    Stop
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
        </div>
    );
} 