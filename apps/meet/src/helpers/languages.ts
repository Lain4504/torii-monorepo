interface Language {
  code: string;
  text: string;
}

// Support only English and Vietnamese
const languages: Language[] = [
  { code: 'en', text: 'English' },
  { code: 'vi', text: 'Tiếng Việt' },
];

const languagesMap = new Map<string, Language>();
languages.forEach((lang) => {
  languagesMap.set(lang.code, lang);
});

export { languagesMap };
export default languages;
