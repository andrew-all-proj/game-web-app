import { Navigate, RouteObject } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import CreateUser from '../pages/create-user/CreateUser'
import StartApp from '../pages/start-app/StartApp'
import Laboratory from '../pages/laboratory/Laboratory'
import ErrorPage from '../pages/error/ErrorPage'
import CreateMonster from '../pages/create-monster/CreateMonster'
import SearchBattle from '../pages/search-battle/SearchBattle'
import MonsterMenu from '../pages/monster-menu/MonsterMenu'
import FoodMenu from '../pages/foog-menu/FoodMenu'
import MutagensMenu from '../pages/mutagens-menu/MutagensMenu'
import MonsterApplyMutagen from '../pages/monster-apply-mutagen/MonsterApplyMutagen'
import SkillMenu from '../pages/skill-menu/SkillMenu'
import EnergyMenu from '../pages/energy-menu/EnergyMenu'
import Loading from '../pages/loading/Loading'

const Arena = lazy(() => import('../pages/arena/Arena'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <StartApp />,
  },
  {
    path: '/arena/:battleId',
    element: (
      <Suspense fallback={<Loading />}>
        <Arena />
      </Suspense>
    ),
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
    path: '/monster-menu',
    element: <Navigate to="/laboratory" replace />,
  },
  {
    path: '/monster-menu/:monsterIdParams/:inventoryIdParams?',
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
    path: '/skills-menu/:monsterIdParams?/:replacedSkillIdParams?',
    element: <SkillMenu />,
  },
  {
    path: '/monster-apply-mutagen/:inventoryIdParams',
    element: <MonsterApplyMutagen />,
  },
  {
    path: '/energy-menu',
    element: <EnergyMenu />,
  },
  {
    path: '/error',
    element: <ErrorPage />,
  },
]

export default routes
