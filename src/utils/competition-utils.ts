export const expandCompetitionTitle = (title: string) => {
  switch (title) {
    case 'CP':
      return 'Competitive Programming';
    case 'CTF':
      return 'Capture The Flag';
    default:
      return title;
  }
};
