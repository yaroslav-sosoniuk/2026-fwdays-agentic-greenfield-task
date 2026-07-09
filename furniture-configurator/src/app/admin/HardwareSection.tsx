"use client";

import { useState, type FormEvent } from "react";

interface HardwareEntry {
  id: number;
  name: string;
  sku: string;
  active: boolean;
}

export function HardwareSection({ initialItems }: { initialItems: HardwareEntry[] }) {
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!name.trim() || !sku.trim()) return;

    const response = await fetch("/api/hardware-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), sku: sku.trim() }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error ?? "Не вдалося додати");
      return;
    }
    setItems((prev) =>
      [...prev, json.hardwareItem].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setName("");
    setSku("");
  }

  async function toggleActive(item: HardwareEntry) {
    const response = await fetch(`/api/hardware-items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    if (!response.ok) return;
    const json = await response.json();
    setItems((prev) =>
      prev.map((i) => (i.id === json.hardwareItem.id ? json.hardwareItem : i)),
    );
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2>Фурнітура</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} ({item.sku}) {!item.active && "(неактивна)"}{" "}
            <button onClick={() => toggleActive(item)}>
              {item.active ? "Деактивувати" : "Активувати"}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Назва" />
        <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" />
        <button type="submit">Додати</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </section>
  );
}
