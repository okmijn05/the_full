// src/layouts/account/AccountPurchaseDeadlineTab.js
/* eslint-disable react/function-component-definition */
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Grid,
  TextField,
  useTheme,
  useMediaQuery,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";

import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

import DownloadIcon from "@mui/icons-material/Download";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import LoadingScreen from "layouts/loading/loadingscreen";
import Swal from "sweetalert2";
import api from "api/api";
import { API_BASE_URL } from "config";
import ExcelJS from "exceljs";
import useAccountPurchaseDeadlineData from "./accountPurchaseDeadlineData";

function AccountPurchaseDeadlineTab() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 🔹 오늘 날짜 (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);

  // ✅ 조회조건 상태
  const [filters, setFilters] = useState({
    type: "1", // 타입
    fromDate: todayStr,
    toDate: todayStr,
    account_id: "", // 거래처 (account_id)
    payType: "1", // 조회구분
  });

  // 🔹 상단 거래처(사업장) select용 리스트
  const [accountList, setAccountList] = useState([]);

  // ✅ 데이터 훅 사용
  const { rows, setRows, originalRows, loading, fetchPurchaseList } = useAccountPurchaseDeadlineData();

  // =========================================
  // ✅ 금액 키들: 화면에는 콤마, 저장은 콤마 제거
  // =========================================
  const MONEY_KEYS = useMemo(() => ["vat", "taxFree", "tax", "total", "totalCash", "totalCard"], []);


  const stripComma = useCallback((v) => {
    if (v === null || v === undefined) return "";
    // 콤마/공백 제거
    return String(v).replace(/,/g, "").replace(/\s+/g, "").trim();
  }, []);

  const formatComma = useCallback(
    (v) => {
      const raw = stripComma(v);
      if (raw === "") return "";

      // 숫자만 남기고 싶으면 아래 정규식 사용(필요시)
      // const cleaned = raw.replace(/[^\d.-]/g, "");
      // const num = Number(cleaned);

      const num = Number(raw);
      if (!Number.isFinite(num)) return String(v); // 숫자 변환 실패 시 원본 유지
      return num.toLocaleString("ko-KR");
    },
    [stripComma]
  );

  // ✅ 조회 결과가 들어오면 금액 필드에 콤마 적용(초기 표시용)
  useEffect(() => {
    if (!rows) return;
    if (!Array.isArray(rows) || rows.length === 0) return;

    const formatted = rows.map((r) => {
      const nr = { ...r };
      MONEY_KEYS.forEach((k) => {
        nr[k] = formatComma(nr[k]);
      });
      return nr;
    });

    const changed = formatted.some((r, i) =>
      MONEY_KEYS.some((k) => String(r?.[k] ?? "") !== String(rows?.[i]?.[k] ?? ""))
    );

    if (changed) setRows(formatted);
  }, [rows, setRows, MONEY_KEYS, formatComma]);

  // ✅ 최초 로딩: 거래처 목록 조회 + 첫 번째 거래처 자동 선택 & 자동 조회
  // ⚠️ fetchPurchaseList가 매 렌더마다 참조가 바뀔 수 있어 dependency 걸면 무한루프 가능 -> initRef로 1회만 실행
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    api
      .get("/Account/AccountList", { params: { account_type: "0" } })
      .then((res) => {
        const list = (res.data || []).map((item) => ({
          account_id: item.account_id,
          account_name: item.account_name,
        }));
        setAccountList(list);

        if (list.length > 0) {
          const firstId = list[0].account_id;
          const next = { ...filters, account_id: firstId };

          // ✅ state 반영
          setFilters(next);

          // ✅ 조회
          fetchPurchaseList(next);
        }
      })
      .catch((err) => console.error("데이터 조회 실패 (AccountList):", err));
  }, []); // ✅ 의도적으로 1회만

  // ✅ 조회조건 변경
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "account_id") fetchPurchaseList(next);
      return next;
    });
  };

  // ✅ 조회 버튼 클릭 (다른 조건 변경 후 수동조회)
  const handleSearch = async () => {
    try {
      await fetchPurchaseList(filters);
    } catch (e) {
      Swal.fire("오류", e.message, "error");
    }
  };

  // ✅ 변경 감지 스타일
  const normalize = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : value);

  const getCellStyle = (rowIndex, key, value) => {
    const original = originalRows[rowIndex]?.[key];

    // ✅ 금액 컬럼은 콤마 제외하고 비교
    if (MONEY_KEYS.includes(key)) {
      const a = stripComma(original);
      const b = stripComma(value);
      return a !== b ? { color: "red" } : { color: "black" };
    }

    if (typeof original === "string" && typeof value === "string") {
      return normalize(original) !== normalize(value) ? { color: "red" } : { color: "black" };
    }
    return original !== value ? { color: "red" } : { color: "black" };
  };

  const handleCellChange = (rowIndex, key, value) => {
    setRows((prev) => prev.map((r, i) => (i === rowIndex ? { ...r, [key]: value } : r)));
  };

  const tableSx = {
    flex: 1,
    minHeight: 0,
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: isMobile ? "calc(100vh - 260px)" : "75vh",
    "& table": {
      borderCollapse: "separate",
      width: "max-content",
      minWidth: "100%",
      borderSpacing: 0,
    },
    "& th, & td": {
      border: "1px solid #686D76",
      textAlign: "center",
      padding: "4px",
      whiteSpace: "pre-wrap",
      fontSize: "12px",
      verticalAlign: "middle",
    },
    "& th": {
      backgroundColor: "#fef6e4",
      position: "sticky",
      borderCollapse: "separate",
      top: 43,
      zIndex: 2,
    },
    "& input[type='text'], & input[type='date']": {
      fontSize: "12px",
      padding: "4px",
      border: "none",
      background: "transparent",
      textAlign: "center",
    },
  };

  const columns = useMemo(
    () => [
      { header: "사업장", accessorKey: "account_name", size: 120 },
      { header: "날짜", accessorKey: "saleDate", size: 100 },
      { header: "구매처", accessorKey: "name", size: 180 },
      { header: "부가세", accessorKey: "vat", size: 80 },
      { header: "면세", accessorKey: "taxFree", size: 80 },
      { header: "과세", accessorKey: "tax", size: 80 },
      { header: "구분(현금,카드)", accessorKey: "payType", size: 90 },
      { header: "현금합계", accessorKey: "totalCash", size: 80 },
      { header: "카드합계", accessorKey: "totalCard", size: 80 },
      { header: "합계", accessorKey: "total", size: 80 },
      { header: "증빙자료사진", accessorKey: "receipt_image", size: 200 },
      { header: "기타", accessorKey: "note", size: 200 },
    ],
    []
  );

  // =========================
  // ✅ URL 조립(이미 절대경로면 그대로, 아니면 API_BASE_URL 붙임)
  // =========================
  const buildFileUrl = useCallback((path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const base = String(API_BASE_URL || "").replace(/\/+$/, "");
    const p = String(path).startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
  }, []);

  // 🔹 증빙자료 없을 때 클릭 시 안내
  const handleNoImageAlert = () => {
    Swal.fire("이미지 없음", "등록된 증빙자료가 없습니다.", "warning");
  };

  // ✅ 다운로드
  const handleDownload = useCallback(
    (path) => {
      if (!path || typeof path !== "string") return;
      const url = buildFileUrl(path);
      const filename = path.split("/").pop() || "download";

      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [buildFileUrl]
  );

  // ============================================================
  // ✅ 떠있는 창(윈도우) 미리보기: 뒤 테이블 입력 가능
  // ============================================================
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const viewerNodeRef = useRef(null);

  const imageItems = useMemo(() => {
    return (rows || [])
      .filter((r) => !!r?.receipt_image)
      .map((r) => ({
        path: r.receipt_image,
        src: buildFileUrl(r.receipt_image),
        title: `${r.name || ""} ${r.saleDate || ""}`.trim(),
      }));
  }, [rows, buildFileUrl]);

  const handleViewImage = useCallback(
    (path) => {
      if (!path) return;
      const idx = imageItems.findIndex((x) => x.path === path);
      setViewerIndex(idx >= 0 ? idx : 0);
      setViewerOpen(true);
    },
    [imageItems]
  );

  const handleCloseViewer = useCallback(() => setViewerOpen(false), []);

  const goPrev = useCallback(() => {
    setViewerIndex((i) => (imageItems.length ? (i - 1 + imageItems.length) % imageItems.length : 0));
  }, [imageItems.length]);

  const goNext = useCallback(() => {
    setViewerIndex((i) => (imageItems.length ? (i + 1) % imageItems.length : 0));
  }, [imageItems.length]);

  useEffect(() => {
    if (!viewerOpen) return;
    if (!imageItems.length) {
      setViewerIndex(0);
      return;
    }
    if (viewerIndex > imageItems.length - 1) setViewerIndex(imageItems.length - 1);
  }, [viewerOpen, imageItems.length, viewerIndex]);

  useEffect(() => {
    if (!viewerOpen) return;

    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || e.target?.isContentEditable;
      if (isTyping) return;

      if (e.key === "Escape") handleCloseViewer();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewerOpen, goPrev, goNext, handleCloseViewer]);

  const currentImg = imageItems[viewerIndex];

  // ============================================================
  // ✅ 저장: 수정된 행만 /Account/AccountPurchaseSave 로 전송
  //    - 금액 항목 콤마 제거해서 전송
  // ============================================================
  const SAVE_KEYS = useMemo(
    () => ["saleDate", "name", "vat", "taxFree", "tax", "payType", "totalCash", "totalCard", "total", "receipt_image", "note"],
    []
  );

  const isRowChanged = useCallback(
    (orig, cur) =>
      SAVE_KEYS.some((k) => {
        const a = orig?.[k];
        const b = cur?.[k];

        // ✅ 금액 컬럼은 콤마 제외하고 비교
        if (MONEY_KEYS.includes(k)) return stripComma(a) !== stripComma(b);

        if (typeof a === "string" && typeof b === "string") return normalize(a) !== normalize(b);
        return a !== b;
      }),
    [SAVE_KEYS, MONEY_KEYS, stripComma]
  );

  const buildRowForSave = useCallback(
    (r) => {
      const user_id = localStorage.getItem("user_id") || "";
      const next = { ...r };

      // 화면용 컬럼 제거(백엔드 필요없으면)
      delete next.account_name;

      // ✅ 금액은 콤마 제거해서 저장 payload에 넣기
      MONEY_KEYS.forEach((k) => {
        const raw = stripComma(next[k]);
        // 빈 값이면 0으로(원하면 "" 또는 null로 바꿔도 됨)
        next[k] = raw === "" ? 0 : raw;
      });

      // 혹시 row에 account_id 없으면 필터값으로 보강
      if (!next.account_id) next.account_id = filters.account_id;

      // 사용자/조건 정보 보강(백엔드에서 필요할 수 있음)
      next.user_id = next.user_id || user_id;
      next.type = next.type || filters.type;

      return next;
    },
    [filters, MONEY_KEYS, stripComma]
  );

  const handleSave = useCallback(async () => {
    try {
      const modified = (rows || [])
        .map((r, idx) => {
          const o = originalRows?.[idx];
          if (!o) return null;
          return isRowChanged(o, r) ? buildRowForSave(r) : null;
        })
        .filter(Boolean);

      if (modified.length === 0) {
        return Swal.fire("안내", "변경된 내용이 없습니다.", "info");
      }

      Swal.fire({
        title: "저장 중...",
        text: "잠시만 기다려 주세요.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await api.post("/Account/AccountPurchaseSave", modified, {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      });

      Swal.close();

      const ok = res?.status === 200 || res?.data?.code === 200;
      if (!ok) {
        return Swal.fire("실패", res?.data?.message || "저장에 실패했습니다.", "error");
      }

      Swal.fire("성공", "저장되었습니다.", "success");

      // ✅ 저장 후 재조회(원본/현재 동기화)
      await fetchPurchaseList(filters);
    } catch (e) {
      Swal.close();
      Swal.fire("오류", e?.message || "저장 중 오류가 발생했습니다.", "error");
    }
  }, [rows, originalRows, isRowChanged, buildRowForSave, fetchPurchaseList, filters]);

  // -----------------------------
  // ✅ 엑셀 다운로드(메뉴 + 세금계산서)
  // -----------------------------
  const [excelAnchorEl, setExcelAnchorEl] = useState(null);
  const excelMenuOpen = Boolean(excelAnchorEl);

  const handleExcelMenuOpen = (e) => setExcelAnchorEl(e.currentTarget);
  const handleExcelMenuClose = () => setExcelAnchorEl(null);

  const parseNumber = (v) => {
    if (v === null || v === undefined) return 0;
    const n = Number(String(v).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : 0;
  };

  const payTypeText = (v) => (String(v) === "2" ? "카드" : "현금");

  const getAccountName = () => {
    const found = accountList.find((a) => a.account_id === filters.account_id);
    return found?.account_name || "";
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadTaxInvoiceExcel = async () => {
    if (!rows || rows.length === 0) {
      Swal.fire("다운로드 불가", "다운로드할 데이터가 없습니다.", "warning");
      return;
    }

    const buyer = {
      bizNo: "000-00-00000", // TODO
      name: getAccountName() || "공급받는자(사업장)",
      ceoName: "대표자명", // TODO
    };

    const safeSheetName = (s) =>
      String(s || "세금계산서")
        .replace(/[\[\]\*\/\\\?\:]/g, " ")
        .trim()
        .slice(0, 31) || "세금계산서";

    const calcTaxableSupply = (r) => {
      const total = parseNumber(r.total);
      const vat = parseNumber(r.vat);
      const taxFree = parseNumber(r.taxFree);
      const supply = total - vat - taxFree;
      return supply > 0 ? supply : 0;
    };

    const groups = new Map();
    rows.forEach((r) => {
      const supplierBizNo = (r.bizNo || "").trim();
      const supplierName = (r.name || "").trim();
      const key = `${supplierBizNo}__${supplierName}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(r);
    });

    const wb = new ExcelJS.Workbook();
    wb.creator = "THEFULL";

    const listWs = wb.addWorksheet("목록");
    listWs.addRow(["공급자 사업자번호", "공급자 상호", "기간", "건수", "공급가액(과세)", "세액", "면세", "합계"]);
    listWs.getRow(1).font = { bold: true };

    for (const [key, items] of groups.entries()) {
      const [supplierBizNo, supplierName] = key.split("__");
      const supplierCeo = items[0]?.ceo_name || "";

      items.sort((a, b) => String(a.saleDate || "").localeCompare(String(b.saleDate || "")));

      const ws = wb.addWorksheet(safeSheetName(`${supplierName || "공급자"}_세금계산서`));

      ws.mergeCells("A1:I1");
      ws.getCell("A1").value = "세 금 계 산 서 (출력/보관용)";
      ws.getCell("A1").font = { bold: true, size: 16 };
      ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

      const label = (addr, text) => {
        ws.getCell(addr).value = text;
        ws.getCell(addr).font = { bold: true };
        ws.getCell(addr).alignment = { horizontal: "center", vertical: "middle" };
        ws.getCell(addr).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        ws.getCell(addr).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2CC" } };
      };
      const box = (addr, text) => {
        ws.getCell(addr).value = text;
        ws.getCell(addr).alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        ws.getCell(addr).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      };

      label("A3", "공급자");
      label("A4", "사업자번호");
      box("B4", supplierBizNo);
      label("A5", "상호(명칭)");
      box("B5", supplierName);
      label("A6", "대표자");
      box("B6", supplierCeo);

      label("E3", "공급받는자");
      label("E4", "사업자번호");
      box("F4", buyer.bizNo);
      label("E5", "상호(명칭)");
      box("F5", buyer.name);
      label("E6", "대표자");
      box("F6", buyer.ceoName);

      label("A8", "조회기간");
      box("B8", `${filters.fromDate} ~ ${filters.toDate}`);
      label("E8", "조회구분");
      box("F8", payTypeText(filters.payType));

      const headerRowIndex = 10;
      const headers = ["일자", "품목(집계)", "수량", "단가", "공급가액(과세)", "세액", "면세", "합계", "비고"];
      ws.getRow(headerRowIndex).values = headers;
      ws.getRow(headerRowIndex).font = { bold: true };
      ws.getRow(headerRowIndex).alignment = { horizontal: "center", vertical: "middle" };
      ws.getRow(headerRowIndex).height = 18;

      headers.forEach((_, i) => {
        const c = ws.getRow(headerRowIndex).getCell(i + 1);
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2CC" } };
        c.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      let supplySum = 0;
      let vatSum = 0;
      let taxFreeSum = 0;
      let totalSum = 0;

      items.forEach((r) => {
        const supply = calcTaxableSupply(r);
        const vat = parseNumber(r.vat);
        const taxFree = parseNumber(r.taxFree);
        const total = parseNumber(r.total);

        supplySum += supply;
        vatSum += vat;
        taxFreeSum += taxFree;
        totalSum += total;

        ws.addRow([r.saleDate ?? "", "매입집계", "", "", supply, vat, taxFree, total, r.note ?? ""]);
      });

      ws.addRow(["", "합계", "", "", supplySum, vatSum, taxFreeSum, totalSum, ""]);

      ws.columns = [
        { width: 12 },
        { width: 14 },
        { width: 8 },
        { width: 10 },
        { width: 16 },
        { width: 12 },
        { width: 12 },
        { width: 14 },
        { width: 30 },
      ];

      ws.eachRow((row, rowNumber) => {
        if (rowNumber < headerRowIndex) return;
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
          if ([5, 6, 7, 8].includes(colNumber)) cell.numFmt = "#,##0";
        });
      });

      listWs.addRow([
        supplierBizNo,
        supplierName,
        `${filters.fromDate}~${filters.toDate}`,
        items.length,
        supplySum,
        vatSum,
        taxFreeSum,
        totalSum,
      ]);
    }

    for (let r = 2; r <= listWs.rowCount; r += 1) {
      [5, 6, 7, 8].forEach((c) => (listWs.getCell(r, c).numFmt = "#,##0"));
    }
    listWs.columns = [
      { width: 16 },
      { width: 22 },
      { width: 24 },
      { width: 8 },
      { width: 16 },
      { width: 12 },
      { width: 12 },
      { width: 14 },
    ];

    const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `세금계산서_출력용_${getAccountName() || "전체"}_${filters.fromDate}_${filters.toDate}_${ymd}.xlsx`;

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    downloadBlob(blob, filename);
  };

  const handleExcelDownload = async (type) => {
    handleExcelMenuClose();

    if (type === "taxInvoice") {
      await downloadTaxInvoiceExcel();
      return;
    }

    Swal.fire("준비중", "현재는 세금계산서만 먼저 구현되어 있어요.", "info");
  };

  if (loading) return <LoadingScreen />;

  return (
    <>
      {/* 🔹 조회조건 영역 */}
      <MDBox
        display="flex"
        flexWrap={isMobile ? "wrap" : "nowrap"}
        flexDirection={isMobile ? "column" : "row"}
        justifyContent={isMobile ? "flex-start" : "flex-end"}
        alignItems={isMobile ? "stretch" : "center"}
        gap={isMobile ? 1 : 1}
        my={1}
        mx={1}
        sx={{
          position: "sticky",
          top: 75,
          zIndex: 10,
          backgroundColor: "#ffffff",
          padding: isMobile ? 1 : 2,
          borderRadius: isMobile ? 1 : 2,
        }}
      >
        <TextField
          select
          label="타입"
          size="small"
          name="type"
          onChange={handleFilterChange}
          sx={{ minWidth: isMobile ? 100 : 120 }}
          SelectProps={{ native: true }}
          value={filters.type}
        >
          <option value="1">위탁급식</option>
          <option value="2">도소매</option>
          <option value="3">프랜차이즈</option>
          <option value="4">산업체</option>
        </TextField>

        <TextField
          select
          label="조회구분"
          size="small"
          name="payType"
          onChange={handleFilterChange}
          sx={{ minWidth: isMobile ? 100 : 120 }}
          SelectProps={{ native: true }}
          value={filters.payType}
        >
          <option value="1">현금</option>
          <option value="2">카드</option>
        </TextField>

        <TextField
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleFilterChange}
          size="small"
          label="조회기간(From)"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: isMobile ? 100 : 120 }}
        />

        <TextField
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleFilterChange}
          size="small"
          label="조회기간(To)"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: isMobile ? 100 : 120 }}
        />

        {/* 🔹 거래처(사업장) select */}
        <TextField
          select
          label="거래처"
          size="small"
          name="account_id"
          onChange={handleFilterChange}
          sx={{ minWidth: isMobile ? 120 : 150 }}
          SelectProps={{ native: true }}
          value={filters.account_id}
        >
          {accountList.length === 0 ? (
            <option value="">사업장 선택</option>
          ) : (
            accountList.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.account_name}
              </option>
            ))
          )}
        </TextField>

        <MDButton
          variant="gradient"
          color="info"
          onClick={handleSearch}
          sx={{ minWidth: isMobile ? 90 : 100, fontSize: isMobile ? "11px" : "13px" }}
        >
          조회
        </MDButton>

        {/* ✅ 저장 버튼 */}
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleSave}
          sx={{ minWidth: isMobile ? 90 : 100, fontSize: isMobile ? "11px" : "13px" }}
        >
          저장
        </MDButton>

        {/* ✅ 엑셀다운로드 */}
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleExcelMenuOpen}
          sx={{ minWidth: isMobile ? 90 : 110, fontSize: isMobile ? "11px" : "13px" }}
        >
          엑셀다운로드
        </MDButton>

        <Menu anchorEl={excelAnchorEl} open={excelMenuOpen} onClose={handleExcelMenuClose}>
          <MenuItem onClick={() => handleExcelDownload("taxInvoice")}>세금계산서</MenuItem>
          <MenuItem onClick={() => handleExcelDownload("invoice")}>계산서</MenuItem>
          <MenuItem onClick={() => handleExcelDownload("simple")}>간이과세</MenuItem>
        </Menu>

        <MDButton
          variant="gradient"
          color="info"
          sx={{ minWidth: isMobile ? 70 : 90, fontSize: isMobile ? "11px" : "13px" }}
        >
          인쇄
        </MDButton>
      </MDBox>

      {/* 🔹 테이블 */}
      <MDBox pt={0} pb={2} sx={tableSx}>
        <MDBox
          py={1}
          px={1}
          pt={1}
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ position: "sticky", top: 0, zIndex: 3 }}
        >
          <MDTypography variant="h6" color="white">
            매입 집계용
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <table>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.accessorKey} style={{ minWidth: col.size }}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} style={{ textAlign: "center", padding: "12px" }}>
                      데이터가 없습니다. 조회 조건을 선택한 후 [조회] 버튼을 눌러주세요.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col) => {
                        const key = col.accessorKey;
                        const value = row[key] ?? "";

                        // 🔹 payType 컬럼 select
                        if (key === "payType") {
                          return (
                            <td
                              key={key}
                              style={{
                                ...getCellStyle(rowIndex, key, value),
                                width: `${col.size}px`,
                              }}
                            >
                              <select
                                value={value}
                                onChange={(e) => handleCellChange(rowIndex, key, e.target.value)}
                                style={{
                                  fontSize: "12px",
                                  border: "none",
                                  background: "transparent",
                                  textAlign: "center",
                                  width: "100%",
                                }}
                              >
                                <option value="1">현금</option>
                                <option value="2">카드</option>
                              </select>
                            </td>
                          );
                        }

                        // 🔹 증빙자료사진
                        if (key === "receipt_image") {
                          const hasImage = !!value;

                          return (
                            <td
                              key={key}
                              style={{
                                ...getCellStyle(rowIndex, key, value),
                                width: `${col.size}px`,
                              }}
                            >
                              <Box display="flex" justifyContent="center" alignItems="center" gap={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={hasImage ? () => handleDownload(value) : handleNoImageAlert}
                                  color={hasImage ? "primary" : "error"}
                                  sx={{ padding: "3px", lineHeight: 0 }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={hasImage ? () => handleViewImage(value) : handleNoImageAlert}
                                  color={hasImage ? "primary" : "error"}
                                  sx={{ padding: "3px", lineHeight: 0 }}
                                >
                                  <ImageSearchIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </td>
                          );
                        }

                        // 🔹 기본 텍스트 / 수정 가능 셀
                        return (
                          <td
                            key={key}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const text = e.target.innerText;

                              // ✅ 금액이면 입력 후 콤마 자동 적용
                              if (MONEY_KEYS.includes(key)) {
                                const formatted = formatComma(text);
                                handleCellChange(rowIndex, key, formatted);
                                // contentEditable에 즉시 반영(커서 이슈 방지용)
                                // eslint-disable-next-line no-param-reassign
                                e.target.innerText = formatted;
                                return;
                              }

                              handleCellChange(rowIndex, key, text);
                            }}
                            style={{
                              ...getCellStyle(rowIndex, key, value),
                              width: `${col.size}px`,
                            }}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Grid>
        </Grid>
      </MDBox>

      {/* ========================= ✅ 떠있는 창 미리보기 ========================= */}
      {viewerOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            pointerEvents: "none",
          }}
        >
          <Draggable
            nodeRef={viewerNodeRef}
            handle="#receipt-viewer-titlebar"
            bounds="parent"
            cancel={'button, a, input, textarea, select, img, [contenteditable="true"]'}
          >
            <Paper
              ref={viewerNodeRef}
              sx={{
                position: "absolute",
                top: 120,
                left: 120,
                m: 0,
                width: "450px",
                height: "650px",
                maxWidth: "95vw",
                maxHeight: "90vh",
                borderRadius: 1.2,
                border: "1px solid rgba(0,0,0,0.25)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                overflow: "hidden",
                resize: "both",
                pointerEvents: "auto",
                backgroundColor: "#000",
              }}
            >
              {/* 타이틀바 */}
              <Box
                id="receipt-viewer-titlebar"
                sx={{
                  height: 42,
                  bgcolor: "#1b1b1b",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  cursor: "move",
                  userSelect: "none",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    flex: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    pr: 1,
                  }}
                >
                  {currentImg?.title || "영수증 미리보기"}
                  {imageItems.length ? `  (${viewerIndex + 1}/${imageItems.length})` : ""}
                </Typography>

                <Tooltip title="이전(←)">
                  <span>
                    <IconButton
                      size="small"
                      sx={{ color: "#fff" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                      }}
                      disabled={imageItems.length <= 1}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="다음(→)">
                  <span>
                    <IconButton
                      size="small"
                      sx={{ color: "#fff" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                      }}
                      disabled={imageItems.length <= 1}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="새 탭으로 열기">
                  <span>
                    <IconButton
                      size="small"
                      sx={{ color: "#fff" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const src = currentImg?.src;
                        if (src) window.open(src, "_blank", "noopener,noreferrer");
                      }}
                      disabled={!currentImg?.src}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="다운로드">
                  <span>
                    <IconButton
                      size="small"
                      sx={{ color: "#fff" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const path = currentImg?.path;
                        if (path) handleDownload(path);
                      }}
                      disabled={!currentImg?.path}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="닫기(ESC)">
                  <IconButton
                    size="small"
                    sx={{ color: "#fff" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseViewer();
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* 컨텐츠 */}
              <Box sx={{ height: "calc(100% - 42px)", bgcolor: "#000", position: "relative" }}>
                {currentImg?.src ? (
                  <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={6}
                    centerOnInit
                    wheel={{ step: 0.12 }}
                    doubleClick={{ mode: "zoomIn" }}
                  >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <>
                        <Box
                          sx={{
                            position: "absolute",
                            right: 10,
                            top: 10,
                            zIndex: 3,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Tooltip title="확대">
                            <IconButton size="small" onClick={zoomIn} sx={{ bgcolor: "rgba(255,255,255,0.15)" }}>
                              <ZoomInIcon sx={{ color: "#fff" }} fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="축소">
                            <IconButton size="small" onClick={zoomOut} sx={{ bgcolor: "rgba(255,255,255,0.15)" }}>
                              <ZoomOutIcon sx={{ color: "#fff" }} fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="리셋">
                            <IconButton size="small" onClick={resetTransform} sx={{ bgcolor: "rgba(255,255,255,0.15)" }}>
                              <RestartAltIcon sx={{ color: "#fff" }} fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <TransformComponent
                          wrapperStyle={{ width: "100%", height: "100%" }}
                          contentStyle={{ width: "100%", height: "100%" }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src={currentImg.src}
                              alt="미리보기"
                              onError={() => {
                                Swal.fire("미리보기 실패", "이미지 경로 또는 서버 응답을 확인해주세요.", "error");
                              }}
                              style={{ maxWidth: "95%", maxHeight: "95%", userSelect: "none" }}
                            />
                          </Box>
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                ) : (
                  <Typography sx={{ color: "#fff", p: 2 }}>이미지가 없습니다.</Typography>
                )}
              </Box>
            </Paper>
          </Draggable>
        </Box>
      )}
    </>
  );
}

export default AccountPurchaseDeadlineTab;
