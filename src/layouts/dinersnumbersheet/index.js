/* eslint-disable react/function-component-definition */
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Select, MenuItem, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import useDinersNumbersheetData, {
  parseNumber,
  formatNumber,
} from "./data/DinersNumberSheetData";
import LoadingScreen from "../loading/loadingscreen";
import Swal from "sweetalert2";
import api from "api/api";
import "./dinersnumbersheet.css";
import HeaderWithLogout from "components/Common/HeaderWithLogout";
import { useParams } from "react-router-dom";

// 🔹 데이케어 컬럼이 보이는 account_id 목록 (기본 레이아웃용)
const DAYCARE_ACCOUNT_IDS = [
  "20250919162439",
  "20250819193615",
  "20250819193504",
  "20250819193455",
];

// 🔹 특수 배치가 필요한 account_id 목록 (colspan 레이아웃)
const SPECIAL_LAYOUT_IDS = [
  "20250819193620",
  "20250819193603",
  "20250819193502",
  "20250819193632",
  "20250819193523",
  "20250819193544",
  "20250819193634",
  "20250819193630", // ✅ 새로 추가
];

// 🔹 숫자 컬럼 목록
const numericCols = [
  "breakfast",
  "lunch",
  "dinner",
  "ceremony",
  "ceremony2",
  "breakfast2",
  "lunch2",
  "dinner2",
  "daycare_breakfast",
  "daycare_lunch",
  "daycare_diner",
  "daycare_employ_breakfast",
  "daycare_employ_lunch",
  "daycare_employ_dinner",
  "daycare_elderly_lunch",
  "daycare_elderly_dinner",
  "employ",
  "employ_breakfast",
  "employ_lunch",
  "employ_dinner",
  "total",
  "extra_diet1_price",
  "extra_diet2_price",
  "extra_diet3_price",
  "extra_diet4_price",
  "extra_diet5_price",
];

// 🔹 학교 / 산업체 판별
const isSchoolAccount = (accountType) =>
  accountType === "학교" || accountType === "5" || accountType === 5;

const isIndustryAccount = (accountType) =>
  accountType === "산업체" || accountType === "4" || accountType === 4;

// ✅ 합계 계산
//   - 학교:    컬럼 합 (중식 + extraDiet들 합)
//   - 산업체 20250819193647: (중식·간편식·석식 평균) + 나머지 extraDiet 합
//   - 그 외 산업체(93645 포함): 중식 + extraDiet 합
//   - 기타(요양원 등): 기존 (조+중+석)/3 + 경관식 (+ 필요시 extra)
const calculateTotal = (row, accountType, extraDietCols) => {
  const extras = Array.isArray(extraDietCols) ? extraDietCols : [];

  // 🏫 / 🏭 학교 & 산업체 공통 처리
  if (isSchoolAccount(accountType) || isIndustryAccount(accountType)) {
    const lunch = parseNumber(row.lunch);

    // 🏭 산업체 중, TH에 "간편식"/"석식" 이 있는 특수 케이스 (93647 레이아웃)
    const hasSimpleMealCols = extras.some((col) =>
      ["간편식", "석식"].includes((col.name || "").trim())
    );

    if (isIndustryAccount(accountType) && hasSimpleMealCols) {
      // 기준 이름: 중식(기본 lunch), 간편식, 석식
      const baseNames = ["중식", "간편식(포케)", "석식"];

      const baseValues = [lunch];
      let otherSum = 0;

      extras.forEach((col) => {
        const name = (col.name || "").trim();
        const value = parseNumber(row[col.priceKey]);

        if (baseNames.includes(name)) {
          baseValues.push(value);
        } else {
          otherSum += value;
        }
      });

      const avgBase =
        baseValues.length > 0
          ? baseValues.reduce((sum, v) => sum + v, 0) / baseValues.length
          : 0;

      return Math.round(avgBase + otherSum);
    }

    // 🏫 학교 + 일반 산업체(예: 20250819193645) → "컬럼들의 합"
    const extraSum = extras.reduce((sum, col) => {
      const v = parseNumber(row[col.priceKey]);
      return sum + v;
    }, 0);

    return lunch + extraSum;
  }

  // 🧓 그 외(요양원 등) → 기존 로직 유지
  const breakfast = parseNumber(row.breakfast);
  const lunch = parseNumber(row.lunch);
  const dinner = parseNumber(row.dinner);
  const ceremony = parseNumber(row.ceremony);

  const baseAvgMeals = (breakfast + lunch + dinner) / 3;
  const baseTotal = Math.round(baseAvgMeals + ceremony);

  let total = baseTotal;

  // 기존처럼 account_type 4/5 인 경우에만 extraDiet 더해주기 (요양원인데 4/5인 케이스 고려)
  if (
    (accountType === "4" ||
      accountType === "5" ||
      accountType === 4 ||
      accountType === 5) &&
    extras.length > 0
  ) {
    const extraSum = extras.reduce((sum, col) => {
      const v = parseNumber(row[col.priceKey]);
      return sum + v;
    }, 0);
    total += extraSum;
  }

  return total;
};

