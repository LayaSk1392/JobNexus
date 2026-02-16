import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Recruiters from './pages/Recruiters';
import Candidates from './pages/Candidates';
import CollegeAdmins from './pages/CollegeAdmins';
import Jobs from './pages/Jobs';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recruiters" element={<Recruiters />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/collegeadmins" element={<CollegeAdmins />} />
        <Route path="/jobs" element={<Jobs />} />
      </Routes>
    </Router>
  );
}


