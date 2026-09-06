import { createBrowserRouter } from 'react-router'
import { PersonaSelect } from './components/PersonaSelect'
import { SwiperFlow } from './components/SwiperFlow'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PersonaSelect,
  },
  {
    path: '/match/:personaId',
    Component: SwiperFlow,
  },
])
