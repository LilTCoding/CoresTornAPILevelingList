import { useState, useEffect, useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';

interface Command {
  name: string;
  description: string;
  execute: (args: string[], apiKey: string) => Promise<string>;
}

const commands: Command[] = [
  {
    name: 'profile',
    description: 'Fetch Torn profile data',
    execute: async (args: string[], apiKey: string) => {
      try {
        const playerId = args[0] || '';
        const response = await fetch(`/api/torn-proxy?selection=profile&playerId=${playerId}`, {
          headers: { 'X-API-Key': apiKey },
        });
        const data = await response.json();
        if (data.error) return `Error: ${data.error}`;
        return `Profile: ${data.name} [${data.player_id}]
Level: ${data.level}
Rank: ${data.rank}
Status: ${data.status?.description || ''}`;
      } catch (err) {
        return 'Error fetching profile data';
      }
    },
  },
  {
    name: 'stats',
    description: 'Show player stats',
    execute: async (args: string[], apiKey: string) => {
      try {
        const playerId = args[0] || '';
        const response = await fetch(`/api/torn-proxy?selection=personalstats&playerId=${playerId}`, {
          headers: { 'X-API-Key': apiKey },
        });
        const data = await response.json();
        if (data.error) return `Error: ${data.error}`;
        return `Stats for ${data.name}:
Strength: ${data.strength}
Speed: ${data.speed}
Defense: ${data.defense}`;
      } catch (err) {
        return 'Error fetching stats';
      }
    },
  },
  {
    name: 'attack',
    description: 'Simulate an attack (not API-supported)',
    execute: async (args: string[]) => {
      const target = args[0] || 'unknown';
      return `Simulating attack on ${target}... [Outcome: Success (mock)]`;
    },
  },
  {
    name: 'sendmoney',
    description: 'Send money to a user: sendmoney <userID> <amount>',
    execute: async (args: string[], apiKey: string) => {
      const [userId, amount] = args;
      if (!userId || !amount || isNaN(Number(userId)) || isNaN(Number(amount))) {
        return 'Usage: sendmoney <userID> <amount>';
      }
      try {
        // Torn API endpoint for sending money
        const response = await fetch(`https://api.torn.com/transaction/send/?toID=${userId}&amount=${amount}&key=${apiKey}`);
        const data = await response.json();
        if (data.error) return `Error: ${data.error.error} - ${data.error.error_description || data.error.error}`;
        if (data.transaction_id) {
          return `Success! Sent $${Number(amount).toLocaleString()} to user ID ${userId}. Transaction ID: ${data.transaction_id}`;
        }
        return JSON.stringify(data, null, 2);
      } catch (err) {
        return 'Error sending money.';
      }
    },
  },
  ...Array.from({ length: 647 }, (_, i) => ({
    name: `cmd${i + 3}`,
    description: `Custom command ${i + 3}`,
    execute: async (args: string[]) => `Executing cmd${i + 3} with args: ${args.join(', ')}`,
  })),
];

export const Route = createFileRoute('/command-prompt')({
  component: CommandPrompt,
});

function CommandPrompt() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(!apiKey);
  const [tempKey, setTempKey] = useState('');

  const getSuggestions = (value: string) => {
    return commands
      .filter((cmd) => cmd.name.startsWith(value.toLowerCase()))
      .map((cmd) => cmd.name);
  };

  const handleCommand = async (cmdInput: string) => {
    if (!cmdInput.trim()) return;
    setHistory((prev) => [...prev, cmdInput]);
    setHistoryIndex(-1);
    const [cmdName, ...args] = cmdInput.trim().split(' ');
    const command = commands.find((c) => c.name.toLowerCase() === cmdName.toLowerCase());
    if (command) {
      const result = await command.execute(args, apiKey);
      setOutput((prev) => [...prev, `> ${cmdInput}`, result]);
    } else {
      setOutput((prev) => [...prev, `> ${cmdInput}`, `Command '${cmdName}' not found`]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      if (historyIndex < history.length - 1) {
        setHistoryIndex((prev) => prev + 1);
        setInput(history[history.length - 1 - (historyIndex + 1)]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > -1) {
        setHistoryIndex((prev) => prev - 1);
        setInput(historyIndex === 0 ? '' : history[history.length - 1 - (historyIndex - 1)]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const suggestions = getSuggestions(input);
      if (suggestions.length === 1) {
        setInput(suggestions[0]);
      }
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleApiKeySave = () => {
    setApiKey(tempKey);
    localStorage.setItem('apiKey', tempKey);
    setShowApiKeyPrompt(false);
  };

  // Spam Send $1 logic
  const handleSpamSend = async () => {
    const userId = prompt('Enter the user ID to spam with $1:');
    if (!userId || isNaN(Number(userId))) {
      setOutput(prev => [...prev, '> Spam Send', 'Invalid user ID.']);
      return;
    }
    let totalAmountStr = prompt('Enter the total amount to send (in dollars):');
    const totalAmount = totalAmountStr && !isNaN(Number(totalAmountStr)) ? Number(totalAmountStr) : 0;
    if (totalAmount <= 0) {
      setOutput(prev => [...prev, '> Spam Send', 'Invalid amount.']);
      return;
    }
    setOutput(prev => [...prev, `> Spam Send $1 to ${userId} until $${totalAmount} is sent`]);
    let sent = 0;
    for (let i = 1; i <= totalAmount; i++) {
      try {
        const response = await fetch(`https://api.torn.com/transaction/send/?toID=${userId}&amount=1&key=${apiKey}`);
        const data = await response.json();
        if (data.error) {
          if (data.error.error && data.error.error.toLowerCase().includes('access level')) {
            setOutput(prev => [...prev, `Send #${i}: Error: Your API key does not have the required 'transactions' permission. Please generate a new key with this permission enabled.`]);
          } else {
            setOutput(prev => [...prev, `Send #${i}: Error: ${data.error.error}`]);
          }
          break;
        }
        sent++;
        if (i % 10 === 0 || i === totalAmount) {
          setOutput(prev => [...prev, `Sent $${sent} so far...`]);
        }
      } catch (err) {
        setOutput(prev => [...prev, `Send #${i}: Network error`]);
        break;
      }
      // To avoid rate limits, pause every 10 sends
      if (i % 10 === 0) await new Promise(res => setTimeout(res, 1000));
    }
    setOutput(prev => [...prev, `Spam Send complete. Total sent: $${sent}`]);
  };

  if (showApiKeyPrompt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-green-400 font-mono">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="mb-4 text-xl font-bold text-purple-400" style={{ fontFamily: 'Pacifico, cursive' }}>
            Enter your Torn API Key
          </div>
          <input
            type="text"
            value={tempKey}
            onChange={(e) => setTempKey(e.target.value)}
            className="w-full bg-gray-700 text-green-400 border-none outline-none p-2 mb-4 rounded"
            placeholder="API Key"
          />
          <button
            onClick={handleApiKeySave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
          >
            Save API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono flex flex-col">
      <div className="flex-1 p-4 overflow-auto">
        <div className="text-center text-3xl mb-4 text-purple-400 animate-pulse" style={{ fontFamily: 'Pacifico, cursive' }}>
          Torn Command Prompt v1.0
        </div>
        {output.map((line, i) => (
          <div key={i} className="mb-1">{line}</div>
        ))}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleSpamSend}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-bold shadow"
          >
            Spam Send $1
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-green-400">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-gray-800 text-green-400 border-none outline-none p-2 rounded"
          placeholder="Enter command (e.g., profile 123456)"
        />
      </div>
    </div>
  );
} 