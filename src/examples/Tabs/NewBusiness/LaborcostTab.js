import React, { useMemo } from "react";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Grid, Card } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import useAnalysisData, { formatNumber, parseNumber } from "../../../layouts/analysis/data/laborcostData";
import AnalysisTabs from "examples/Tabs/AnalysisTabs.js";

function LaborCost() {
  const { rows, setRows, originalRows, saveData } = useAnalysisData("/api/laborcost");

  const columns = useMemo(
    () => [
      { header: "구분", accessorKey: "category", size: 120 },
      { header: "금액", accessorKey: "amount", size: 120, cell: (info) => formatNumber(info.getValue()) },
      { header: "비율", accessorKey: "rate", size: 80 },
    ],
    []
  );

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card sx={{ height: "calc(100vh - 200px)", display: "flex", flexDirection: "column" }}>
            <MDBox
              mx={0}
              mt={-3}
              py={1}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h6" color="white">
                인건비
              </MDTypography>
            </MDBox>

            <MDBox
              pt={0}
              sx={{
                flex: 1,
                minHeight: 0,
                overflow: "auto",
                "& table": {
                  width: "max-content",
                  minWidth: "100%",
                  borderSpacing: 0,
                  borderCollapse: "separate",
                },
                "& th, & td": {
                  border: "1px solid #686D76",
                  textAlign: "center",
                  padding: "4px",
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                },
                "& th": {
                  backgroundColor: "#f0f0f0",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                },
                "& td:first-of-type, & th:first-of-type": {
                  position: "sticky",
                  left: 0,
                  background: "#f0f0f0",
                  zIndex: 3,
                  width: "3%",
                },
                "thead th:first-of-type": { zIndex: 5 },
              }}
            >
              <table>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} style={{ width: header.column.columnDef.size }}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row, rowIndex) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        const colKey = cell.column.columnDef.accessorKey;
                        const isEditable = colKey !== "category";
                        const isNumeric = colKey === "amount";
                        const currentValue = row.getValue(colKey);
                        const originalValue = originalRows?.[rowIndex]?.[colKey];
                        const isChanged = currentValue !== originalValue;

                        return (
                          <td
                            key={cell.id}
                            contentEditable={isEditable}
                            suppressContentEditableWarning
                            className={isEditable && isChanged ? "edited-cell" : ""}
                            onBlur={(e) => {
                              if (!isEditable) return;
                              let newValue = e.target.innerText.trim();
                              if (isNumeric) newValue = parseNumber(newValue);
                              const updated = rows.map((r, idx) =>
                                idx === rowIndex ? { ...r, [colKey]: newValue } : r
                              );
                              setRows(updated);
                              if (isNumeric) e.currentTarget.innerText = formatNumber(newValue);
                            }}
                          >
                            {isNumeric ? formatNumber(currentValue) : currentValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default LaborCost;
