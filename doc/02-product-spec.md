# 📋 Spécification Produit – CoStory

## 1. Vision Produit

**CoStory** est une plateforme web de co-création d'histoires où l'utilisateur écrit **avec** une IA, pas à sa place. Focus sur l'introspection, la fiction collaborative, et le legs personnel—dans une ambiance bienveillante et minimaliste.

### Piliers Produit
1. **Co-création, pas génération complète** – L'IA est un coach, un partenaire, pas un robot qui écrit tout
2. **Multi-usage** – Thérapie, fiction, journal, capsules héritage, jeux de rôle
3. **Safe space** – Intimité, confidentialité par défaut, zéro jugement
4. **Pricing transparent** – Montrez le coût réel en tokens, pay-as-you-go

---

## 2. Personae Utilisateurs

### Persona 1: L'Introspectif(e) Thérapeutique
- **Âge:** 25–50 ans
- **Motivation:** Déposer ses émotions, structurer ses pensées, se sentir accompagné sans jugement
- **Use case:** Journal guidé, lettres aux proches, travail émotionnel
- **Frustration actuelle:** Les journaux blancs intimident, pas de structure; les thérapeutes sont chers/lents
- **Valeur clé:** Douceur, confidentialité absolue, reformulation bienveillante

### Persona 2: L'Auteur(ice) de Fiction
- **Âge:** 18–45 ans
- **Motivation:** Débloquer la page blanche, co-écrire, améliorer style et structure
- **Use case:** Brainstorming, draft → polish, world-building, continuité narrative
- **Frustration actuelle:** "Syndrome de la page blanche", relectures pénibles, besoin d'inspiration fiable
- **Valeur clé:** Vitesse, variation stylée, suggestions intelligentes sans imposer

### Persona 3: L'Auteur(ice) de Fictions Immersives
- **Âge:** 16–35 ans
- **Motivation:** Jeux de rôle collaboratifs, world-building avec des copains, sagas épiques
- **Use case:** Mondes partagés, co-création narrative, personnages complexes
- **Frustration actuelle:** Google Docs pas assez "smart", besoin de continuité narrative automatique
- **Valeur clé:** Collaboration, cohérence monde, IA qui "understand" le ton

### Persona 4: Le Narrateur Mémorialiste
- **Âge:** 40–75 ans
- **Motivation:** Laisser une trace pour les descendants, documenter une vie
- **Use case:** Autobiographie, anecdotes familiales, "capsules héritage"
- **Frustration actuelle:** Rédaction difficile, enfants pas intéressés par oral, peur d'oublier
- **Valeur clé:** Simplicité, assistance discrète, respect du ton personnel

---

## 3. Parcours Utilisateur Détaillé

### 3.1 Arrivée & Onboarding (Landing → First Project)

```
Landing Page
    ↓
[CTA: "Commencer à écrire mon histoire"]
    ↓
Auth (Register / Login)
    ↓
Wizard de création de projet:
    
    Step 1: Type de projet?
    - ☐ Histoire de fiction
    - ☐ Journal / Introspection
    - ☐ Capsule héritage / Autobiographie
    - ☐ Jeu de rôle collaboratif
    
    Step 2: Vrai ou fictif?
    - ☐ Entièrement fictif
    - ☐ Basé sur du vrai
    - ☐ Mélange
    
    Step 3: But principal?
    - ☐ Thérapeutique / Exploration émotionnelle
    - ☐ Laisser une trace pour famille/descendants
    - ☐ Être lu par une communauté
    - ☐ Jeu de rôle / Collaborative worldbuilding
    
    Step 4: Thème & Paramètres
    - Thème: [SF, Fantasy, Romance, Tranche de vie, Thriller, Autre...]
    - Époque: [Contemporain, Futur, Passé, Intemporel]
    - Ton: [Léger, Sérieux, Poétique, Introspectif, Épique...]
    - POV: [Je, Il/Elle, Tu, Omniscient]
    
    Step 5: Comment démarrer?
    - ☐ Juste quelques mots (l'IA génère synopsis + structure)
    - ☐ Un pitch de 2–3 phrases (même)
    - ☐ Un brouillon qu'j'ai déjà (pour mise en forme / continuation)
    
    ↓
    Studio d'écriture (première session créée)
```

