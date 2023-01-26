// import logo from './logo.svg';
import './App.css';
import Artist from './components/Artist.js';
import data1 from './artistData.js';
import data2 from './albumData.js';
import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router';
function App() {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'a7794b9a36mshed157cdb4537f8ap1b3af5jsn3878cc4f1a3c',
      'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
    }
  };
  const artistData = data1.map((artist, index) => {

    return <Artist
      key = {index}
      artistName = {artist.artistName}
      artistImg = {artist.artistImg}
    />
  })
  const albumData = data2.map((album, index) => {
    return <Artist
      key = {index}
      artistName = {album.albumName}
      artistImg = {album.albumImg}
    />
  })
  // const data = React.useEffect(() => {
  // fetch('https://spotify23.p.rapidapi.com/search/?q=%3CREQUIRED%3E&type=multi&offset=0&limit=10&numberOfTopResults=5', options)
  //   .then(response => response.json())
  //   .then(data => console.log(data))
  //   .catch(err => console.error(err));
  // })
  // console.log("data", data);


  
  return (
    <div className="App">
      <div className = "latest">Notify stay up to date on all new music releases 
        <div className = "slideshow">
          <img  className = "release"></img>
        </div>
      </div>
      
      <div className = "artistComponents">
        {artistData}
      </div>
      
      <div className = "artistTitle"> Get the latest releases from your favorite artists
      </div>

      <div className = "artistComponents">
        {albumData}        
      </div>

      <div className='downloadInfo'>
        Download the app now
      </div>
      
      <footer></footer>
    </div>
  );
}

export default App;
