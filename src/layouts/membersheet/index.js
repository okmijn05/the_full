import React, { useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { useLocation  } from "react-router-dom";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import useMembersheetData from "./data/membersheetData";

function MemberSheet() {
  const {
    activeRows,
    setActiveRows,
    inactiveRows,
    setInactiveRows,
    activeOriginalRows,
    inactiveOriginalRows,
    saveData,
    parseNumber,
    formatNumber,
  } = useMembersheetData();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const account_name = queryParams.get("name");

  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 0; h <= 20; h++) {
      options.push(`${h.toString().padStart(2, "")}:00`);
      options.push(`${h.toString().padStart(2, "")}:30`);
    }
    return options;
  }, []);

  const activeColumns = useMemo(() => [
    { header: "주소", accessorKey: "account_address", size: "8%" },
    { header: "거래처명", accessorKey: "account_name", size: "3%" },
    { header: "성명", accessorKey: "name", size: "2%" },
    { header: "입사일자", accessorKey: "join_dt", size: "6%" },
    { header: "퇴사일자", accessorKey: "del_dt", size: "6%" },
    { header: "급여", accessorKey: "salary", size: "3%", cell: info => formatNumber(info.getValue()) },
    { header: "직책", accessorKey: "position", size: "2%" },
    { header: "근무체계", accessorKey: "work_system", size: "4%" },
    { header: "출근", accessorKey: "start_time", size: "2%" },
    { header: "퇴근", accessorKey: "end_time", size: "2%" },
    { header: "채용공고", accessorKey: "rct_notice", size: "17%" },
    { header: "특이사항", accessorKey: "note", size: "17%" },
  ], [formatNumber]);

  const inactiveColumns = useMemo(() => [
    { header: "주소", accessorKey: "account_address", size: "8%" },
    { header: "거래처명", accessorKey: "account_name", size: "3%" },
    { header: "성명", accessorKey: "name", size: "2%" },
    { header: "입사일자", accessorKey: "join_dt", size: "6%" },
    { header: "퇴사일자", accessorKey: "del_dt", size: "6%" },
    { header: "급여", accessorKey: "salary", size: "3%", cell: info => formatNumber(info.getValue()) },
    { header: "직책", accessorKey: "position", size: "2%" },
    { header: "근무체계", accessorKey: "work_system", size: "4%" },
    { header: "출근", accessorKey: "start_time", size: "2%" },
    { header: "퇴근", accessorKey: "end_time", size: "2%" },
    { header: "관계", accessorKey: "relation", size: "17%" },
    { header: "퇴사사유", accessorKey: "del_note", size: "17%" },
  ], [formatNumber]);

  const activeTable = useReactTable({
    data: activeRows,
    columns: activeColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const inactiveTable = useReactTable({
    data: inactiveRows,
    columns: inactiveColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleCellChange = (rowIndex, colKey, value, isActiveTable) => {
    const rows = isActiveTable ? activeRows : inactiveRows;
    const originals = isActiveTable ? activeOriginalRows : inactiveOriginalRows;
    const setter = isActiveTable ? setActiveRows : setInactiveRows;

    let newValue = value;
    if (colKey === "salary") newValue = parseNumber(value);

    const updatedRows = [...rows];
    updatedRows[rowIndex] = { ...updatedRows[rowIndex], [colKey]: newValue };
    setter(updatedRows);
  };

  // 급여 합계 계산
  const activeSalarySum = useMemo(() => {
    return activeRows.reduce((sum, row) => sum + (parseNumber(row.salary) || 0), 0);
  }, [activeRows, parseNumber]);

  const renderTable = (table, rows, originals, isActiveTable = true) => {
    // 거래처별 rowspan 계산
    const addressSpans = {};
    const accountNameSpans = {};
    let prevAddress = null;
    let spanStart = 0;

    rows.forEach((row, idx) => {
      if (row.account_address !== prevAddress) {
        addressSpans[idx] = 1;
        spanStart = idx;
      } else {
        addressSpans[spanStart]++;
        addressSpans[idx] = 0;
      }
      prevAddress = row.account_address;
    });

    rows.forEach((row, idx) => {
      if (row.account_name !== prevAddress) {
        accountNameSpans[idx] = 1;
        spanStart = idx;
      } else {
        accountNameSpans[spanStart]++;
        accountNameSpans[idx] = 0;
      }
      prevAddress = row.account_name;
    });

    return (
      <MDBox pt={0} sx={{
        overflowX: "auto",
        //overflowY: "auto",
        height: "100%",
        "& table": 
        { 
          borderCollapse: "collapse", 
          width: "max-content", 
          minWidth: "100%",
          borderSpacing: 0,
          borderCollapse: "separate",
        },
        "& th, & td": 
        { 
          border: "1px solid #686D76", 
          textAlign: "center", 
          padding: "4px", 
          whiteSpace: "nowrap", 
          fontSize: "12px" 
        },
        "& th": 
        { 
          backgroundColor: "#f0f0f0", 
          position: "sticky", 
          top: 0, 
          zIndex: 5 
        },
        "& td:first-of-type, & th:first-of-type": 
        { 
          //background: "#f0f0f0", 
          zIndex: 4,
          width: "3%",
        },
        "thead th:first-of-type": { zIndex: 5 },
        ".edited-cell": { color: "red", fontWeight: "bold" },
        ".date-picker": { width: "80px", zIndex: 3, position: "relative", fontSize: "12px" },
        ".react-datepicker-popper" : { zIndex: 999 },
        ".time-select": { width: "80px" },
        ".react-datepicker__input-container > input": { width: "80px"}
      }}>
        <table>
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
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
                {row.getVisibleCells().map(cell => {
                  const colKey = cell.column.columnDef.accessorKey;
                  const currentValue = rows[rowIndex][colKey];
                  const originalValue = originals?.[rowIndex]?.[colKey];
                  const isEdited = colKey === "salary"
                    ? parseNumber(currentValue) !== parseNumber(originalValue)
                    : (currentValue || "") !== (originalValue || "");

                  // 주소 colspan 처리
                  if (colKey === "account_address") {
                    const span = addressSpans[rowIndex];
                    if (span === 0) return null;
                    return (
                      <td key={cell.id} rowSpan={span}>
                        {currentValue}
                      </td>
                    );
                  }

                  // 주소 colspan 처리
                  if (colKey === "account_name") {
                    const span = accountNameSpans[rowIndex];
                    if (span === 0) return null;
                    return (
                      <td key={cell.id} rowSpan={span} >
                        {currentValue}
                      </td>
                    );
                  }

                  if (colKey === "join_dt" || colKey === "del_dt") {
                    return (
                      <td key={cell.id}>
                        <DatePicker
                          selected={currentValue ? new Date(currentValue) : null}
                          onChange={(date) => handleCellChange(rowIndex, colKey, date ? date.toISOString().slice(0, 10) : "", isActiveTable)}
                          dateFormat="yyyy-MM-dd"
                          className={isEdited ? "edited-cell" : ""}
                        />
                      </td>
                    );
                  }

                  if (colKey === "start_time" || colKey === "end_time") {
                    return (
                      <td key={cell.id}>
                        <select
                          className={`time-select ${isEdited ? "edited-cell" : ""}`}
                          value={currentValue || ""}
                          onChange={(e) => handleCellChange(rowIndex, colKey, e.target.value, isActiveTable)}
                        >
                          <option value="">선택</option>
                          {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={cell.id}
                      contentEditable
                      suppressContentEditableWarning
                      className={isEdited ? "edited-cell" : ""}
                      onBlur={(e) => handleCellChange(rowIndex, colKey, e.target.innerText, isActiveTable)}
                    >
                      {colKey === "salary" ? formatNumber(currentValue) : currentValue}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* 재직자 테이블 하단 급여 합계 */}
            {isActiveTable && (
              <tr>
                <td colSpan={5} style={{ fontWeight: "bold", textAlign: "right" }}>총 급여</td>
                <td style={{ fontWeight: "bold", textAlign: "right" }}>{formatNumber(activeSalarySum)}</td>
                <td colSpan={activeColumns.length - 6}></td>
              </tr>
            )}
          </tbody>
        </table>
      </MDBox>
    );
  };

  return (
    <DashboardLayout>
      <MDBox pt={2} pb={4} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <MDButton variant="gradient" color="info" onClick={() => saveData(activeRows, inactiveRows)}>저장</MDButton>
      </MDBox>

      <MDBox sx={{ display: "flex", flexDirection: "column", height: "calc(90vh - 120px)" }}>
        <Grid container spacing={6} sx={{ flex: 1 }}>
          <Grid item xs={12} sx={{ flex: 1, minHeight: 0 }}>
            <Card sx={{ display: "flex", flexDirection: "column", height: "calc(50vh - 120px)" }}>
              <MDBox mx={0} mt={-3} py={1} px={2} variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info">
                <MDTypography variant="h6" color="white">재직자  (업장명 : {account_name})</MDTypography>
              </MDBox>
              <MDBox sx={{ flex: 1, minHeight: 0 }}>
                {renderTable(activeTable, activeRows, activeOriginalRows, true)}
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} sx={{ flex: 1, minHeight: 0 }}>
            <Card sx={{ display: "flex", flexDirection: "column", height: "calc(50vh - 120px)" }}>
              <MDBox mx={0} mt={-2} py={1} px={2} variant="gradient" bgColor="error" borderRadius="lg" coloredShadow="error">
                <MDTypography variant="h6" color="white">퇴사자  (업장명 : {account_name})</MDTypography>
              </MDBox>
              <MDBox sx={{ flex: 1, minHeight: 0 }}>
                {renderTable(inactiveTable, inactiveRows, inactiveOriginalRows, false)}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default MemberSheet;
