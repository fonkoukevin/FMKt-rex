<?php
// Informations de connexion à la base de données
$serveur = "localhost"; // Le serveur MySQL (généralement 'localhost' sur votre machine locale)
$utilisateur = "root"; // Votre nom d'utilisateur MySQL
$mot_de_passe = ""; // Votre mot de passe MySQL
$base_de_donnees = "rex_db"; // Le nom de votre base de données MySQL

// Connexion à la base de données
$connexion = new mysqli($serveur, $utilisateur, $mot_de_passe, $base_de_donnees);

// Vérifier la connexion
if ($connexion->connect_error) {
    die("Échec de la connexion à la base de données : " . $connexion->connect_error);
}

// Si le score est envoyé depuis le jeu
if(isset($_POST['score'])) {
    $score = $_POST['score'];

    // Insertion du score dans la base de données
    $requete_insertion = "INSERT INTO scores (score) VALUES ($score)";
    if ($connexion->query($requete_insertion) === TRUE) {
        echo "Score enregistré avec succès";
    } else {
        echo "Erreur lors de l'enregistrement du score : " . $connexion->error;
    }
}

// Récupération de tous les scores depuis la base de données
$requete_selection = "SELECT score FROM scores ORDER BY score DESC LIMIT 10";

$resultat = $connexion->query($requete_selection);

$scores = array();

if ($resultat->num_rows > 0) {
    // Ajout des scores à un tableau
    while($ligne = $resultat->fetch_assoc()) {
        $scores[] = $ligne["score"];
    }
} else {
    echo "Aucun score trouvé";
}

// Fermer la connexion à la base de données
$connexion->close();

// Renvoyer les scores sous forme de JSON
header('Content-Type: application/json');
echo json_encode($scores);
?>
