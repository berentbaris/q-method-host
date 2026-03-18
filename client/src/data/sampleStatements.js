/*
  Sample Q-statements for demo/development.
  Topic: Technology in Education.
  In production, these come from the study creator via the backend.

  25 statements to fill a standard -4 to +4 pyramid:
  -4(1) -3(2) -2(3) -1(4) 0(5) +1(4) +2(3) +3(2) +4(1) = 25 total
*/

export const SAMPLE_STATEMENTS = [
  { id: 1, text: 'Technology in the classroom improves student engagement more than traditional teaching methods.' },
  { id: 2, text: 'Students learn better when they can work at their own pace using digital tools.' },
  { id: 3, text: 'Face-to-face interaction between teacher and student is irreplaceable.' },
  { id: 4, text: 'Social media has a net negative effect on young people\u2019s learning.' },
  { id: 5, text: 'Online courses can be just as effective as in-person classes.' },
  { id: 6, text: 'Handwriting notes is more effective for learning than typing them.' },
  { id: 7, text: 'Schools should teach coding as a core subject alongside math and science.' },
  { id: 8, text: 'Too much screen time is harmful to children\u2019s cognitive development.' },
  { id: 9, text: 'Artificial intelligence will fundamentally change how we assess student work.' },
  { id: 10, text: 'The digital divide means technology in education often increases inequality.' },
  { id: 11, text: 'Gamification makes learning more fun without sacrificing depth.' },
  { id: 12, text: 'Textbooks will be completely replaced by digital resources within a decade.' },
  { id: 13, text: 'Students need to learn information literacy more than content knowledge.' },
  { id: 14, text: 'Virtual reality has the potential to revolutionize science education.' },
  { id: 15, text: 'Standardized testing does not accurately measure student understanding.' },
  { id: 16, text: 'Group projects are more valuable than individual assignments for building real-world skills.' },
  { id: 17, text: 'Teachers should be facilitators of learning, not lecturers.' },
  { id: 18, text: 'Most educational apps are distractions disguised as learning tools.' },
  { id: 19, text: 'Data analytics can help identify struggling students before they fall behind.' },
  { id: 20, text: 'Creativity and critical thinking matter more than technical skills.' },
  { id: 21, text: 'Open educational resources should replace commercial textbooks.' },
  { id: 22, text: 'Students perform better when they have a say in what they learn.' },
  { id: 23, text: 'The best teachers inspire curiosity, regardless of the technology available.' },
  { id: 24, text: 'Remote learning revealed that many students thrive outside traditional classrooms.' },
  { id: 25, text: 'Education systems change too slowly to keep up with technological progress.' },
]

// Default pyramid: scores from -4 to +4
export const DEFAULT_PYRAMID_CONFIG = [
  { score: -4, slots: 1 },
  { score: -3, slots: 2 },
  { score: -2, slots: 3 },
  { score: -1, slots: 4 },
  { score:  0, slots: 5 },
  { score:  1, slots: 4 },
  { score:  2, slots: 3 },
  { score:  3, slots: 2 },
  { score:  4, slots: 1 },
]
