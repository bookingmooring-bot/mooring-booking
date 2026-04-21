"""
Meta Ads campaign configuration for 4-country provider acquisition launch.
Copy deck and lead form specs are embedded (sourced from Facebook_Ads_Komplet.md).
"""

from dataclasses import dataclass, field
from typing import Any

SITE_URL = "https://www.mooring-booking.com"
PRIVACY_URL = "https://www.mooring-booking.com/privacy"


@dataclass
class LeadFormSpec:
    name: str
    context_title: str
    context_body: str
    questions: list[dict[str, Any]]
    thank_you_title: str
    thank_you_body: str
    thank_you_cta_text: str
    locale: str
    follow_up_url: str = SITE_URL


@dataclass
class CountryCampaign:
    country_code: str
    lang: str
    lang_cap: str
    campaign_name: str
    daily_budget_cents: int
    geo_countries: list[str]
    age_min: int
    age_max: int
    headlines: list[str]
    primary_texts: list[str]
    descriptions: list[str]
    cta_text: str
    video_filename: str
    image_filenames: list[str]
    lead_form: LeadFormSpec
    interest_keywords: list[str] = field(default_factory=list)


ITALY = CountryCampaign(
    country_code="IT",
    lang="italian",
    lang_cap="Italian",
    campaign_name="MR-Provider-IT-2026",
    daily_budget_cents=583,
    geo_countries=["IT"],
    age_min=30,
    age_max=65,
    headlines=[
        "Hai boe nel Mediterraneo?",
        "Le tue boe possono lavorare per te",
        "Pubblica i tuoi ormeggi gratis",
        "Velisti da 11 paesi ti cercano",
        "Sii tra i primi a registrarti",
    ],
    primary_texts=[
        "Hai boe o ormeggi sulla costa mediterranea? Migliaia di velisti cercano un posto sicuro dove ormeggiare. Pubblica gratis i tuoi ormeggi su Mooring Booking e ricevi prenotazioni da velisti di tutto il mondo.",
        "Le tue boe restano vuote per la maggior parte della stagione. Nel frattempo, velisti da 11 paesi mediterranei cercano esattamente quello che hai tu. Pubblicale gratis e inizia a ricevere prenotazioni.",
        "Nuova app per gestori di ormeggi e concessioni. Pubblica le tue boe in 10 minuti, ricevi prenotazioni da velisti internazionali e gestisci tutto dal tuo smartphone.",
        "Mooring Booking e appena stato lanciato — la prima piattaforma dedicata a ormeggi e boe nel Mediterraneo. Sii tra i primi proprietari a pubblicare le tue boe.",
        "Sapevi che i tuoi ormeggi possono attirare velisti da 11 paesi? Mooring Booking collega proprietari di boe con velisti che cercano ormeggi sicuri.",
    ],
    descriptions=[
        "Pubblica gratis i tuoi ormeggi. Ricevi prenotazioni internazionali.",
        "La prima app per ormeggi e marine nel Mediterraneo.",
        "Gestisci le tue boe dallo smartphone.",
        "Velisti da 11 paesi cercano i tuoi ormeggi.",
        "Nuova piattaforma. Sii tra i primi.",
    ],
    cta_text="SIGN_UP",
    video_filename="ProviderAd_Italian.mp4",
    image_filenames=["ad_italian_1.png", "ad_italian_2.png"],
    interest_keywords=["Vela", "Nautica", "Yacht", "Sailing", "Boating"],
    lead_form=LeadFormSpec(
        name="MR Provider IT Lead Form",
        context_title="Hai ormeggi o boe? Pubblicalo gratis!",
        context_body="Compila questo modulo per registrare i tuoi ormeggi su Mooring Booking. E completamente gratuito e ti richiedera solo 2 minuti.",
        locale="it_IT",
        questions=[
            {"type": "FULL_NAME"},
            {"type": "EMAIL"},
            {"type": "PHONE"},
            {"type": "CUSTOM", "key": "city", "label": "Dove si trovano i tuoi ormeggi? (Citta/Porto)"},
            {
                "type": "CUSTOM",
                "key": "mooring_type",
                "label": "Che tipo di ormeggi hai?",
                "options": [
                    {"value": "Boa"},
                    {"value": "Pontile privato"},
                    {"value": "Banchina"},
                    {"value": "Posto in porto"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "mooring_count",
                "label": "Quanti ormeggi hai?",
                "options": [
                    {"value": "1"},
                    {"value": "2-3"},
                    {"value": "4-5"},
                    {"value": "Piu di 5"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "availability_2026",
                "label": "I tuoi ormeggi sono disponibili per la stagione 2026?",
                "options": [
                    {"value": "Si"},
                    {"value": "Parzialmente"},
                    {"value": "Non sono ancora sicuro"},
                ],
            },
        ],
        thank_you_title="Grazie per il tuo interesse!",
        thank_you_body="Abbiamo ricevuto i tuoi dati. Il nostro team ti contattera entro le prossime 24 ore per aiutarti a pubblicare i tuoi ormeggi.",
        thank_you_cta_text="Visita il sito",
    ),
)


GREECE = CountryCampaign(
    country_code="GR",
    lang="greek",
    lang_cap="Greek",
    campaign_name="MR-Provider-GR-2026",
    daily_budget_cents=500,
    geo_countries=["GR"],
    age_min=30,
    age_max=65,
    headlines=[
        "Εχεις σημαδουρες στο Αιγαιο;",
        "Οι σημαδουρες σου μπορουν να δουλεψουν",
        "Δημοσιευσε τα αγκυροβολια σου δωρεαν",
        "Ναυτικοι απο 11 χωρες σε ψαχνουν",
        "Γινε απο τους πρωτους που εγγραφονται",
    ],
    primary_texts=[
        "Εχεις σημαδουρες η αγκυροβολιο στην ελληνικη ακτογραμμη; Χιλιαδες ναυτικοι ψαχνουν ασφαλη αγκυροβολια. Δημοσιευσε δωρεαν στο Mooring Booking και δεξου κρατησεις απο ιστιοπλοους ολου του κοσμου.",
        "Οι σημαδουρες σου μενουν αδειες τον περισσοτερο καιρο. Την ιδια στιγμη, ναυτικοι απο 11 μεσογειακες χωρες ψαχνουν ακριβως αυτο που εχεις.",
        "Νεα εφαρμογη για ιδιοκτητες αγκυροβολιων και μαρινων. Δημοσιευσε τις σημαδουρες σου σε 10 λεπτα, δεξου κρατησεις απο διεθνεις ναυτικους.",
        "Το Mooring Booking μολις κυκλοφορησε — η πρωτη πλατφορμα αφιερωμενη σε αγκυροβολια και σημαδουρες στη Μεσογειο.",
        "Ηξερες οτι η σημαδουρα σου μπορει να προσελκυσει ναυτικους απο 11 χωρες; Mooring Booking συνδεει ιδιοκτητες σημαδουρων με ιστιοπλοους.",
    ],
    descriptions=[
        "Δημοσιευσε δωρεαν. Δεξου κρατησεις απο διεθνεις ναυτικους.",
        "Η πρωτη εφαρμογη για αγκυροβολια στη Μεσογειο.",
        "Διαχειρισου τις σημαδουρες σου απο το κινητο.",
        "Ναυτικοι απο 11 χωρες ψαχνουν αγκυροβολιο.",
        "Νεα πλατφορμα. Γινε απο τους πρωτους.",
    ],
    cta_text="SIGN_UP",
    video_filename="ProviderAd_Greek.mp4",
    image_filenames=["ad_greek_1.png", "ad_greek_2.png"],
    interest_keywords=["Ιστιοπλοια", "Sailing", "Yacht", "Boating"],
    lead_form=LeadFormSpec(
        name="MR Provider GR Lead Form",
        context_title="Εχεις αγκυροβολια η σημαδουρες; Δημοσιευσε το δωρεαν!",
        context_body="Συμπληρωσε αυτη τη φορμα για να καταχωρησεις τα αγκυροβολια σου στο Mooring Booking. Ειναι εντελως δωρεαν και θα σου παρει μονο 2 λεπτα.",
        locale="el_GR",
        questions=[
            {"type": "FULL_NAME"},
            {"type": "EMAIL"},
            {"type": "PHONE"},
            {"type": "CUSTOM", "key": "city", "label": "Που βρισκονται τα αγκυροβολια σου; (Πολη/Λιμανι)"},
            {
                "type": "CUSTOM",
                "key": "mooring_type",
                "label": "Τι τυπους αγκυροβολιων εχεις;",
                "options": [
                    {"value": "Σημαδουρα"},
                    {"value": "Ιδιωτικη προβλητα"},
                    {"value": "Πασσαλος"},
                    {"value": "Θεση σε λιμανι"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "mooring_count",
                "label": "Ποσα αγκυροβολια εχεις;",
                "options": [
                    {"value": "1"},
                    {"value": "2-3"},
                    {"value": "4-5"},
                    {"value": "Πανω απο 5"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "availability_2026",
                "label": "Ειναι διαθεσιμα για τη σεζον 2026;",
                "options": [
                    {"value": "Ναι"},
                    {"value": "Εν μερει"},
                    {"value": "Δεν ειμαι σιγουρος ακομα"},
                ],
            },
        ],
        thank_you_title="Ευχαριστουμε για το ενδιαφερον σου!",
        thank_you_body="Λαβαμε τα στοιχεια σου. Η ομαδα μας θα επικοινωνησει μαζι σου μεσα στις επομενες 24 ωρες για να σε βοηθησει να δημοσιευσεις τα αγκυροβολια σου.",
        thank_you_cta_text="Επισκεψου τη σελιδα",
    ),
)


SPAIN = CountryCampaign(
    country_code="ES",
    lang="spanish",
    lang_cap="Spanish",
    campaign_name="MR-Provider-ES-2026",
    daily_budget_cents=333,
    geo_countries=["ES"],
    age_min=30,
    age_max=65,
    headlines=[
        "Tienes boyas en el Mediterraneo?",
        "Tus boyas vacias pueden trabajar por ti",
        "Publica tus amarres gratis",
        "Navegantes de 11 paises te buscan",
        "Se de los primeros en registrarte",
    ],
    primary_texts=[
        "Tienes boyas o amarre en la costa mediterranea? Miles de navegantes buscan un lugar seguro para fondear. Publica tus amarres gratis en Mooring Booking y recibe reservas de velistas de todo el mundo.",
        "Tus boyas estan vacias la mayor parte de la temporada. Mientras tanto, navegantes de 11 paises mediterraneos buscan exactamente lo que tu tienes.",
        "Nueva app para propietarios de amarres y concesiones. Publica tus boyas en 10 minutos, recibe reservas de navegantes internacionales.",
        "Mooring Booking acaba de lanzarse — la primera plataforma dedicada a amarres y boyas en el Mediterraneo.",
        "Sabias que tus amarres pueden atraer navegantes de 11 paises? Mooring Booking conecta propietarios de boyas con velistas.",
    ],
    descriptions=[
        "Publica tus amarres gratis. Recibe reservas internacionales.",
        "La primera app para amarres en el Mediterraneo.",
        "Gestiona tus boyas desde el movil.",
        "Navegantes de 11 paises buscan tus amarres.",
        "Nueva plataforma. Se de los primeros.",
    ],
    cta_text="SIGN_UP",
    video_filename="ProviderAd_Spanish.mp4",
    image_filenames=["ad_spanish_1.png", "ad_spanish_2.png"],
    interest_keywords=["Vela", "Navegacion", "Yacht", "Sailing", "Boating"],
    lead_form=LeadFormSpec(
        name="MR Provider ES Lead Form",
        context_title="Tienes amarres o boyas? Publicalo gratis!",
        context_body="Rellena este formulario para registrar tus amarres en Mooring Booking. Es completamente gratuito y solo te llevara 2 minutos.",
        locale="es_ES",
        questions=[
            {"type": "FULL_NAME"},
            {"type": "EMAIL"},
            {"type": "PHONE"},
            {"type": "CUSTOM", "key": "city", "label": "Donde se encuentran tus amarres? (Ciudad/Puerto)"},
            {
                "type": "CUSTOM",
                "key": "mooring_type",
                "label": "Que tipo de amarres tienes?",
                "options": [
                    {"value": "Boya"},
                    {"value": "Muelle privado"},
                    {"value": "Pantalan"},
                    {"value": "Atraque en puerto"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "mooring_count",
                "label": "Cuantos amarres tienes?",
                "options": [
                    {"value": "1"},
                    {"value": "2-3"},
                    {"value": "4-5"},
                    {"value": "Mas de 5"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "availability_2026",
                "label": "Tus amarres estan disponibles para la temporada 2026?",
                "options": [
                    {"value": "Si"},
                    {"value": "Parcialmente"},
                    {"value": "Todavia no estoy seguro"},
                ],
            },
        ],
        thank_you_title="Gracias por tu interes!",
        thank_you_body="Hemos recibido tus datos. Nuestro equipo se pondra en contacto contigo en las proximas 24 horas para ayudarte a publicar tus amarres.",
        thank_you_cta_text="Visitar sitio web",
    ),
)


FRANCE = CountryCampaign(
    country_code="FR",
    lang="french",
    lang_cap="French",
    campaign_name="MR-Provider-FR-2026",
    daily_budget_cents=250,
    geo_countries=["FR"],
    age_min=30,
    age_max=65,
    headlines=[
        "Vous avez des bouees en Mediterranee ?",
        "Vos bouees peuvent travailler pour vous",
        "Publiez vos mouillages gratuitement",
        "Des plaisanciers de 11 pays vous cherchent",
        "Soyez parmi les premiers inscrits",
    ],
    primary_texts=[
        "Vous possedez des bouees ou des mouillages sur la cote mediterraneenne ? Des milliers de plaisanciers cherchent un endroit sur pour mouiller. Publiez vos mouillages gratuitement sur Mooring Booking.",
        "Vos bouees restent vides la majorite de la saison. Pendant ce temps, des plaisanciers de 11 pays mediterraneens cherchent exactement ce que vous avez.",
        "Nouvelle application pour les gestionnaires de mouillages. Publiez vos bouees en 10 minutes, recevez des reservations de plaisanciers internationaux.",
        "Mooring Booking vient d'etre lance — la premiere plateforme dediee aux mouillages et bouees en Mediterranee.",
        "Saviez-vous que vos mouillages peuvent attirer des plaisanciers de 11 pays ? Mooring Booking met en relation les proprietaires de bouees avec les navigateurs.",
    ],
    descriptions=[
        "Publiez gratuitement. Recevez des reservations internationales.",
        "La premiere application pour mouillages en Mediterranee.",
        "Gerez vos bouees depuis votre telephone.",
        "Des plaisanciers de 11 pays cherchent vos mouillages.",
        "Nouvelle plateforme. Soyez parmi les premiers.",
    ],
    cta_text="SIGN_UP",
    video_filename="ProviderAd_French.mp4",
    image_filenames=["ad_french_1.png", "ad_french_2.png"],
    interest_keywords=["Voile", "Navigation", "Yacht", "Plaisance", "Sailing"],
    lead_form=LeadFormSpec(
        name="MR Provider FR Lead Form",
        context_title="Vous avez des mouillages ? Publiez-les gratuitement !",
        context_body="Remplissez ce formulaire pour enregistrer vos mouillages sur Mooring Booking. C'est entierement gratuit et ne vous prendra que 2 minutes.",
        locale="fr_FR",
        questions=[
            {"type": "FULL_NAME"},
            {"type": "EMAIL"},
            {"type": "PHONE"},
            {"type": "CUSTOM", "key": "city", "label": "Ou se trouvent vos mouillages ? (Ville/Port)"},
            {
                "type": "CUSTOM",
                "key": "mooring_type",
                "label": "Quel type de mouillages possedez-vous ?",
                "options": [
                    {"value": "Bouee"},
                    {"value": "Ponton prive"},
                    {"value": "Quai"},
                    {"value": "Place de port"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "mooring_count",
                "label": "Combien de mouillages possedez-vous ?",
                "options": [
                    {"value": "1"},
                    {"value": "2-3"},
                    {"value": "4-5"},
                    {"value": "Plus de 5"},
                ],
            },
            {
                "type": "CUSTOM",
                "key": "availability_2026",
                "label": "Vos mouillages sont-ils disponibles pour la saison 2026 ?",
                "options": [
                    {"value": "Oui"},
                    {"value": "Partiellement"},
                    {"value": "Je ne suis pas encore sur"},
                ],
            },
        ],
        thank_you_title="Merci pour votre interet !",
        thank_you_body="Nous avons bien recu vos informations. Notre equipe vous contactera dans les 24 prochaines heures pour vous aider a publier vos mouillages.",
        thank_you_cta_text="Visiter le site",
    ),
)


CAMPAIGNS: dict[str, CountryCampaign] = {
    "IT": ITALY,
    "GR": GREECE,
    "ES": SPAIN,
    "FR": FRANCE,
}
