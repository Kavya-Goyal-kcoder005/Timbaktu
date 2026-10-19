export interface LetterSection {
  id: string;
  heading?: string;
  paragraphs: string[];
  callout?: string;
}

export interface CreatorLetter {
  hero: {
    title: string;
    subtitle: string;
    supportingLine: string;
    metaTitle: string;
    metaDescription: string;
  };
  greeting: {
    heading: string;
    paragraphs: string[];
  };
  sections: LetterSection[];
  signature: {
    closing: string;
    authorName: string;
    authorRole: string;
    tagline: string;
  };
  feedback: {
    heading: string;
    subtitle: string;
  };
}

export const LETTER_FROM_THE_NEST: CreatorLetter = {
  hero: {
    title: 'A Letter from the Nest',
    subtitle: 'A little note from the person who started it all.',
    supportingLine: 'Every story has a reason for being told. This is the story behind Timbaktu.',
    metaTitle: 'A Letter from the Nest | Timbaktu',
    metaDescription:
      'A personal note from Kavya Goyal, creator and developer of Timbaktu, about the idea, vision, and community behind the platform.',
  },
  greeting: {
    heading: 'Hey there, fellow storyteller! 🐦',
    paragraphs: [
      "If you're reading this, welcome to a little corner of the internet that means a lot to me.",
      "I'm Kavya Goyal, the person behind Timbaktu.",
      'Before this becomes a place for your stories, I wanted to tell you a little about the idea that brought it to life.',
    ],
  },
  sections: [
    {
      id: 'why-timbaktu',
      heading: 'Why Timbaktu?',
      paragraphs: [
        'The internet gives us countless ways to share what we think, what we do, and what we create.',
        'But I kept coming back to a simple thought:',
        'Sometimes, writing captures exactly what we want to say.',
        "Other times, there's something in our voice — a pause, an emotion, a little excitement — that words on a screen alone might not convey.",
        "That's the thought behind Timbaktu.",
        'A place where writing meets the human voice.',
        'Where a blog can be more than something you read.',
        'It can be something you hear, experience, and connect with.',
        'I wanted to create a space where people can express themselves in their own way — whether that\'s through a carefully written piece, a spoken reflection, a personal experience, a creative idea, or simply something they want to share with the world.',
      ],
      callout: 'What if sharing a story could feel a little more personal?',
    },
    {
      id: 'the-vision',
      heading: 'The Vision',
      paragraphs: [
        'My vision for Timbaktu is bigger than building another blogging application.',
        'I hope to build a welcoming community where ideas can travel, stories can find their listeners, and people feel encouraged to express themselves without needing to be professional writers or experienced creators.',
        'I imagine Timbaktu becoming a place where different perspectives coexist.',
        'Where a small personal story can be just as meaningful as a big idea.',
        'Where the way you tell something matters just as much as what you tell.',
        "I don't want Timbaktu to be just a platform people visit to publish something and leave.",
        'I want it to become a place people return to because they feel heard, discover something interesting, or find a story that stays with them.',
      ],
    },
    {
      id: 'why-the-community-matters',
      heading: 'Why the Community Matters',
      paragraphs: [
        "Here's something important:",
        'I can imagine features, write code, experiment with designs, and try to make thoughtful decisions.',
        'But the people who use this platform will see things I might miss.',
        "You'll have ideas I haven't considered.",
        "You'll discover problems I haven't noticed.",
        "And you'll imagine possibilities I haven't thought of yet.",
        "That's why your feedback matters.",
        'If something feels confusing, tell me.',
        "If a feature could be better, I'd love to hear how.",
        'If you have an idea that could make Timbaktu more useful, more welcoming, or simply more fun, please share it.',
        "You don't need to have the perfect words or a fully developed proposal.",
        'Sometimes, even a small suggestion can lead to a meaningful improvement.',
      ],
      callout: "I don't believe the best version of Timbaktu can be built by one person sitting behind a screen.",
    },
    {
      id: 'lets-build-it-together',
      heading: "Let's Build It Together",
      paragraphs: [
        "So here's my little invitation to you:",
        'If you have an idea, a suggestion, a concern, or even a small observation, consider sharing it.',
        "I can't promise that every suggestion will become a feature.",
        'But I can promise that thoughtful feedback deserves to be heard and considered.',
        'My hope is that, over time, Timbaktu grows not only through the code I write, but also through the experiences, ideas, and voices of the people who make it their own.',
        "Let's make this little corner of the internet something worth coming back to.",
      ],
      callout: 'One story, one voice, and one improvement at a time.',
    },
  ],
  signature: {
    closing: 'With gratitude and a whole lot of curiosity,',
    authorName: 'Kavya Goyal',
    authorRole: 'Creator & Developer of Timbaktu',
    tagline: 'Built with an idea. Growing with your voices.',
  },
  feedback: {
    heading: 'Help Timbaktu Grow 🌱',
    subtitle:
      'Every thoughtful suggestion helps us see Timbaktu from a new perspective. What would you change, improve, or love to see next?',
  },
};
