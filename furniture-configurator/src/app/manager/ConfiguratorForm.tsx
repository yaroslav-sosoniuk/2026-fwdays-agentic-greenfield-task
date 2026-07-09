"use client";

import { useState, type FormEvent } from "react";

interface DictionaryOption {
  id: number;
  name: string;
}

interface HardwareOption {
  id: number;
  name: string;
  sku: string;
}

interface BOMComponent {
  partRole: string;
  sku: string;
  label: string;
}

interface BOMError {
  partRole: string;
  message: string;
}

interface ConfigurationResponse {
  bomResult:
    | { valid: true; bom: BOMComponent[] }
    | { valid: false; errors: BOMError[] };
  isStandard: boolean;
  matchingEntry: { id: number; sku: string } | null;
}

export function ConfiguratorForm({
  productType,
  colors,
  materials,
  hardwareItems,
}: {
  productType: { id: number; name: string };
  colors: DictionaryOption[];
  materials: DictionaryOption[];
  hardwareItems: HardwareOption[];
}) {
  const [topSizeCm, setTopSizeCm] = useState(60);
  const [bottomSizeCm, setBottomSizeCm] = useState(60);
  const [facadeColorId, setFacadeColorId] = useState(colors[0]?.id ?? 0);
  const [facadeMaterialId, setFacadeMaterialId] = useState(materials[0]?.id ?? 0);
  const [corpusMaterialId, setCorpusMaterialId] = useState(materials[0]?.id ?? 0);
  const [selectedHardwareIds, setSelectedHardwareIds] = useState<number[]>([]);

  const [result, setResult] = useState<ConfigurationResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  function toggleHardware(id: number) {
    setSelectedHardwareIds((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id],
    );
  }

  function buildPayload() {
    return {
      productTypeId: productType.id,
      topSizeCm,
      bottomSizeCm,
      facadeColorId,
      facadeMaterialId,
      corpusMaterialId,
      hardwareItemIds: selectedHardwareIds,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSaveMessage(null);
    setResult(null);
    try {
      const response = await fetch("/api/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const json = await response.json();
      if (!response.ok) {
        setSubmitError(json.error ?? "Не вдалося сформувати BOM");
        return;
      }
      setResult(json);
    } catch {
      setSubmitError("Помилка мережі");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveAsCatalogEntry() {
    setSaveMessage(null);
    try {
      const response = await fetch("/api/catalog-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const json = await response.json();
      if (response.status === 409) {
        setSaveMessage(`Ця комбінація вже є в каталозі: ${json.existingMatch?.sku}`);
        return;
      }
      if (!response.ok) {
        setSaveMessage(json.error ?? "Не вдалося зберегти");
        return;
      }
      setSaveMessage(`Збережено як нову каталожну позицію: ${json.catalogEntry.sku}`);
    } catch {
      setSaveMessage("Помилка мережі");
    }
  }

  const errorsByPart = new Map<string, string>();
  if (result && !result.bomResult.valid) {
    for (const err of result.bomResult.errors) {
      errorsByPart.set(err.partRole, err.message);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}
      >
        <fieldset>
          <legend>{productType.name}</legend>

          <label style={{ display: "block" }}>
            Верх, см
            <input
              type="number"
              value={topSizeCm}
              onChange={(e) => setTopSizeCm(Number(e.target.value))}
              required
            />
          </label>
          {errorsByPart.get("TOP") && <p style={{ color: "crimson" }}>{errorsByPart.get("TOP")}</p>}

          <label style={{ display: "block" }}>
            Низ, см
            <input
              type="number"
              value={bottomSizeCm}
              onChange={(e) => setBottomSizeCm(Number(e.target.value))}
              required
            />
          </label>
          {errorsByPart.get("BOTTOM") && <p style={{ color: "crimson" }}>{errorsByPart.get("BOTTOM")}</p>}

          <label style={{ display: "block" }}>
            Колір фасаду
            <select
              value={facadeColorId}
              onChange={(e) => setFacadeColorId(Number(e.target.value))}
            >
              {colors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block" }}>
            Матеріал фасаду
            <select
              value={facadeMaterialId}
              onChange={(e) => setFacadeMaterialId(Number(e.target.value))}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "block" }}>
            Матеріал корпусу
            <select
              value={corpusMaterialId}
              onChange={(e) => setCorpusMaterialId(Number(e.target.value))}
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p>Фурнітура</p>
            {hardwareItems.map((h) => (
              <label key={h.id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={selectedHardwareIds.includes(h.id)}
                  onChange={() => toggleHardware(h.id)}
                />
                {h.name} ({h.sku})
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={isSubmitting}>
          Сформувати BOM
        </button>
      </form>

      {submitError && <p style={{ color: "crimson" }}>{submitError}</p>}

      {result && (
        <section style={{ marginTop: 24 }}>
          {result.bomResult.valid ? (
            <>
              <p>
                {result.isStandard
                  ? `Стандартна партія (${result.matchingEntry?.sku})`
                  : "Індивідуальна комбінація (ще немає в каталозі)"}
              </p>
              <ul>
                {result.bomResult.bom.map((c) => (
                  <li key={`${c.partRole}-${c.sku}`}>
                    {c.label} — <code>{c.sku}</code>
                  </li>
                ))}
              </ul>
              {!result.isStandard && (
                <button onClick={handleSaveAsCatalogEntry}>
                  Зберегти як нову каталожну позицію
                </button>
              )}
              {saveMessage && <p>{saveMessage}</p>}
            </>
          ) : (
            <p>Виправте помилки вище, щоб сформувати BOM.</p>
          )}
        </section>
      )}
    </div>
  );
}
