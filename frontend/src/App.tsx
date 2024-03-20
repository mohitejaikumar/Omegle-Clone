
import { Route, Routes } from 'react-router-dom'
import './App.css'
import { LandingPage } from './components/landingPage'

function App() {


  return (
    <>
    <Routes>
      <Route path='/' element={<LandingPage/>}></Route>
    </Routes>

    </>
  )
}

export default App
