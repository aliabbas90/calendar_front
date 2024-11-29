import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './screens/Login';
import Calendar from './screens/Calendar';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/calendar" element={<Calendar />} />
            </Routes>
        </Router>
    );
}

export default App;
