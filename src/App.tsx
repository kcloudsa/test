import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  ScrollRestoration,
  Navigate,
  useParams,
} from "react-router";
import { LanguageProvider } from "@/providers/LanguageProvider";
import Cookies from 'js-cookie';

// Main Pages
import Home from "@/app/Home";

// Other Pages
import LoginPage from "@/app/Login";
import NF from "@/app/NF";

// Dashboard Pages
import DashLayout from "@/app/Dashboard/layout";
import Dashboard from "@/app/Dashboard";
// import RealStates from "@/app/Dashboard/RealStates";
import Tasks from "@/app/Dashboard/Tasks";
import Calendar from "@/app/Dashboard/Calendar";
// import Contacts from "@/app/Dashboard/Contacts";
// import Documents from "@/app/Dashboard/Documents";
// import Reports from "@/app/Dashboard/reports";
// import Rentals from "@/app/Dashboard/Rentals";
// import Settings from "@/app/Dashboard/Settings";

// Language wrapper component
function LanguageWrapper() {
  const { lang } = useParams();
  
  // Validate language parameter
  if (!lang || !['en-US', 'ar-SA'].includes(lang)) {
    return <Navigate to="/ar-SA" replace />;
  }

  return (
    <LanguageProvider>
      <Layout />
    </LanguageProvider>
  );
}

// Root redirect component that checks cookies
function RootRedirect() {
  const cookieLang = Cookies.get('k-cloud-language');
  const targetLang = (cookieLang && ['en-US', 'ar-SA'].includes(cookieLang)) ? cookieLang : 'ar-SA';
  
  return <Navigate to={`/${targetLang}`} replace />;
}

// Layout component
function Layout() {
  return (
    <>
      <ScrollRestoration />
      {/* <Navbar /> */}
      <main>
        <div>
          <div>
            <Outlet />
          </div>
        </div>
        {/* <Footer /> */}
      </main>
      {/* <Dock /> */}
    </>
  );
}

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/:lang",
    element: <LanguageWrapper />,
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
          // {
          //   path: "real-states",
          //   element: <RealStates />,
          // },
          {
            path: "tasks",
            element: <Tasks />,
          },
          {
            path: "calender",
            element: <Calendar />,
          },
          // {
          //   path: "contacts",
          //   element: <Contacts />,
          // },
          // {
          //   path: "documents",
          //   element: <Documents />,
          // },
          // {
          //   path: "reports",
          //   element: <Reports />,
          // },
          // {
          //   path: "rentals",
          //   element: <Rentals />,
          // },
          // {
          //   path: "settings",
          //   element: <Settings />,
          // },
        ],
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      // {
      //   path: "admin",
      //   element: <div>Admin Page</div>,
      // },
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
      //   element: <div>Terms Page</div>,
      // },
      // {
      //   path: "privacy",
      //   element: <div>Privacy Page</div>,
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