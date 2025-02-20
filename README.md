## 1. Clients actuels

Structure pour recenser les clients en cours :  
- *Nom* (obligatoire)  
- *Prénom* (obligatoire)  
- *Entreprise* (facultatif)  
- *Type(s) de prestation* :  
  - Liste avec choix multiples (ajouter/retirer au besoin) :  
    - SEO  
    - Dev Web  
    - Maintenance Dev Web  
    - Maintenance Site Web  
    - Site Internet  
- *Montant* : en euros (€)  
- *Fréquence* : mensuel, annuel (modifiable pour entrer les anciennes statistiques)  
- *Date de début de contrat* : obligatoire  
- *Date de fin de contrat* : facultatif  

### Fonctionnalité spécifique :  
- Lorsqu'un contrat arrive à échéance (si une *date de fin* est renseignée), il doit être automatiquement transféré dans l'historique (Onglet 2).  
- Possibilité de saisir manuellement des anciens contrats pour les ajouter à l'historique.  

---

## 2. Historique des clients

Structure pour archiver les contrats terminés :  
- *Nom et prénom du client*  
- *Entreprise* (facultatif)  
- *Type(s) de prestation* : liste multiple comme ci-dessus  
- *Montant facturé* : en euros (€)  
- *Fréquence* : mensuel, annuel ou autre  
- *Date de début et de fin de contrat*  
- *Remarque ou commentaire* : champ libre  

### Fonctionnalité spécifique :  
- Les clients sont automatiquement transférés dans l'historique lorsque la *date de fin de contrat* est atteinte.  

---

## 3. Statistiques

### Objectif  
Suivre et comparer les entrées de chiffre d'affaires (CA) mensuelles.

### Données à afficher :  
1. *CA mensuel à l'instant T* : somme des contrats actifs.  
2. *Évolution mensuelle du CA* : comparaison avec les mois précédents.  
3. *Nombre de contrats actifs*.  
4. *Répartition des prestations en cours* (par type, en pourcentage).  
5. *Historique mensuel du CA* (tableau ou graphique pour voir les variations).  

---

## Notes additionnelles
- Les champs doivent être *modulables* (ajouter/supprimer un type de prestation, adapter la fréquence, etc.).  
- L'interface doit permettre un accès rapide aux trois onglets décrits ci-dessus.  
- Les statistiques doivent être exportables pour analyse (CSV ou autre format).  
- La gestion doit être intuitive pour que les données historiques et actuelles restent cohérentes.  
- *Design* :  
  - Très simple, pur, avec des couleurs *blanches* et *bleues*.  
  - *Responsive* : une version mobile avec un *menu burger*.
