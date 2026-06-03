import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from "./layouts/Layout";
import Loader from "./components/Loader";

// Lazy-loaded components
const Super40Form = lazy(() => import("./pages/Super40Form"));
const Super40Exams = lazy(() => import("./pages/Super40Exams"));
const Super40ExamQuestions = lazy(() => import("./pages/Super40ExamQuestions"));
const Super40Results = lazy(() => import("./pages/Super40Results"));

// Admin Components
const AdminLayout = lazy(() => import("./pages/AdminLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const ApplicationManager = lazy(() => import("./pages/ApplicationManager"));
const ExamManager = lazy(() => import("./pages/ExamManager"));
const Settings = lazy(() => import('./pages/Settings'));
const ProgramEnrollForm = lazy(() => import('./pages/ProgramEnrollForm'));
const ProgramManager = lazy(() => import('./pages/ProgramManager'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Super40Form /> },
      { path: "super40/exams", element: <Super40Exams /> },
      { path: "super40/exam/:id", element: <Super40ExamQuestions /> },
      { path: "super40/results", element: <Super40Results /> },
      { path: "enroll/:programSlug", element: <ProgramEnrollForm /> },
      { 
        path: "*", 
        element: (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="text-center">
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">404</h1>
              <p className="text-slate-500 font-medium mb-6">Page not found or resource unavailable.</p>
              <a href="/" className="px-6 py-3 bg-blue-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs">Return Home</a>
            </div>
          </div>
        ) 
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "applications", element: <ApplicationManager /> },
      { path: "exams", element: <ExamManager /> },
      { path: "programs", element: <ProgramManager /> },
      { path: "settings", element: <Settings /> },
    ]
  },
  {
    path: "/admin/login",
    element: <Login />
  }
]);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
