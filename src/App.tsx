import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  // Add state for form fields
  const [email, setEmail] = useState("");
  const [destinationEmail, setDestinationEmail] = useState("");

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content"),source: "source@source.com", destination: "dest@dest.com" });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  // Handle form submission
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Destination Email:", destinationEmail);
    // You can add your backend logic here
    setEmail("");
    setDestinationEmail("");
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>

      {/* Email form */}
      <form onSubmit={handleFormSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Destination email"
          value={destinationEmail}
          onChange={e => setDestinationEmail(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)}
          key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
