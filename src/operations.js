export const OPERATIONS = [
  {
    id: "faits",
    num: "1",
    nom: "Établir des faits",
    def: "Identifier un fait — un événement, une action ou une situation vérifiable et appuyé par une preuve — à partir d'un ou plusieurs documents. C'est la base de toutes les autres opérations.",
    consigneType: `identifier ou vérifier un fait précis à partir d'un document fourni.

Respecte impérativement ce style (exemple, à ne jamais réutiliser tel quel):
"À l'aide du document ci-dessous, énoncez un fait concernant l'arrivée des Loyalistes au Québec après 1783."

Règles de style à respecter absolument:
1. La consigne demande UN SEUL fait précis, pas une liste de faits.
2. Le fait demandé ne doit PAS être écrit ou paraphrasé nulle part ailleurs dans la consigne — l'élève doit le trouver dans le document, pas le recopier depuis la question.`,
    formatAttendu: "Une phrase complète qui énonce le fait, en précisant le document qui l'appuie."
  },
  {
    id: "espace-temps",
    num: "2",
    nom: "Situer dans le temps et dans l'espace",
    def: "Lier un fait au bon territoire (à l'aide d'une carte) ou le placer au bon moment sur une ligne du temps.",
    consigneType: `situer un fait dans l'espace (lieu/territoire) OU dans le temps (période/date), à l'aide d'un document (carte, texte, image).

Respecte impérativement ce style (exemple, à ne jamais réutiliser tel quel):
"À l'aide du document ci-dessous, situez dans le temps le moment où la Loi sur les mesures de guerre a été adoptée."

Règles de style à respecter absolument:
1. Précise clairement si la tâche porte sur le TEMPS (une date, une période) ou sur L'ESPACE (un lieu, un territoire) — jamais les deux en même temps dans une même consigne.
2. Le document fourni doit contenir l'indice nécessaire (une date, un repère géographique) sans que la réponse exacte soit donnée en toutes lettres dans la consigne elle-même.`,
    formatAttendu: "Une phrase qui nomme le lieu ou la période, avec justification tirée du document."
  },
  {
    id: "mise-en-relation",
    num: "3",
    nom: "Mettre en relation des faits",
    def: "Associer un fait présenté dans un document au bon fait ou à la bonne réalité historique déjà connue.",
    consigneType: `associer TROIS extraits/documents distincts chacun à la réalité historique correspondante — trois relations séparées à établir, pas une seule.

Respecte impérativement ce style (voici un exemple du format attendu, à ne jamais réutiliser tel quel — invente un tout autre sujet historique):
"Dans les décennies qui suivent la Confédération, le Québec connaît plusieurs transformations qui touchent différents aspects de sa société. Associez chacun des documents ci-dessous à l'énoncé qui lui correspond parmi les suivants :
- la modernisation du système scolaire
- les droits des femmes mariées
- la gestion publique de ressources énergétiques"

Règles de style à respecter absolument:
1. Commence TOUJOURS la consigne par une brève mise en contexte générale (1-2 phrases) qui situe la période ou le thème, SANS révéler ni suggérer le lien entre les documents et les énoncés.
2. Les trois énoncés doivent être de COURTES expressions nominales (quelques mots désignant un aspect général) — JAMAIS des phrases complètes, savantes ou trop précises comme "La laïcisation des institutions et la modernisation de l'éducation". Un énoncé doit ressembler à un titre court, pas à une définition.
3. Les documents doivent contenir assez d'indices concrets pour que l'élève puisse faire le lien lui-même — mais le vocabulaire des documents ne doit pas reprendre mot pour mot celui des énoncés (sinon l'association devient une simple recherche de mots-clés au lieu d'un raisonnement historique).`,
    formatAttendu: "OBLIGATOIRE: trois relations distinctes, une phrase complète par relation, chacune nommant le document et la réalité historique associée.",
    marqueursRecommandes: [
      { typeLien: "Cause → Effet", marqueurs: "en raison de, par conséquent, ce qui entraîne" }
    ]
  },
  {
    id: "comparaisons",
    num: "4",
    nom: "Établir des comparaisons",
    def: "Dégager les ressemblances et les différences entre deux faits, situations ou points de vue d'acteurs historiques.",
    consigneType: `comparer deux faits, situations ou points de vue d'acteurs historiques présentés dans les documents, en identifiant au moins une ressemblance et une différence.

Respecte impérativement ce style (exemple, à ne jamais réutiliser tel quel):
"À l'aide des documents ci-dessous, comparez la position du gouvernement provincial et celle du gouvernement fédéral à l'égard de la gestion des ressources naturelles. Nommez une ressemblance et une différence entre les deux positions."

Règles de style à respecter absolument:
1. Nomme clairement les DEUX éléments à comparer (deux acteurs, deux situations, deux groupes) — jamais de façon vague ("comparez les deux documents").
2. Les documents doivent présenter des positions ou situations suffisamment distinctes pour permettre une vraie comparaison, mais NE DOIS PAS énoncer toi-même la ressemblance ou la différence dans la consigne — c'est à l'élève de la découvrir.`,
    formatAttendu: "Au moins une différence ET une similitude, en phrases complètes justifiées par les documents."
  },
  {
    id: "causes-consequences",
    num: "5",
    nom: "Déterminer des causes et des conséquences",
    def: "Identifier ce qui a causé un événement historique, ou ce que cet événement a entraîné comme conséquence.",
    consigneType: `identifier UNE cause OU UNE conséquence d'un événement historique précis présenté dans le document — pas les deux à la fois, et pas une chaîne de plusieurs éléments (ça, c'est l'opération "Établir des liens de causalité").

Respecte impérativement ce style (exemple, à ne jamais réutiliser tel quel):
"À l'aide du document ci-dessous, nommez une conséquence de la construction du chemin de fer transcontinental sur le développement économique de l'Ouest canadien."

Règles de style à respecter absolument:
1. Nomme clairement l'événement historique servant de point de départ (la cause si on demande une conséquence, ou l'événement dont on cherche la cause).
2. Précise EXPLICITEMENT si l'élève doit trouver une CAUSE ou une CONSÉQUENCE — jamais les deux, et jamais de façon ambiguë.
3. Ne révèle jamais la cause ou la conséquence attendue dans la consigne elle-même — le document doit contenir l'indice, pas la question.`,
    formatAttendu: "Une phrase complète: « Une cause/conséquence de [événement] est... »"
  },
  {
    id: "liens-causalite",
    num: "6",
    nom: "Établir des liens de causalité",
    def: "Lier trois faits ensemble en chaîne: le premier au deuxième, puis le deuxième au troisième (fait A → fait B → fait C). Aussi appelée « la question à trois picots ».",
    consigneType: `établir une chaîne de causalité entre trois énoncés fournis dans la question (sous forme de trois picots) et les lier avec les informations distinctes tirées des documents (A entraîne B, qui entraîne C). Pose la question puis donne les trois picots (aspects à lier pour répondre correctement).

Respecte impérativement ce style (voici un exemple du format attendu, à ne jamais réutiliser tel quel — invente un tout autre sujet historique):
"Expliquez comment l'action du gouvernement fédéral, suite à la mobilisation de la population, entraîne une réaction de la population québécoise. Dans votre réponse, vous devez préciser chacun des éléments ci-dessous et les lier entre eux.
- la mobilisation de la population lors de la guerre
- l'action du gouvernement fédéral
- la réaction de la population québécoise"

Règles de style à respecter absolument:
1. La phrase principale doit NOMMER directement les trois éléments à lier (jamais "le premier fait", "le deuxième élément", etc.)
2. Les trois picots doivent être de COURTES expressions nominales (quelques mots désignant un aspect général) — jamais des phrases complètes avec dates précises, noms propres détaillés ou événements très spécifiques.
3. La phrase principale doit indiquer seulement L'ORDRE des trois éléments (avec "suite à" ou "entraîne"), JAMAIS le mécanisme ou la raison du lien. N'utilise pas d'expressions qui expliquent déjà le COMMENT (comme "à travers", "par le biais de", "grâce à", "ce qui permet", "en raison de"). C'est justement ce que l'élève doit expliquer dans sa réponse — la question ne doit pas lui donner la réponse.
   MAUVAIS EXEMPLE (donne déjà le mécanisme): "un conflit armé, à travers le développement du commerce du bois, entraîne l'ouverture de nouvelles régions"
   BON EXEMPLE (indique seulement l'ordre): "le développement du commerce du bois, suite à un conflit armé en Europe, entraîne l'ouverture de nouvelles régions de colonisation"`,
    formatAttendu: "Trois faits reliés clairement en chaîne (A → B → C), en phrases complètes."
  },
  {
    id: "continuite-changement",
    num: "7",
    nom: "Déterminer des éléments de continuité et des changements",
    def: "En comparant une même réalité à deux moments différents dans l'histoire, identifier ce qui change et ce qui reste pareil (ou presque).",
    consigneType: `comparer une réalité précise à deux moments différents dans l'histoire du Québec, à l'aide des documents, en identifiant un élément de changement et un élément de continuité.

Respecte impérativement ce style (exemple, à ne jamais réutiliser tel quel):
"À l'aide des documents ci-dessous, comparez le rôle de l'Église catholique dans le système scolaire québécois entre 1950 et 1970. Précisez un élément de changement et un élément de continuité."

Règles de style à respecter absolument:
1. Nomme clairement la réalité comparée (une institution, une pratique, un groupe social) et les deux moments précis à comparer (deux dates, deux périodes).
2. Les deux documents doivent chacun représenter un des deux moments, avec assez de détails concrets pour que l'élève identifie lui-même ce qui change et ce qui reste stable — sans que la consigne ne révèle déjà le changement ou la continuité attendue.`,
    formatAttendu: "Obligatoire: « Un élément de changement est (...). Un élément de continuité est (...). » — deux phrases complètes sur ce modèle.",
    marqueursRecommandes: [
      { typeLien: "Rupture historique (changement)", marqueurs: "cependant, alors que, contrairement à l'époque précédente" },
      { typeLien: "Stabilité dans le temps (continuité)", marqueurs: "de même, pendant cette période encore, également" }
    ]
  }
];