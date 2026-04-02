# Ubiquitous Language — Shiplens

Source de verite unique pour le vocabulaire metier du projet. Enrichi par `/product-manager` et `/event-storming`.

| Terme | Bounded Context | Definition |
|-------|-----------------|------------|
| Workspace | Shared | Espace de travail Linear d'une organisation |
| Session | Identity | Lien actif entre Shiplens et le workspace Linear de l'utilisateur |
| Deconnexion | Identity | Rupture complete du lien, avec suppression des acces des deux cotes |
| Equipe | Shared | Team Linear — unite organisationnelle regroupant des membres et des projets |
| Projet | Shared | Regroupement d'issues au sein d'une equipe, avec un objectif et une echeance |
| Projet actif | Identity | Projet non archive et non termine dans Linear |
| Issue | Shared | Tache ou ticket de travail dans Linear |
| Cycle | Shared | Periode de travail iterative (sprint) dans Linear, avec une date de debut et de fin |
| Cycle actif | Dashboard | Cycle en cours pour une equipe donnee |
| Milestone | Sync | Jalon d'avancement au sein d'un projet |
| Transition d'etat | Shared | Changement de statut d'une issue, horodate, servant de base au calcul du temps par statut |
| Statut | Shared | Etape du workflow d'une issue dans Linear (Backlog, Todo, In Progress, In Review, Done) |
| Statut final | Dashboard | Etat d'une issue a la cloture du cycle (terminee, en cours, bloquee, annulee) |
| Assignee | Shared | Personne responsable d'une issue dans Linear |
| Synchronisation initiale | Sync | Import complet de l'historique des donnees Linear pour les equipes selectionnees |
| Sync incrementale | Sync | Mise a jour continue des donnees apres l'import initial |
| Evenement | Sync | Notification envoyee par Linear lorsqu'une donnee change |
| Evenement isole | Sync | Evenement non traitable mis de cote pour investigation manuelle |
| Velocite | Shared | Rapport entre les points completes et les points planifies au demarrage du cycle |
| Throughput | Analytics | Nombre total d'issues completees dans le cycle |
| Cycle time | Shared | Duree entre le passage en cours de traitement et la completion d'une issue |
| Lead time | Analytics | Duree entre la creation d'une issue et sa completion |
| Scope creep | Shared | Issues ajoutees au cycle apres sa date de debut |
| Taux de completion | Shared | Pourcentage d'issues terminees par rapport au perimetre initial du cycle |
| Tendance | Shared | Evolution d'une metrique comparee aux derniers cycles termines |
| Estimation | Shared | Nombre de points assignes a une issue avant sa realisation |
| Score de precision | Analytics | Mesure de l'ecart entre l'estimation et le cycle time reel, apres normalisation |
| Normalisation | Analytics | Conversion des points et des durees sur une echelle commune pour les rendre comparables |
| Sur-estimation | Analytics | Issue dont le cycle time est significativement inferieur a ce que l'estimation laissait prevoir |
| Sous-estimation | Analytics | Issue dont le cycle time est significativement superieur a ce que l'estimation laissait prevoir |
| Prediction | Analytics | Estimation calculee de la duree probable d'une issue, basee sur l'historique |
| Intervalle de confiance | Analytics | Trio de valeurs (optimiste, probable, pessimiste) encadrant la duree predite |
| Issue similaire | Analytics | Issue deja completee partageant des criteres communs avec l'issue a predire |
| Issue bloquee | Shared | Issue restee dans un meme statut au-dela du seuil configure |
| Seuil | Shared | Duree maximale acceptable pour une issue dans un statut donne |
| Severite | Shared | Niveau de gravite d'une alerte ou d'une regle |
| Alerte | Analytics | Signalement qu'une issue a depasse le seuil dans son statut actuel |
| Goulot d'etranglement | Analytics | Statut du workflow ou les issues passent le plus de temps en mediane |
| Distribution du temps | Analytics | Repartition du temps passe par les issues dans chaque statut |
| Temps median | Analytics | Valeur centrale du temps passe dans un statut — plus robuste que la moyenne |
| Rapport de sprint | Shared | Document structure resumant l'activite, la sante et les tendances d'un sprint |
| Resume executif | Analytics | Paragraphe court donnant une vue d'ensemble de la sante du sprint |
| Faits saillants | Analytics | Issues notables, achievements ou evenements marquants du sprint |
| Recommandations | Shared | Suggestions concretes d'amelioration pour les prochains sprints |
| Fournisseur d'IA | Analytics | Service externe utilise pour la generation du texte (OpenAI, Anthropic, Ollama) |
| Historique des rapports | Analytics | Liste chronologique de tous les rapports generes pour une equipe |
| Regle d'audit | Shared | Verification automatique d'une pratique d'equipe, definie par un identifiant, un nom, une severite et une condition |
| Condition | Rules | Critere mesurable : seuil sur une metrique, pattern sur labels/statuts, ou ratio entre deux metriques |
| Evaluation | Rules | Verification d'une regle sur les donnees d'un cycle termine, produisant pass, warn ou fail |
| Archivage | Rules | Retrait d'une regle de l'evaluation active sans suppression physique |
| Score d'adherence | Rules | Pourcentage de regles ayant le statut pass sur le total des regles evaluees |
| Section d'audit | Rules | Partie du rapport de cycle dediee aux resultats d'evaluation des regles |
| Packmind | Rules | Outil collaboratif de documentation des pratiques d'equipe |
| Pratique mesurable | Rules | Pratique Packmind traduisible en condition verifiable sur des metriques |
| Pratique qualitative | Rules | Pratique Packmind descriptive, non traduisible en condition automatique |
| Checklist | Shared | Liste de pratiques qualitatives a verifier manuellement |
| Cache | Rules | Derniere version des regles synchronisees, utilisee en cas d'indisponibilite de Packmind |
| Webhook Slack | Notification | Adresse de destination permettant d'envoyer un message dans un canal Slack |
| Canal Slack | Shared | Espace de discussion dans Slack ou les messages et alertes sont publies |
| Notification | Notification | Message automatique envoye sur Slack a la cloture d'un cycle |
| Throttling | Notification | Limitation a une seule alerte par issue par jour pour eviter le bruit |
| Dashboard | Shared | Page d'accueil affichant une vue d'ensemble du workspace |
| Carte equipe | Dashboard | Bloc visuel resumant l'etat du cycle actif d'une equipe |
| Tendance velocite | Dashboard | Evolution de la velocite du cycle actif par rapport aux cycles precedents |
| Graphique de progression | Dashboard | Visualisation de l'avancement du cycle au fil du temps |
| Statut de synchronisation | Dashboard | Indicateur montrant quand la derniere sync a eu lieu et quand la prochaine est prevue |
| Etat vide | Dashboard | Reponse du dashboard quand les prerequis ne sont pas remplis, contenant un statut et un message guide |
