import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useRoutes } from 'react-router-dom'
import routes from '../routes'
import ApolloProvider from '../api/ApolloProvider'
import '../assets/styles/global.css'
import TopAlertHost from '../components/TopAlert/TopAlertHost'
import '../i18n'
import TelegramViewportSync from '../components/TelegramViewportSync/TelegramViewportSync'

const AppRouter = () => useRoutes(routes)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider>
      <TelegramViewportSync />
      <BrowserRouter>
        <TopAlertHost />
        <AppRouter />
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>,
)

export default AppRouter
