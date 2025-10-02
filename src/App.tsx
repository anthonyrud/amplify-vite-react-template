import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [EmailForwards, setTodos] = useState<Array<Schema["EmailForwards"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  // Add state for new source and destination
  const [newSource, setNewSource] = useState("");
  //const [newDestination, setNewDestination] = useState("");

  useEffect(() => {
    client.models.EmailForwards.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function deleteForward(id: string) {
    if (window.confirm("Are you sure you want to delete this destination?")) {
      client.models.EmailForwards.delete({ id });
    }
  }

  // Add this function to delete all forwards for a source
  function deleteGroup(source: string) {
    if (window.confirm(`Are you sure you want to delete all destinations for "${source}"?`)) {
      const toDelete = EmailForwards.filter(item => item.source === source);
      toDelete.forEach(item => {
        if (item.id) {
          client.models.EmailForwards.delete({ id: item.id });
        }
      });
    }
  }

  // Handler for new source/destination form
  function handleNewSourceSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newSource) return;
    client.models.EmailForwards.create({
      source: newSource,
      destination: "DEFAULT",
    });
    setNewSource("");
    //setNewDestination("");
  }

  // Group EmailForwards by source
  const groupedEmailForwards = EmailForwards.reduce((acc, item) => {
    if (!item || !item.source) return acc; // <-- Add this line
    if (!acc[item.source]) acc[item.source] = [];
    acc[item.source].push(item);
    return acc;
  }, {} as Record<string, Schema["EmailForwards"]["type"][]>);

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>

      {/* New Source/Destination Form */}
      <form onSubmit={handleNewSourceSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="email"
          placeholder="New source email"
          value={newSource}
          onChange={e => setNewSource(e.target.value)}
          required
        />
        <button type="submit">Add Mapping</button>
      </form>

      {/* Grouped display */}
      {Object.entries(groupedEmailForwards).map(([source, todos]) => {
        const filteredTodos = todos.filter(todo => todo.destination !== "DEFAULT");
        return (
          <div key={source} style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ margin: 0 }}>{source}</h3>
              <button
                style={{ marginLeft: "auto" }}
                onClick={() => deleteGroup(source)}
              >
                Delete Group
              </button>
            </div>
            <ul>
              {filteredTodos.length > 0 ? (
                filteredTodos.map(todo => (
                  <li
                    key={todo.id}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                  >
                    {todo.destination}
                    <button
                      style={{ marginLeft: "auto" }}
                      onClick={() => deleteForward(todo.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))
              ) : (
                <li>No Destinations</li>
              )}
            </ul>
            <button
              onClick={() => {
                const destination = window.prompt(`Enter destination email for ${source}`);
                if (destination) {
                  client.models.EmailForwards.create({
                    source,
                    destination,
                  });
                }
              }}
            >
              Add Destination
            </button>
          </div>
        );
      })}

      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
