import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Calendar.css';
import beerImage from '../assets/beer.png';
import caseImages from '../assets/cases';

function Calendar() {
  const location = useLocation();
  const userId = location.state?.userId || '';
  const userName = location.state?.userName || 'Utilisateur';

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [days, setDays] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [isQuoteVisible, setIsQuoteVisible] = useState(false);

  useEffect(() => {
    const fetchDaysAndUpdate = async () => {
      try {
        const daysResponse = await axios.get(`https://tipii-calendar-backend-405727229290.europe-west1.run.app/users/days?id=${userId}`);
        const currentDays = daysResponse.data;
        setDays(currentDays);

        const rewardsResponse = await axios.get(`https://tipii-calendar-backend-405727229290.europe-west1.run.app/users/rewards?id=${userId}`);
        const cleanedRewards = rewardsResponse.data.map((reward) => JSON.parse(reward));
        setRewards(cleanedRewards);

        const today = new Date();
        const currentMonth = today.getMonth(); // Novembre est 10

        if (currentMonth === 10) {
          for (let day = 1; day <= 24; day++) {
            const dayIndex = day - 1;
            if (day <= today.getDate()) {
              if (currentDays[dayIndex] === 'closed') {
                await axios.put('https://tipii-calendar-backend-405727229290.europe-west1.run.app/users/update-day', {
                  id: userId,
                  day_index: dayIndex,
                  new_day_value: 'ready_to_open',
                });
                currentDays[dayIndex] = 'ready_to_open';
              }
            } else {
              if (currentDays[dayIndex] !== 'closed') {
                await axios.put('https://tipii-calendar-backend-405727229290.europe-west1.run.app/users/update-day', {
                  id: userId,
                  day_index: dayIndex,
                  new_day_value: 'closed',
                });
                currentDays[dayIndex] = 'closed';
              }
            }
          }
          setDays(currentDays);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des jours ou mise à jour :', error);
      }
    };

    if (userId) {
      fetchDaysAndUpdate();
    }
  }, [userId]);

  const handleDayClick = (day) => {
    const dayIndex = day - 1;
    if (days[dayIndex] === 'ready_to_open') {
      setSelectedDay(day);
      const element = document.getElementById(`day-${day}`);
      if (element) {
        element.classList.add('flipped');
      }
      setTimeout(() => {
        setIsPopupVisible(true);
      }, 1500);
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="calendar-container">
      <div className="welcome-message">
        <h1>Bonjour {userName}</h1>
      </div>

      <div className="calendar-grid">
        {Array.from({ length: 24 }, (_, index) => (
          <div key={index} className="calendar-slot">
            <div
              id={`day-${index + 1}`}
              className={`calendar-day ${
                days[index] === 'ready_to_open' ? 'ready-to-open' : 'closed-day'
              }`}
              onClick={days[index] === 'ready_to_open' ? () => handleDayClick(index + 1) : null}
              style={{
                backgroundImage: `url(${caseImages[index]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 3,
              }}
            >
              Jour {index + 1}
            </div>
            <div className="calendar-hole" style={{ zIndex: 1 }}></div>
            {rewards[index] && rewards[index] === 'beer' && (
              <img
                src={beerImage}
                alt={rewards[index]}
                className="reward-image"
                style={{ zIndex: 2 }}
              />
            )}
          </div>
        ))}
      </div>

      {isPopupVisible && selectedDay !== null && (
        <div className="popup-overlay">
          <div className="popup">
            {rewards[selectedDay - 1] === 'nothing' ? (
              <div>
                <p className="consolation-message">
                  Dommage ! Pas de récompense cette fois. Essayez demain !
                </p>
              </div>
            ) : (
              rewards[selectedDay - 1] === 'beer' && (
                <div>
                  <p>Bravo ! Vous avez gagné :</p>
                  <img src={beerImage} alt="Récompense" className="popup-reward-image" />
                </div>
              )
            )}
            <button onClick={closePopup}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
