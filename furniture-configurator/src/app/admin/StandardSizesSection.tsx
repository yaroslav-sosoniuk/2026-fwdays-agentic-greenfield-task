"use client";

import { useState, type FormEvent } from "react";

type DimensionType = "WIDTH" | "HEIGHT" | "DEPTH";

interface StandardSizeEntry {
  id: number;
  dimensionType: DimensionType;
  valueCm: number;
  active: boolean;
}

const DIMENSION_LABELS: Record<DimensionType, string> = {
  WIDTH: "Ширина",
  HEIGHT: "Висота",
  DEPTH: "Глибина",
};

export function StandardSizesSection({
  initialItems,
}: {
  initialItems: StandardSizeEntry[];
}) {
  const [items, setItems] = useState(initialItems);
  const [dimensionType, setDimensionType] = useState<DimensionType>("WIDTH");
  const [valueCm, setValueCm] = useState(40);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/standard-sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dimensionType, valueCm }),
    });
    const json = await response.json();
    if (!response.ok) {
      setError(json.error ?? "Не вдалося додати");
      return;
    }
    setItems((prev) =>
      [...prev, json.standardSize].sort((a, b) =>
        a.dimensionType === b.dimensionType
          ? a.valueCm - b.valueCm
          : a.dimensionType.localeCompare(b.dimensionType),
      ),
    );
  }

  async function toggleActive(item: StandardSizeEntry) {
    const response = await fetch(`/api/standard-sizes/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    if (!response.ok) return;
    const json = await response.json();
    setItems((prev) =>
      prev.map((i) => (i.id === json.standardSize.id ? json.standardSize : i)),
    );
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2>Стандартні розміри</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {DIMENSION_LABELS[item.dimensionType]}: {item.valueCm}см{" "}
            {!item.active && "(неактивний)"}{" "}
            <button onClick={() => toggleActive(item)}>
              {item.active ? "Деактивувати" : "Активувати"}
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8 }}>
        <select
          value={dimensionType}
          onChange={(e) => setDimensionType(e.target.value as DimensionType)}
        >
          {Object.entries(DIMENSION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={valueCm}
          onChange={(e) => setValueCm(Number(e.target.value))}
        />
        <button type="submit">Додати</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </section>
  );
}
