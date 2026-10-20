
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Safety from "./pages/Safety";
import Moderator from "./pages/Moderator";
import ApiTest from "./ApiTest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/moderator" element={<Moderator />} />
        <Route path="/api-test" element={<ApiTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
