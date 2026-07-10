"use client";

import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

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
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Правила розмірів частин
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Частина</TableCell>
            <TableCell>Індивідуальні розміри</TableCell>
            <TableCell>Мін, см</TableCell>
            <TableCell>Макс, см</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{PART_ROLE_LABELS[item.partRole] ?? item.partRole}</TableCell>
              <TableCell>
                <Checkbox
                  checked={item.allowsCustomSize}
                  onChange={(e) => updateSpec(item.id, { allowsCustomSize: e.target.checked })}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  value={item.minCm ?? ""}
                  onChange={(e) =>
                    updateSpec(item.id, {
                      minCm: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  value={item.maxCm ?? ""}
                  onChange={(e) =>
                    updateSpec(item.id, {
                      maxCm: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
