import { VideoData } from "@/types/transcript";

// Define a type for all valid video IDs
export type VideoId = 
  | "introduction-to-fossda"
  | "tristan-nitot"
  | "deb-goodkin"
  | "heather-meeker"
  | "bruce-perens"
  | "larry-augustin"
  | "roger-dannenberg"
  | "bart-decrem"
  | "lawrence-rosen";

// Type the videoData object with Record<VideoId, VideoData>
export const videoData: Record<VideoId, VideoData> = {
  "introduction-to-fossda": {
    id: "introduction-to-fossda",
    title: "Introduction to FOSSDA",
    duration: "5:07",
    thumbnail: "/thumbnails/fossda-intro.png",
    summary: `Open source has transformed our world, not through governments or corporations, but through dedicated individuals 
    who envisioned a better way to share software. FOSSDA captures the personal stories of those who built this 
    movement, preserving their experiences for future generations who will carry open source forward into the 21st century.`,
    sentence: "An introduction to the Free and Open Source Stories Digital Archive and its mission."
  },
  "lawrence-rosen": {
    id: "lawrence-rosen",
    title: "Lawrence (Larry) Rosen",
    duration: "1:18:47",
    thumbnail: "https://image.mux.com/isR00Hr0068dfnHs2lyhmd001U778XfjCWp9QEWo3GAE7A/animated.gif?width=320&start=5&end=10",
    summary: "Interview with Lawrence (Larry) Rosen discussing their journey and contributions to open source software.",
    sentence: "From discovering computing as a teenager to playing a pivotal role in the rise of Mozilla and Firefox"
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