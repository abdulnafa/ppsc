(function () {
  "use strict";

  // Stable topic IDs are intentionally separate from question IDs and saved progress.
  // Add a more specific rule before a general one when extending this taxonomy.
  var RULES = {
    "general-knowledge": [
      ["united-nations", "United Nations & SDGs", /united nations|\bU\.?N\.?\b|unicef|unesco|undp|unfpa|world health organization|sustainable development|millennium development goal|security council|general assembly|international court of justice|international criminal court|\bicj\b|\bicc\b/i],
      ["world-organizations", "World Organizations & Headquarters", /saarc|oic\b|organization of islamic cooperation|commonwealth|asean|nato|european union|\beu\b|wto\b|world trade organization|imf\b|international monetary fund|world bank|brics|g20\b|g7\b|interpol|red cross|opec\b|ecowas|african union|headquarters|head office/i],
      ["world-leaders", "World Leaders & Politics", /president|prime minister|chancellor|monarch|king |queen |emperor|secretary.general|political party|election|parliament|senate|congress|constitution|plutocracy|political power|ideology|gorbachev|soviet/i],
      ["world-history", "World History & Civilizations", /ancient|civilization|empire|dynasty|war\b|battle|revolution|independence|colonial|historic|medieval|mughal|ottoman|soviet|roman|greek|renaissance|magna carta/i],
      ["books-authors", "Books, Authors & Literature", /book\b|novel|author|writer|poet|literature|autobiograph|biograph|wrote|written|publication|published|magazine|newspaper/i],
      ["awards-honours", "Awards & Honours", /nobel|prize|award|medal|honou?r|laureate|pulitzer|oscar|grammy/i],
      ["sports-games", "Sports & Games", /olympic|cricket|football|soccer|tennis|grand slam|hockey|fifa|world cup|sport|athlete|stadium|tournament|javelin|badminton|wimbledon|asian games/i],
      ["science-technology", "Science, Space & Technology", /scientist|invent|discover|space|satellite|nasa|planet|astronaut|technology|computer|physics|chemistry|nuclear|aircraft|rocket|missile/i],
      ["religion-culture", "Religion, Art & Culture", /religion|religious|islam|christian|buddh|hindu|mosque|temple|church|museum|art\b|painter|festival|heritage|unesco world heritage/i],
      ["countries-places", "Countries, Cities & Places", /country|countries|city|capital|continent|located|island|sea\b|river|mountain|landmark|palace|fort\b|desert|border|region|province|canal|population|nationality/i],
      ["law-governance", "Law & Governance", /law\b|legal|court|judge|treaty|convention|rights|legislation|act of|article \d|international law/i],
      ["economy-trade", "Economy, Trade & Currency", /currency|euro|dollar|rupee|trade|econom|bank|finance|budget|export|import|industry|market|gross domestic|gdp\b|opportunity cost/i],
      ["society-education", "Society, Education & Institutions", /literacy|education|school|university|college|library|institution|community|language|linguistic|society|social|population|jail|prison|human right|discrimination/i],
      ["transport-communications", "Transport, Aviation & Communications", /railway|airline|airways|airport|aircraft|ship\b|voyage|transatlantic|transport|telegraph|postal/i],
      ["military-diplomacy", "Military, Diplomacy & International Relations", /military|army|navy|admiral|fleet|diplomac|security relations|confidence.building|atomic bomb|r2p\b|responsibility to protect/i],
      ["social-sciences", "Social Sciences & General Concepts", /anthropolog|psycholog|sociolog|therap|human resource|employment|job classification|discipline|study of/i],
      ["international-days", "International Days & Observances", /international day|world day|observance|commemorat|celebrat.*day/i],
      ["famous-people", "Famous People & Biographies", /\bwho\b|personality|famous|founder|founded|born\b|died\b|life of/i]
    ],
    "pakistan-studies": [
      ["constitution-articles", "Constitutional Articles & Amendments", /article \d|constitutional article|amendment|constitution of pakistan|constitution, 1973|constitution of 1973|constitutional provision/i],
      ["constitution-history", "Constitutional History & Governance", /constitution|constituent assembly|government of india act|dyarchy|cabinet mission|nehru report|round table conference|governor.general|martial law/i],
      ["prime-ministers", "Prime Ministers & Federal Cabinet", /prime minister|premier|premiership|cabinet|law minister|foreign minister|finance minister|federal minister/i],
      ["presidents", "Presidents & Governors", /president|governor|viceroy|head of state/i],
      ["judiciary-law", "Judiciary, Law & Institutions", /court|judge|chief justice|judiciary|legal|law\b|police|code of criminal|section \d|ordinance|senate|national assembly|election commission/i],
      ["political-parties", "Political Parties & Elections", /political party|peoples party|people.s party|\bppp\b|muslim league|\bpml\b|election|vote|democracy|bhutto/i],
      ["pakistan-movement", "Pakistan Movement & Independence", /pakistan movement|independence|partition|quaid.e.azam|jinnah|iqbal|all.india|lahore resolution|muslim league|khilafat|two.nation|1947|1940 resolution|lucknow pact|quit india|separate electorate|agartala conspiracy/i],
      ["historical-rulers", "Historical Rulers & Empires", /mughal|emperor|sultan|sikh|afghan|durrani|ghaznav|ghori|delhi sultanate|british raj|maharaja|dynasty/i],
      ["wars-defence", "Wars, Armed Forces & Defence", /war\b|battle|conflict|kargil|army|navy|air force|military|defence|defense|general|chief of army|line of control|kashmir|counterterrorism|operation radd|missile|satellite/i],
      ["rivers-dams", "Rivers, Dams & Barrages", /river|dam\b|barrage|canal|lake|water|irrigation|indus|jhelum|chenab|ravi|sutlej/i],
      ["physical-geography", "Mountains, Land & Climate", /mountain|peak|range|desert|plateau|valley|pass\b|climate|border|coast|sea\b|mount\b|glacier/i],
      ["provinces-cities", "Provinces, Cities & Districts", /province|punjab|sindh|balochistan|khyber pakhtunkhwa|district|city|lahore|karachi|islamabad|peshawar|quetta|faisalabad|multan|rawalpindi/i],
      ["economy-development", "Economy, Trade & Development", /econom|budget|bank|trade|export|import|industry|agriculture|crop|energy|power plant|solar park|corridor|cpec|steel mills|fertilizer|manufactur/i],
      ["education-culture", "Education, Literature & Culture", /university|college|school|education|literature|urdu|poet|writer|book\b|museum|heritage|fort\b|mosque|shrine|artist|painter/i],
      ["sports-awards", "Pakistani Sports & Awards", /sport|cricket|squash|bowler|athlete|medal|nishan.e.haider|hilal.i.imtiaz|award|honou?r/i],
      ["culture-festivals", "Pakistani Culture & Festivals", /festival|community|music|singer|band\b|song\b|cultural|tribe|folk/i],
      ["natural-events", "Natural Events & Disasters", /flood|earthquake|disaster|landmass|drought/i],
      ["national-facts", "National Symbols & General Facts", /national|flag\b|anthem|symbol|population|census|area\b|first\b|largest|smallest|founded|established|pakistan\b/i]
    ],
    "current-affairs": [
      ["pakistan-government", "Pakistan Government & Officeholders", /pakistan.{0,50}(?:president|prime minister|minister|chief justice|governor|cabinet|government|assembly|senate)|(?:president|prime minister|minister|chief justice|senate).{0,50}pakistan|chief minister|chief justice|governor of|federal investigation agency|state bank of pakistan|council of islamic ideology|pakistan air force|federal board of revenue|pemra|punjab.{0,50}(?:ordinance|government|minister|e.khidmat)|pakistan.s first/i],
      ["pakistan-economy", "Pakistan Economy & Budget", /pakistan.{0,60}(?:budget|econom|inflation|trade|export|import|imf|debt|rupee|fiscal|census)|(?:budget|imf|inflation|fiscal|gsp\+).{0,60}pakistan|pia\b|education.sector allocation/i],
      ["pakistan-foreign-relations", "Pakistan Foreign Relations", /pakistan.{0,65}(?:agreement|saudi|china|india|afghan|united states|united kingdom|turk|iran|diplomatic|treaty|defence|defense)|(?:agreement|treaty).{0,50}pakistan/i],
      ["united-nations", "UN, SDGs & Global Summits", /united nations|\bun\b|security council|general assembly|sustainable development|climate conference|\bcop\d+|summit of the future/i],
      ["world-leaders-elections", "World Leaders & Elections", /president|prime minister|chancellor|monarch|king\b|queen\b|head of|election|vote|government|cabinet|leader|secretary of state|mayor|chief of staff|chairman|politician|crown prince/i],
      ["international-conflicts", "International Conflicts & Security", /war\b|invasion|attack|conflict|ceasefire|military|nuclear|terror|bombing|missile|israel|palestine|gaza|ukraine|russia|afghanistan/i],
      ["international-organizations", "International Organizations & Treaties", /saarc|sco\b|brics|g20\b|commonwealth|oic\b|asean|nato|world bank|imf\b|fatf\b|d.8\b|european commission|treaty|agreement|summit|conference/i],
      ["climate-environment", "Climate, Environment & Energy", /climate|environment|emission|temperature|flood|earthquake|renewable|energy|oil\b|gas\b|water|weather/i],
      ["science-health", "Science, Health & Technology", /vaccine|covid|virus|pandemic|health|disease|space|satellite|ai\b|artificial intelligence|technology|scientist/i],
      ["sports-awards", "Sports, Awards & Culture", /fifa|cricket|olympic|world cup|sport|uefa|champions league|psl\b|odi\b|nobel|prize|award|medal|festival|film|person of the year/i],
      ["media-public-events", "Media, Public Events & Society", /time magazine|news|media|singer|anthem|heatwave|public service|national day|public holiday|service as of/i],
      ["country-updates", "Countries & International Developments", /country|countries|city|capital|currency|province|region|international|global|world|saudi arabia|north korea|european union/i]
    ],
    "islamic-studies": [
      ["quran-surahs", "Quran, Surahs & Verses", /qur.an|quran|surah|sura\b|ayah|verse|juz\b|para\b|revelation|tafsir|tajwid|sajda|recitation|tilawah/i],
      ["hadith-sunnah", "Hadith & Sunnah", /hadith|sunnah|bukhari|muslim collection|narrat|tradition of the prophet/i],
      ["prophets", "Prophets & Families", /prophet|ibrahim|abraham|ishmael|ismail|musa|moses|isa\b|jesus|yusuf|joseph|yunus|jonah|adam\b|noah|nuh\b|daud|david\b|sulaiman|solomon/i],
      ["prophet-muhammad", "Life of Prophet Muhammad", /muhammad|rasul|messenger|hijrah|hijra|makkah|mecca|madinah|medina|seerah|seerat|migration to medina/i],
      ["companions-caliphs", "Companions & Rashidun Caliphs", /caliph|abu bakr|umar\b|uthman|usman|ali ibn|ali bin|hazrat ali|sahab|companion|aisha|hafsa|fatimah|khadija|bayt al.mal/i],
      ["islamic-battles", "Islamic Battles & Conquests", /battle|ghazwa|badr|uhud|khaybar|khandaq|tabuk|conquest|expedition|muhammad bin qasim|muhammad ibn qasim/i],
      ["hajj-umrah", "Hajj, Umrah & Holy Places", /hajj|umrah|kaaba|arafat|mina\b|muzdalifah|tawaf|safa|marwa|qibla|masjid/i],
      ["prayer-fasting", "Prayer, Fasting & Worship", /salah|salat|namaz|prayer|fasting|sawm|ramadan|ramzan|eid\b|wudu|ablution|tayammum/i],
      ["zakat-charity", "Zakat, Ushr & Charity", /zakat|zakah|ushr|nisab|sadaqah|charity|alms/i],
      ["beliefs-fiqh", "Beliefs, Fiqh & Islamic Law", /iman\b|faith|tawhid|shirk|jihad|fiqh|sharia|jurisprudence|qiyas|ijma|riba|halal|haram|hanafi|fatwa/i],
      ["islamic-history", "Islamic History & Empires", /umayyad|abbasid|ottoman|empire|dynasty|sultan|islamic history|hijri|century|medieval|andalu|baghdad|damascus/i],
      ["scholars-books", "Scholars, Sufis & Islamic Books", /scholar|imam\b|sufi|order\b|book\b|wrote|author|writer|shah wali|ghazali|iqbal/i]
    ],
    "geography": [
      ["oceans-seas", "Oceans, Seas & Gulfs", /ocean|sea\b|gulf|strait|bay\b|maritime|coast|shore|coral reef/i],
      ["rivers-barrages", "Rivers, Barrages & Canals", /river|barrage|canal|tributary|delta\b|waterfall|falls\b|indus|nile|amazon\b|ganges|jhelum|chenab/i],
      ["dams-reservoirs", "Dams & Reservoirs", /dam\b|reservoir|hydroelectric|hydropower/i],
      ["lakes-wetlands", "Lakes & Wetlands", /lake|wetland|lagoon/i],
      ["mountains-glaciers", "Mountains, Peaks & Glaciers", /mountain|mount\b|peak|range|hills|glacier|himalaya|karakoram|hindu kush|everest|k2\b|godwin austen/i],
      ["deserts-plains", "Deserts, Plains & Plateaus", /desert|plain\b|plateau|valley|canyon|salt flat|steppe|basin/i],
      ["islands-peninsulas", "Islands & Peninsulas", /island|archipelago|peninsula|atoll/i],
      ["borders-directions", "Borders, Directions & Locations", /border|boundary|neighbou?r|north|south|east|west|between|adjacent|lies in|situated|located|corridor/i],
      ["capitals-cities", "Capital Cities & Major Cities", /capital|city|cities|metropolis|urban|town\b/i],
      ["countries-continents", "Countries & Continents", /country|countries|continent|sovereign state|nation|asia\b|europe|africa|america|australia/i],
      ["currencies", "Country Currencies", /currency|currencies|rupee|dollar|pound sterling|euro\b|yen\b|dinar|rial\b|riyal/i],
      ["population-area", "Population, Area & Demography", /population|density|land area|square kilomet|largest|smallest|size\b|census|inhabitant/i],
      ["climate-earth", "Climate, Weather & Earth", /climate|weather|rainfall|monsoon|temperature|earth\b|hemisphere|latitude|longitude|equator|time zone|tropic/i],
      ["ports-transport", "Ports, Airports & Routes", /port\b|airport|road\b|highway|rail|route|shipping|pass\b|transport|channel/i],
      ["maps-landmarks", "Maps, Landmarks & Famous Places", /map\b|landmark|fort\b|palace|shrine|monument|museum|heritage|mosque|temple/i]
    ],
    "basic-mathematics": [
      ["factorization", "Factorization & Polynomials", /factoriz|factoris|factor of|factors of|polynomial|algebraic identity/i],
      ["quadratic-equations", "Quadratic Equations & Roots", /quadratic|discriminant|roots? of (?:the |an? )?equation|solve[^?]{0,30}x²/i],
      ["exponents-roots", "Exponents, Powers & Roots", /exponent|power\b|square root|cube root|radical|indices|surds|²|³|√|x\^|root of/i],
      ["equations-algebra", "Equations & Algebra", /equation|solve for|find x\b|value of x\b|value of y\b|x \+|x -|2x\b|quadratic|linear|variable|expression|substitut/i],
      ["profit-loss", "Profit, Loss & Prices", /profit|loss\b|cost price|selling price|markup|marked price|purchase price/i],
      ["interest-finance", "Interest & Financial Calculations", /interest|principal|installment|compound|amount due|loan\b/i],
      ["percentages", "Percentages & Percentage Change", /percent|percentage|%|discount|increase by|decrease by/i],
      ["ratios-proportions", "Ratios & Proportions", /ratio|proportion|share\b|divide.*in the ratio/i],
      ["averages-statistics", "Averages & Statistics", /average|mean\b|median|mode\b|data set|frequency|range of|standard deviation/i],
      ["sequences-patterns", "Sequences & Number Patterns", /sequence|series|progression|common difference|next term|follows \d|arithmetic sequence|geometric sequence|pattern|term is/i],
      ["fractions-decimals", "Fractions & Decimals", /fraction|decimal|numerator|denominator|\/\d|reciprocal/i],
      ["numbers-divisibility", "Numbers & Divisibility", /prime number|composite number|divisib|lcm\b|hcf\b|gcd\b|least common|greatest common|even number|odd number|integer|multiple of/i],
      ["age-word-problems", "Ages & Everyday Word Problems", /father.s age|mother.s age|son.s age|daughter.s age|years earlier|years ago|how old|age of|pens and|pencils|teams|students in total|handshakes/i],
      ["sets-logic", "Sets, Coordinates & Logical Reasoning", /set\b|intersection|union|venn|quadrant|coordinate|facing east|facing west|direction|standing.*right|standing.*left/i],
      ["speed-distance", "Speed, Distance & Time", /speed|distance|train\b|car\b|vehicle|journey|travel|kilometres per hour|km\/h|m\/s/i],
      ["time-work", "Time, Work & Rates", /work\b|worker|job\b|complete.*days|pipe|fill.*tank|tap\b|per hour/i],
      ["geometry-circles", "Circles & Curved Shapes", /circle|circumference|radius|diameter|arc\b|sphere|cylinder|cone\b|π|pi =/i],
      ["geometry-triangles", "Triangles & Angles", /triangle|angle|hypotenuse|pythagor|inradius|equilateral|isosceles/i],
      ["geometry-areas", "Areas, Perimeters & Solids", /rectangle|square\b|perimeter|area\b|volume|surface|cube\b|cuboid|parallelogram|polygon|trapez/i],
      ["probability-counting", "Probability, Permutations & Counting", /probability|permutation|combination|possible ways|arrangement|dice\b|die\b|coin\b/i],
      ["unit-conversion", "Units & Conversions", /unit\b|convert|metre|meter|centimet|kilogram|gram\b|litre|liter|celsius|fahrenheit|kelvin/i],
      ["arithmetic", "Arithmetic & Simplification", /add\b|adding|sum\b|subtract|multiply|product|divide|division|simplif|calculate|evaluate|what is \d|what is one|solve:\s*\d|[0-9]\s*[÷×]\s*[0-9]/i]
    ],
    english: [
      ["synonyms", "Synonyms", /synonym|same meaning|closest in meaning|similar meaning|means the same|word nearest in meaning/i],
      ["antonyms", "Antonyms", /antonym|opposite meaning|opposite of|opposite word|contrary meaning/i],
      ["analogies", "Word Analogies & Relationships", /analogy|relationship between|::/i],
      ["idioms", "Idioms & Phrases", /idiom|phrase|figurative|pencil you in|scot.free|end in smoke/i],
      ["proverbs", "Proverbs & Sayings", /proverb|saying|adage/i],
      ["vocabulary", "Vocabulary & Word Meanings", /meaning|define|definition|word\b|term\b|means\b|vocabulary|what does|denote/i],
      ["spellings", "Spelling & Word Formation", /spell|orthograph|prefix|suffix|compound word|word formation/i],
      ["prepositions", "Prepositions & Collocations", /preposition|fill in.*\b(?:at|in|on|by|for|with|from|to)\b|appropriate.*preposition/i],
      ["tenses-verbs", "Tenses, Verbs & Modals", /tense|verb\b|modal|infinitive|gerund|participle|past perfect|present perfect|future perfect/i],
      ["active-passive", "Active & Passive Voice", /passive voice|active voice|voice of|active to passive|passive to active/i],
      ["direct-indirect", "Direct & Indirect Speech", /direct speech|indirect speech|reported speech|narration|reported form|direct form/i],
      ["parts-of-speech", "Parts of Speech & Grammar", /noun\b|pronoun|adjective|adverb|conjunction|interjection|article\b|part of speech|subject.verb|singular subject|plural subject|determiner/i],
      ["sentences", "Sentence Completion & Correction", /sentence|fill in the blank|complete the|choose the correct form|grammatical|correctly matches/i],
      ["punctuation", "Punctuation & Capitalization", /punctuation|comma|semicolon|colon\b|apostrophe|quotation mark|parenthes|capitaliz/i],
      ["singular-plural", "Singular, Plural & Gender", /plural|singular|gender\b|masculine|feminine/i],
      ["literature", "English Literature & Authors", /author|wrote|written by|novel|poem|poet|playwright|shakespeare|literature|book\b/i]
    ],
    urdu: [
      ["urdu-antonyms", "متضاد الفاظ", /متضاد|antonym|opposite|الٹ معنی|ضد\b/i],
      ["urdu-synonyms", "مترادف الفاظ", /مترادف|synonym|same meaning|ہم معنی/i],
      ["urdu-idioms", "محاورے", /محاورہ|محاورے|idiom|idiomatic/i],
      ["urdu-proverbs", "ضرب الامثال", /ضرب المثل|ضرب الامثال|proverb|saying/i],
      ["urdu-vocabulary", "الفاظ کے معنی", /لفظ|الفاظ|معنی|meaning|definition|word\b|lexical|expression/i],
      ["urdu-grammar", "اردو قواعد", /grammar|قواعد|اسم\b|فعل\b|حرف\b|مصدر|زمانہ|tense|verb\b|sentence|جملہ|ترکیب/i],
      ["urdu-singular-plural", "واحد، جمع اور جنس", /واحد|جمع|singular|plural|مذکر|مونث|gender/i],
      ["urdu-punctuation", "رموز اوقاف", /رموز|اوقاف|punctuation|comma|colon\b|سکتہ|ختمہ/i],
      ["urdu-rhetoric", "صنائع و بدائع", /صنعت|تشبیہ|استعارہ|کنایہ|rhetoric|allusion|بلاغت|تلمیح/i],
      ["urdu-poetry", "اردو شاعری اور شعرا", /poet|poem|poetry|شاعر|غزل|نظم|شعر|اقبال|غالب|فیض|میر تقی|قصیدہ/i],
      ["urdu-prose", "اردو نثر، ناول اور افسانہ", /novel|short story|fiction|essay|drama|افسانہ|ناول|نثر|ڈراما|premchand|اشفاق|بانو قدسیہ/i],
      ["urdu-books-authors", "اردو کتب اور مصنفین", /author|writer|wrote|book\b|publication|published|کتاب|مصنف|تالیف|لغت|رسالہ|سفرنامہ/i],
      ["urdu-history", "اردو زبان کی تاریخ", /language|origin|history|اردو زبان|دکنی|فارسی|عربی|لسانی/i]
    ],
    "everyday-science": [
      ["human-anatomy", "Human Body & Organs", /human body|human\b|brain|heart|lung|kidney|liver|stomach|blood|bone|muscle|nerve|neuron|ribs?|villi|trachea|eye\b|ear\b|pancreas|gland|organ|digest|bipedal|physiotherap|amnesia/i],
      ["health-diseases", "Health, Diseases & Medicine", /disease|virus|bacteria|infection|vaccine|cancer|diabetes|fever|medicine|antibiotic|immunity|medical|steriliz|malaria|covid/i],
      ["nutrition-vitamins", "Nutrition, Vitamins & Food", /vitamin|nutrient|protein|fat\b|carbohydrate|calorie|diet\b|food\b|milk\b|mineral|deficien/i],
      ["plants-animals", "Plants, Animals & Ecology", /plant|animal|bird\b|fish\b|tree\b|flower|leaf\b|photosynthesis|pollinat|ecosystem|species|mammal|insect|zoology|botany|frog|dog\b|evolution|natural selection|apiculture|deforestation|agronomy/i],
      ["genetics-cells", "Cells, DNA & Genetics", /cell\b|dna\b|rna\b|gene|chromosome|heredit|genetic|mitosis|meiosis|nucleus|transcription/i],
      ["chemistry-elements", "Elements, Compounds & Chemistry", /element|atom|molecule|compound|metal|nonmetal|chemical|acid\b|alkali|base\b|periodic table|carbon|silicon|oxygen|hydrogen|nitrogen|mercury|ethanol|gold\b|plastic|pvc\b|colloid|corrosion/i],
      ["energy-electricity", "Energy, Electricity & Magnetism", /energy|electric|current|voltage|magnet|battery|power|solar cell|renewable|nuclear|turbine|semiconductor|megawatt|kilowatt/i],
      ["light-sound", "Light, Sound & Optics", /light\b|sound|frequency|wave|optics|lens|reflection|refraction|colour|color|blue sky|radiation/i],
      ["heat-temperature", "Heat, Temperature & Matter", /heat\b|temperature|boiling|melting|freezing|celsius|fahrenheit|kelvin|gas\b|liquid|solid\b|pressure/i],
      ["earth-atmosphere", "Earth, Atmosphere & Weather", /earth\b|atmosphere|weather|climate|rain|humidity|air\b|ozone|greenhouse|pollution|water cycle|hygrometer/i],
      ["space-astronomy", "Space, Sun & Planets", /space|planet|sun\b|moon\b|star|solar system|galaxy|universe|astronom|satellite|comet/i],
      ["scientists-inventions", "Scientists, Inventions & Discoveries", /scientist|invent|discover|formulat|demonstrat|law of|newton|einstein|harvey|edward jenner/i],
      ["measurements-units", "Measurements & Scientific Units", /unit\b|si\b|measure|instrument|scale|meter|metre|gram\b|litre|liter|stopwatch|least count/i]
    ],
    "basic-computer-studies": [
      ["microsoft-excel", "Microsoft Excel & Spreadsheets", /excel|spreadsheet|workbook|worksheet|cell\b|formula\b|pivot|vlookup|sumif|sum\(|average\(|chart\b/i],
      ["microsoft-word", "Microsoft Word & Documents", /microsoft word|ms word|\bWord\b|word processor|docx|mail merge/i],
      ["microsoft-powerpoint", "Microsoft PowerPoint & Slides", /powerpoint|slide\b|presentation|slideshow|pptx/i],
      ["microsoft-access", "Microsoft Access & Databases", /microsoft access|ms access|database|sql\b|query\b|record\b|table\b|primary key|foreign key/i],
      ["microsoft-office", "Microsoft Office & Productivity", /microsoft office|office suite|outlook|onenote|publisher/i],
      ["keyboard-shortcuts", "Keyboard Shortcuts & Keys", /shortcut|keyboard|keystroke|ctrl\+|alt\+|shift\+|function key|toggle key|caps lock|num lock|enter key/i],
      ["windows-os", "Windows & Operating Systems", /windows|operating system|macos|linux|android|ios\b|start menu|desktop|taskbar|file explorer|ms.dos|user interface/i],
      ["internet-web", "Internet, Web & Browsers", /internet|world wide web|www\b|website|web page|browser|http|https|url\b|domain|search engine|html\b|css\b/i],
      ["networking", "Networks & Telecommunications", /network|router|switch|lan\b|wan\b|wi.fi|wifi|bluetooth|tcp|ip address|protocol|lte\b|modem|telecommunicat|ethernet|osi\b|cloud computing/i],
      ["email", "Email & Messaging", /e.mail|email|inbox|spam|cc\b|bcc\b|attachment|messag/i],
      ["cybersecurity", "Cybersecurity & Privacy", /security|virus|malware|phishing|password|firewall|encrypt|hacker|authentication|cyber|privacy/i],
      ["hardware-components", "Computer Hardware & CPU", /hardware|cpu\b|processor|motherboard|chip\b|transistor|computer component|computer system/i],
      ["memory-storage", "Memory, Storage & Data Units", /memory|ram\b|rom\b|cache|storage|hard disk|ssd\b|flash drive|usb\b|byte\b|bit\b|gigabyte|megabyte|kilobyte/i],
      ["input-output", "Input & Output Devices", /input device|output device|printer|scanner|monitor|mouse\b|touchscreen|display|pixel|resolution|headphones|speaker/i],
      ["programming", "Programming Languages & Software", /programming|language|software|compiler|interpreter|algorithm|source code|python|java\b|c\+\+|application|deep learning|machine learning|sdlc|nanotechnolog/i],
      ["computer-history", "Computer History & Generations", /computer history|generation|first computer|inventor|invented|founder|founded|co.found|eniac|ibm\b|abacus|babbage|turing/i],
      ["file-management", "Files, Folders & Formats", /file\b|folder|extension|pdf\b|document|directory|recycle bin|delete|copy|paste/i],
      ["binary-logic", "Binary, Number Systems & Logic", /binary|decimal|hexadecimal|octal|logic gate|boolean|which gate|and gate|or gate/i],
      ["acronyms", "Computer Acronyms & Terms", /stand for|stands for|abbreviation|acronym|full form|denote/i]
    ],
    "job-related-finance-taxation": [
      ["zakat-ushr-law", "Zakat & Ushr Law", /zakat|ushr|nisab|sadaqah/i],
      ["sales-tax", "Sales Tax & PRA", /sales tax|taxable service|zero.rat|exempt supply|pra\b|punjab revenue authority/i],
      ["income-tax", "Income Tax & Tax Administration", /income tax|tax\b|deductib|taxpayer|withholding|short.paid|tax liability/i],
      ["accounting", "Accounting & Financial Statements", /accounting|journal|ledger|balance sheet|asset|liabilit|equity|depreciation|prepaid|adjusting entry|receivable|payable/i],
      ["cost-management", "Cost & Management Accounting", /costing|cost\b|margin|overhead|variable|fixed\b|contribution|prime cost|segment/i],
      ["corporate-finance", "Corporate Finance & Investment", /finance|capital|interest|investment|present value|time value|npv\b|irr\b|risk.return|liquidity|working capital|hedg|option|exchange rate/i],
      ["banking", "Banking & Financial Markets", /bank|credit|loan|deposit|stock|bond\b|share\b|securit|market/i],
      ["economics", "Economics & Trade", /econom|trade|inflation|demand|supply|fiscal|monetary|budget|gdp\b/i],
      ["business-law", "Business Law & Companies", /companies act|company|contract|ordinance|legal|section \d|business law/i],
      ["management-technology", "Management & Technology", /management|organiz|marketing|machine learning|artificial intelligence|technology|business/i]
    ]
  };

  var DEFAULTS = {
    "general-knowledge": "General World Facts",
    "pakistan-studies": "Other Pakistan Studies Topics",
    "current-affairs": "Other Current Affairs",
    "islamic-studies": "Other Islamic Studies Topics",
    geography: "Other Geography Topics",
    "basic-mathematics": "Other Mathematics Topics",
    english: "Other English Topics",
    urdu: "دیگر اردو موضوعات",
    "everyday-science": "Other Science Topics",
    "basic-computer-studies": "Other Computer Topics",
    "job-related-finance-taxation": "Other Finance & Job Topics"
  };

  var bank = window.PPSC_QUIZ_DATA && window.PPSC_QUIZ_DATA.questions || [];
  var categories = window.PPSC_QUIZ_DATA && window.PPSC_QUIZ_DATA.categories || [];
  var categoryOrder = Object.create(null);
  var originalOrder = Object.create(null);
  var groupByKey = Object.create(null);
  var topicById = Object.create(null);
  var focusById = Object.create(null);
  var bankById = Object.create(null);
  categories.forEach(function (category, index) {
    categoryOrder[category.id] = index;
  });
  bank.forEach(function (question, index) {
    originalOrder[question.id] = index;
    bankById[question.id] = question;
    var key = question.categoryId + "|" + (question.pairId || question.id);
    if (!groupByKey[key]) groupByKey[key] = [];
    groupByKey[key].push(question);
  });

  function semanticText(question) {
    // Paper IDs and source metadata are deliberately excluded: they are not topics.
    var tags = (question.tags || []).filter(function (tag) {
      return !/^(?:adv2e102|wgi|ibes-2025|ibes-capsule|similar-practice|related-practice|formal-paper-\d+|model-paper-\d+|u\d+(?:-q\d+)?|practice|current-affairs|basic-computer-studies|researched-supplement-\d+)$/.test(tag);
    });
    return [question.question, question.questionUrdu, tags.join(" ")].filter(Boolean).join(" ");
  }

  function declaredTopic(questions, categoryId, rules) {
    var tag = null;
    questions.some(function (question) {
      tag = (question.tags || []).find(function (entry) {
        return /^topic:[a-z0-9-]+$/.test(entry);
      }) || null;
      return Boolean(tag);
    });
    if (!tag) return null;
    var id = tag.slice(6);
    for (var index = 0; index < rules.length; index += 1) {
      if (rules[index][0] === id) {
        return { id: id, label: rules[index][1], categoryId: categoryId, order: index };
      }
    }
    // A future editorial topic can be introduced without modifying this file.
    return {
      id: id,
      label: id.split("-").map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(" "),
      categoryId: categoryId,
      order: rules.length
    };
  }

  function classify(questions, categoryId) {
    var rules = RULES[categoryId] || [];
    var editorialTopic = declaredTopic(questions, categoryId, rules);
    if (editorialTopic) return editorialTopic;
    var text = questions.map(semanticText).join(" ");
    for (var index = 0; index < rules.length; index += 1) {
      if (rules[index][2].test(text)) {
        return { id: rules[index][0], label: rules[index][1], categoryId: categoryId, order: index };
      }
    }
    return {
      id: "other",
      label: DEFAULTS[categoryId] || "Other Topics",
      categoryId: categoryId,
      order: rules.length + 1
    };
  }

  function focusForQuestion(question, categoryId) {
    var text = String(question.question || "");
    // Exact named entities are stronger study clusters than source-document order.
    var named = [
      /\barticle\s+\d+[a-z]?\b/i,
      /\b(?:surah|sura)\s+(?:al[- ]?)?[\w'-]+/i,
      /\b(?:[A-Z][a-z'-]+\s+){0,3}[A-Z][a-z'-]+\s+(?:Barrage|Dam|River|Ocean|Sea|Lake|Fort|Palace|Resolution|Agreement|Convention|Amendment|University|Mosque|Desert|Mountain|Range|Strait|Gulf|Canal)\b/,
      /\b(?:River|Lake|Mount|Mt\.?)\s+[A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+)?\b/,
      /\b(?:[A-Z][A-Z]+|[A-Z][a-z]+)\s+(?:World Cup|Olympics|Games|Empire)\b/
    ];
    for (var index = 0; index < named.length; index += 1) {
      var match = text.match(named[index]);
      if (match) return match[0].toLowerCase().replace(/\s+/g, " ");
    }
    if (categoryId === "english" || categoryId === "urdu") {
      var quoted = text.match(/['“‘"]([^'”’"]{2,65})['”’"]/);
      if (quoted) return quoted[1].toLowerCase();
      var vocabularyTarget = text.match(/(?:synonym|antonym|opposite)\s+of\s+([A-Za-z][A-Za-z'-]+)/i);
      if (vocabularyTarget) return vocabularyTarget[1].toLowerCase();
    }
    var candidates = text.match(/\b(?:[A-Z][a-z][A-Za-z'-]*|[A-Z]{2,})(?:\s+(?:(?:[A-Z][a-z][A-Za-z'-]*|[A-Z]{2,})|(?:of|the|al|bin|ibn|ul|and))){0,4}\b/g) || [];
    var skip = /^(?:which|which of the|what|who|when|where|why|how|in|on|at|the|according|as of|under|choose|choose the|select|name|identify|true|false|first|second|third|a|an|complete|complete the|fill|fill in|change|solve|evaluate|simplify|find|find the|if|if the|one|pakistan's|pakistani)$/i;
    for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
      var candidate = candidates[candidateIndex].replace(/^(?:The|In|On|At|According to)\s+/, "");
      if (skip.test(candidate)) continue;
      if (categoryId === "pakistan-studies" && /^pakistan$/i.test(candidate)) continue;
      if (candidate.length >= 3) return candidate.toLowerCase();
    }
    // A category/topic without a named subject remains in its source order.
    return "";
  }

  Object.keys(groupByKey).forEach(function (key) {
    var family = groupByKey[key];
    var sourceFirst = family.slice().sort(function (left, right) {
      return (left.kind === "source" ? 0 : 1) - (right.kind === "source" ? 0 : 1);
    });
    var topic = classify(sourceFirst, family[0].categoryId);
    var focus = focusForQuestion(sourceFirst[0], family[0].categoryId);
    family.forEach(function (question) {
      topicById[question.id] = topic;
      focusById[question.id] = focus;
    });
  });

  function getTopic(question) {
    if (!question || !question.categoryId) return null;
    if (question.id && topicById[question.id]) return topicById[question.id];
    // Future questions need no hand-maintained ID map; their text/tags are classified.
    return classify([question], question.categoryId);
  }

  function getFocusKey(question) {
    if (!question || !question.categoryId) return "";
    if (question.id && focusById[question.id] != null) return focusById[question.id];
    return focusForQuestion(question, question.categoryId);
  }

  function getTopics(categoryId, questions) {
    var selected = questions || bank;
    var counts = Object.create(null);
    selected.forEach(function (question) {
      if (question.categoryId !== categoryId) return;
      var topic = getTopic(question);
      if (!topic) return;
      if (!counts[topic.id]) {
        counts[topic.id] = {
          id: topic.id,
          label: topic.label,
          categoryId: categoryId,
          order: topic.order,
          count: 0
        };
      }
      counts[topic.id].count += 1;
    });
    return Object.keys(counts).map(function (id) { return counts[id]; })
      .sort(function (left, right) { return left.order - right.order; });
  }

  function sortQuestions(questions) {
    return questions.slice().sort(function (left, right) {
      var leftCategory = categoryOrder[left.categoryId] == null ? 999 : categoryOrder[left.categoryId];
      var rightCategory = categoryOrder[right.categoryId] == null ? 999 : categoryOrder[right.categoryId];
      if (leftCategory !== rightCategory) return leftCategory - rightCategory;
      var leftTopic = getTopic(left);
      var rightTopic = getTopic(right);
      if (leftTopic && rightTopic && leftTopic.order !== rightTopic.order) {
        return leftTopic.order - rightTopic.order;
      }
      if (leftTopic && rightTopic && leftTopic.id !== rightTopic.id) {
        return leftTopic.id < rightTopic.id ? -1 : 1;
      }
      var leftFocus = getFocusKey(left);
      var rightFocus = getFocusKey(right);
      if (leftFocus !== rightFocus) {
        // Unnamed items follow named clusters, each with their original order.
        if (!leftFocus) return 1;
        if (!rightFocus) return -1;
        return leftFocus < rightFocus ? -1 : 1;
      }
      var leftOrder = originalOrder[left.id];
      var rightOrder = originalOrder[right.id];
      // Existing source/similar items retain source order. New items follow existing
      // items, in their supplied order (Array#sort is stable in supported browsers).
      if (leftOrder == null && rightOrder == null) return 0;
      if (leftOrder == null) return 1;
      if (rightOrder == null) return -1;
      return leftOrder - rightOrder;
    });
  }

  window.PPSC_TOPIC_DATA = {
    version: 1,
    getTopic: getTopic,
    getFocusKey: getFocusKey,
    getTopics: getTopics,
    sortQuestions: sortQuestions,
    getQuestionById: function (id) { return bankById[id] || null; }
  };
})();
