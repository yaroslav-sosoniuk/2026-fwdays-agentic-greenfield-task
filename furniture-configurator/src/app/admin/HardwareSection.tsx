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
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setDialogOpen(false);
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
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" component="h2">
          Фурнітура
        </Typography>
        <Button variant="contained" size="small" onClick={() => setDialogOpen(true)}>
          Додати
        </Button>
      </Stack>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Назва</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Статус</TableCell>
            <TableCell align="right">Дія</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>
                {item.active ? (
                  <Chip label="активна" color="success" size="small" />
                ) : (
                  <Chip label="неактивна" size="small" />
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
          <DialogTitle>Додати фурнітуру</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                autoFocus
                label="Назва"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              <TextField
                label="SKU"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
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
