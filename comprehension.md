***debounce*** = L’exécution de la fonction Delays permet de limiter les appels rapides, en regroupant les entrées rapides dans un seul appel.

***lodash-es*** = Fournit une fonction utilitaire de suppression des rebonds via l’importation de { debounce } depuis 'lodash-es' utilisée pour supprimer les mises à jour d’entrée de recherche.

***Debounce*** retarde l’exécution de la fonction pour limiter les appels rapides.

***Bibliothèque utilitaire JavaScript*** : Fournit des fonctions pratiques pour manipuler tableaux, objets, chaînes, nombres, etc.


C'est exactement cela, à une petite nuance technique près : ce ne sont pas des variables dans votre code JavaScript, mais des cookies sécurisés envoyés automatiquement par le navigateur.Voici leur rôle précis :

1. ***laravel_session*** (L'identité)Rôle : Il gère l'authentification et l'état de la session.Fonctionnement : ***Ce cookie contient un identifiant unique (l'ID de session). À chaque fois que votre JavaScript appelle ***/auth/me***, le navigateur envoie ce cookie. Laravel lit cet ID, retrouve la session correspondante sur le serveur, et sait instantanément quel utilisateur est connecté.

2. ***XSRF-TOKEN*** (Le garde du corps)Rôle : Il protège contre les attaques ***CSRF (Cross-Site Request Forgery)***.Fonctionnement : Ce cookie contient un jeton de sécurité. Les outils comme Axios ou l'instance api de votre code lisent automatiquement la valeur de ce cookie pour l'injecter dans l'en-tête ***HTTP (X-XSRF-TOKEN)*** de vos requêtes. Laravel compare le cookie et l'en-tête : si un site malveillant tente de forcer une action à votre insu, l'en-tête sera manquant et Laravel bloquera la requête.Ce qu'il faut retenirAucun stockage manuel : Laravel Sanctum utilise ces ***cookies "HTTP-only"*** (pour la session), ce qui signifie que votre code JavaScript ne peut pas les lire ni les voler, garantissant une excellente sécurité.Souhaitez-vous de l'aide pour configurer Axios afin qu'il gère correctement ces cookies, ou rencontrez-vous une ***erreur 419 (CSRF token mismatch)*** lors de vos tests ?