### 3.2 Studio d'Écriture (Core Experience)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Lib | Project Title | Status [Saved] | Settings | ... │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ÉDITEUR (Gauche, 60%)       │  COACH IA (Droite, 40%) │
│                              │                          │
│  [Chapitre 1]                │  [Chat IA]              │
│                              │                          │
│  Mon texte...                │  Coach: Qu'aimerais-tu  │
│  [éditable, wrapping]        │  pour cette scène?      │
│                              │                          │
│                              │  [Scroll messages]      │
│                              │                          │
│                              │  User input box:        │
│                              │  [Question / Consigne]  │
│                              │  [Boutons d'actions]    │
│                              │                          │
│  Word count: 2,345           │                          │
│  Chapitre 2 | + Chapitre     │  [Coût estimé]         │
│                              │                          │
└──────────────────────────────────────────────────────────┘
```

#### Modes IA Disponibles (switch contextuel)

**Mode 1: Coach Narratif** (Fiction)
- Aide structure, rythme, personnages, arcs narratifs
- Questions: "Où tu veux que la scène culmine?", "Ce personnage a besoin d'une motivation plus claire"
- Génération: Propose 2–3 variantes d'une scène (max ~800 mots)
- Never concludes the story

**Mode 2: Coach Thérapeutique** (Journal / Introspection)
- Reformule, valide émotions, pose questions ouvertes
- Jamais diagnostique, jamais prescriptif
- Encourage clarté et cohérence émotionnelle
- Tone: Empathique, doux, sans jugement

**Mode 3: Co-auteur** (Génération)
- Génère la suite d'une scène à partir d'un contexte
- Respecte strictement les consignes (ton, POV, style)
- Termine souvent par une question ("Tu veux que ce personnage revienne ou on laisse suspense?")

**Mode 4: Coach Structurel** (Synopsis + Plan)
- À partir de quelques mots, génère:
  - Synopsis 5–10 phrases
  - Structure en actes/chapitres (3–6 parties)
  - Persos principaux + 1-liner chacun
  - Questions pour raffiner

#### Contrôles & Interactions

**Boutons d'action IA:**
- 🤔 "Poser une question" – Ouvre input pour poser une question libre au coach
- ✨ "Générer la suite" – Génère le prochain paragraphe / scène
- 🎯 "Reformuler ce passage" – Réécrit le passage sélectionné (style/ton)
- 📋 "Résumer le chapitre" – Crée un résumé pour relecture
- 🔄 "Variantes" – Propose 2–3 versions différentes (coûte plus de tokens)

**Affichage du coût:**
```
💰 Cette action va générer ~2000 tokens (5 min de lecture)
   Coût estimé: 0.32 EUR  |  Crédit restant: 45.20 EUR
   [Continuer] [Annuler] [Infos]
```

### 3.3 Édition & Révision

- User peut éditer directement son texte (éditeur simple, Markdown optionnel)
- Sélection + boutons contextuels: "Générer variation", "Reformuler", "Expliquer"
- Historique des versions (draft auto-saved toutes les 30 sec)

### 3.4 Publication & Social

#### États de projet:
- **Privé** (par défaut) – Invisibleà tous sauf l'auteur
- **Partagé** – Via lien (amis, famille)
- **Public** – Listed sur la plateforme, tags, recommandations

#### Social Features (à stage):
- Likes, commentaires (modérés)
- Suivre des auteurs
- Listes de lecture personnalisées
- Tags/catégories (Fiction, Thérapeutique, Introspectif, etc.)

### 3.5 Export & Ebook

- Format: ePub, PDF, DOCX
- Styling customizable (serif/sans-serif, taille police, couleurs)
- Couverture générée ou upload custom
- Métadonnées: Titre, auteur, résumé, ISBN option

---

## 4. Modèles de Pricing

### Tier 1: Free (Acquisition)

**Inclus:**
- Création de projets illimitée
- Éditeur texte illimité
- Coach IA: Conversation illimitée avec "short context" (max 500 tokens input)
- Génération: 1 appel/jour à "Générer synopsis + structure"
- Export: Privé seulement (pas PDF public)

**Limites:**
- Pas de génération narrative complète
- Pas d'images

**Objectif:** Saisir utilisateurs, montrer valeur, créer friction pour upgrade

### Tier 2: Pay-as-You-Go (Core Revenue)

**Modèle:**
- Crédits achetables en packs:
  - 50 EUR = 50k tokens
  - 10 EUR = 10k tokens  (meilleur ratio)
  - 5 EUR = 5k tokens
- Déduction selon consommation réelle OpenRouter
- Affichage transparent du coût avant chaque appel

**Inclus:**
- Tout du Free +
- Génération narrative illimitée (tant que crédits restent)
- Coach IA: Unlimited, full context
- Export public (PDF, ePub, DOCX)
- Publication publique
- Social features

**Coûts Internes (OpenRouter Jan 2026):**
- Claude 3.5 Sonnet: 0.003 USD / 1k input, 0.015 USD / 1k output
- GPT-4o: 0.005 USD / 1k input, 0.015 USD / 1k output
- Mistral: 0.002 USD / 1k input, 0.006 USD / 1k output

**Exemple de dépense utilisateur:**
- 1 synopsis (1000 input + 400 output tokens) ≈ $0.009
- 1 chapitre généré (2000 input + 3000 output tokens) ≈ $0.051
- User moyen: 5–15 EUR/mois si actif

### Tier 3: Premium+ (VIP, Future)

**Pricing:** 25 EUR/mois

**Inclus (en plus de Free + Pay-as-you-go):**
- Unlimited image generation (FLUX.2)
- Priority support
- Accès anticipé features
- Limite augmentée: Jusqu'à 100k tokens/appel (vs. 20k limitless)

---

## 5. Modes Thématiques & Prompts Système

### Mode Thérapeutique
```
Tu es un accompagnant d'écriture introspective, orienté bien-être.
Tu n'es PAS un thérapeute, tu ne donnes PAS de diagnostic.

Règles:
- Encourage l'exploration émotionnelle par l'écriture
- Respond with empathy and gentleness
- Pose questions ouvertes qui aident à clarifier
- Aide à reformuler pensées en texte cohérent
- Si mentions de harm/suicide: encourage contacter professionnels
- Ton: Simple, chaleureux, jamais moralisateur
```

### Mode Narratif (Fiction)
```
Tu es un coach d'écriture de fiction bienveillant.
Objectif: aider l'utilisateur à écrire, pas écrire tout à la place.

Règles:
- Pose des questions si consignes floues
- Propose max 2–3 options, jamais 10
- Respecte ton, style, intentions utilisateur
- Suggère améliorations structure/rythme/personnages
- Si génération texte demandée: passes courtes (~800 mots), invite à itérer
- Zero judgment, même contenu sombre
```

### Mode Co-auteur (Génération)
```
Tu es co-auteur écrivant à quatre mains avec l'utilisateur.

Règles:
- Demande toujours: contexte, persos, ton, POV, longueur
- Respecte STRICTEMENT contraintes de style
- Propose suite de scène ou variante
- Ne conclus PAS définitivement sans permission
- Termine par question invitant user à raffiner/corriger ta proposition
```

---

## 6. Architecture UX/Design

### Principes Design
- **Minimalisme:** Peu de distractions, focus sur texte
- **Typographie lecture:** Serif pour body (ex: Lora, Merriweather), sans-serif pour UI (Inter, Geist)
- **Thème sombre doux:** Backgrounds: charcoal, couleurs accent: teal/cyan douce
- **Spacing ample:** Respiration visuelle, pas crampon
- **Feedback clair:** States (saved, saving, error), coûts tokens visibles

### Composants Clés
- **Editor:** Simple textarea avec auto-save, word count, chapter nav
- **Chat IA:** Messages verticaux, avatars simples (user vs. assistant)
- **Buttons:** Minimalistes, texte + icon, transitions douces
- **Modals:** Confirma/actions sensibles (delete, publish)

---

## 7. Limitations & Règles de Garde

### Version Gratuite Limits
- Max 1 génération synopsis/jour
- Coach IA: Max 10 messages/jour (short context)
- Pas d'image generation

### Freemium Friction Points
- Afficher "Vous avez X crédits restants" en évidence
- Après 3 générations/jour: "Tu as limité gratuit. Upgrade pour plus?"
- Bouton "Acheter crédits" toujours visible

### Modération / Safety
- Automated filter sur contenu explicite (hate, abuse, spam)
- User reports → human review
- TOS: "Interdit: content sexuel mineur, violence explicite, dox"
- IA: Refuse clearly (ne génère pas) si flagged

---

## 8. MVP vs. Phase 2+

### MVP (Launch)
- ✅ Éditeur + Coach IA (narrative + thérapeutique)
- ✅ Génération synopsis + chapitre
- ✅ Free tier limité
- ✅ Pay-as-you-go tokens
- ✅ Publication basique (privé, lien, public)
- ✅ Social basique (like, comment, follow)

### Phase 2 (M6+)
- 🔄 Image generation (Premium+)
- 🔄 Collaborative editing
- 🔄 Advanced social (listes lecture, recommandations)
- 🔄 Analytics auteur
- 🔄 Newsletter / Feed

### Phase 3+ (M12+)
- 🔄 Mobile app
- 🔄 Podcast export
- 🔄 Audio narration (TTS)
- 🔄 Integration partenaires (psychologues, coaches)
- 🔄 Community challenges

---

## Appendix: Onboarding Strings (Copy)

**Landing CTA:**
```
Écrivez votre histoire avec l'IA.
Pas générée. Co-créée.

[Commencer à écrire]
```

**Wizard Step 1:**
```
De quel type d'histoire veux-tu parler?

[Icons + labels]
📖 Histoire de fiction
📔 Journal / Introspection  
👨‍👩‍👧‍👦 Capsule héritage
🎭 Jeu de rôle collaboratif
```

**Coach IA Intro:**
```
Coucou! Je suis ton coach d'écriture.
Je suis là pour t'aider à écrire, pas pour écrire tout.

Qu'est-ce qu'on crée ensemble aujourd'hui?
[Brainstormer une idée] [Continuer un draft] [Reformuler ce passage]
```

---

*Spécification v1.0 – Janvier 2026*