// ✅ 비교용 공통 정규화 함수 (테이블용)
const normalizeValueForCompare = (key, value) => {
  if (numericCols.includes(key)) {
    if (value === null || value === undefined || value === "") return 0;
    const num = parseNumber(value);
    if (Number.isNaN(num)) return 0;
    return Number(num);
  }

  if (value === null || value === undefined) return "";
  if (typeof value === "string") {
    return value.trim().replace(/\s+/g, " ");
  }
  return value;
};

// 🔹 account_id + account_type 별 헤더 구조 + 컬럼 키 정의
const getTableStructure = (
  selectedAccountId,
  isDaycareVisible,
  extraDietCols,
  selectedAccountType
) => {
  const isSchoolOrIndustry =
    selectedAccountType === "학교" || selectedAccountType === "산업체";

  if (isSchoolOrIndustry) {
    const baseColumns = [
      "lunch",
      ...extraDietCols.map((col) => col.priceKey),
      "total",
      "note",
    ];

    const headerRow = [
      { label: "구분" },
      { label: selectedAccountType === "학교" ? "학생" : "중식" },
      ...extraDietCols.map((col) => ({ label: col.name })),
      { label: "계" },
      { label: "비고" },
    ];

    return {
      headerRows: [headerRow],
      visibleColumns: baseColumns,
    };
  }

  // 🔸 특수 배치 케이스들…

  if (selectedAccountId === "20250819193620") {
    return {
      headerRows: [
        [
          { label: "구분", rowSpan: 2 },
          { label: "2층 주간보호(어르신)", colSpan: 3 },
          { label: "3층-5층 요양원(어르신)", colSpan: 3 },
          { label: "경관식", rowSpan: 2 },
          { label: "2층 주간보호(직원조식)", rowSpan: 2 },
          { label: "요양원직원", colSpan: 2 },
          { label: "계", rowSpan: 2 },
          { label: "비고", rowSpan: 2 },
          { label: "조식취소", rowSpan: 2 },
          { label: "중식취소", rowSpan: 2 },
          { label: "석식취소", rowSpan: 2 },
        ],
        [
          { label: "조식" },
          { label: "중식" },
          { label: "석식" },
          { label: "조식" },
          { label: "중식" },
          { label: "석식" },
          { label: "조식" },
          { label: "중식" },
        ],
      ],
      visibleColumns: [
        "daycare_breakfast",
        "daycare_lunch",
        "daycare_diner",
        "breakfast",
        "lunch",
        "dinner",
        "ceremony",
        "daycare_employ_breakfast",
        "employ_breakfast",
        "employ_lunch",
        "total",
        "note",
        "breakcancel",
        "lunchcancel",
        "dinnercancel",
      ],
    };
  }

  if (selectedAccountId === "20250819193603") {
    return {
      headerRows: [
        [
          { label: "구분", rowSpan: 2 },
          { label: "조식", rowSpan: 2 },
          { label: "중식", rowSpan: 2 },
          { label: "석식", rowSpan: 2 },
          { label: "주간보호", colSpan: 2 },
          { label: "직원(조식)", rowSpan: 2 },
          { label: "직원(중식)", colSpan: 2 },
          { label: "직원(석식)", rowSpan: 2 },
          { label: "계", rowSpan: 2 },
          { label: "비고", rowSpan: 2 },
          { label: "조식취소", rowSpan: 2 },
          { label: "중식취소", rowSpan: 2 },
          { label: "석식취소", rowSpan: 2 },
        ],
        [
          { label: "중식" },
          { label: "석식" },
          { label: "요양원" },
          { label: "주간보호" },
        ],
      ],
      visibleColumns: [
        "breakfast",
        "lunch",
        "dinner",
        "daycare_lunch",
        "daycare_diner",
        "employ_breakfast",
        "employ_lunch",
        "daycare_employ_lunch",
        "daycare_employ_dinner",
        "total",
        "note",
        "breakcancel",
        "lunchcancel",
        "dinnercancel",
      ],
    };
  }

  if (selectedAccountId === "20250819193502") {
    return {
      headerRows: [
        [
          { label: "구분", rowSpan: 2 },
          { label: "조식", rowSpan: 2 },
          { label: "중식", rowSpan: 2 },
          { label: "석식", rowSpan: 2 },
          { label: "경관식", rowSpan: 2 },
          { label: "직원", colSpan: 2 },
          { label: "계", rowSpan: 2 },
          { label: "비고", rowSpan: 2 },
          { label: "조식취소", rowSpan: 2 },
          { label: "중식취소", rowSpan: 2 },
          { label: "석식취소", rowSpan: 2 },
        ],
        [
          { label: "중식" },
          { label: "석식" },
        ],
      ],
      visibleColumns: [
        "breakfast",
        "lunch",
        "dinner",
        "ceremony",
        "employ_lunch",
        "employ_dinner",
        "total",
        "note",
        "breakcancel",
        "lunchcancel",
        "dinnercancel",
      ],
    };
  }

  if (selectedAccountId === "20250819193632") {
    return {
      headerRows: [
        [
          { label: "구분", rowSpan: 2 },
          { label: "조식", rowSpan: 2 },
          { label: "중식", rowSpan: 2 },
          { label: "석식", rowSpan: 2 },
          { label: "경관식", rowSpan: 2 },
          { label: "주간보호(어르신)", colSpan: 2 },
          { label: "주간보호(직원)", colSpan: 2 },
          { label: "직원", colSpan: 3 },
          { label: "계", rowSpan: 2 },
          { label: "비고", rowSpan: 2 },
          { label: "조식취소", rowSpan: 2 },
          { label: "중식취소", rowSpan: 2 },
          { label: "석식취소", rowSpan: 2 },
        ],
        [
          { label: "중식" },
          { label: "석식" },
          { label: "중식" },
          { label: "석식" },
          { label: "조식" },
          { label: "중식" },
          { label: "석식" },
        ],
      ],
      visibleColumns: [
        "breakfast",
        "lunch",
        "dinner",
        "ceremony",
        "daycare_lunch",
        "daycare_diner",
        "daycare_employ_lunch",
        "daycare_employ_dinner",
        "employ_breakfast",
        "employ_lunch",
        "employ_dinner",
        "total",
        "note",
        "breakcancel",
        "lunchcancel",
        "dinnercancel",
      ],
    };
  }

  if (selectedAccountId === "20250819193523") {
    return {
      headerRows: [
        [
          { label: "구분", rowSpan: 2 },
          { label: "조식", rowSpan: 2 },
          { label: "중식", rowSpan: 2 },
          { label: "특식여부", rowSpan: 2 },
          { label: "석식", rowSpan: 2 },
          { label: "경관식", rowSpan: 2 },
          { label: "직원", colSpan: 2 },
          { label: "계", rowSpan: 2 },
          { label: "비고", rowSpan: 2 },
          { label: "조식취소", rowSpan: 2 },
          { label: "중식취소", rowSpan: 2 },
          { label: "석식취소", rowSpan: 2 },
        ],
        [
          { label: "조식" },
          { label: "중식" },
        ],
      ],
      visibleColumns: [
        "breakfast",
        "lunch",
        "special_yn",
        "dinner",
        "ceremony",
        "employ_breakfast",
        "employ_lunch",
        "total",
        "note",
        "breakcancel",
        "lunchcancel",
        "dinnercancel",
      ],
    };
  }

  if (selectedAccountId === "20250819193544") {
    return {
      headerRows: [
        [
          { label: "구분" },
          { label: "조식" },
          { label: "중식" },
          { label: "특식여부" },
          { label: "석식" },
          { label: "경관식" },
          { label: "주간보호 중식" },
          { label: "직원" },
          { label: "계" },
          { label: "비고" },
          { label: "조식취소" },
          { label: "중식취소" },
          { label: "석식취소" },
        ],
      ],
      visibleColumns: [
        "breakfast",
        "lunch",
        "special_yn",
        "dinner",
        "ceremony",
        "daycare_lunch",
        "employ",
        "total",
        "note",
        "breakcancel",
        "lunchcancel",
        "dinnercancel",
      ],
    };
  }

  if (selectedAccountId === "20250819193634") {
    return {
      headerRows: [
        [
          { label: "구분", rowSpan: 2 },
          { label: "조식", rowSpan: 2 },
          { label: "중식", rowSpan: 2 },
          { label: "석식", rowSpan: 2 },
          { label: "경관식", rowSpan: 2 },
          { label: "직원", colSpan: 3 },
          { label: "계", rowSpan: 2 },
          { label: "비고", rowSpan: 2 },
          { label: "조식취소", rowSpan: 2 },
          { label: "중식취소", rowSpan: 2 },
          { label: "석식취소", rowSpan: 2 },
        ],
        [
          { label: "조식" },
          { label: "중식" },
          { label: "석식" },
        ],
      ],
      visibleColumns: [
        "breakfast",
        "lunch",
        "dinner",
        "ceremony",
        "employ_breakfast",
        "employ_lunch",
        "employ_dinner",
        "total",
        "note",
        "breakcancel",
        "lunchcancel",
        "dinnercancel",
      ],
    };
  }

  if (selectedAccountId === "20250819193630") {
    return {
      headerRows: [
        [
          { label: "구분", rowSpan: 2 },
          { label: "2,3층", colSpan: 3 },
          { label: "7층", colSpan: 3 },
          { label: "경관식", colSpan: 2 },
          { label: "직원", colSpan: 2 },
          { label: "계", rowSpan: 2 },
          { label: "비고", rowSpan: 2 },
          { label: "조식취소", rowSpan: 2 },
          { label: "중식취소", rowSpan: 2 },
          { label: "석식취소", rowSpan: 2 },
        ],
        [
          { label: "조식" },
          { label: "중식" },
          { label: "석식" },
          { label: "조식" },
          { label: "중식" },
          { label: "석식" },
          { label: "2,3층" },
          { label: "7층" },
          { label: "조식" },
          { label: "중식" },
        ],
      ],
      visibleColumns: [
        "breakfast",
        "lunch",
        "dinner",
        "breakfast2",
        "lunch2",
        "dinner2",
        "ceremony",
        "ceremony2",
        "employ_breakfast",
        "employ_lunch",
        "total",
        "note",
        "breakcancel",
        "lunchcancel",
        "dinnercancel",
      ],
    };
  }

  const showDaycareLunch = isDaycareVisible;
  const showDaycareDinner = isDaycareVisible;

  const baseColumns = [
    "breakfast",
    "lunch",
    "special_yn",
    "dinner",
    "ceremony",
    ...extraDietCols.map((col) => col.priceKey),
    ...(showDaycareLunch ? ["daycare_lunch"] : []),
    ...(showDaycareDinner ? ["daycare_diner"] : []),
    "employ",
    "total",
    "note",
    "breakcancel",
    "lunchcancel",
    "dinnercancel",
  ];

  const headerRow = [
    { label: "구분" },
    { label: "조식" },
    { label: "중식" },
    { label: "특식여부" },
    { label: "석식" },
    { label: "경관식" },
    ...extraDietCols.map((col) => ({ label: col.name })),
    ...(showDaycareLunch ? [{ label: "데이케어 중식" }] : []),
    ...(showDaycareDinner ? [{ label: "데이케어 석식" }] : []),
    { label: "직원" },
    { label: "계" },
    { label: "비고" },
    { label: "조식취소" },
    { label: "중식취소" },
    { label: "석식취소" },
  ];

  return {
    headerRows: [headerRow],
    visibleColumns: baseColumns,
  };
};

