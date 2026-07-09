"use client";

import { useState } from "react";

interface PartSpecEntry {
  id: number;
  partRole: string;
  allowsCustomSize: boolean;
  minCm: number | null;
  maxCm: number | null;
}

const PART_ROLE_LABELS: Record<string, string> = {
  TOP: "Верх",
  BOTTOM: "Низ",
  FACADE: "Фасад",
  CORPUS: "Корпус",
};

export function PartSpecsSection({ initialItems }: { initialItems: PartSpecEntry[] }) {
  const [items, setItems] = useState(initialItems);

  async function updateSpec(
    id: number,
    patch: Partial<Pick<PartSpecEntry, "allowsCustomSize" | "minCm" | "maxCm">>,
  ) {
    const response = await fetch(`/api/part-specs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) return;
    const json = await response.json();
    setItems((prev) => prev.map((i) => (i.id === json.partSpec.id ? json.partSpec : i)));
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2>Правила розмірів частин</h2>
      <table>
        <thead>
          <tr>
            <th>Частина</th>
            <th>Індивідуальні розміри</th>
            <th>Мін, см</th>
            <th>Макс, см</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{PART_ROLE_LABELS[item.partRole] ?? item.partRole}</td>
              <td>
                <input
                  type="checkbox"
                  checked={item.allowsCustomSize}
                  onChange={(e) => updateSpec(item.id, { allowsCustomSize: e.target.checked })}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.minCm ?? ""}
                  onChange={(e) =>
                    updateSpec(item.id, {
                      minCm: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={item.maxCm ?? ""}
                  onChange={(e) =>
                    updateSpec(item.id, {
                      maxCm: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
