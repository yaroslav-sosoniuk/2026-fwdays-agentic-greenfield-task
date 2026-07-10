"use client";

import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
    <Box sx={{ mt: 2 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {productType.name}
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Верх, см"
            type="number"
            value={topSizeCm}
            onChange={(e) => setTopSizeCm(Number(e.target.value))}
            required
            error={Boolean(errorsByPart.get("TOP"))}
            helperText={errorsByPart.get("TOP")}
          />

          <TextField
            label="Низ, см"
            type="number"
            value={bottomSizeCm}
            onChange={(e) => setBottomSizeCm(Number(e.target.value))}
            required
            error={Boolean(errorsByPart.get("BOTTOM"))}
            helperText={errorsByPart.get("BOTTOM")}
          />

          <FormControl fullWidth>
            <InputLabel id="facade-color-label">Колір фасаду</InputLabel>
            <Select
              labelId="facade-color-label"
              label="Колір фасаду"
              value={facadeColorId}
              onChange={(e) => setFacadeColorId(Number(e.target.value))}
            >
              {colors.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="facade-material-label">Матеріал фасаду</InputLabel>
            <Select
              labelId="facade-material-label"
              label="Матеріал фасаду"
              value={facadeMaterialId}
              onChange={(e) => setFacadeMaterialId(Number(e.target.value))}
            >
              {materials.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="corpus-material-label">Матеріал корпусу</InputLabel>
            <Select
              labelId="corpus-material-label"
              label="Матеріал корпусу"
              value={corpusMaterialId}
              onChange={(e) => setCorpusMaterialId(Number(e.target.value))}
            >
              {materials.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Фурнітура
            </Typography>
            <FormGroup>
              {hardwareItems.map((h) => (
                <FormControlLabel
                  key={h.id}
                  control={
                    <Checkbox
                      checked={selectedHardwareIds.includes(h.id)}
                      onChange={() => toggleHardware(h.id)}
                    />
                  }
                  label={`${h.name} (${h.sku})`}
                />
              ))}
            </FormGroup>
          </Box>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Сформувати BOM
          </Button>
        </Stack>
      </Paper>

      {submitError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {submitError}
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 3, mt: 2 }}>
          {result.bomResult.valid ? (
            <Stack spacing={1}>
              <Typography>
                {result.isStandard
                  ? `Стандартна партія (${result.matchingEntry?.sku})`
                  : "Індивідуальна комбінація (ще немає в каталозі)"}
              </Typography>
              <Box component="ul" sx={{ pl: 3, m: 0 }}>
                {result.bomResult.bom.map((c) => (
                  <Typography component="li" key={`${c.partRole}-${c.sku}`}>
                    {c.label} — <code>{c.sku}</code>
                  </Typography>
                ))}
              </Box>
              {!result.isStandard && (
                <Button onClick={handleSaveAsCatalogEntry} variant="outlined" sx={{ alignSelf: "flex-start" }}>
                  Зберегти як нову каталожну позицію
                </Button>
              )}
              {saveMessage && <Alert severity="info">{saveMessage}</Alert>}
            </Stack>
          ) : (
            <Typography>Виправте помилки вище, щоб сформувати BOM.</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}
