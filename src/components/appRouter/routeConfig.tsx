import { RouteObject } from 'react-router-dom';
import Home from '../pages/home';
import Login from '../pages/Login';
import Registration from '../pages/Registration';
import Payment from '../pages/Payment';
import NotFoundPage from '../pages/error404';
import Requisites from '../pages/Requisites';
import CurrentBalance from '../pages/CurrentBalance';
import Workspace from '../pages/Workspace';
import Instruction from '../pages/Instruction';

export enum AppRoutes {
  Home = 'home',
  Login = 'login',
  Registration = 'registration',
  Payment = 'payment',
  NotFoundPage = 'NotFoundPage',
  Requisites = 'requisites',
  CurrentBalance = 'currentbalance',
  Workspace = 'workspace',
  Instruction = 'instruction',
}

export const routePaths: Record<AppRoutes, string> = {
  [AppRoutes.Home]: '/',
  [AppRoutes.Login]: '/login',
  [AppRoutes.Registration]: '/registration',
  [AppRoutes.Payment]: '/payment',
  [AppRoutes.NotFoundPage]: '/NotFoundPage',
  [AppRoutes.Requisites]: '/requisites',
  [AppRoutes.CurrentBalance]: '/currentbalance',
  [AppRoutes.Workspace]: '/workspace',
  [AppRoutes.Instruction]: '/instruction',
};

export const routerConfig: Record<AppRoutes, RouteObject> = {
  [AppRoutes.Home]: {
    path: routePaths[AppRoutes.Home],
    element: <Home />,
  },
  [AppRoutes.Login]: {
    path: routePaths[AppRoutes.Login],
    element: <Login />,
  },
  [AppRoutes.Registration]: {
    path: routePaths[AppRoutes.Registration],
    element: <Registration />,
  },
  [AppRoutes.Payment]: {
    path: routePaths[AppRoutes.Payment],
    element: <Payment />,
  },
  [AppRoutes.NotFoundPage]: {
    path: routePaths[AppRoutes.NotFoundPage],
    element: <NotFoundPage />,
  },
  [AppRoutes.Requisites]: {
    path: routePaths[AppRoutes.Requisites],
    element: <Requisites />,
  },
  [AppRoutes.CurrentBalance]: {
    path: routePaths[AppRoutes.CurrentBalance],
    element: <CurrentBalance />,
  },
  [AppRoutes.Workspace]: {
    path: routePaths[AppRoutes.Workspace],
    element: <Workspace />,
  },
  [AppRoutes.Instruction]: {
    path: routePaths[AppRoutes.Instruction],
    element: <Instruction />,
  },
};
