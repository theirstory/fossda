import { VideoId } from "./videos";

// Hero's Journey stages adapted for Open Source Pioneers
export interface JourneyStage {
  id: string;
  name: string;
  description: string;
  order: number;
  archetype: 'beginning' | 'initiation' | 'transformation' | 'return';
}

export const heroJourneyStages: JourneyStage[] = [
  {
    id: 'ordinary-world',
    name: 'Ordinary World',
    description: 'Early life, education, first encounters with computing',
    order: 1,
    archetype: 'beginning'
  },
  {
    id: 'call-to-adventure',
    name: 'Call to Adventure',
    description: 'Discovery of programming, first computer, realization of software\'s potential',
    order: 2,
    archetype: 'beginning'
  },
  {
    id: 'refusal-doubt',
    name: 'Refusal & Doubt',
    description: 'Initial challenges, imposter syndrome, technical barriers',
    order: 3,
    archetype: 'beginning'
  },
  {
    id: 'meeting-mentor',
    name: 'Meeting the Mentor',
    description: 'Key professors, colleagues, or pioneers who shaped their path',
    order: 4,
    archetype: 'initiation'
  },
  {
    id: 'crossing-threshold',
    name: 'Crossing the Threshold',
    description: 'First major project, contribution, or professional role in open source',
    order: 5,
    archetype: 'initiation'
  },
  {
    id: 'tests-allies-enemies',
    name: 'Tests, Allies & Enemies',
    description: 'Building communities, facing corporate opposition, technical challenges',
    order: 6,
    archetype: 'initiation'
  },
  {
    id: 'approach',
    name: 'Approach to the Cave',
    description: 'Major challenges: licensing battles, funding crises, adoption struggles',
    order: 7,
    archetype: 'transformation'
  },
  {
    id: 'ordeal',
    name: 'The Ordeal',
    description: 'Critical moments of crisis or breakthrough',
    order: 8,
    archetype: 'transformation'
  },
  {
    id: 'reward',
    name: 'The Reward',
    description: 'Success, adoption, recognition of their work',
    order: 9,
    archetype: 'transformation'
  },
  {
    id: 'road-back',
    name: 'The Road Back',
    description: 'Sharing knowledge, mentoring others, building institutions',
    order: 10,
    archetype: 'return'
  },
  {
    id: 'resurrection',
    name: 'Resurrection',
    description: 'Evolution of their work, adapting to new challenges',
    order: 11,
    archetype: 'return'
  },
  {
    id: 'return-elixir',
    name: 'Return with Elixir',
    description: 'Legacy, ongoing impact, wisdom shared with community',
    order: 12,
    archetype: 'return'
  }
];

export interface PioneerJourneyMoment {
  stageId: string;
  year?: number;
  title: string;
  description: string;
  location?: string;
  themes: string[];
  challenges: string[];
  relatedPioneers?: string[]; // IDs of other pioneers involved
  timestamp?: number; // Interview timestamp reference
}

export interface PioneerJourney {
  pioneerId: VideoId;
  pioneerName: string;
  birthYear: number;
  location: string; // Primary location
  keyThemes: string[];
  moments: PioneerJourneyMoment[];
}

