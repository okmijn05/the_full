import React, { useMemo, useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useLocation } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import dayjs from "dayjs";
import PropTypes from "prop-types";

import useNewRecordsheetData, { parseNumber } from "./data/newrecordsheetData";

// 근무 타입별 배경색
const typeColors = {
  "": "#fff",
  "0": "#d9f2d9",
  "1": "#fff7cc",
  "2": "#e6d9f2",
  "3": "#f9d9d9",
};

// 직책 코드 정의
const positions = {
  "0": "대표",
  "1": "팀장",
  "2": "부장",
  "3": "차장",
  "4": "과장",
  "5": "대리",
  "6": "주임",
  "7": "사원",
  "8": "점장",
  "9": "직원",
};

// 출근현황 셀
function AttendanceCell({ getValue, row, column, table }) {
  const initialValue =
    getValue() || { leave_type: "", start: "", end: "", leave_use: "" };
  const [value, setValue] = useState(initialValue);

  const handleChange = (field, val) => {
    const newValue = { ...value, [field]: val };
    setValue(newValue);
    table.options.meta?.updateData(row.index, column.id, newValue);
  };

  // 00:00 ~ 20:00, 30분 단위
  const times = [];
  for (let h = 6; h <= 20; h++) {
    for (let m of ["00", "30"]) {
      if (h === 20 && m !== "00") continue;
      times.push(`${h.toString().padStart(2, "")}:${m}`);
    }
  }

  const bgColor = typeColors[value.leave_type] || "#ffefd5";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        backgroundColor: bgColor,
        padding: "2px",
        borderRadius: "4px",
        width: "100%",
      }}
    >
      {/* 근무 타입 */}
      <select
        value={value.leave_type}
        onChange={(e) => handleChange("leave_type", e.target.value)}
        style={{ fontSize: "0.75rem", textAlign: "center", width: "100%" }}
      >
        <option value="">휴일</option>
        <option value="0">정상</option>
        <option value="1">연차</option>
        <option value="2">반차</option>
        <option value="3">여름휴가</option>
        <option value="4">교육</option>
        <option value="5">훈련</option>
      </select>

      {/* 출퇴근 시간 (정상, 반차일 경우) */}
      {["0", "2"].includes(value.leave_type) && (
        <>
          <select
            value={value.start}
            onChange={(e) => handleChange("start", e.target.value)}
            style={{ fontSize: "0.725rem", width: "100%" }}
          >
            <option value="">출근</option>
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={value.end}
            onChange={(e) => handleChange("end", e.target.value)}
            style={{ fontSize: "0.725rem", width: "100%" }}
          >
            <option value="">퇴근</option>
            {times.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </>
      )}

      {/* 연차/반차 입력 */}
      {["1", "2", "3"].includes(value.leave_type) && (
        <input
          type="text"
          placeholder="연차/반차"
          value={value.leave_use ? Number(value.leave_use).toLocaleString() : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            handleChange("leave_use", raw);
          }}
          style={{
            fontSize: "0.725rem",
            textAlign: "center",
            border: "1px solid black",
            width: "100%",
          }}
        />
      )}
    </div>
  );
}
AttendanceCell.propTypes = {
  getValue: PropTypes.func.isRequired,
  row: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
};

function ReadonlyCell({ getValue }) {
  return <span style={{ fontSize: "0.75rem" }}>{getValue() || ""}</span>;
}
ReadonlyCell.propTypes = {
  getValue: PropTypes.func.isRequired,
};

