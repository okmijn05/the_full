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

import { useState, useEffect, useMemo } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";
import themeDarkRTL from "assets/theme-dark/theme-rtl";

// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

// 화면등록
import TallySheet from "layouts/tallysheet";
import RecordSheet from "layouts/recordsheet";
import MemberSheet from "layouts/membersheet";
import DinersNumberSheet from "layouts/dinersnumbersheet";
import PropertySheet from "layouts/propertysheet";
import AccountInfoSheet from "layouts/accountinfosheet";
import NewRecordSheet from "layouts/newrecordsheet";
// 신사업 메뉴
import CostSheet from "layouts/analysis/cost";
import SalesProfitSheet from "layouts/analysis/salesprofit";
import BrandProfitSheet from "layouts/analysis/brandprofit";
import BranchProfitSheet from "layouts/analysis/branchprofit";
import MonthlySalesSheet from "layouts/analysis/monthlysales";
import InvestMentSheet from "layouts/analysis/investment";
// 영업 메뉴
import TeleManagerSheet from "layouts/business/telemanager";
import CorCarSheet from "layouts/business/corcar";
import CookWearSheet from "layouts/business/cookwear";
import AccountFileSheet from "layouts/business/accountfile";
// 운영메뉴

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;

  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return <Route exact path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  // const configsButton = (
  //   <MDBox
  //     display="flex"
  //     justifyContent="center"
  //     alignItems="center"
  //     width="3.25rem"
  //     height="3.25rem"
  //     bgColor="white"
  //     shadow="sm"
  //     borderRadius="50%"
  //     position="fixed"
  //     right="2rem"
  //     bottom="2rem"
  //     zIndex={99}
  //     color="dark"
  //     sx={{ cursor: "pointer" }}
  //     onClick={handleConfiguratorOpen}
  //   >
  //     <Icon fontSize="small" color="inherit">
  //       settings
  //     </Icon>
  //   </MDBox>
  // );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <CssBaseline />
        {layout === "dashboard" && (
          <>
            <Sidenav
              color={sidenavColor}
              brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
              brandName="Material Dashboard 2"
              routes={routes}
              onMouseEnter={handleOnMouseEnter}
              onMouseLeave={handleOnMouseLeave}
            />
            <Configurator />
            {configsButton}
          </>
        )}
        {layout === "vr" && <Configurator />}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="Material Dashboard 2"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
          {/* {configsButton} */}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="/tallysheet/:account_id" element={<TallySheet />} />
        <Route path="/recordsheet/:account_id" element={<RecordSheet />} />
        <Route path="/membersheet/:account_id" element={<MemberSheet />} />
        <Route path="/dinersnumbersheet/:account_id" element={<DinersNumberSheet />} />
        <Route path="/propertysheet/:account_id" element={<PropertySheet />} />
        <Route path="/accountinfosheet/:account_id" element={<AccountInfoSheet />} />
        <Route path="/newrecordsheet" element={<NewRecordSheet />} />
        <Route path="/newrecordsheet/:account_id" element={<NewRecordSheet />} />
        {/* 신사업메뉴 */}
        <Route path="/analysis/cost/:account_id" element={<CostSheet />} />
        <Route path="/analysis/salesprofit/:account_id" element={<SalesProfitSheet />} />
        <Route path="/analysis/brandprofit/:account_id" element={<BrandProfitSheet />} />
        <Route path="/analysis/branchprofit/:account_id" element={<BranchProfitSheet />} />
        <Route path="/analysis/monthlysales/:account_id" element={<MonthlySalesSheet />} />
        <Route path="/analysis/investment/:account_id" element={<InvestMentSheet />} />
        <Route path="*" element={<Navigate to="/authentication/sign-in" />} />
        {/* 영업 메뉴 */}
        <Route path="/business/telemanager/:account_id" element={<TeleManagerSheet />}/>
        <Route path="/business/corcar/:account_id" element={<CorCarSheet />}/>
        <Route path="/business/cookwear/:account_id" element={<CookWearSheet />}/>
        <Route path="/business/accountfile/:account_id" element={<AccountFileSheet />}/>
        {/* 운영메뉴 */}
        
      </Routes>
    </ThemeProvider>
  );
}
