"use client";

import { useState } from "react";

interface CatalogEntryEntry {
  id: number;
  sku: string;
  active: boolean;
  topSizeCm: number;
  bottomSizeCm: number;
  facadeColor: { name: string };
  facadeMaterial: { name: string };
  corpusMaterial: { name: string };
}

export function CatalogEntriesSection({
  initialItems,
}: {
  initialItems: CatalogEntryEntry[];
}) {
  const [items, setItems] = useState(initialItems);

  async function toggleActive(item: CatalogEntryEntry) {
    const response = await fetch(`/api/catalog-entries/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    if (!response.ok) return;
    const json = await response.json();
    setItems((prev) =>
      prev.map((i) => (i.id === json.catalogEntry.id ? { ...i, active: json.catalogEntry.active } : i)),
    );
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2>Каталог стандартних партій</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.sku}</strong> — верх {item.topSizeCm}см, низ {item.bottomSizeCm}см,
            фасад {item.facadeMaterial.name}/{item.facadeColor.name}, корпус{" "}
            {item.corpusMaterial.name}
            {!item.active && " (неактивна)"}{" "}
            <button onClick={() => toggleActive(item)}>
              {item.active ? "Деактивувати" : "Активувати"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
