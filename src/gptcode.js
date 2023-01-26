import React, { useState, useEffect } from 'react';

function InfiniteScroll() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    fetchItems();
    // start auto scrolling
    const id = setInterval(() => {
      document.documentElement.scrollLeft += 10; // adjust this value as per your need
    }, 100);
    setIntervalId(id);
    return () => clearInterval(id);
  }, []);

  const handleScroll = () => {
    if (
      document.documentElement.scrollLeft + window.innerWidth
      === document.documentElement.offsetWidth
    ) {
      setPage(page + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page]);

  const fetchItems = async () => {
    setLoading(true);
    const response = await fetch(`https://my-api/items?page=${page}`);
    const data = await response.json();
    setItems(prevItems => [...prevItems, ...data]);
    setLoading(false);
  };

  return (
    <div style={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
      <div style={{ display: "flex" }}>
        {items.map(item => (
          <div key={item.id} style={{ width: "100px", height: "100px", marginRight: "10px" }}>
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
      {loading && <div>Loading...</div>}
    </div>
  );
}

export default InfiniteScroll;
