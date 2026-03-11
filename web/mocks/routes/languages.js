// Mock data for languages configuration
const LANGUAGES = [
  { english_name: "English", iso_639_1: "en", name: "English" },
  { english_name: "Sinhala", iso_639_1: "si", name: "සිංහල" },
  { english_name: "Tamil", iso_639_1: "ta", name: "தமிழ்" },
  { english_name: "Spanish", iso_639_1: "es", name: "Español" },
  { english_name: "French", iso_639_1: "fr", name: "Français" },
  { english_name: "German", iso_639_1: "de", name: "Deutsch" },
  { english_name: "Japanese", iso_639_1: "ja", name: "日本語" },
  { english_name: "Korean", iso_639_1: "ko", name: "한국어" },
  { english_name: "Hindi", iso_639_1: "hi", name: "हिन्दी" },
];

module.exports = [
  {
    id: "get-languages",
    url: "/api/configuration/languages",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: LANGUAGES,
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 500,
          body: { message: "Failed to fetch languages" },
        },
      },
    ],
  },
];
