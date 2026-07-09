"use client";

import { useState, type FormEvent } from "react";

interface SimpleEntry {
  id: number;
  name: string;
  active: boolean;
}

export function SimpleDictionarySection({
  title,
  resourcePath,
  itemKey,
  initialItems,
}: {
  title: string;
  resourcePath: string;
  itemKey: string;
  initialItems: SimpleEntry[];
}) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) return;

    const response = await fetch(resourcePath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error ?? "Не вдалося додати");
      return;
    }
    const created: SimpleEntry = json[itemKey];
    setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
  }

  async function toggleActive(item: SimpleEntry) {
    const response = await fetch(`${resourcePath}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    if (!response.ok) return;
    const json = await response.json();
    const updated: SimpleEntry = json[itemKey];
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} {!item.active && "(неактивний)"}{" "}
            <button onClick={() => toggleActive(item)}>
              {item.active ? "Деактивувати" : "Активувати"}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Нова назва"
        />
        <button type="submit">Додати</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </section>
  );
}
