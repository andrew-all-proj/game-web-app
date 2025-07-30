import { RouteObject } from 'react-router-dom'
import CreateUser from '../pages/create-user/CreateUser'
import Arena from '../pages/arena/Arena'
import StartApp from '../pages/start-app/StartApp'
import Laboratory from '../pages/laboratory/Laboratory'
import ErrorPage from '../pages/error/ErrorPage'
import CreateMonster from '../pages/create-monster/CreateMonster'
import SearchBattle from '../pages/search-battle/SearchBattle'
import MonsterMenu from '../pages/monster-menu/MonsterMenu'
import FoodMenu from '../pages/foog-menu/FoodMenu'
import MutagensMenu from '../pages/mutagens-menu/MutagensMenu'
import MonsterApplyMutagen from '../pages/monster-apply-mutagen/MonsterApplyMutagen'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <StartApp />,
  },
  {
    path: '/arena/:battleId',
    element: <Arena />,
  },
  {
    path: '/arena',
    element: <SearchBattle />,
  },
  {
    path: '/laboratory',
    element: <Laboratory />,
  },
  {
    path: '/create-user',
    element: <CreateUser />,
  },
  {
    path: '/create-monster',
    element: <CreateMonster />,
  },
  {
    path: '/search-battle',
    element: <SearchBattle />,
  },
  {
    path: '/monster-menu/:monsterIdParams',
    element: <MonsterMenu />,
  },
  {
    path: '/food-menu/:userIdParams',
    element: <FoodMenu />,
  },
  {
    path: '/mutagens-menu',
    element: <MutagensMenu />,
  },
  {
    path: '/monster-apply-mutagen/:inventoryIdParams',
    element: <MonsterApplyMutagen />,
  },
  {
    path: '/error',
    element: <ErrorPage />,
  },
]

export default routes
