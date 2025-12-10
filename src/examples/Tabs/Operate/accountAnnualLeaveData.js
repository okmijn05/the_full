/* eslint-disable react/function-component-definition */
import { useState } from "react";
import api from "api/api";

// 숫자 파싱
const parseNumber = (value) => {
  if (!value) return 0;
  return Number(String(value).replace(/,/g, "")) || 0;
};

// 숫자 포맷
const formatNumber = (value) => {
  if (!value && value !== 0) return "";
  return Number(value).toLocaleString();
};

export default function useAccountAnnualLeaveData() {
  const [accountMemberRows, setAccountMemberRows] = useState([]);      // 왼쪽
  const [annualLeaveRows, setAnnualLeaveRows] = useState([]);          // 오른쪽
  const [overTimeRows, setOverTimeRows] = useState([]);          // 오른쪽
  const [accountList, setAccountList] = useState([]);                  // 거래처 셀렉트용
  const [loading, setLoading] = useState(false);

  const fetchAccountMemberList = async (account_id) => {
    const params = {};
    if (account_id) params.account_id = account_id;
    params.del_yn = 'N'
    setLoading(true);
    try {
      const res = await api.get("/Operate/AccountMemberAllList",
        { params }
      );
      const rows = (res.data || []).map((item) => ({
        account_id: item.account_id,
        member_id: item.member_id,
        name: item.name,
        position_type: item.position_type,
        contract_type: item.contract_type,
        join_dt: item.join_dt,
        work_system: item.work_system,
        start_time: item.start_time,
        end_time: item.end_time,
      }));
      setAccountMemberRows(rows);
    } catch (err) {
      console.error("AccountMemberAllList 조회 실패:", err);
      setAccountMemberRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnualLeaveList = async (member_id) => {
    const params = {};
    if (member_id) params.member_id = member_id;
    setLoading(true);
    try {
      const res = await api.get("/Operate/AnnualLeaveList",
        { params }
      );
      const rows = (res.data || []).map((item) => ({
        // 필요하면 여기서 PK (예: item.id) 도 같이 넣어두면 좋음
        ledger_id: item.ledger_id,
        member_id: item.member_id || "",
        ledger_dt: item.ledger_dt,
        type: item.type,
        days: item.days,
        reason: item.reason,
      }));
      setAnnualLeaveRows(rows);
    } catch (err) {
      console.error("AnnualLeaveList 조회 실패:", err);
      setAnnualLeaveRows([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverTimeList = async (member_id) => {
    const params = {};
    if (member_id) params.member_id = member_id;
    setLoading(true);
    try {
      const res = await api.get("/Operate/OverTimeList",
        { params }
      );
      const rows = (res.data || []).map((item) => ({
        // 필요하면 여기서 PK (예: item.id) 도 같이 넣어두면 좋음
        over_id: item.over_id,
        member_id: item.member_id || "",
        over_dt: item.over_dt,
        type: item.type,
        times: item.times,
        reason: item.reason,
      }));
      setOverTimeRows(rows);
    } catch (err) {
      console.error("AnnualLeaveList 조회 실패:", err);
      setOverTimeRows([]);
    } finally {
      setLoading(false);
    }
  };

  // AccountList 조회 (검색조건 & 셀렉트박스용)
  const fetchAccountList = async () => {
    try {
      const res = await api.get("/Account/AccountList", {
        params: { account_type: 0 },
      });
      setAccountList(res.data || []);
    } catch (err) {
      console.error("AccountList 조회 실패:", err);
      setAccountList([]);
    }
  };

  return {
    accountMemberRows,
    annualLeaveRows,
    overTimeRows,
    accountList,
    loading,
    fetchAccountMemberList,
    fetchAnnualLeaveList,
    fetchOverTimeList,
    fetchAccountList,
    setAccountMemberRows,
    setAnnualLeaveRows,
    setOverTimeRows,
  };
}

export { parseNumber, formatNumber };