export const pioneerJourneys: PioneerJourney[] = [
  {
    pioneerId: 'eric-allman-interview-with-fossda',
    pioneerName: 'Eric Allman',
    birthYear: 1955,
    location: 'Berkeley, California',
    keyThemes: ['Email Infrastructure', 'Berkeley Unix', 'Open Source Philosophy', 'LGBTQ+ in Tech'],
    moments: [
      {
        stageId: 'ordinary-world',
        year: 1955,
        title: 'Growing Up in Berkeley',
        description: 'Born in Oakland, raised in Berkeley with strong identification with the area',
        location: 'Berkeley, California',
        themes: ['Education', 'California Culture'],
        challenges: ['Parents divorce', 'Finding identity']
      },
      {
        stageId: 'call-to-adventure',
        year: 1973,
        title: 'Entering UC Berkeley',
        description: 'Enrolled at UC Berkeley, discovered passion for computing and theater tech',
        location: 'Berkeley, California',
        themes: ['Higher Education', 'Computing'],
        challenges: ['Choosing career path'],
        timestamp: 375
      },
      {
        stageId: 'meeting-mentor',
        year: 1977,
        title: 'Bill Joy and BSD',
        description: 'Worked with Bill Joy on Berkeley Software Distribution',
        location: 'Berkeley, California',
        themes: ['Unix', 'Mentorship', 'Collaboration'],
        challenges: ['Learning Unix internals'],
        relatedPioneers: ['kirk-mckusick']
      },
      {
        stageId: 'crossing-threshold',
        year: 1983,
        title: 'Creating Sendmail',
        description: 'Developed Sendmail, which became the backbone of internet email',
        location: 'Berkeley, California',
        themes: ['Email', 'Internet Infrastructure', 'Open Source'],
        challenges: ['Complex email routing', 'Multiple network types'],
        timestamp: 1503
      },
      {
        stageId: 'tests-allies-enemies',
        year: 1988,
        title: 'Coming Out',
        description: 'Coming out as gay in the tech community during a less accepting era',
        location: 'Berkeley, California',
        themes: ['LGBTQ+ Rights', 'Personal Identity', 'Courage'],
        challenges: ['Social stigma', 'Professional concerns']
      },
      {
        stageId: 'approach',
        year: 1998,
        title: 'Sendmail Inc.',
        description: 'Founded commercial company around Sendmail',
        location: 'California',
        themes: ['Open Source Business', 'Commercialization'],
        challenges: ['Balancing open source and business'],
        relatedPioneers: ['kirk-mckusick']
      },
      {
        stageId: 'ordeal',
        year: 2001,
        title: 'Dot-com Crash',
        description: 'Navigating company through economic downturn',
        location: 'California',
        themes: ['Business Survival', 'Economic Crisis'],
        challenges: ['Market collapse', 'Company viability']
      },
      {
        stageId: 'reward',
        year: 2005,
        title: 'Sendmail Dominance',
        description: 'Sendmail powers majority of internet email',
        location: 'Global',
        themes: ['Success', 'Internet Infrastructure'],
        challenges: ['Maintaining relevance']
      },
      {
        stageId: 'road-back',
        year: 2010,
        title: 'Mentoring Next Generation',
        description: 'Sharing knowledge and advocating for open source principles',
        location: 'Berkeley, California',
        themes: ['Mentorship', 'Community', 'Knowledge Sharing'],
        challenges: ['Staying relevant']
      },
      {
        stageId: 'return-elixir',
        year: 2020,
        title: 'Legacy and Reflection',
        description: 'Reflecting on career, emphasizing purpose over profit',
        location: 'Berkeley, California',
        themes: ['Legacy', 'Philosophy', 'Community'],
        challenges: ['Passing the torch']
      }
    ]
  },
  {
    pioneerId: 'kirk-mckusick',
    pioneerName: 'Kirk McKusick',
    birthYear: 1954,
    location: 'Berkeley, California',
    keyThemes: ['BSD Unix', 'File Systems', 'FreeBSD', 'Open Source Licensing'],
    moments: [
      {
        stageId: 'ordinary-world',
        year: 1954,
        title: 'Early Years',
        description: 'Growing up and developing interest in computing',
        location: 'United States',
        themes: ['Education', 'Early Computing'],
        challenges: ['Access to computers']
      },
      {
        stageId: 'call-to-adventure',
        year: 1975,
        title: 'UC Berkeley',
        description: 'Joined UC Berkeley and discovered Unix',
        location: 'Berkeley, California',
        themes: ['Higher Education', 'Unix'],
        challenges: ['Learning systems programming']
      },
      {
        stageId: 'meeting-mentor',
        year: 1977,
        title: 'Working with Bill Joy',
        description: 'Collaborated with Bill Joy on BSD development',
        location: 'Berkeley, California',
        themes: ['Mentorship', 'BSD', 'Collaboration'],
        challenges: ['Complex technical problems'],
        relatedPioneers: ['eric-allman-interview-with-fossda'],
        timestamp: 1606
      },
      {
        stageId: 'crossing-threshold',
        year: 1983,
        title: 'Fast File System',
        description: 'Developed the Fast File System (FFS) for BSD',
        location: 'Berkeley, California',
        themes: ['File Systems', 'Performance', 'Innovation'],
        challenges: ['Disk performance optimization']
      },
      {
        stageId: 'tests-allies-enemies',
        year: 1991,
        title: 'AT&T Lawsuit',
        description: 'BSD faced legal challenges from AT&T over Unix code',
        location: 'Berkeley, California',
        themes: ['Legal Battles', 'Intellectual Property'],
        challenges: ['Legal uncertainty', 'Project survival']
      },
      {
        stageId: 'approach',
        year: 1994,
        title: 'Making BSD Truly Free',
        description: 'Working to remove all AT&T code from BSD',
        location: 'Berkeley, California',
        themes: ['Open Source', 'Legal Freedom'],
        challenges: ['Code rewriting', 'Compatibility']
      },
      {
        stageId: 'ordeal',
        year: 1995,
        title: 'FreeBSD Foundation',
        description: 'Critical period establishing FreeBSD as independent project',
        location: 'California',
        themes: ['Community Building', 'Independence'],
        challenges: ['Organizational structure', 'Funding']
      },
      {
        stageId: 'reward',
        year: 2000,
        title: 'FreeBSD Success',
        description: 'FreeBSD becomes foundation for many commercial systems',
        location: 'Global',
        themes: ['Success', 'Adoption', 'Industry Impact'],
        challenges: ['Competition with Linux']
      },
      {
        stageId: 'road-back',
        year: 2010,
        title: 'Continued Leadership',
        description: 'Ongoing work on FreeBSD and mentoring community',
        location: 'Berkeley, California',
        themes: ['Leadership', 'Community', 'Mentorship'],
        challenges: ['Evolving technology landscape']
      },
      {
        stageId: 'return-elixir',
        year: 2020,
        title: 'Living Legacy',
        description: 'BSD principles and code continue influencing modern systems',
        location: 'Berkeley, California',
        themes: ['Legacy', 'Impact', 'Philosophy'],
        challenges: ['Staying relevant']
      }
    ]
  },
  {
    pioneerId: 'bruce-perens',
    pioneerName: 'Bruce Perens',
    birthYear: 1958,
    location: 'Bay Area, California',
    keyThemes: ['Open Source Definition', 'Debian', 'Licensing', 'OSI'],
    moments: [
      {
        stageId: 'ordinary-world',
        year: 1958,
        title: 'Early Life',
        description: 'Growing up with fascination for technology',
        location: 'United States',
        themes: ['Childhood', 'Technology Interest'],
        challenges: ['Early access to computing']
      },
      {
        stageId: 'call-to-adventure',
        year: 1980,
        title: 'Professional Computing',
        description: 'Beginning career in technology and software',
        location: 'California',
        themes: ['Career', 'Software Development'],
        challenges: ['Industry entry']
      },
      {
        stageId: 'meeting-mentor',
        year: 1993,
        title: 'Discovering Free Software',
        description: 'Encountered GNU/Linux and free software movement',
        location: 'California',
        themes: ['Free Software', 'Philosophy'],
        challenges: ['Understanding licensing']
      },
      {
        stageId: 'crossing-threshold',
        year: 1996,
        title: 'Debian Project Leader',
        description: 'Became Debian Project Leader, created Debian Social Contract',
        location: 'California',
        themes: ['Leadership', 'Community', 'Governance'],
        challenges: ['Community management']
      },
      {
        stageId: 'tests-allies-enemies',
        year: 1997,
        title: 'Defining Open Source',
        description: 'Worked on defining what "Open Source" means',
        location: 'California',
        themes: ['Definitions', 'Standards', 'Philosophy'],
        challenges: ['Consensus building'],
        relatedPioneers: ['lawrence-rosen']
      },
      {
        stageId: 'approach',
        year: 1998,
        title: 'Co-founding OSI',
        description: 'Co-founded Open Source Initiative with Eric S. Raymond',
        location: 'California',
        themes: ['Organization', 'Advocacy', 'Business'],
        challenges: ['Defining mission', 'Gaining acceptance']
      },
      {
        stageId: 'ordeal',
        year: 1999,
        title: 'Leaving OSI',
        description: 'Conflicts and departure from OSI leadership',
        location: 'California',
        themes: ['Conflict', 'Governance', 'Vision Differences'],
        challenges: ['Organizational disputes']
      },
      {
        stageId: 'reward',
        year: 2000,
        title: 'Open Source Definition Adopted',
        description: 'Open Source Definition becomes widely accepted standard',
        location: 'Global',
        themes: ['Success', 'Standards', 'Influence'],
        challenges: ['Maintaining relevance']
      },
      {
        stageId: 'road-back',
        year: 2010,
        title: 'Continued Advocacy',
        description: 'Ongoing work educating about open source principles',
        location: 'California',
        themes: ['Education', 'Advocacy', 'Speaking'],
        challenges: ['New licensing models']
      },
      {
        stageId: 'return-elixir',
        year: 2020,
        title: 'Enduring Impact',
        description: 'Open Source Definition remains foundational to movement',
        location: 'Global',
        themes: ['Legacy', 'Standards', 'Foundation'],
        challenges: ['Evolving definitions']
      }
    ]
  },
  {
    pioneerId: 'karen-sandler',
    pioneerName: 'Karen Sandler',
    birthYear: 1975,
    location: 'California',
    keyThemes: ['Software Freedom', 'Medical Devices', 'Legal Advocacy', 'Transparency'],
    moments: [
      {
        stageId: 'ordinary-world',
        year: 1975,
        title: 'Early Life',
        description: 'Growing up and pursuing education',
        location: 'United States',
        themes: ['Education', 'Law'],
        challenges: ['Career choice']
      },
      {
        stageId: 'call-to-adventure',
        year: 2005,
        title: 'Medical Device Crisis',
        description: 'Needed cardiac device, discovered closed-source software controlling it',
        location: 'California',
        themes: ['Medical Devices', 'Software Freedom', 'Personal Health'],
        challenges: ['Proprietary medical software', 'Personal safety']
      },
      {
        stageId: 'refusal-doubt',
        year: 2006,
        title: 'Questioning Trust',
        description: 'Struggling with trusting proprietary software in life-critical device',
        location: 'California',
        themes: ['Trust', 'Transparency', 'Software Freedom'],
        challenges: ['Lack of alternatives', 'Industry resistance']
      },
      {
        stageId: 'crossing-threshold',
        year: 2008,
        title: 'Joining Software Freedom Law Center',
        description: 'Left corporate law to work for Software Freedom Law Center',
        location: 'New York',
        themes: ['Career Change', 'Advocacy', 'Legal Work'],
        challenges: ['Career transition', 'Income reduction']
      },
      {
        stageId: 'tests-allies-enemies',
        year: 2011,
        title: 'Fighting for Transparency',
        description: 'Advocating for open source in medical devices',
        location: 'United States',
        themes: ['Advocacy', 'Medical Software', 'Transparency'],
        challenges: ['Industry resistance', 'Regulatory complexity'],
        relatedPioneers: ['joshua-gay-fossda']
      },
      {
        stageId: 'approach',
        year: 2012,
        title: 'Software Freedom Conservancy',
        description: 'Became Executive Director of Software Freedom Conservancy',
        location: 'California',
        themes: ['Leadership', 'Organization', 'Advocacy'],
        challenges: ['Organizational leadership', 'Funding']
      },
      {
        stageId: 'ordeal',
        year: 2015,
        title: 'GPL Enforcement',
        description: 'Major GPL enforcement actions and legal battles',
        location: 'United States',
        themes: ['Legal Battles', 'GPL', 'Enforcement'],
        challenges: ['Corporate opposition', 'Legal complexity']
      },
      {
        stageId: 'reward',
        year: 2018,
        title: 'Growing Movement',
        description: 'Increased awareness of software freedom in critical systems',
        location: 'Global',
        themes: ['Success', 'Awareness', 'Movement Growth'],
        challenges: ['Sustaining momentum']
      },
      {
        stageId: 'road-back',
        year: 2020,
        title: 'Education and Outreach',
        description: 'Speaking globally about software freedom and medical devices',
        location: 'Global',
        themes: ['Education', 'Speaking', 'Advocacy'],
        challenges: ['Reaching broader audience']
      },
      {
        stageId: 'return-elixir',
        year: 2024,
        title: 'Ongoing Mission',
        description: 'Continuing fight for transparent, free software in critical systems',
        location: 'Global',
        themes: ['Legacy', 'Mission', 'Impact'],
        challenges: ['Systemic change']
      }
    ]
  },
  {
    pioneerId: 'tristan-nitot',
    pioneerName: 'Tristan Nitot',
    birthYear: 1966,
    location: 'France/Europe',
    keyThemes: ['Mozilla', 'Firefox', 'Browser Wars', 'European Open Source'],
    moments: [
      {
        stageId: 'ordinary-world',
        year: 1966,
        title: 'Growing Up in France',
        description: 'Early life and discovering computing as a teenager',
        location: 'France',
        themes: ['Education', 'Computing Discovery'],
        challenges: ['Access to computers']
      },
      {
        stageId: 'call-to-adventure',
        year: 1998,
        title: 'Netscape Goes Open Source',
        description: 'Excited by Netscape\'s decision to open source their browser',
        location: 'France',
        themes: ['Open Source', 'Browsers', 'Internet'],
        challenges: ['Technical debt in code'],
        timestamp: 1260
      },
      {
        stageId: 'meeting-mentor',
        year: 2000,
        title: 'Joining Mozilla',
        description: 'Connected with Mozilla community and key leaders',
        location: 'France',
        themes: ['Community', 'Mozilla', 'Collaboration'],
        challenges: ['Uncertain future'],
        relatedPioneers: ['bart-decrem']
      },
      {
        stageId: 'tests-allies-enemies',
        year: 2003,
        title: 'AOL Layoffs',
        description: 'Mozilla Foundation created after AOL abandoned project',
        location: 'France',
        themes: ['Crisis', 'Independence', 'Survival'],
        challenges: ['Funding', 'Organizational uncertainty'],
        timestamp: 1625
      },
      {
        stageId: 'approach',
        year: 2004,
        title: 'Mozilla Europe',
        description: 'Founding Mozilla Europe to support European adoption',
        location: 'Europe',
        themes: ['Organization', 'Localization', 'Growth'],
        challenges: ['Multi-language support', 'Cultural adaptation'],
        timestamp: 2941
      },
      {
        stageId: 'ordeal',
        year: 2004,
        title: 'Firefox Launch',
        description: 'Firefox 1.0 launch facing resistance and uncertainty',
        location: 'Europe',
        themes: ['Product Launch', 'Competition', 'Innovation'],
        challenges: ['Microsoft dominance', 'Market adoption'],
        timestamp: 2337
      },
      {
        stageId: 'reward',
        year: 2006,
        title: 'Firefox Success',
        description: 'Firefox achieves significant market share, challenging IE',
        location: 'Global',
        themes: ['Success', 'Market Impact', 'Community Victory'],
        challenges: ['Sustaining growth'],
        timestamp: 3783
      },
      {
        stageId: 'road-back',
        year: 2010,
        title: 'Advocacy Work',
        description: 'Focused on internet freedom and privacy advocacy',
        location: 'France',
        themes: ['Privacy', 'Advocacy', 'Internet Freedom'],
        challenges: ['Corporate surveillance']
      },
      {
        stageId: 'return-elixir',
        year: 2020,
        title: 'Continuing Impact',
        description: 'Firefox\'s legacy of browser competition and open web',
        location: 'Europe',
        themes: ['Legacy', 'Open Web', 'Standards'],
        challenges: ['Browser diversity']
      }
    ]
  },
  {
    pioneerId: 'larry-augustin',
    pioneerName: 'Larry Augustin',
    birthYear: 1962,
    location: 'Silicon Valley, California',
    keyThemes: ['Open Source Business', 'VA Linux', 'SourceForge', 'Commercialization'],
    moments: [
      {
        stageId: 'ordinary-world',
        year: 1962,
        title: 'Early Life',
        description: 'Growing up and developing interest in technology',
        location: 'United States',
        themes: ['Education', 'Technology'],
        challenges: ['Career direction']
      },
      {
        stageId: 'call-to-adventure',
        year: 1993,
        title: 'Discovering Linux',
        description: 'Encountered Linux and saw business potential',
        location: 'California',
        themes: ['Linux', 'Business Vision', 'Open Source'],
        challenges: ['Skepticism about open source business']
      },
      {
        stageId: 'crossing-threshold',
        year: 1993,
        title: 'Founding VA Linux',
        description: 'Started VA Linux Systems to sell Linux-based systems',
        location: 'Silicon Valley, California',
        themes: ['Entrepreneurship', 'Linux', 'Hardware'],
        challenges: ['Market education', 'Funding']
      },
      {
        stageId: 'tests-allies-enemies',
        year: 1996,
        title: 'Building the Business',
        description: 'Growing VA Linux, building relationships with open source community',
        location: 'Silicon Valley, California',
        themes: ['Business Growth', 'Community Relations'],
        challenges: ['Balancing profit and principles'],
        relatedPioneers: ['bruce-perens']
      },
      {
        stageId: 'approach',
        year: 1999,
        title: 'Preparing for IPO',
        description: 'VA Linux preparing to go public',
        location: 'Silicon Valley, California',
        themes: ['Finance', 'Growth', 'Validation'],
        challenges: ['Market skepticism']
      },
      {
        stageId: 'ordeal',
        year: 1999,
        title: 'Record-Breaking IPO',
        description: 'VA Linux IPO with largest first-day gain in history',
        location: 'Silicon Valley, California',
        themes: ['Success', 'Validation', 'Business Model'],
        challenges: ['Maintaining momentum']
      },
      {
        stageId: 'reward',
        year: 2000,
        title: 'SourceForge Launch',
        description: 'Launched SourceForge, becoming hub for open source projects',
        location: 'Silicon Valley, California',
        themes: ['Platform', 'Community', 'Infrastructure'],
        challenges: ['Scaling infrastructure']
      },
      {
        stageId: 'tests-allies-enemies',
        year: 2001,
        title: 'Dot-com Crash',
        description: 'Navigating company through economic collapse',
        location: 'Silicon Valley, California',
        themes: ['Crisis', 'Survival', 'Adaptation'],
        challenges: ['Economic downturn', 'Stock collapse']
      },
      {
        stageId: 'road-back',
        year: 2007,
        title: 'Company Transition',
        description: 'VA Linux transitioned, SourceForge continued',
        location: 'Silicon Valley, California',
        themes: ['Transition', 'Legacy', 'Evolution'],
        challenges: ['Business model changes']
      },
      {
        stageId: 'return-elixir',
        year: 2020,
        title: 'Proven Business Model',
        description: 'Demonstrated open source can be viable business',
        location: 'Global',
        themes: ['Legacy', 'Business Model', 'Validation'],
        challenges: ['Evolution of models']
      }
    ]
  },
  {
    pioneerId: 'cat-allman',
    pioneerName: 'Cat Allman',
    birthYear: 1962,
    location: 'California',
    keyThemes: ['Community Building', 'Google Summer of Code', 'Open Source Programs', 'Diversity'],
    moments: [
      {
        stageId: 'ordinary-world',
        year: 1980,
        title: 'Early Computing',
        description: 'Early exposure to computing through brother Eric Allman',
        location: 'California',
        themes: ['Family', 'Computing', 'Education'],
        challenges: ['Gender barriers in tech'],
        relatedPioneers: ['eric-allman-interview-with-fossda']
      },
      {
        stageId: 'call-to-adventure',
        year: 1998,
        title: 'Sendmail Inc.',
        description: 'Joined Sendmail Inc., entered open source world',
        location: 'California',
        themes: ['Open Source', 'Business', 'Community'],
        challenges: ['Learning open source culture']
      },
      {
        stageId: 'crossing-threshold',
        year: 2003,
        title: 'Joining Google',
        description: 'Joined Google to work on open source programs',
        location: 'Mountain View, California',
        themes: ['Corporate Open Source', 'Programs'],
        challenges: ['Corporate integration']
      },
      {
        stageId: 'approach',
        year: 2005,
        title: 'Google Summer of Code',
        description: 'Key role in launching Google Summer of Code',
        location: 'Mountain View, California',
        themes: ['Education', 'Mentorship', 'Community'],
        challenges: ['Program design', 'Scaling']
      },
      {
        stageId: 'reward',
        year: 2010,
        title: 'GSoC Success',
        description: 'Summer of Code becomes major pipeline for open source contributors',
        location: 'Global',
        themes: ['Success', 'Impact', 'Education'],
        challenges: ['Sustaining program']
      },
      {
        stageId: 'road-back',
        year: 2015,
        title: 'Diversity Advocacy',
        description: 'Focus on diversity and inclusion in open source',
        location: 'California',
        themes: ['Diversity', 'Inclusion', 'Community'],
        challenges: ['Cultural change']
      },
      {
        stageId: 'return-elixir',
        year: 2024,
        title: 'Lasting Impact',
        description: 'Thousands of developers entered open source through GSoC',
        location: 'Global',
        themes: ['Legacy', 'Education', 'Community'],
        challenges: ['Continuing evolution']
      }
    ]
  }
];