function DinersNumberSheet() {
  const today = dayjs();
  const [year, setYear] = useState(today.year());
  const [month, setMonth] = useState(today.month() + 1);

  // 👉 라우트 파라미터에서 account_id 가져오기 (RecordSheet와 동일한 패턴)
  const { account_id } = useParams();

  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [originalRows, setOriginalRows] = useState([]);

  // ✅ 근무일수 상태 (테이블과 완전 분리)
  const [workingDay, setWorkingDay] = useState("0");
  const [originalWorkingDay, setOriginalWorkingDay] = useState(0);

  const {
    activeRows,
    setActiveRows,
    loading,
    fetchAllData,
    extraDietCols,
    accountList,
  } = useDinersNumbersheetData(selectedAccountId, year, month);

  const isDaycareVisible =
    selectedAccountId &&
    DAYCARE_ACCOUNT_IDS.includes(selectedAccountId) &&
    !SPECIAL_LAYOUT_IDS.includes(selectedAccountId);

  const selectedAccount = (accountList || []).find(
    (acc) => acc.account_id === selectedAccountId
  );
  const selectedAccountType = selectedAccount?.account_type;

  const isWorkingDayVisible =
    selectedAccountType === "학교" || selectedAccountType === "산업체";

  const isWorkingDayChanged =
    isWorkingDayVisible &&
    parseNumber(workingDay ?? 0) !== originalWorkingDay;

  // ✅ accountList 로딩 후, URL param의 account_id를 우선 1번만 적용 (RecordSheet와 동일 로직)
  useEffect(() => {
    if (!accountList || accountList.length === 0) return;

    setSelectedAccountId((prev) => {
      // 이미 선택된 값이 있으면(사용자가 셀렉트 변경 후 등) 건들지 않음
      if (prev) return prev;

      // URL path param account_id가 있고, 실제 리스트에도 존재하면 그걸 사용
      if (
        account_id &&
        accountList.some((row) => row.account_id === account_id)
      ) {
        return account_id;
      }

      // 아니면 첫 번째 거래처 사용
      return accountList[0].account_id;
    });
  }, [accountList, account_id]);

  // ✅ 기준(originalRows) + 화면용(activeRows) 세팅 + 근무일수 초기값 세팅
  useEffect(() => {
    if (loading || !selectedAccountId) return;

    const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();

    const baseRows = Array.from({ length: daysInMonth }, (_, i) => {
      const base = {
        diner_date: dayjs(`${year}-${month}-${i + 1}`).toDate(),
        diner_year: year,
        diner_month: month,

        breakfast: 0,
        lunch: 0,
        dinner: 0,
        ceremony: 0,

        breakfast2: 0,
        lunch2: 0,
        dinner2: 0,
        ceremony2: 0,

        daycare_breakfast: 0,
        daycare_lunch: 0,
        daycare_diner: 0,
        daycare_elderly_lunch: 0,
        daycare_elderly_dinner: 0,

        daycare_employ_breakfast: 0,
        daycare_employ_lunch: 0,
        daycare_employ_dinner: 0,

        employ: 0,
        employ_breakfast: 0,
        employ_lunch: 0,
        employ_dinner: 0,

        extra_diet1_price: 0,
        extra_diet2_price: 0,
        extra_diet3_price: 0,
        extra_diet4_price: 0,
        extra_diet5_price: 0,

        total: 0,
        note: "",
        breakcancel: "",
        lunchcancel: "",
        dinnercancel: "",
        special_yn: "N",
      };

      extraDietCols.forEach((col) => {
        if (!(col.priceKey in base)) {
          base[col.priceKey] = 0;
        }
      });

      return base;
    });

    const merged = baseRows.map((base) => {
      const found = activeRows.find((item) => {
        const itemDate = dayjs(item.diner_date);
        return (
          itemDate.year() === year &&
          itemDate.month() + 1 === month &&
          itemDate.date() === dayjs(base.diner_date).date()
        );
      });

      const mergedRow = found ? { ...base, ...found } : { ...base };
      return {
        ...mergedRow,
        total: calculateTotal(mergedRow, selectedAccountType, extraDietCols),
      };
    });

    setActiveRows(merged);
    setOriginalRows(merged.map((r) => ({ ...r })));

    // 🔹 근무일수 초기값 세팅 (서버 값 있으면, 없으면 0)
    const rowWithWorkingDay = merged.find(
      (r) => r.working_day !== undefined && r.working_day !== null
    );
    const initialWorkingDay =
      rowWithWorkingDay && !Number.isNaN(rowWithWorkingDay.working_day)
        ? parseNumber(rowWithWorkingDay.working_day)
        : 0;

    setWorkingDay(initialWorkingDay.toString()); // ← 문자열
    setOriginalWorkingDay(initialWorkingDay); // ← 숫자
  }, [
    selectedAccountId,
    year,
    month,
    extraDietCols,
    loading,
    selectedAccountType,
  ]);

  // ✅ 셀 변경 (테이블)
  const handleCellChange = (rowIndex, key, value) => {
    setActiveRows((prev) =>
      prev.map((row, i) =>
        i === rowIndex
          ? {
              ...row,
              [key]: value,
              total: calculateTotal(
                { ...row, [key]: value },
                selectedAccountType,
                extraDietCols
              ),
            }
          : row
      )
    );
  };

  // ✅ 스타일 비교 (테이블 전용)
  const getCellStyle = (rowIndex, key, value) => {
    const original = originalRows[rowIndex]?.[key];

    const origNorm = normalizeValueForCompare(key, original);
    const currNorm = normalizeValueForCompare(key, value);

    return origNorm !== currNorm ? { color: "red" } : { color: "black" };
  };

  // ✅ 저장 처리
  const handleSave = async () => {
    if (!originalRows || originalRows.length === 0) {
      Swal.fire("안내", "비교 기준 데이터가 없습니다. 다시 조회해 주세요.", "info");
      return;
    }

    const modified = activeRows.filter((r, idx) => {
      const original = originalRows[idx] || {};
      return Object.keys(r).some((key) => {
        if (!(key in original)) return false;
        if (key === "diner_date") return false;

        const currNorm = normalizeValueForCompare(key, r[key]);
        const origNorm = normalizeValueForCompare(key, original[key]);
        return currNorm !== origNorm;
      });
    });

    const workingDayNumber = isWorkingDayVisible
      ? parseNumber(workingDay ?? 0) || 0
      : 0;

    const workingDayChanged =
      isWorkingDayVisible && workingDayNumber !== originalWorkingDay;

    if (modified.length === 0 && !workingDayChanged) {
      Swal.fire("안내", "변경된 데이터가 없습니다.", "info");
      return;
    }

    const rowsToSend = workingDayChanged ? activeRows : modified;

    const payload = rowsToSend.map((row) => ({
      ...row,
      ...(isWorkingDayVisible ? { working_day: workingDayNumber } : {}),
      account_id: selectedAccountId,
      diner_year: year,
      diner_month: month,
      diner_date: dayjs(row.diner_date).format("DD"),
    }));

    try {
      const res = await api.post("/Operate/AccountDinnersNumberSave", payload);
      if (res.data.code === 200) {
        Swal.fire("성공", "저장되었습니다.", "success");
        await fetchAllData();
      }
    } catch (e) {
      Swal.fire("실패", e.message || "저장 중 오류 발생", "error");
    }
  };

  if (loading && (!activeRows || activeRows.length === 0)) {
    return <LoadingScreen />;
  }

  const { headerRows, visibleColumns } = getTableStructure(
    selectedAccountId,
    isDaycareVisible,
    extraDietCols,
    selectedAccountType
  );

  if (loading) return <LoadingScreen />;

  return (
    <DashboardLayout>
      <HeaderWithLogout showMenuButton title="🍽️ 식수관리" />

      <MDBox
        pt={1}
        pb={1}
        gap={1}
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {isWorkingDayVisible && (
          <>
            <MDTypography variant="button">근무일수</MDTypography>
            <TextField
              value={workingDay}
              onChange={(e) => setWorkingDay(e.target.value)}
              onBlur={(e) => {
                // 포커스 빠질 때 한 번 숫자로 정리
                const num = parseNumber(e.target.value) || 0;
                setWorkingDay(num.toString());
              }}
              variant="outlined"
              size="small"
              sx={{ width: 80, mr: 1 }}
              inputProps={{
                style: {
                  textAlign: "right",
                  ...(isWorkingDayChanged ? { color: "red" } : {}),
                },
              }}
            />
          </>
        )}

        <Select
          value={selectedAccountId}
          onChange={(e) => {
            setSelectedAccountId(e.target.value); // ✅ 셀렉트 변경 시 그 값으로 재조회
          }}
          size="small"
        >
          {(accountList || []).map((acc) => (
            <MenuItem key={acc.account_id} value={acc.account_id}>
              {acc.account_name}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          size="small"
        >
          {Array.from({ length: 10 }, (_, i) => today.year() - 5 + i).map(
            (y) => (
              <MenuItem key={y} value={y}>
                {y}년
              </MenuItem>
            )
          )}
        </Select>

        <Select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          size="small"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <MenuItem key={m} value={m}>
              {m}월
            </MenuItem>
          ))}
        </Select>

        <MDButton variant="gradient" color="info" onClick={handleSave}>
          저장
        </MDButton>
      </MDBox>

      <MDBox pt={1} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card
              sx={{
                height: "calc(98vh - 160px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
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
                    width: "5%",
                  },
                  "& th": {
                    backgroundColor: "#f0f0f0",
                    position: "sticky",
                    zIndex: 10,
                  },
                }}
              >
                <table className="dinersheet-table">
                  <thead>
                    {headerRows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((cell, i) => (
                          <th
                            key={i}
                            colSpan={cell.colSpan || 1}
                            rowSpan={cell.rowSpan || 1}
                            style={{
                              top: rowIdx * 24,
                            }}
                          >
                            {cell.label}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {activeRows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>{dayjs(row.diner_date).format("YYYY-MM-DD")}</td>

                        {visibleColumns.map((key) => {
                          const editable = !["total", "diner_date"].includes(
                            key
                          );
                          const value = row[key] ?? "";
                          const isNumeric = numericCols.includes(key);
                          const style = getCellStyle(rowIndex, key, value);
                          const isSpecial = key === "special_yn";

                          return (
                            <td
                              key={key}
                              contentEditable={editable && !isSpecial}
                              suppressContentEditableWarning
                              style={{ ...style, width: "80px" }}
                              onBlur={(e) => {
                                if (isSpecial) return;

                                let newValue = e.target.innerText.trim();
                                if (isNumeric) newValue = parseNumber(newValue);
                                handleCellChange(rowIndex, key, newValue);
                                if (isNumeric)
                                  e.currentTarget.innerText =
                                    formatNumber(newValue);
                              }}
                            >
                              {isSpecial ? (
                                <select
                                  value={value || "N"}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    handleCellChange(rowIndex, key, newValue);
                                  }}
                                  style={{
                                    width: "100%",
                                    border: "none",
                                    background: "transparent",
                                    textAlign: "center",
                                    ...style,
                                  }}
                                >
                                  <option value="Y">유</option>
                                  <option value="N">무</option>
                                </select>
                              ) : isNumeric ? (
                                formatNumber(value)
                              ) : (
                                value
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
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default DinersNumberSheet;
