import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();

    // Utilisation de la variable d'environnement injectée par Webpack
    const captchaSiteApiKey = process.env.REACT_APP_CAPTCHA_SITE_API;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${captchaSiteApiKey}`;
        script.async = true;
        document.body.appendChild(script);
    }, [captchaSiteApiKey]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const token = await window.grecaptcha.enterprise.execute(
                captchaSiteApiKey, 
                { action: 'LOGIN' }
            );

            const response = await axios.get(`https://gift.tipii.fr/api/users/id-to-name`, {
                params: {
                    id: id,
                    captchaToken: token,
                },
            }); 

            const userName = response.data.name;
            if (userName) {
                navigate('/calendar', { state: { userId: id, userName: name } });
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
