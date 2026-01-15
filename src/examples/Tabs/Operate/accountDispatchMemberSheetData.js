/* eslint-disable react/function-component-definition */
import { useState, useEffect } from "react";
import api from "api/api";

const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  return Number(String(value).replace(/,/g, "")) || 0;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return Number(value).toLocaleString();
};

// ✅ year, month 파라미터 추가
export default function useAccountDispatchMembersheetData(account_id, activeStatus, year, month) {
  const [activeRows, setActiveRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccountMembersAllList = async (opts = { snapshot: true }) => {
    const params = {};
    if (account_id) params.account_id = account_id;
    if (activeStatus) params.del_yn = activeStatus;
    if (year) params.year = year;
    if (month) params.month = month;

    setLoading(true);
    const start = Date.now();

    try {
      const res = await api.get("/Operate/AccountDispatchMemberAllList", { params });

      // ✅ 같은 member_id가 여러 행으로 내려오는 경우가 있으므로 합치기
      //    key: account_id + member_id 기준으로 머지
      const mergedMap = new Map();
      (res.data || []).forEach((item) => {
        const key = `${item.account_id}-${item.member_id}`;
        const prev = mergedMap.get(key) || {};
        // 뒤에 오는 값이 덮어쓰되, 날짜 컬럼(숫자키)도 누적되게 merge
        mergedMap.set(key, { ...prev, ...item });
      });

      const rows = Array.from(mergedMap.values()).map((item) => {
        // ✅ 날짜 컬럼("1","1Salary"...) 보존하려면 item을 그대로 포함
        const row = {
          ...item,

          account_id: item.account_id,
          member_id: item.member_id,
          account_name: item.account_name,

          name: item.name,
          rrn: item.rrn,
          bank_name: item.bank_name,
          account_number: item.account_number,

          del_yn: item.del_yn,
          del_dt: item.del_dt,
          note: item.note,
          type: item.type,

          // 숫자 정리
          work_cnt: parseNumber(item.work_cnt),
          salary_sum: parseNumber(item.salary_sum),
        };

        // ✅ 혹시 백엔드가 어떤 날짜키는 안 내려줄 수도 있으니 1~31을 null로 안전하게 세팅
        for (let d = 1; d <= 31; d += 1) {
          const dayKey = String(d);
          const salKey = `${d}Salary`;
          if (!(dayKey in row)) row[dayKey] = null;
          if (!(salKey in row)) row[salKey] = null;
          // salary는 숫자 형태로 정리
          if (row[salKey] !== null && row[salKey] !== undefined && row[salKey] !== "") {
            row[salKey] = parseNumber(row[salKey]);
          }
        }

        return row;
      });

      setActiveRows(rows);
      if (opts.snapshot) setOriginalRows(rows);
      return rows;
    } catch (err) {
      console.error("AccountDispatchMemberAllList 조회 실패:", err);
      setActiveRows([]);
      if (opts.snapshot) setOriginalRows([]);
      return [];
    } finally {
      const elapsed = Date.now() - start;
      const remain = Math.max(0, 1000 - elapsed);
      setTimeout(() => setLoading(false), remain);
    }
  };

  useEffect(() => {
    api
      .get("/Account/AccountList", { params: { account_type: "0" } })
      .then((res) => {
        const rows = (res.data || []).map((item) => ({
          account_id: item.account_id,
          account_name: item.account_name,
        }));
        setAccountList(rows);
      })
      .catch((err) => console.error("거래처(AccountList) 조회 실패:", err));
  }, []);

  return {
    activeRows,
    setActiveRows,
    originalRows,
    setOriginalRows,
    accountList,
    fetchAccountMembersAllList,
    loading,
  };
}

export { parseNumber, formatNumber };
