import React, { useState } from "react";
import { Tabs, Tab, Box, Card, Grid } from "@mui/material";
import MDBox from "components/MDBox";

// 탭용 서브 컴포넌트 import
import HygieneSheetTab from "./Operate/HygieneSheetTab";
import PropertySheetTab from "./Operate/PropertySheetTab";
import RetailBusinessTab from "./Operate/RetailBusinessTab";
import SubRestaurantTab from "./Operate/SubRestaurantTab";
import HandOverSheetTab from "./Operate/HandoverSheetTab";
import AccountMembersFilesTab from "./Operate/AccountMembersFilesTab";

function OperateTabs() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (_, newValue) => setTabIndex(newValue);
  // ✅ 숫자 이모지 아이콘
  const numberIcons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

  const tabLabels = [
    "위생관리",
    "기물관리",
    "거래처관리",
    "대체업체관리",
    "인수인계 관리",
    "면허증 및 자격증 관리"
  ];

  const tabComponents = [
    <HygieneSheetTab key="hygiene" />,
    <PropertySheetTab key="property" />,
    <RetailBusinessTab key="retail" />,
    <SubRestaurantTab key="retail" />,
    <HandOverSheetTab key="handover" />,
    <AccountMembersFilesTab key="account" />,
  ];
  return (
    <Card sx={{ borderRadius: "16px", boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}>
      {/* 탭 상단 */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          backgroundColor: "#f7f7f7",
          borderRadius: "16px 16px 0 0",
          "& .MuiTabs-indicator": {
            backgroundColor: "#ff9800",
            height: "3px",
            borderRadius: "3px",
          },
        }}
      >
        {tabLabels.map((label, index) => (
          <Tab
            key={label}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <span>{numberIcons[index]}</span>
                <span>{label}</span>
              </Box>
            }
            sx={{
              fontSize: "0.8rem",
              minWidth: 120,
              textTransform: "none",
              color: tabIndex === index ? "#ff9800" : "#666",
              fontWeight: "bold",
              transition: "0.2s",
              "&:hover": {
                color: "#ff9800",
                opacity: 0.8,
              },
            }}
          />
        ))}
      </Tabs>

      {/* 탭 내용 */}
      <MDBox p={2}>{tabComponents[tabIndex]}</MDBox>
    </Card>
  );
}

export default OperateTabs;
