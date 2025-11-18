// src/components/EditableTable.js
import React from "react";
import PropTypes from "prop-types";   // ✅ 추가
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function EditableTable({ rows, setRows, columns, title, height = 400 }) {
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card
      sx={{
        mb: 3,
        height: `${height}px`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MDBox
        mx={0}
        mt={-3}
        py={1}
        px={2}
        variant="gradient"
        bgColor="info"
        borderRadius="lg"
        coloredShadow="info"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <MDTypography variant="h6" color="white">
          {title}
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
            padding: "6px",
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
                  return (
                    <td
                      key={cell.id}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newValue = e.target.innerText.trim();
                        const updatedRows = rows.map((r, idx) =>
                          idx === rowIndex ? { ...r, [colKey]: newValue } : r
                        );
                        setRows(updatedRows);
                      }}
                    >
                      {cell.getValue()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </MDBox>
    </Card>
  );
}

/* ✅ PropTypes 정의 */
EditableTable.propTypes = {
  rows: PropTypes.array.isRequired,
  setRows: PropTypes.func.isRequired,
  columns: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  height: PropTypes.number,
};

export default EditableTable;
