/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import DirectTable from "layouts/directmanagement"
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import NewRecordSheet from "layouts/newrecordsheet";
import AccountMemberSheet from "layouts/accountmembersheet";
// 본사
import PeopleCountingManager from "layouts/headoffice/headofficetab";
import WeekMenuManager from "layouts/weekmenusheet";
import EventManager from "layouts/eventsheet";
// 신사업
import Cost from "layouts/analysis/cost";
// 영업
import TeleManager from "layouts/business/telemanager";
import ContractManager from "layouts/accountinfosheet/index";
// 운영
import OperateTab from "layouts/operate/operatetab";
import AccountIssueManager from "layouts/operate/accountissuesheet";
// 회계
//import DeadlineBalance from "examples/Tabs/AccountSales/DeadlineBalanceTab";
import AccountSales from "layouts/accountsales/accountsales";
import PurchaseTally from "layouts/accounting/accountpurchasetally"
// 현장
import TallyManager from "layouts/tallysheet";
import RecordManager from "layouts/recordsheet";
import HandOverManager from "examples/Tabs/Operate/HandoverSheetTab";
// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "본사",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    collapse: [
      {
        type: "collapse",
        name: "관리표",
        key: "account_managerment",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/HeadOffice/PeopleCountingTab",
        component: <PeopleCountingManager />,
      },
      {
        type: "collapse",
        name: "행사",
        key: "event",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/event",
        component: <EventManager />,
      },
      {
        type: "collapse",
        name: "본사 식단표",
        key: "weekmenu",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/weekmenu",
        component: <WeekMenuManager />,
      },
    ]
  },
  {
    type: "collapse",
    name: "영업",
    key: "business",
    icon: <Icon fontSize="small">table_view</Icon>,
    collapse: [
      {
        type: "collapse",
        name: "미수채권",
        key: "account_member",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/accountmembersheet",
        component: <AccountMemberSheet />,
      },
      {
        type: "collapse",
        name: "고객사 정보",
        key: "business",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/accountinfosheet/index",
        component: <ContractManager />,
      },
      {
        type: "collapse",
        name: "고객사 관리",
        key: "business",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/business/telemanager",
        component: <TeleManager />,
      },
    ]
  },
  {
    type: "collapse",
    name: "운영",
    key: "operate",
    icon: <Icon fontSize="small">table_view</Icon>,
    collapse: [
      {
        type: "collapse",
        name: "매입",
        key: "account",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/tables",
        component: <Tables />,
      },
      {
        type: "collapse",
        name: "교육",
        key: "business",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/business/telemanager",
        component: <TeleManager />,
      },
      {
        type: "collapse",
        name: "현장직원 관리",
        key: "account_member",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/accountmembersheet",
        component: <AccountMemberSheet />,
      },
      {
        type: "collapse",
        name: "고객사 관리",
        key: "account_management",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/Operate/OperateTabs",
        component: <OperateTab />,
      },
      {
        type: "collapse",
        name: "고객사 소통",
        key: "business",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/operate/accountissuesheet",
        component: <AccountIssueManager />,
      },
    ]
  },
  {
    type: "collapse",
    name: "회계",
    key: "accounting",
    icon: <Icon fontSize="small">table_view</Icon>,
    collapse: [
      {
        type: "collapse",
        name: "손익 분석표",
        key: "account",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/tables",
        component: <Tables />,
      },
      {
        type: "collapse",
        name: "매출",
        key: "deadline",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/AccountSales/AccountSalesTab",
        component: <AccountSales />,
      },
      {
        type: "collapse",
        name: "매입",
        key: "accounting",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/accounting/purchasetally",
        component: <PurchaseTally />,
      },
    ]
  },
  {
    type: "collapse",
    name: "인사",
    key: "human",
    icon: <Icon fontSize="small">table_view</Icon>,
    collapse: [
      {
        type: "collapse",
        name: "본사 교육",
        key: "account",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/tables",
        component: <Tables />,
      },
      {
        type: "collapse",
        name: "인사평가",
        key: "account_member",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/accountmembersheet",
        component: <AccountMemberSheet />,
      },
      {
        type: "collapse",
        name: "연봉테이블",
        key: "business",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/business/telemanager",
        component: <TeleManager />,
      },
      {
        type: "collapse",
        name: "복리후생",
        key: "business",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/business/telemanager",
        component: <TeleManager />,
      },
      {
        type: "collapse",
        name: "평가/교육 자료",
        key: "business",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/business/telemanager",
        component: <TeleManager />,
      },
    ]
  },
  {
    type: "collapse",
    name: "현장",
    key: "site",
    icon: <Icon fontSize="small">table_view</Icon>,
    collapse: [
      {
        type: "collapse",
        name: "집계표",
        key: "account",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/layouts/tallysheet",
        component: <TallyManager />,
      },
      {
        type: "collapse",
        name: "출근부",
        key: "account_member",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/layouts/recordsheet",
        component: <RecordManager />,
      },
      {
        type: "collapse",
        name: "인수인계",
        key: "hand_over",
        icon: <Icon fontSize="small">*</Icon>,
        route: "/Operate/HandoverSheetTab",
        component: <HandOverManager />,
      },
    ]
  },
  // {
  //   type: "collapse",
  //   name: "급식사업부",
  //   key: "tables",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   collapse: [
  //     {
  //       type: "collapse",
  //       name: "거래처",
  //       key: "account",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/tables",
  //       component: <Tables />,
  //     },
  //     {
  //       type: "collapse",
  //       name: "직원관리",
  //       key: "account_member",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/accountmembersheet",
  //       component: <AccountMemberSheet />,
  //     },
  //     {
  //       type: "collapse",
  //       name: "영업관리",
  //       key: "business",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/business/telemanager",
  //       component: <TeleManager />,
  //     },
  //     {
  //       type: "collapse",
  //       name: "운영관리",
  //       key: "operate",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/operate/tallysheet",
  //       component: <TallyManager />,
  //     },
  //   ]
  // },
  // {
  //   type: "collapse",
  //   name: "신사업팀",
  //   key: "new_business",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   collapse: [
  //     {
  //       type: "collapse",
  //       name: "신사업관리",
  //       key: "new_business_management",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/tables",
  //       component: <Tables />,
  //     },
  //     {
  //       type: "collapse",
  //       name: "근태관리",
  //       key: "newrecordsheet",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/newrecordsheet",
  //       component: <NewRecordSheet />,
  //     },
  //     {
  //       name: "통계 / 분석",
  //       key: "analysis",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/analysis/cost",
  //       component: <Cost />,
  //     },
  //     {
  //       name: "직영점",
  //       key: "direct_store",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/directmanagement",
  //       component: <DirectTable />,
  //     },
  //     {
  //       name: "가맹점",
  //       key: "franchise_store",
  //       icon: <Icon fontSize="small">*</Icon>,
  //       route: "/tables",
  //       component: <Tables />,
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
  //   route: "/rtl",
  //   component: <RTL />,
  // },
  // {
  //   type: "collapse",
  //   name: "Notifications",
  //   key: "notifications",
  //   icon: <Icon fontSize="small">notifications</Icon>,
  //   route: "/notifications",
  //   component: <Notifications />,
  // },
  // {
  //   type: "collapse",
  //   name: "Profile",
  //   key: "profile",
  //   icon: <Icon fontSize="small">person</Icon>,
  //   route: "/profile",
  //   component: <Profile />,
  // },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
