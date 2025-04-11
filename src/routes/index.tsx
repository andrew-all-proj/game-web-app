import { RouteObject } from "react-router-dom";
import CreateUser from "../pages/create-user/CreateUser";
import Arena from "../pages/arena/Arena";
import StartApp from "../pages/start-app/StartApp";
import Laboratory from "../pages/laboratory/Laboratory";

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
];

export default routes;
