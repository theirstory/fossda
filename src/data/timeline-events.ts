export interface TimelineEvent {
  id: string;
  year: number;
  month?: number;
  day?: number;
  title: string;
  description: string;
  category: 'software' | 'organization' | 'license' | 'movement' | 'technology';
  relatedInterviews?: {
    interviewId: string;
    interviewTitle: string;
    timestamp?: number;
    context?: string;
  }[];
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'unix-creation',
    year: 1969,
    title: 'Unix Created at Bell Labs',
    description: 'Ken Thompson and Dennis Ritchie develop Unix at AT&T Bell Labs, laying the foundation for modern operating systems.',
    category: 'software',
    relatedInterviews: [
      {
        interviewId: 'kirk-mckusick',
        interviewTitle: 'Kirk McKusick',
      }
    ]
  },
  {
    id: 'c-language',
    year: 1972,
    title: 'C Programming Language',
    description: 'Dennis Ritchie creates the C programming language, which becomes fundamental to Unix and open source development.',
    category: 'technology',
  },
  {
    id: 'berkeley-unix',
    year: 1977,
    title: 'Berkeley Software Distribution (BSD)',
    description: 'UC Berkeley begins distributing its own version of Unix, creating one of the first major open source operating systems.',
    category: 'software',
    relatedInterviews: [
      {
        interviewId: 'kirk-mckusick',
        interviewTitle: 'Kirk McKusick',
        timestamp: 1606,
        context: 'McKusick explains how Bill Joy created the Berkeley Software Distribution (BSD), initially just consisting of utilities Joy had written. McKusick discusses his own contributions, including a Graphical Profiler (GPROF), and how BSD evolved.'
      },
      {
        interviewId: 'tony-wasserman',
        interviewTitle: 'Tony Wasserman',
        timestamp: 953,
        context: 'Berkeley received a grant from the United States Department of Defense that involved enhancing AT&T UNIX. They made a bunch of changes, virtual memory being the one that is perhaps the most significant. And so they created the BSD license.'
      },
      {
        interviewId: 'deb-goodkin',
        interviewTitle: 'Deb Goodkin',
        timestamp: 2674,
        context: 'The real first unencumbered Unix like operating system actually came out of Berkeley and it was called 386 BSD. And that was back in the early eighties. Berkeley took Unix and developed on it.'
      }
    ]
  },
  {
    id: 'sendmail',
    year: 1983,
    title: 'Sendmail Created',
    description: 'Eric Allman creates Sendmail at UC Berkeley, which becomes the most widely used mail transfer agent on the Internet.',
    category: 'software',
    relatedInterviews: [
      {
        interviewId: 'eric-allman-interview-with-fossda',
        interviewTitle: 'Eric Allman',
        timestamp: 1503,
        context: 'Bill came to me and said, "Eric, you know more about email than anyone else here. Why don\'t you do it?" I agreed to do this and if I had known how hard it was going to be I would never have agreed to it. But on the day the Internet got turned on, Sendmail was the mail program for the entire Internet.'
      },
      {
        interviewId: 'kirk-mckusick',
        interviewTitle: 'Kirk McKusick',
        timestamp: 7882,
        context: 'McKusick describes his husband Eric Allman\'s creation of Sendmail, a crucial email routing program that handled multiple network types through a complex configuration system and eventually became the foundation for a successful company.'
      }
    ]
  },
  {
    id: 'gnu-project',
    year: 1983,
    month: 9,
    title: 'GNU Project Announced',
    description: 'Richard Stallman announces the GNU Project to create a free Unix-like operating system.',
    category: 'movement',
  },
  {
    id: 'fsf-founded',
    year: 1985,
    month: 10,
    title: 'Free Software Foundation Founded',
    description: 'Richard Stallman establishes the Free Software Foundation to support the free software movement.',
    category: 'organization',
  },
  {
    id: 'gpl',
    year: 1989,
    title: 'GNU General Public License (GPL)',
    description: 'The first version of the GPL is released, becoming one of the most important free software licenses.',
    category: 'license',
  },
  {
    id: 'linux-kernel',
    year: 1991,
    month: 8,
    title: 'Linux Kernel Released',
    description: 'Linus Torvalds releases the first version of the Linux kernel, sparking a revolution in open source operating systems.',
    category: 'software',
  },
  {
    id: 'apache',
    year: 1995,
    title: 'Apache HTTP Server',
    description: 'The Apache HTTP Server is released, becoming the world\'s most popular web server.',
    category: 'software',
  },
  {
    id: 'netscape-source',
    year: 1998,
    month: 1,
    title: 'Netscape Releases Source Code',
    description: 'Netscape announces it will release the source code of its browser, leading to the creation of Mozilla.',
    category: 'software',
    relatedInterviews: [
      {
        interviewId: 'tristan-nitot',
        interviewTitle: 'Tristan Nitot',
        timestamp: 1260,
        context: 'Netscape\'s open-source efforts were hampered by technical debt, incomplete code releases, and AOL\'s acquisition. AOL\'s disinterest in Mozilla and its eventual legal settlement with Microsoft led to massive layoffs.'
      },
      {
        interviewId: 'bart-decrem',
        interviewTitle: 'Bart Decrem',
        context: 'Bart discusses joining Mozilla and the challenges of the Netscape open source release.'
      }
    ]
  },
  {
    id: 'osi-founded',
    year: 1998,
    month: 2,
    title: 'Open Source Initiative Founded',
    description: 'Bruce Perens and Eric S. Raymond found the Open Source Initiative to promote open source software.',
    category: 'organization',
    relatedInterviews: [
      {
        interviewId: 'bruce-perens',
        interviewTitle: 'Bruce Perens',
        context: 'Bruce Perens co-founded the Open Source Initiative to promote open source software.'
      },
      {
        interviewId: 'lawrence-rosen',
        interviewTitle: 'Lawrence Rosen',
        timestamp: 1310,
        context: 'A friend said "I\'m working with this organization on the East Coast called the Open Source Initiative. Would you like to meet them?" I found them very interesting and very challenging. Their objective of providing open source software was a good idea. It tied in many ways to what I was doing at a university, where the objective was not to make money.'
      },
      {
        interviewId: 'tony-wasserman',
        interviewTitle: 'Tony Wasserman',
        timestamp: 2784,
        context: 'In 2005, I organized a conference on open source software in the Bay Area. The OSI\'s main mission then and now has been over license approval. The open source community as a whole looks to the OSI for its leadership and voice on that.'
      }
    ]
  },
  {
    id: 'mozilla-foundation',
    year: 2003,
    title: 'Mozilla Foundation Created',
    description: 'After AOL abandoned Mozilla, the Mozilla Foundation was formed in 2003 with limited resources, gaining independence that ultimately strengthened the project.',
    category: 'organization',
    relatedInterviews: [
      {
        interviewId: 'tristan-nitot',
        interviewTitle: 'Tristan Nitot',
        timestamp: 1625,
        context: 'After AOL abandoned Mozilla, the Mozilla Foundation was formed in 2003 with limited resources. Nitot recalls the uncertainty and challenges but notes that independence from AOL ultimately strengthened the project.'
      },
      {
        interviewId: 'bart-decrem',
        interviewTitle: 'Bart Decrem',
        context: 'Bart played a major role in the Mozilla Foundation and Firefox development.'
      }
    ]
  },
  {
    id: 'va-linux-ipo',
    year: 1999,
    month: 12,
    title: 'VA Linux IPO',
    description: 'VA Linux Systems goes public with the largest first-day gain in stock market history, validating the open source business model.',
    category: 'organization',
    relatedInterviews: [
      {
        interviewId: 'larry-augustin',
        interviewTitle: 'Larry Augustin',
        context: 'Larry Augustin founded VA Linux Systems, which went public with the largest first-day gain in stock market history, proving that open source could be a viable business model.'
      }
    ]
  },
  {
    id: 'firefox',
    year: 2004,
    month: 11,
    title: 'Firefox 1.0 Released',
    description: 'Mozilla Firefox 1.0 is released, challenging Internet Explorer\'s dominance and proving open source can compete in consumer software.',
    category: 'software',
    relatedInterviews: [
      {
        interviewId: 'tristan-nitot',
        interviewTitle: 'Tristan Nitot',
        timestamp: 2337,
        context: 'The Firefox project emerged as a streamlined browser, but it initially faced resistance from the open-source community. The introduction of extensions helped bridge the gap between customization and simplicity, becoming a key factor in Firefox\'s long-term success.'
      },
      {
        interviewId: 'tristan-nitot',
        interviewTitle: 'Tristan Nitot',
        timestamp: 2941,
        context: 'After being laid off, Nitot and others worked to establish Mozilla Europe, ensuring Firefox\'s adoption across different languages and cultures. The browser\'s rapid success was fueled by frustration with Internet Explorer.'
      },
      {
        interviewId: 'tristan-nitot',
        interviewTitle: 'Tristan Nitot',
        timestamp: 3783,
        context: 'The grassroots campaign "Spread Firefox" helped Firefox gain traction. Developers and users rallied behind it, making it a viral success story and a major challenge to Microsoft.'
      },
      {
        interviewId: 'bart-decrem',
        interviewTitle: 'Bart Decrem',
        timestamp: 1669,
        context: 'Bart played a major role in branding and marketing Firefox. He explains how the name "Firefox" was chosen and how the community-driven marketing campaign propelled its adoption.'
      }
    ]
  },
  {
    id: 'git',
    year: 2005,
    title: 'Git Created',
    description: 'Linus Torvalds creates Git for Linux kernel development, revolutionizing version control and collaboration.',
    category: 'software',
  },
  {
    id: 'google-summer-of-code',
    year: 2005,
    title: 'Google Summer of Code Launched',
    description: 'Google launches Summer of Code to introduce students to open source development.',
    category: 'organization',
    relatedInterviews: [
      {
        interviewId: 'cat-allman',
        interviewTitle: 'Cat Allman',
        context: 'Cat Allman discusses her key role at Google in launching and managing Google Summer of Code, a program that introduces students to open source development.'
      }
    ]
  },
  {
    id: 'github',
    year: 2008,
    title: 'GitHub Founded',
    description: 'GitHub is launched, making Git accessible and social, transforming how developers collaborate on open source.',
    category: 'organization',
  },
  {
    id: 'android',
    year: 2008,
    title: 'Android Released',
    description: 'Google releases Android as open source, bringing open source to mobile devices at massive scale.',
    category: 'software',
  },
  {
    id: 'node-js',
    year: 2009,
    title: 'Node.js Released',
    description: 'Ryan Dahl releases Node.js, enabling JavaScript on the server and spawning a massive ecosystem of open source packages.',
    category: 'software',
  },
  {
    id: 'docker',
    year: 2013,
    title: 'Docker Released',
    description: 'Docker is released as open source, revolutionizing application deployment and infrastructure.',
    category: 'software',
  },
  {
    id: 'kubernetes',
    year: 2014,
    title: 'Kubernetes Released',
    description: 'Google releases Kubernetes as open source, becoming the standard for container orchestration.',
    category: 'software',
  },
  {
    id: 'microsoft-github',
    year: 2018,
    title: 'Microsoft Acquires GitHub',
    description: 'Microsoft acquires GitHub for $7.5 billion, marking a major shift in Microsoft\'s relationship with open source.',
    category: 'organization',
  },
  {
    id: 'ibm-redhat',
    year: 2019,
    title: 'IBM Acquires Red Hat',
    description: 'IBM acquires Red Hat for $34 billion, the largest software acquisition in history, validating enterprise open source.',
    category: 'organization',
  },
];