// Common themes that connect pioneers
export const commonThemes = [
  'Software Freedom',
  'Community Building',
  'Legal Battles',
  'Business vs. Principles',
  'Internet Infrastructure',
  'Education',
  'Diversity',
  'Standards',
  'Corporate Opposition',
  'Licensing',
  'Mentorship',
  'Personal Identity'
];

// Common challenges that connect pioneers
export const commonChallenges = [
  'Funding and Sustainability',
  'Corporate Resistance',
  'Legal Uncertainty',
  'Technical Complexity',
  'Market Adoption',
  'Community Governance',
  'Balancing Ideals and Pragmatism',
  'Imposter Syndrome',
  'Gender/Identity Barriers',
  'Economic Downturns',
  'Organizational Conflicts',
  'Maintaining Relevance'
];

// Helper function to find journey overlaps
export function findJourneyOverlaps(journey1: PioneerJourney, journey2: PioneerJourney) {
  const overlaps = {
    themes: journey1.keyThemes.filter(theme => journey2.keyThemes.includes(theme)),
    timeOverlap: false,
    locationOverlap: false,
    directCollaboration: false,
    sharedChallenges: [] as string[]
  };

  // Check time overlap
  const years1 = journey1.moments.map(m => m.year).filter(Boolean) as number[];
  const years2 = journey2.moments.map(m => m.year).filter(Boolean) as number[];
  overlaps.timeOverlap = years1.some(year => years2.includes(year));

  // Check location overlap
  overlaps.locationOverlap = journey1.moments.some(m1 =>
    journey2.moments.some(m2 => m1.location === m2.location)
  );

  // Check direct collaboration
  overlaps.directCollaboration = journey1.moments.some(m =>
    m.relatedPioneers?.includes(journey2.pioneerId)
  ) || journey2.moments.some(m =>
    m.relatedPioneers?.includes(journey1.pioneerId)
  );

  // Find shared challenges
  const challenges1 = new Set(journey1.moments.flatMap(m => m.challenges));
  const challenges2 = new Set(journey2.moments.flatMap(m => m.challenges));
  overlaps.sharedChallenges = Array.from(challenges1).filter(c => challenges2.has(c));

  return overlaps;
}
