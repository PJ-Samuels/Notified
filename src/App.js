
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';
import Artist from './components/Artist.js';
import data1 from './artistData.js';
import data2 from './albumData.js';
import React from 'react';
// import { BrowserRouter, Route, Switch } from 'react-router';
function App() {
  // const options = {
  //   method: 'GET',
  //   headers: {
  //     'X-RapidAPI-Key': 'a7794b9a36mshed157cdb4537f8ap1b3af5jsn3878cc4f1a3c',
  //     'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
  //   }
  // };
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
  const [currentIndex, setCurrentIndex] = React.useState(0);
  React.useEffect(() => {
    const intervalId = setInterval(() => {
        setCurrentIndex(currentIndex => (currentIndex + 1) % artistData.length);
        // setCurrentIndex(currentIndex => (currentIndex === artistData.length - 1) ? 0 : currentIndex + 1);
    }, 5000);
    return () => clearInterval(intervalId);
  }, []);
  // setCurrentIndex(currentIndex => (currentIndex === artistData.length - 1) ? 0 : currentIndex + 1);



  // const data = React.useEffect(() => {
  // fetch('https://spotify23.p.rapidapi.com/search/?q=%3CREQUIRED%3E&type=multi&offset=0&limit=10&numberOfTopResults=5', options)
  //   .then(response => response.json())
  //   .then(data => console.log(data))
  //   .catch(err => console.error(err));
  // })
  // console.log("data", data);

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 10,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    // autoplay: true,
    // autoplaySpeed: 5000,
  };
  
  return (
    <div className="App">
      <div className = "latest">Notify stay up to date on all new music releases 
        <div className = "slideshow">
          <img  className = "release"></img>
        </div>
      </div>
      
      <div className = "artistComponents">
        <Slider className = "slider" {...settings}>
          {artistData}
        </Slider>
      </div>
      
      <div className = "artistTitle"> Get the latest releases from your favorite artists
      </div>

      <div className = "artistComponents">
        <Slider className = "slider" {...settings}>
          {albumData}        
        </Slider>
      </div>

      <div className='downloadInfo'>
        Download the app now
      </div>
      
      <footer></footer>
    </div>
  );
}

export default App;
