import React from 'react'
import SchoolReportSaaS from './components/Student'
import {ToastContainer} from 'react-toastify'
import { Routes,Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import ForgotPass from './pages/ForgotPass'

const App = () => {
  return (
    <>
     <ToastContainer/>
     <Routes>
      <Route path='/' element={<Dashboard/>}/>
      <Route path='/reset-pass' element={<ForgotPass/>}/>
     </Routes>
      
    </>
   
  )
}

export default App