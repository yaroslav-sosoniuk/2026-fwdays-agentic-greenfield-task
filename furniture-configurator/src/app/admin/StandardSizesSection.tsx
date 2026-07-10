"use client";

import { useState, type FormEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setDialogOpen(false);
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
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" component="h2">
          Стандартні розміри
        </Typography>
        <Button variant="contained" size="small" onClick={() => setDialogOpen(true)}>
          Додати
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Вимір</TableCell>
            <TableCell>Значення, см</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell align="right">Дія</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{DIMENSION_LABELS[item.dimensionType]}</TableCell>
              <TableCell>{item.valueCm}</TableCell>
              <TableCell>
                {item.active ? (
                  <Chip label="активний" color="success" size="small" />
                ) : (
                  <Chip label="неактивний" size="small" />
                )}
              </TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => toggleActive(item)}>
                  {item.active ? "Деактивувати" : "Активувати"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={handleAdd}>
          <DialogTitle>Додати стандартний розмір</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel id="dimension-type-label">Вимір</InputLabel>
                <Select
                  labelId="dimension-type-label"
                  label="Вимір"
                  value={dimensionType}
                  onChange={(e) => setDimensionType(e.target.value as DimensionType)}
                >
                  {Object.entries(DIMENSION_LABELS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Значення, см"
                type="number"
                value={valueCm}
                onChange={(e) => setValueCm(Number(e.target.value))}
                fullWidth
              />
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Скасувати</Button>
            <Button type="submit" variant="contained">
              Додати
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Paper>
  );
}
