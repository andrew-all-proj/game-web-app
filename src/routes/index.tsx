import { RouteObject } from "react-router-dom";
import CreateUser from "../pages/create-user/CreateUser";
import Arena from "../pages/arena/Arena";
import StartApp from "../pages/start-app/StartApp";
import Laboratory from "../pages/laboratory/Laboratory";
import ErrorPage from "../pages/error/ErrorPage";
import CreatePet from "../pages/create-pet/CreatePet";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <StartApp />,
  },
  {
    path: "/arena",
    element: <Arena />,
  },
  {
    path: "/laboratory",
    element: <Laboratory />,
  },
  {
    path: "/create-user",
    element: <CreateUser />,
  },
  {
    path: "/create-pet",
    element: <CreatePet />,
  },
  {
    path: "/error",
    element: <ErrorPage />,
  },
];

export default routes;
