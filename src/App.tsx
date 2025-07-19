import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
} from "react-router";
import { LanguageProvider } from "@/providers/LanguageProvider";

// Main Pages
import Home from "@/app/Home";

// Other Pages
import LoginPage from "@/app/Login";
import NF from "@/app/NF";

// Dashboard Pages
import DashLayout from "@/app/Dashboard/layout";
import Dashboard from "@/app/Dashboard";
import RealStates from "@/app/Dashboard/RealEstates";
import Unit from "@/app/Dashboard/RealEstates/Unit";
// import Tasks from "@/app/Dashboard/Tasks";
// import Calendar from "@/app/Dashboard/Calendar";
// import Contacts from "@/app/Dashboard/Contacts";
// import Documents from "@/app/Dashboard/Documents";
import Reports from "@/app/Dashboard/reports";
import Rentals from "@/app/Dashboard/Rentals";
import Rental from "@/app/Dashboard/Rentals/Rental";
// import Settings from "@/app/Dashboard/Settings";
// import Notifications from "@/app/Dashboard/Notifications";
import Account from "@/app/Dashboard/Account";

// Admin Dashboard Pages
import AdminDashLayout from "@/app/Admin/layout";
import AdminDashboard from "@/app/Admin";
import Users from "@/app/Admin/Users";


// Layout component with language provider
function Layout() {
  return (
    <LanguageProvider>
      <ScrollRestoration />
      <main>
        <div>
          <Outlet />
        </div>
      </main>
    </LanguageProvider>
  );
}

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "dash",
        element: <DashLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "real-estates",
            children: [
              {
                index: true,
                element: <RealStates />,
              },
              {
                path: ":unitID",
                element: <Unit />,
              },
            ],
          },
          // {
          //   path: "tasks",
          //   element: <Tasks />,
          // },
          // {
          //   path: "calender",
          //   element: <Calendar />,
          // },
          // {
          //   path: "contacts",
          //   element: <Contacts />,
          // },
          // {
          //   path: "documents",
          //   element: <Documents />,
          // },
          {
            path: "reports",
            element: <Reports />,
          },
          {
            path: "rentals",
            children: [
              {
                index: true,
                element: <Rentals />,
              },
              {
                path: ":rentalID",
                element: <Rental />,
              },
            ],
          },
          // {
          //   path: "settings",
          //   element: <Settings />,
          // },
          // {
          //   path: "notifications",
          //   element: <Notifications />,
          // },
          {
            path: "account",
            element: <Account />,
          },
        ],
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "admin",
        element: <AdminDashLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "users",
            element: <Users />,
          }
        ],
      },
      // {
      //   path: "about",
      //   element: <div>About Page</div>,
      // },
      // {
      //   path: "subscribe",
      //   element: <div>Subscribe Page</div>,
      // },
      // {
      //   path: "blog",
      //   element: <div>Blog Page</div>,
      // },
      // {
      //   path: "faq",
      //   element: <div>FAQ Page</div>,
      // },
      // {
      //   path: "terms",
      //   element: <div>just some perms we didn't decide yet</div>,
      // },
      // {
      //   path: "privacy",
      //   element: <div>you don't have privacy</div>,
      // },
      {
        path: "*",
        element: <NF />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
