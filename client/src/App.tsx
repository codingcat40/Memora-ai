import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./components/Home";
import About from "./pages/About";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { useAuth } from "./context/AuthContext";
import { LLMProvider } from "./context/SharedContext";
import { PrivateRoutes } from "./components/PrivateRoutes";

import LandingPage from "./components/LandingPage";
import Loading from "./components/Loading";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedLayout } from "./components/ProtectedLayout";

function App() {
  const {user, loading} = useAuth()
  if(loading){
    return <Loading />
  }
  return(
      <LLMProvider>
          <BrowserRouter>
            <Routes>
              {/* public */}
              <Route path="/" element={<LandingPage />}/>
              <Route path="/about" element = {<About />}/>

              {/* guest routes */}
              <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* Protected Routes */}
              <Route element = {<PrivateRoutes isAuthenticated={!!user}/>}>
                 <Route element = {<ProtectedLayout />}>
                  <Route path="/home" element= {<Home />}/>
                 </Route>
              </Route>
                            
            </Routes>
          </BrowserRouter>
    </LLMProvider>
  ) 
}

export default App;
