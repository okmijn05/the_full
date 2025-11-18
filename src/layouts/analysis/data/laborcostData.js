import { useState, useEffect } from "react";
import axios from "axios";

// 숫자 파싱 & 포맷
export const parseNumber = (val) => {
  if (!val) return 0;
  const num = Number(String(val).replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
};

export const formatNumber = (val) => {
  if (val === null || val === undefined) return "";
  return new Intl.NumberFormat().format(val);
};

// 데이터 훅
function useAnalysisData(apiUrl) {
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);

  useEffect(() => {
    axios
      .get(apiUrl)
      .then((res) => {
        const data = res.data || [];
        setRows(data);
        setOriginalRows(data);
      })
      .catch((err) => console.error("데이터 로드 실패:", err));
  }, [apiUrl]);

  const saveData = () => {
    axios
      .post(apiUrl + "/save", rows)
      .then(() => {
        alert("저장 성공!");
        setOriginalRows([...rows]);
      })
      .catch((err) => console.error("저장 실패:", err));
  };

  return { rows, setRows, originalRows, saveData };
}

export default useAnalysisData;
