import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { toast } from "sonner";

const SUPER_ADMIN_ID = 3544082;
const SUPER_ADMIN_KEY = "ogcHDmImSiJGc2rZ";

function getAdminKeys() {
  const keys = localStorage.getItem("adminApiKeys");
  return keys ? JSON.parse(keys) : [];
}
function setAdminKeys(keys: string[]) {
  localStorage.setItem("adminApiKeys", JSON.stringify(keys));
}

export default function AdminPanel() {
  const { apiKey } = useStore();
  const [adminKeys, setAdminKeysState] = useState<string[]>(getAdminKeys());
  const [newKey, setNewKey] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAdminKeysState(getAdminKeys());
  }, []);

  useEffect(() => {
    async function fetchUserId() {
      if (!apiKey) return;
      setLoading(true);
      try {
        const res = await fetch(`https://api.torn.com/user/?selections=basic&key=${apiKey}`);
        const data = await res.json();
        if (data.error) {
          setUserId(null);
        } else {
          setUserId(data.player_id || data.user_id || null);
        }
      } catch {
        setUserId(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUserId();
  }, [apiKey]);

  const isSuperAdmin = userId === SUPER_ADMIN_ID && apiKey === SUPER_ADMIN_KEY;
  const isAdmin = isSuperAdmin || adminKeys.includes(apiKey);

  const handleAddKey = () => {
    if (!newKey) return;
    if (adminKeys.includes(newKey)) {
      toast.error("Key already added");
      return;
    }
    const updated = [...adminKeys, newKey];
    setAdminKeys(updated);
    setAdminKeysState(updated);
    setNewKey("");
    toast.success("Admin API key added");
  };

  const handleRemoveKey = (key: string) => {
    const updated = adminKeys.filter(k => k !== key);
    setAdminKeys(updated);
    setAdminKeysState(updated);
    toast.success("Admin API key removed");
  };

  if (loading) {
    return <div className="admin-panel"><h2>Admin Panel</h2><div>Loading...</div></div>;
  }

  if (!isAdmin) {
    return <div className="admin-panel"><h2>Admin Panel</h2><div>You do not have admin access.</div></div>;
  }

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <div className="owner-info">
        <strong>Owner:</strong> LilTorey [3544082]
      </div>
      {isSuperAdmin && (
        <div className="admin-key-manager">
          <h3>Admin API Key Management</h3>
          <input
            type="text"
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            placeholder="Add new admin API key"
          />
          <button onClick={handleAddKey}>Add Admin Key</button>
          <ul>
            {adminKeys.map(key => (
              <li key={key}>
                <span>{key}</span>
                <button onClick={() => handleRemoveKey(key)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="admin-actions">
        <h3>Admin Actions</h3>
        <button onClick={() => window.location.reload()}>Force Refresh All</button>
        {/* Add more admin actions here */}
      </div>
      {/* Placeholder for Torn 200+ features */}
      <div className="torn-200plus">
        <h3>Torn 200+ Features (Coming Soon)</h3>
        <p>Advanced tools and analytics for admins.</p>
      </div>
    </div>
  );
} 