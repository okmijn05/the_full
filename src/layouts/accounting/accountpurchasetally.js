import React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import AccountingTab from "examples/Tabs/AccountingTab";

function AccountPurchaseTally() {
  return (
    <DashboardLayout>
      <AccountingTab />
    </DashboardLayout>
  );
}

export default AccountPurchaseTally;