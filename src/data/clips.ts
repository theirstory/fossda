import { Clip } from '@/types/index';

export const clips: Clip[] = [
  {
    "id": "meeker-personal-journey",
    "title": "Personal Journey into Open Source",
    "startTime": 102.9,
    "endTime": 141.054,
    "duration": 38.154,
    "chapter": {
      "id": "exposure",
      "title": "Heather Meeker's Personal Journey into Technology"
    },
    "interviewId": "introduction-to-fossda",
    "interviewTitle": "Introduction to FOSSDA",
    "transcript": "Heather Meeker: Now, it's only fair that I tell my own story and it's certainly not the most interesting story you're going to hear, but I was a computer programmer a long time ago back in the 1980s. It was so long ago, we called ourselves computer programmers instead of software engineers. I wrote code in compiled Basic. Now, for people who are in the tech industry, that is, you know, a very lightweight way of doing computer programming, but hey, you can't judge, because it actually worked really well for what we were doing at the time.",
    "themes": ["exposure", "evolution"]
  },
  {
    "id": "perens-stallman-influence",
    "title": "From Free Software to Open Source",
    "startTime": 74.261,
    "endTime": 156.4,
    "duration": 82.139,
    "chapter": {
      "id": "evolution",
      "title": "The Genesis of Open Source Involvement"
    },
    "interviewId": "bruce-perens",
    "interviewTitle": "Bruce Perens",
    "transcript": "Heather Meeker: How'd you decide to get involved in/create this movement of open source? Bruce Perens: Well, obviously, I'm standing on the shoulders of giants because the work of Richard Stallman preceeded mine, and the basic concepts of open source are those created by Richard for free software. What we did with open source was create a marketing program for the free software concept which would reach different people. So, Richard's approach was very well suited for programmers, but it depended on the apriori understanding of the usefulness of software freedom. And our approach was more based on just having a big collection of software that you could build, whether it was a business or any project that you wanted to, you could build these upon, you could share the development of the software and my feeling personally was that the philosophy would come later for a lot of the people who participated.",
    "themes": ["evolution", "mission-values", "community"]
  },
  {
    "id": "perens-debian-community",
    "title": "Building the Debian Community",
    "startTime": 476.5,
    "endTime": 554.2,
    "duration": 77.7,
    "chapter": {
      "id": "community",
      "title": "Debian Project Leadership and Community Building"
    },
    "interviewId": "bruce-perens",
    "interviewTitle": "Bruce Perens",
    "transcript": "Bruce Perens: And I took it and obviously didn't have the time to work on all of these packages and fanned them out to 50 people who I only knew from email correspondence on the net. I was a Debian project leader, I had never actually met another Debian developer, and fanned it out. And these 50 people who also did not physically know each other combined to create a working, running, operating system. And obviously, the software was very modular and that certainly helped us get away with that but also the fact that open source let us all sort of look over each other's shoulders and help each other was very useful as well.",
    "themes": ["community", "projects"]
  },
  {
    "id": "perens-busybox-project",
    "title": "The Creation of BusyBox",
    "startTime": 600.781,
    "endTime": 660.563,
    "duration": 59.782,
    "chapter": {
      "id": "projects",
      "title": "The Creation and Impact of BusyBox"
    },
    "interviewId": "bruce-perens",
    "interviewTitle": "Bruce Perens",
    "transcript": "Bruce Perens: The whole idea of BusyBox is it's all of the commands that you might need to install an operating system on a computer made smaller so that they all would fit on a floppy disk. Okay, that's how far back this goes. We had those three-and-a-half inch plastic floppy disks and the kernel fit on one and all of the runtime and BusyBox fit on the second one. And so, you would boot your system using these two floppy disks and then you would be able to put a CD in the CD drive and install the entire distribution from it.",
    "themes": ["projects", "evolution"]
  },
  {
    "id": "goodkin-early-computers",
    "title": "First Computer Experiences", 
    "startTime": 224.624,
    "endTime": 281.673,
    "duration": 57.049,
    "chapter": {
      "id": "exposure",
      "title": "College Education and Introduction to Computing"
    },
    "interviewId": "deb-goodkin",
    "interviewTitle": "Deb Goodkin",
    "transcript": "Karen Herman: Did you have any interest in computing or computers as a kid? Deb Goodkin: So, we didn't have a computer when I was growing up. So that was before home computers. And so I really, the only thing I knew about computers was really the word processors, which were fancy typewriters. And because my dad was also a writer, we had one at home. And so that was pretty novel. And but, but I didn't grow up with computers. So I didn't know anything, I really didn't know anything about them.",
    "themes": ["exposure"]
  },
  {
    "id": "goodkin-freebsd-projects",
    "title": "FreeBSD Foundation Project Selection",
    "startTime": 1560.781,
    "endTime": 1620.563,
    "duration": 59.782,
    "chapter": {
      "id": "projects",
      "title": "Funding and Supporting Open Source Development"
    },
    "interviewId": "deb-goodkin",
    "interviewTitle": "Deb Goodkin",
    "transcript": "Karen Herman: How do people get their projects funded? What's the process? Deb Goodkin: So there's a couple things, ways, uh, we do have a, a CFP or we have, uh, actually it's a project proposal application. And so we have information on our website on how to submit a proposal. So say you have an interest in implementing something and, um, but you need funding. So usually the case is this person, maybe they have to take time off of work to do this. And, uh, so they actually, so they write up the proposal, like what is it that they want to do? What are the outcomes and what's the timeframe? And then what's the cost?",
    "themes": ["projects", "community"]
  },
  {
    "id": "meeker-early-programming",
    "title": "Early Career as a Programmer",
    "startTime": 114.52,
    "endTime": 155.88,
    "duration": 41.36,
    "chapter": {
      "id": "exposure",
      "title": "Early Career and Transition to Law"
    },
    "interviewId": "heather-meeker",
    "interviewTitle": "Heather Meeker",
    "transcript": "Zack Ellis: Could you talk a little bit about kind of the high level, like the beginnings of your career into when you started to get involved in software, in open source? Heather Meeker: Well, so I actually was a computer programmer in the 1980s. I know that just sounds absolutely ancient now. Doesn't sound ancient to me, but it's all a matter of perspective. And I got into that because there was a lot of demand for people to work in particularly applications programming. When I graduated from college, and I didn't have a degree in computer science, and in fact, most people didn't have degrees in computer science, you couldn't really get a degree in computer science, except for maybe, you know, some schools.",
    "themes": ["exposure", "education"]
  },
  {
    "id": "meeker-early-exposure",
    "title": "Early Computer Exposure Through Family",
    "startTime": 360.781,
    "endTime": 420.563,
    "duration": 59.782,
    "chapter": {
      "id": "exposure",
      "title": "Introduction to Computers and Programming"
    },
    "interviewId": "heather-meeker",
    "interviewTitle": "Heather Meeker",
    "transcript": "Zack Ellis: Well, just out of curiosity, what did he do? And how did that come about where he was like, oh, yeah, he's going to love this? Heather Meeker: He was actually a programmer. And that doesn't sound extraordinary today at all, but it was incredibly extraordinary then. I mean, he actually worked in a think tank kind of place and they were starting to use computers to solve problems, which, you know, people just hadn't even done before that. And so he used to take me to work and I would see the computers with the big tape drives on them.",
    "themes": ["exposure", "education"]
  },
  {
    "id": "perens-software-freedom-challenge",
    "title": "Challenges in Open Source Success",
    "startTime": 208.8,
    "endTime": 236.454,
    "duration": 27.654,
    "chapter": {
      "id": "challenges",
      "title": "Open Source Success and Challenges"
    },
    "interviewId": "bruce-perens",
    "interviewTitle": "Bruce Perens",
    "transcript": "Bruce Perens: We did not achieve all of our goals. Actually, I would have liked it if people did appreciate the need for software freedom, which is something that is becoming more meaningful today, especially in the context of privacy and people seeing the large web companies, as sort of privacy eating giants, don't really have your best interest in mind. And open source, though very successful, I think, has evolved a extremely capable open source, exploitation industry. So, I'm not quite so happy about that, I actually am working on solutions.",
    "themes": ["challenges", "evolution"]
  },
  {
    "id": "meeker-legal-challenges",
    "title": "Navigating Uncharted Legal Territory",
    "startTime": 1260.563,
    "endTime": 1320.781,
    "duration": 60.218,
    "chapter": {
      "id": "challenges",
      "title": "Early Experiences in Open Source Law"
    },
    "interviewId": "heather-meeker",
    "interviewTitle": "Heather Meeker",
    "transcript": "Heather Meeker: That scares lawyers a lot. Like when they don't have rules, they get freaked out. They like rules. So the experience was like walking out on a wire, you know. And by the way, there were some people at the time and probably still some some people, some lawyers who just would not deal with it at all because it was too weird and too new. And they felt that it was risky to give advice about it. But but my clients had questions. You know, I couldn't just say, oh, no, I don't know the answer to that.",
    "themes": ["challenges", "education"]
  },
  {
    "id": "goodkin-foundation-challenges",
    "title": "FreeBSD Foundation's Main Challenges",
    "startTime": 2280.781,
    "endTime": 2340.563,
    "duration": 59.782,
    "chapter": {
      "id": "challenges",
      "title": "Open Source Community Culture and Challenges"
    },
    "interviewId": "deb-goodkin",
    "interviewTitle": "Deb Goodkin",
    "transcript": "Karen Herman: What is your biggest challenge? Deb Goodkin: Um, I would say the biggest challenge that, well, a couple of things, uh, one is for the project, one's for us. So one would be getting the money that to do this work, to fund the work. Cause we, there's, there's so many things we know we can help with and we just don't have the resources to do it. And, uh, we have these conversations all the time, like, oh, if we had someone who could step in to do this, that would be so beneficial. And, but we can't, can't do it cause we don't have the funding.",
    "themes": ["challenges", "community"]
  },
  {
    "id": "perens-volunteer-challenges",
    "title": "Managing Volunteer Contributions",
    "startTime": 1860.781,
    "endTime": 1920.563,
    "duration": 59.782,
    "chapter": {
      "id": "challenges",
      "title": "Community Collaboration and its Challenges"
    },
    "interviewId": "bruce-perens",
    "interviewTitle": "Bruce Perens",
    "transcript": "Bruce Perens: Um, I think that the software collaboration was very successful. A lot of the organizational efforts were not. For example, during this time, I drove the creation of software in the public interest, non-profit that's still very active in supporting open source projects, and there was vast distrust among the Debian developers of software in the public interest.",
    "themes": ["challenges", "community"]
  },
  {
    "id": "fossda-mission",
    "title": "The Purpose of FOSSDA",
    "startTime": 4.4,
    "endTime": 47.354,
    "duration": 42.954,
    "chapter": {
      "id": "mission-values",
      "title": "Introduction to FOSSDA and Open Source"
    },
    "interviewId": "introduction-to-fossda",
    "interviewTitle": "Introduction to FOSSDA",
    "transcript": "Heather Meeker: Welcome to the open source stories, digital archive, or FOSSDA. Open source has changed the world. And it's changed the world greatly for the better. It's a movement that's been going on for quite a while now, and it didn't start because of a government, or a company, or a politician. It started really from people who wanted to change the way people had access to software because software is so important to our lives now. Whether you know it or not, you are using open-source software right now, and you're probably using it every moment of your life.",
    "themes": ["mission-values", "evolution"]
  },
  {
    "id": "fossda-purpose",
    "title": "Capturing Open Source Stories",
    "startTime": 58.3,
    "endTime": 104.807,
    "duration": 46.507,
    "chapter": {
      "id": "mission-values",
      "title": "Capturing Personal Stories of Open Source Pioneers"
    },
    "interviewId": "introduction-to-fossda",
    "interviewTitle": "Introduction to FOSSDA",
    "transcript": "Heather Meeker: Because this is such an important change in our world, and because it happened in the way it did. I thought it was important to capture the personal stories of people involved in this movement. What made them so dedicated? What made them understand that this was so important?",
    "themes": ["mission-values", "community"]
  },
  {
    "id": "goodkin-mission-values",
    "title": "Making Technology Accessible Worldwide",
    "startTime": 1540.820,
    "endTime": 1586.275,
    "duration": 45.455,
    "chapter": {
      "id": "mission-values",
      "title": "Legacy Contributors and FreeBSD's 30-Year History"
    },
    "interviewId": "deb-goodkin",
    "interviewTitle": "Deb Goodkin",
    "transcript": "Deb Goodkin: And by doing that into the world, because when you look at Pre-BSD as this product, um, I mean, companies use it and they benefit from it, but it's this free operating system that anyone around the world can use. And the hardware that it runs on can be really cheap. So you can go into, you know, underdeveloped countries. And I mean, we can't do this because we don't have the resources yet, but other people could do it. And so you can, um, teach people skills that will give them jobs and, um, you know, and make them marketable.",
    "themes": ["mission-values", "community"]
  },
  {
    "id": "goodkin-education",
    "title": "Learning Computer Engineering",
    "startTime": 380.781,
    "endTime": 430.563,
    "duration": 59.782,
    "chapter": {
      "id": "education",
      "title": "College Education and Introduction to Computing"
    },
    "interviewId": "deb-goodkin",
    "interviewTitle": "Deb Goodkin",
    "transcript": "Deb Goodkin: I was focused more on business, because like I said, before, the plan was really for me to take over my dad's business. But it wasn't something I was really interested in. And my mom actually helped me try to figure out what I was good at. And I grew up thinking, never thinking I was good at math, but my mom would always tell me how she was good at math. And so I realized that I was also very good at math. And so in doing like an assessment test at that time, computer science, and engineering actually came up as a strength.",
    "themes": ["education", "exposure"]
  },
  {
    "id": "meeker-mission-values",
    "title": "Why Open Source Matters",
    "startTime": 1380.781,
    "endTime": 1440.563,
    "duration": 59.782,
    "chapter": {
      "id": "mission-values",
      "title": "Open Source as a Transformative Force"
    },
    "interviewId": "heather-meeker",
    "interviewTitle": "Heather Meeker",
    "transcript": "Heather Meeker: I really saw it as transformative almost from the beginning. I did not realize and I'm not sure very many people would have realized at that time how huge it would get. But it was just so different from everything else that you learned as a technology lawyer. Like if you do a regular software license, you know, it has a particular form and some terms that you would expect. Open source is like bizarro world licensing. It's like exactly the opposite. It's like giving away rights and forcing people to give away rights instead of just like normal licensing.",
    "themes": ["mission-values", "evolution"]
  },
  {
    "id": "meeker-evolution",
    "title": "Evolution of Open Source in Business",
    "startTime": 1740.781,
    "endTime": 1800.563,
    "duration": 59.782,
    "chapter": {
      "id": "evolution",
      "title": "Impact of Open Source on Business and Collaboration"
    },
    "interviewId": "heather-meeker",
    "interviewTitle": "Heather Meeker",
    "transcript": "Heather Meeker: And if you go back, I guess, 25 years, the notion that that private companies would do collaborate was not an idea. I mean, it wasn't a thing that it wasn't a thing. And today you have all these like big organizations and companies collaborating on things and giving stuff away. And that just wasn't done. I would say open source changed the entire face of technology because it it changed a paradigm for how people interact.",
    "themes": ["evolution", "community"]
  },
  // Larry Augustin Clips
  {
    "id": "augustin-early-engineering",
    "title": "Problem-Solving Mindset on the Farm",
    "startTime": 124,
    "endTime": 161,
    "duration": 37,
    "chapter": {
      "id": "background",
      "title": "Background and Early Life"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "I spent the summers working on the family farm in New Hampshire, baling hay, doing everything around the place. And I developed this tendency to just fix things. When you're out in the field and the tractor breaks, there's nobody to call. You had to just fix things yourself. And so my whole life, that's how I kind of approach things, which is just learn to do whatever needs to be done and be hands-on and fix things.",
    "themes": ["mission-values"]
  },
  {
    "id": "augustin-early-exposure",
    "title": "Early Exposure to Electronics and Tinkering",
    "startTime": 255.129,
    "endTime": 312.392,
    "duration": 57.263,
    "chapter": {
      "id": "early-academic-and-professional-experiences",
      "title": "Early Academic and Professional Experiences"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "I was also lucky in that Dayton, Ohio, is home to something called the Ham Fest, which I don't know if a lot of people know, but it is a gathering of ham radio operators that happens every year. But beyond that sort of just ham radio operators, it's really about people who tinker with electronics. And so I was lucky to have this exposure early on that this interesting thing was happening and I wanted to learn. And so I was a kid who always was experimenting with sort of basic electronics. I had the little kits as a kid where you would build the radio from scratch or you would wire together a little electronic circuits. And I was always kind of tinkering or doing or building something like that.",
    "themes": ["exposure"]
  },
  {
    "id": "augustin-early-programming",
    "title": "Early Programming Experiences with Punch Cards",
    "startTime": 410.420,
    "endTime": 543.075,
    "duration": 132.655,
    "chapter": {
      "id": "advanced-education-and-early-career",
      "title": "Advanced Education and Early Career"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "There was one thing in my high school that was interesting. There was a course I took as I began to try and understand electronics and computers, but more a course at this time. And gosh, you look back and you realize how far the world has come. That my first sort of exposure to doing anything with programming was punched cards with cobalt. And as a high school student, I was able to take a course where we didn't even have a punch card machine. We had these big coding forms, big ledger sheets of paper, 11 by 17 pieces of paper with lines on them. And there were 80 columns on a punch card. And you literally wrote in clean print across these sheets of paper. And we would send them in. So I'd have to write my program out by hand on a piece of paper. You'd send it in. People would punch those into the punch card machines. You would get back decks of cards. And then you sorted the cards into a program. And then you sent the cards in to run. So we think today about fast turn and programming and developing code. The productivity in that sense of lines of code was pretty low. It was, you know, you spent a day writing forms. You sent it in. You got punched cards back. I mean, it took a week to turn around. And if you made one change, a comma in a different place, one different line, it was a week to make a minor change. So you had to get that right. You had to make sure that was sort of perfect when it went in because the turnaround was very slow.",
    "themes": ["exposure", "education"]
  },
  {
    "id": "coining-open-source",
    "title": "Coining 'Open Source'",
    "startTime": 3475.903,
    "endTime": 3538.787,
    "duration": 62.884,
    "transcript": "We got Linus on the phone, and ultimately, the idea was we're going to brand this open source, because the openness of the source code was what was important. Bruce Perens, at the time, the head of the Debian project, had created a set of definitions for software that could be part of Debian. And we realized the world here needed to separate the notion of software in which the source code is available from free software, and we coined the term open source to do that. And we all agreed to promote and develop this, and that became the genesis for the term open source. And this was in 1998.",
    "themes": ["evolution", "mission-values"],
    "chapter": {
      "id": "evolution",
      "title": "The Genesis of Open Source"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin"
  },
  {
    "id": "augustin-bell-labs",
    "title": "Bell Labs Opportunity",
    "startTime": 761.892,
    "endTime": 815.095,
    "duration": 53.203,
    "chapter": {
      "id": "education",
      "title": "Advanced Education and Early Career"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "They would recruit kids right out of their undergraduate, they would bring them in, they'd give them an opportunity to work for a year, and then they would send them off to school to get their master's, get advanced degrees. Fabulous, fabulous program. I was lucky enough to get accepted into that. And I went from South Bend, Indiana, Notre Dame, to Holmdel, New Jersey, the home of the transistor, and Bell Labs, the place where the Big Bang was discovered.",
    "themes": ["education", "exposure"]
  },
  {
    "id": "augustin-stanford-software",
    "title": "Appreciating Free Software at Stanford",
    "startTime": 1180.920,
    "endTime": 1219.513,
    "duration": 38.593,
    "chapter": {
      "id": "evolution",
      "title": "Early Open Source Experience"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "As a research team at Stanford, we had access to essentially anything we wanted to access to commercially. We could get that. But the software that we used was easier to work with, was better, was available for free. And that's where I really learned that a community of people working together with the goal of producing great software was often producing things that were better than what was available commercially.",
    "themes": ["evolution", "community"]
  },
  {
    "id": "augustin-va-linux-founding",
    "title": "The Vision Behind VA Linux",
    "startTime": 2147.371,
    "endTime": 2273.954,
    "duration": 45.531,
    "chapter": {
      "id": "evolution",
      "title": "Building VA Linux"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "Dell had been very inspirational to me. If you look at the start of Dell Computers with Michael Dell and his dorm room at, I think it was UT Austin, assembling PCs. I was doing the same, except I was doing it in the Unix world.",
    "themes": ["evolution", "mission-values", "projects"]
  },
  {
    "id": "augustin-business-model",
    "title": "The Cathedral and the Bazaar Impact",
    "startTime": 3087.555,
    "endTime": 3124.204,
    "duration": 36.649,
    "chapter": {
      "id": "challenges",
      "title": "Business Challenges in Open Source"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "If you look at the concept of I am selling you something that's free, it's kind of an odd concept. It takes people a moment to get their heads around this concept.",
    "themes": ["challenges", "evolution", "community", "education", "mission-values"]
  },
  {
    "id": "augustin-stanford-yahoo",
    "title": "Stanford, Yahoo, Sequoia, and VA Linux's First Venture Funding",
    "startTime": 2276.883,
    "endTime": 2320.433,
    "duration": 43.550,
    "chapter": {
      "id": "evolution",
      "title": "Early Business Development"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "As I was doing this, two of my friends from Stanford had raised venture funding. Two gentlemen by the name of Jerry Yang and David Filo. You may recall those names as their little company they had started was Yahoo. Dave and Jerry were both PhD students in EDA, Electronic Design Automation, at Stanford. They had started this little directory of the web on a machine under their desk in their office at Stanford.",
    "themes": ["evolution", "community"]
  },
  {
    "id": "augustin-entrepreneurial-advice",
    "title": "Bootstrapping and Persistence in Entrepreneurship",
    "startTime": 1832.790,
    "endTime": 1900.669,
    "duration": 67.879,
    "chapter": {
      "id": "challenges",
      "title": "Entrepreneurial Lessons and Growth"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "This is just an amazing way of bootstrapping. And to me, I always look for today, I love the entrepreneurial part of the world and people launching and building things. We got people to send us checks for the computers they wanted, because we were selling a physical device. And to me, these things were hugely expensive. I mean, somewhere between $1,000 and $3,000. And I couldn't afford to buy the parts to send someone. People sent us a check ahead of time. We would cash the check, go buy the parts, have an assembly party in the living room of my apartment and ship them out. And that was what the business was initially.",
    "themes": ["challenges", "evolution", "mission-values"]
  },
  {
    "id": "augustin-learning-philosophy",
    "title": "Learning by Doing",
    "startTime": 5995.947,
    "endTime": 6109.879,
    "duration": 113.932,
    "chapter": {
      "id": "challenges",
      "title": "Entrepreneurial Lessons and Growth"
    },
    "interviewId": "larry-augustin",
    "interviewTitle": "Larry Augustin",
    "transcript": "I always encourage learning. You know, as I look back now, I realize how naive I was at every stage, but that's how we learn. So I'm not big on the would have, should have, could have done it differently. I think everyone has to go through the learning phases, and there's a ton of things that I got wrong all the time. But I listened a lot, and I hope I learned from those. This is a little of my philosophy when I advise entrepreneurs and companies - I give them advice, but I also think they have to learn themselves. People make mistakes, that's part of the learning process. It's one of the things I think is great about the Silicon Valley culture - it's a culture in which people learn from making mistakes, and you can make a mistake, and get better, and learn, and come back, and that's okay.",
    "themes": ["education", "mission-values", "challenges"]
  },
];
// Remove the dynamic functions and just export the static data
export default clips; 