function NewRecordSheet() {
  const { memberRows, setMemberRows, dispatchRows, setDispatchRows, sheetRows } =
    useNewRecordsheetData();
  const [attendanceRows, setAttendanceRows] = useState([]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const account_name = queryParams.get("name");

  useEffect(() => {
    if (sheetRows && sheetRows.length) {
      setAttendanceRows(
        sheetRows.map((item) => ({
          ...item,
          ...item.days,
          ...Object.fromEntries(
            Object.entries(item.days).map(([k, v]) => [
              k,
              {
                leave_type: v.leave_type || "",
                start: v.start_time || "",
                end: v.end_time || "",
                leave_use: v.leave_use || "",
              },
            ])
          ),
        }))
      );
    }
  }, [sheetRows]);

  const year = dayjs().year();
  const month = dayjs().month() + 1;
  const daysInMonth = dayjs(`${year}-${month}`).daysInMonth();

  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => {
    const date = dayjs(`${year}-${month}-${i + 1}`);
    const weekday = ["일", "월", "화", "수", "목", "금", "토"][date.day()];
    return {
      header: `${i + 1}일(${weekday})`,
      accessorKey: `day_${i + 1}`,
      cell: AttendanceCell,
      size: "2%",
    };
  });

  const attendanceColumns = useMemo(
    () => [
      {
        header: "직원명",
        accessorKey: "user_name",
        size: "2%",
        cell: (info) => <b>{info.getValue()}</b>,
      },
      ...dayColumns,
    ],
    []
  );

  // 직원정보 합계 계산
  const employeeTotals = useMemo(() => {
    const totals = {
      name: "합계",
      employ_dispatch: 0,
      over_work: 0,
      non_work: 0,
    };
    memberRows.forEach((row) => {
      totals.employ_dispatch += parseNumber(row.total);
      totals.over_work += parseNumber(row.over_work);
      totals.non_work += parseNumber(row.non_work);
    });
    return {
      name: totals.name,
      employ_dispatch: totals.employ_dispatch.toLocaleString(),
      over_work: totals.over_work.toLocaleString(),
      non_work: totals.non_work.toLocaleString(),
    };
  }, [memberRows]);

  const tableSx = {
    maxHeight: "440px",
    overflow: "auto",
    "& table": {
      borderCollapse: "collapse",
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
      border: "1px solid #686D76",
    },
    "thead th:first-of-type": {
      zIndex: 5,
    },
  };

  const attendanceTable = useReactTable({
    data: attendanceRows,
    columns: attendanceColumns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setAttendanceRows((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...row, [columnId]: value } : row
          )
        );
      },
    },
  });

  // 🔥 직원정보 테이블
  const employeeTable = useReactTable({
    data: memberRows,
    columns: [
      { header: "직원명", accessorKey: "user_name", size: "15%", cell: ReadonlyCell },
      {
        header: "직책",
        accessorKey: "position",
        size: "15%",
        cell: ({ row, getValue }) => (
          <select
            value={String(getValue() ?? "")} 
            onChange={(e) => {
              const newVal = e.target.value;
              setMemberRows((prev) =>
                prev.map((r, i) =>
                  i === row.index ? { ...r, position: newVal } : r
                )
              );
            }}
            style={{ fontSize: "0.75rem", width: "100%" }}
          >
            {Object.entries(positions).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        ),
      },
      { header: "입사일자", accessorKey: "join_dt", size: "15%", cell: ReadonlyCell },
      { header: "총 갯수", accessorKey: "total_leave", size: "15%", cell: ReadonlyCell },
      { header: "사용연차", accessorKey: "leave_use", size: "15%", cell: ReadonlyCell },
      { header: "남은연차", accessorKey: "leave_remain", size: "15%", cell: ReadonlyCell },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DashboardLayout>
      <MDBox pt={1} pb={5} sx={{ display: "flex", justifyContent: "flex-end" }}>
        <MDButton
          variant="gradient"
          color="info"
          onClick={() =>
            console.log("저장", { attendanceRows, memberRows, dispatchRows })
          }
        >
          저장
        </MDButton>
      </MDBox>

      <Grid container spacing={5}>
        {/* 출근현황 */}
        <Grid item xs={12}>
          <Card>
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
                출근 현황
              </MDTypography>
            </MDBox>
            <MDBox pt={0} sx={tableSx}>
              <table className="recordsheet-table">
                <thead>
                  {attendanceTable.getHeaderGroups().map((hg) => (
                    <tr key={hg.id}>
                      {hg.headers.map((header) => (
                        <th key={header.id}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {attendanceTable.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
                        let bg = "";
                        if (cell.column.id.startsWith("day_")) {
                          const val = cell.getValue();
                          const type = val?.leave_type || "";
                          bg = typeColors[type] || "";
                        }
                        return (
                          <td
                            key={cell.id}
                            style={{
                              width: cell.column.columnDef.size,
                              backgroundColor: bg,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
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

        {/* 직원정보 */}
        <Grid item xs={12} container spacing={2}>
          <Grid item xs={12}>
            <Card>
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
                  직원 정보
                </MDTypography>
              </MDBox>
              <MDBox pt={0} sx={tableSx}>
                <table className="recordsheet-table">
                  <thead>
                    {employeeTable.getHeaderGroups().map((hg) => (
                      <tr key={hg.id}>
                        {hg.headers.map((header) => (
                          <th key={header.id}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {employeeTable.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{ width: cell.column.columnDef.size }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default NewRecordSheet;
