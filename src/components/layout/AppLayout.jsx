import React from 'react'
import Header from './Header.jsx'
import Breadcrumb from '../breadcrumb/index.jsx'

const AppLayout = ({children}) => {
  return (
    <div className='app_wrapper'>
        <Header />
        <main>
            <div className='container'>
              <Breadcrumb
            labels={{
          dashboard: 'Dashboard',
          invoices: 'Invoices',
          clients: 'Clients',
          projects: 'Projects',
        }}/>
            {children}
            </div>
        </main>
    </div>
  )
}

export default AppLayout