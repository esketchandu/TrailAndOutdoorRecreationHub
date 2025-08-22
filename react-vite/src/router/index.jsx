import { createBrowserRouter } from 'react-router-dom';
import LoginFormPage from '../components/LoginFormPage';
import SignupFormPage from '../components/SignupFormPage';
import TrailList from '../components/Trails/TrailList';
import TrailDetail from '../components/Trails/TrailDetail';
import TrailForm from '../components/Trails/TrailForm';
import TrailEdit from '../components/Trails/TrailEdit';
import Layout from './Layout';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <TrailList />,
      },
      {
        path: "trails",
        element: <TrailList />,
      },
      {
        path: "trails/new",
        element: <TrailForm />,
      },
      {
        path: "trails/:trailId",
        element: <TrailDetail />,
      },
      {
        path: "trails/:trailId/edit",
        element: <TrailEdit />,
      },
      {
        path: "login",
        element: <LoginFormPage />,
      },
      {
        path: "signup",
        element: <SignupFormPage />,
      },
    ],
  },
]);
