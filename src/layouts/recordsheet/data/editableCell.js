/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

export const parseNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  return Number(String(value).replace(/,/g, "")) || 0;
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const num = Number(String(value).replace(/,/g, ""));
  return isNaN(num) ? value : num.toLocaleString();
};

export const EditableCell = ({ getValue, row, column, table }) => {
  const rawValue = getValue();
  const [val, setVal] = useState(formatNumber(rawValue));

  const onChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
    setVal(formatNumber(onlyNums));
  };

  const onBlur = () => {
    const numericVal = parseNumber(val);
    // react-table의 meta.updateData 사용
    table.options.meta?.updateData(row.index, column.id, numericVal);
    setVal(formatNumber(numericVal));
  };

  useEffect(() => {
    setVal(formatNumber(rawValue));
  }, [rawValue]);

  return (
    <input
      value={val}
      onChange={onChange}
      onBlur={onBlur}
      style={{
        width: "100%",
        textAlign: "center",
        border: "none",
        background: "transparent",
        fontFamily: "Roboto, Helvetica, Arial, sans-serif",
        fontSize: "0.75rem",
      }}
    />
  );
};

EditableCell.propTypes = {
  getValue: PropTypes.func.isRequired,
  row: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
};
