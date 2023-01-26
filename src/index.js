import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Nav from './components/navbar';
import Releases from './components/releases';
import News from './components/news';
import Faq from './components/faq.js';
import Signup from './components/Signup.js';
import reportWebVitals from './reportWebVitals';  
import { BrowserRouter, Routes, Route} from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <React.StrictMode>
    {/* <Nav /> */}

    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<div><Nav/><App/></div>}></Route>
        <Route path = "/home" element={<div><Nav/><App/></div>} />
        <Route path= "/releases" element={<div><Nav/><Releases/></div>} />
        <Route path= "/news" element={<div><Nav/><News/></div>} />
        <Route path="/faq" element={<div><Nav/><Faq/></div>} />
        <Route path = "/signup" element = {<Signup/>}/>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
