import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Calendar.css';
import caseImages from '../assets/cases';

// Importation des images
import vinImage from '../assets/vin.png';
import cidreImage from '../assets/cidre.png';
import limonadeImage from '../assets/limonade.png';
import tipiiImage from '../assets/tipii.png';
import theImage from '../assets/the.png';
import mielImage from '../assets/miel.png';
import confitureImage from '../assets/confiture.png';
import bieresImage from '../assets/bieres.webp';

function Calendar() {
  const location = useLocation();
  const userId = location.state?.userId || '';
  const userName = location.state?.userName || 'Utilisateur';

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [days, setDays] = useState([]);
  const [rewardData, setRewardData] = useState(null); // Stocke le reward et reward_day_
  const [currentDay, setCurrentDay] = useState(null); // Stocke le jour actuel

  // Mapper les récompenses aux images correspondantes
  const rewardImages = {
    "Vin": vinImage,
    "Cidre": cidreImage,
    "Limonade": limonadeImage,
    "Tipii'": tipiiImage,
    "Thé": theImage,
    "Miel": mielImage,
    "Confiture": confitureImage,
    "Bière": bieresImage,
  };

  useEffect(() => {
    const fetchDaysAndReward = async () => {
      try {
        // Récupérer l'état des jours depuis l'API
        const daysResponse = await axios.get(`https://gift.tipii.fr/api/users/days?id=${userId}`);
        setDays(daysResponse.data);

        // Récupérer la récompense et le jour associé
        const rewardResponse = await axios.get(`https://gift.tipii.fr/api/users/rewards?id=${userId}`);
        setRewardData(rewardResponse.data); // Stocke directement l'objet { reward, reward_day_ }

        // Définir le jour actuel
        const today = new Date().getDate();
        setCurrentDay(today);
      } catch (error) {
        console.error('Erreur lors du chargement des jours ou de la récompense :', error);
      }
    };

    if (userId) {
      fetchDaysAndReward();
    }
  }, [userId]);

  const handleDayClick = async (day) => {
    const dayIndex = day - 1;

    try {
      // Mettre à jour la case comme "opened" via l'API
      await axios.put('https://gift.tipii.fr/api/users/update-day', {
        id: userId,
        day_index: dayIndex,
        new_day_value: 'opened',
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la case :', error);
      return;
    }

    // Gérer le comportement en temps réel
    setSelectedDay(day);
    const element = document.getElementById(`day-${day}`);
    if (element) {
      element.classList.add('flipped');
    }
    setTimeout(() => {
      setIsPopupVisible(true);
    }, 1500);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const getRewardMessage = (reward) => {
    // Personnalisation pour "Tipii'"
    if (reward === "Tipii'") {
      return "20€ de bons Tipii";
    }
    return reward;
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
                days[index] === 'ready_to_open' && index + 1 === currentDay
                  ? 'ready-to-open'
                  : 'closed-day'
              }`}
              onClick={
                days[index] === 'ready_to_open' && index + 1 === currentDay
                  ? () => handleDayClick(index + 1)
                  : null
              } // Seules les cases "ready_to_open" pour le jour actuel sont cliquables
              style={{
                backgroundImage: `url(${caseImages[index]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 3,
                cursor:
                  days[index] === 'ready_to_open' && index + 1 === currentDay
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              Jour {index + 1}
            </div>
            <div className="calendar-hole" style={{ zIndex: 1 }}></div>
            {/* Affiche l'image uniquement pour les cases "ready_to_open" et non ouvertes */}
            {days[index] === 'ready_to_open' &&
              index + 1 === currentDay &&
              rewardData?.reward_day_ === index + 1 && (
                <img
                  src={rewardImages[rewardData.reward]} // Affiche l'image correspondant à la récompense uniquement si la case est cliquable
                  alt="Récompense"
                  className="reward-image"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100px',
                    height: '100px',
                    zIndex: 2,
                  }}
                />
              )}
          </div>
        ))}
      </div>

      {isPopupVisible && selectedDay !== null && (
        <div className="popup-overlay">
          <div className="popup">
            {rewardData && rewardData.reward_day_ === selectedDay ? (
              <div>
                <p>Bravo ! Vous avez gagné :</p>
                <p>{getRewardMessage(rewardData.reward)}</p> {/* Message personnalisé */}
                <img
                  src={rewardImages[rewardData.reward]} // Affiche l'image correspondant à la récompense
                  alt="Récompense"
                  className="popup-reward-image"
                />
              </div>
            ) : (
              <p className="consolation-message">
                Dommage ! Pas de récompense cette fois. Essayez demain !
              </p>
            )}
            <button onClick={closePopup}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
