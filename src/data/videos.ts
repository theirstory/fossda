// Remove the unused import
// import type { VideoData } from "@/types/transcript";

// Define a type for all valid video IDs
export type VideoId = | "introduction-to-fossda"
  | "tristan-nitot"
  | "deb-goodkin"
  | "heather-meeker"
  | "bruce-perens"
  | "larry-augustin"
  | "roger-dannenberg"
  | "bart-decrem"
  | "lawrence-rosen"
  | "jon-maddog-hall"
  | "tony-wasserman"
  | "joshua-gay-fossda"
  | "karen-sandler" | "kirk-mckusick" | "eric-allman-interview-with-fossda" | "cat-allman";

// Type the videoData object with Record<VideoId, VideoData>
export const videoData = {
  "introduction-to-fossda": {
    id: "introduction-to-fossda",
    title: "Introduction to FOSSDA",
    duration: "5:07",
    thumbnail: "/thumbnails/introduction-to-fossda.jpg",
    summary: "An introduction to the Free and Open Source Software Digital Archive project.",
    sentence: "An introduction to the Free and Open Source Software Digital Archive project."
  },
  "cat-allman": {
    id: "cat-allman",
    title: "Cat Allman",
    duration: "1:00:50",
    thumbnail: "/thumbnails/cat-allman.png",
    summary: "Cat Allman explores her journey through the open source software world from the 1980s to today, beginning with early exposure to computing through her brother, Eric Allman. She reflects on her diverse career, including key roles at Sendmail Inc. and Google, and her involvement in community-driven initiatives like Google Summer of Code. Allman highlights the value of collaboration, the need for sustainable support in open source, and the importance of fostering diversity in tech.",
    sentence: "Building Open Source Communities, Sustaining Innovation, and Driving Collaborative Change"
  },
  "eric-allman-interview-with-fossda": {
    id: "eric-allman-interview-with-fossda",
    title: "Eric Allman",
    duration: "1:39:47",
    thumbnail: "/thumbnails/eric-allman.png",
    summary: "Eric Allman reflects on his life and career as a pioneering software engineer, from growing up in Berkeley to developing foundational technologies like Sendmail and Syslog. He discusses his formative experiences at UC Berkeley, his contributions to open source software, and his personal journey of coming out in the 1970s. Allman also shares insights into his later work, retirement, and continued community involvement, emphasizing purpose and passion over profit.",
    sentence: "From Berkeley roots to building the backbone of internet email: Tracing a life of code, courage, and community"
  },
  "kirk-mckusick": {
    id: "kirk-mckusick",
    title: "Kirk McKusick",
    duration: "2:30:29",
    thumbnail: "/thumbnails/kirk-mckusick.png",
    summary: "In this interview, Marshall Kirk McKusick recounts his influential career developing the Berkeley Software Distribution (BSD) and FreeBSD operating systems, highlighting his fast file system work and his role in making BSD open source. McKusick discusses his personal life, including his relationship with husband Eric Allman (creator of Sendmail) and their approach to raising children. The conversation weaves together the evolution of Unix-based systems and McKusick's experiences navigating technological and social changes from the 1970s to present.",
    sentence: "From Code to Community: How Marshall Kirk McKusick Shaped BSD Unix and Navigated Life's Transitions"
  },
  "karen-sandler": {
    id: "karen-sandler",
    title: "Karen Sandler",
    duration: "53:32",
    thumbnail: "/thumbnails/karen-sandler.png",
    summary: "Interview with Karen Sandler discussing her journey from corporate law to becoming a leading advocate for software freedom, her work with the Software Freedom Law Center and Software Freedom Conservancy, and her personal mission to promote transparency in medical device software.",
    sentence: "From corporate law to software freedom advocacy - championing transparency in critical systems."
  },
  "joshua-gay-fossda": {
    id: "joshua-gay-fossda",
    title: "Joshua Gay",
    duration: "1:55:37",
    thumbnail: "https://image.mux.com/soSe2omfCv72n5h9BFOV5hgCXOIMVBPWIPN9MNeJC8E/animated.gif?width=320&start=5&end=10",
    summary: "Joshua Gay shares his journey from a curious, entrepreneurial youth to a key contributor in the free and open source software movement. From editing Richard Stallman's essays to co-founding projects like LibrePlanet and the CK-12 Foundation, he has focused on making technology and education more accessible. Now at IEEE, he works to bridge open source and global standards, guided by a deep belief in community and human-centered innovation.",
    sentence: "Empowering Learners, Advancing Free Software, and Building a More Humane Digital Future"
  },
  "tony-wasserman": {
    id: "tony-wasserman",
    title: "Tony Wasserman",
    duration: "1:14:21",
    thumbnail: "/thumbnails/tony-wasserman.jpg",
    summary: "Tony Wasserman, a distinguished computer science professor and open source pioneer, shares his journey from double-majoring in math and physics at UC Berkeley to becoming a leading figure in software engineering and open source development. His unique perspective bridges academic research and practical industry experience, offering valuable insights into the evolution of open source software and its impact on modern computing.",
    sentence: "From early AI research to championing open source business models and adoption."
  },
  "jon-maddog-hall": {
    id: "jon-maddog-hall",
    title: "Jon \"Maddog\" Hall",
    duration: "2:00:13",
    thumbnail: "/thumbnails/jon-maddog-hall.png",
    summary: "John \"Maddog\" Hall, a pioneer in free and open source software, shares his journey from early computing at Drexel University to championing Linux and global open tech advocacy. He played a key role in bringing Linux to the DEC Alpha platform, co-founding Linux International, and supporting open hardware initiatives like Caninos Loucos and Project Cauãn. Maddog also reflects on his teaching career, personal life, and lifelong mission to promote digital freedom, equity, and community-driven innovation.",
    sentence: "From early Unix days to Linux advocacy - exploring the evolution of open source through decades of experience."
  },
  "lawrence-rosen": {
    id: "lawrence-rosen",
    title: "Lawrence (Larry) Rosen",
    duration: "1:18:47",
    thumbnail: "https://image.mux.com/isR00Hr0068dfnHs2lyhmd001U778XfjCWp9QEWo3GAE7A/animated.gif?width=320&start=5&end=10",
    summary: "Larry Rosen explores his pivotal role in computer science and the evolution of open source licensing. Rosen recounts his educational background, early work in programming languages, and the founding of the Open Source Initiative, contrasting its philosophy with that of the Free Software Foundation. He reflects on the future of open source, its influence on scientific research, and the enduring value of human relationships in shaping innovation.",
    sentence: "Larry Rosen on building open source, bridging law and tech, and making space for future generations"
  },
  "tristan-nitot": {
    id: "tristan-nitot",
    title: "Tristan Nitot",
    duration: "1:12:24",
    thumbnail: "/thumbnails/tristan-nitot.png",
    summary: "Tristan Nitot tells the story of Netscape, AOL, Mozilla and Firefox, and how they shaped the modern Web discussing their journey and contributions to open source software.",
    sentence: "From discovering computing as a teenager to playing a pivotal role in the rise of Mozilla and Firefox"
  },
  "deb-goodkin": {
    id: "deb-goodkin",
    title: "Deb Goodkin",
    duration: "1:34:17",
    thumbnail: "/thumbnails/deb-goodkin.png",
    summary: `Deb Goodkin traces her path from her early days in Southern California to her current role as Executive Director of the FreeBSD Foundation. From her start at IBM developing firmware for storage devices to her leadership in the open source community, she shares insights about technology evolution and the importance of making software more accessible and inclusive.`,
    sentence: "From computer engineering to FreeBSD Foundation leadership - exploring a journey of technical innovation, community building, and advocacy for women in open source."
  },
  "heather-meeker": {
    id: "heather-meeker",
    title: "Heather Meeker",
    duration: "55:02",
    thumbnail: "https://image.mux.com/BxDXf8F00tZ0201IRZ3Y8cgtxOJd02k3G00gmGzbg3KI7irM/animated.gif?width=320&start=5&end=10",
    summary: `Heather Meeker shares her fascinating journey from early computer programming in the 1980s to becoming a leading voice in open source software law. Her interview provides unique insights into the evolution of software licensing and the legal frameworks that support open source development.`,
    sentence: "From computer programmer to open source legal expert - a journey through the evolution of software licensing."
  },
  "bruce-perens": {
    id: "bruce-perens",
    title: "Bruce Perens",
    duration: "39:40",
    thumbnail: "/thumbnails/bruce-perens.png",
    summary: `Bruce Perens provides a firsthand account of the early days of the open source movement and his instrumental role in shaping its direction. From his work at Pixar to creating foundational open source tools and definitions, his interview offers unique insights into how open source transformed from a radical idea to a fundamental part of modern software development.`,
    sentence: "From Pixar animation to open source advocacy - the story of how defining the Open Source Definition helped transform software development forever."
  },
  "larry-augustin": {
    id: "larry-augustin",
    title: "Larry Augustin",
    duration: "1:12:45",
    thumbnail: "/thumbnails/larry-augustin.png",
    summary: `Larry Augustin shares his journey from founding VA Linux to his pivotal role in the early days of open source business. His interview provides valuable insights into the commercialization of open source software and the creation of SourceForge, which became a cornerstone of collaborative software development.`,
    sentence: "From VA Linux to pioneering open source business models - exploring the early days of commercial open source software."
  },
  "roger-dannenberg": {
    id: "roger-dannenberg",
    title: "Roger Dannenberg",
    duration: "25:20",
    thumbnail: "/thumbnails/roger-dannenberg.png",
    summary: `Roger Dannenberg, a professor at Carnegie Mellon University, shares his journey as the co-creator of Audacity, one of the most widely used open-source audio editors. His unique perspective combines computer science, art, and music, offering insights into how open source can empower creative tools and make them accessible to everyone.`,
    sentence: "From research project to worldwide impact - the story of how Audacity became one of the most popular open source audio tools."
  },
  "bart-decrem": {
    id: "bart-decrem",
    title: "Bart Decrem",
    duration: "1:15:00",
    thumbnail: "https://image.mux.com/31cm889ntl2r00w9514HD1w6v02m98aSOThhZ7EyRbGzo/animated.gif?width=320&start=5&end=10",
    summary: `Bart Decrem shares his journey in the open source movement and his role in various open source initiatives. His interview provides valuable insights into the evolution of open source software and its impact on the technology industry.`,
    sentence: "From open source advocacy to entrepreneurship - exploring the intersection of open source and business innovation."
  }
}; 