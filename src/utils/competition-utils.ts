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

export const getCompetitionGroupChat = (title: string) => {
  switch (title) {
    case 'Arkalogica':
      return 'https://chat.whatsapp.com/DQQRLeR6bJL5GLngewQgjI';
    case 'CP':
      return 'https://discord.gg/KAvfwuTbpg';
    case 'CTF':
      return 'https://s.hmif.dev/DiscordCTFArkavidia';
    case 'Datavidia':
      return 'https://s.hmif.dev/GrupDatavidia9';
    case 'Hackvidia':
      return 'https://chat.whatsapp.com/FsDOMt0os9808Ih6qVJnfk';
    default:
      return undefined;
  }
};
