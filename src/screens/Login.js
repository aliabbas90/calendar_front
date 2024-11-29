import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.get(`https://tipii-calendar-backend-405727229290.europe-west1.run.app/users/id-to-name?id=${id}`);  
            const userName = response.data.name;
            if (userName) {
                navigate('/calendar', { state: { userId: id , userName:name} });
            } else {
                alert("Nom d'utilisateur incorrect pour cet identifiant");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la connexion");
        }
    };
    

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input type="text" placeholder="Identifiant" value={id} onChange={(e) => setId(e.target.value)} />
                <input type="text" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
}

export default Login;
