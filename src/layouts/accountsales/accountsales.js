import React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import AccountSalesTab from "examples/Tabs/AccountSalesTab";

function AccountSales() {
  return (
    <DashboardLayout>
      <AccountSalesTab />
    </DashboardLayout>
  );
}

export default AccountSales;