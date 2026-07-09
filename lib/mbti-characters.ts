import { mbtiBaseType } from "@/lib/mbti-questions";

/**
 * Per-type character art + the "famous people commonly typed as X" lists.
 *
 * The art is our own original low-poly set (public/mbti/<type>.webp), generated
 * for Vivida — not 16Personalities' characters. The famous-people lists are the
 * popular community associations (unofficial — these people never took the
 * test), shown for fun and flavour, so the UI frames them as "ხშირად ამ ტიპს
 * მიაწერენ" rather than as fact.
 */

/** Public path to a type's character image (falls back to the 4-letter base). */
export function mbtiCharacterSrc(type: string): string {
  return `/mbti/${mbtiBaseType(type).toLowerCase()}.webp`;
}

/** Widely-cited (unofficial) famous associations per 4-letter type. */
export const MBTI_FAMOUS: Record<string, string[]> = {
  INTJ: ["Elon Musk", "Michelle Obama", "Friedrich Nietzsche", "Christopher Nolan"],
  INTP: ["Albert Einstein", "Marie Curie", "Bill Gates", "Isaac Newton"],
  ENTJ: ["Steve Jobs", "Margaret Thatcher", "Gordon Ramsay", "Sheryl Sandberg"],
  ENTP: ["Leonardo da Vinci", "Thomas Edison", "Mark Twain", "Sacha Baron Cohen"],
  INFJ: ["Nelson Mandela", "Carl Jung", "Martin Luther King Jr.", "Plato"],
  INFP: ["William Shakespeare", "J.R.R. Tolkien", "Vincent van Gogh", "Björk"],
  ENFJ: ["Barack Obama", "Oprah Winfrey", "Maya Angelou", "Malala Yousafzai"],
  ENFP: ["Robin Williams", "Robert Downey Jr.", "Walt Disney", "Ellen DeGeneres"],
  ISTJ: ["George Washington", "Angela Merkel", "Warren Buffett", "Natalie Portman"],
  ISFJ: ["Mother Teresa", "Queen Elizabeth II", "Rosa Parks", "Kate Middleton"],
  ESTJ: ["Frank Sinatra", "Sonia Sotomayor", "John D. Rockefeller", "Judge Judy"],
  ESFJ: ["Taylor Swift", "Bill Clinton", "Hugh Jackman", "Jennifer Garner"],
  ISTP: ["Clint Eastwood", "Michael Jordan", "Bear Grylls", "Amelia Earhart"],
  ISFP: ["Michael Jackson", "Frida Kahlo", "Bob Dylan", "Lana Del Rey"],
  ESTP: ["Ernest Hemingway", "Madonna", "Jack Nicholson", "Eddie Murphy"],
  ESFP: ["Elvis Presley", "Marilyn Monroe", "Adele", "Jamie Oliver"],
};

export function mbtiFamousFor(type: string): string[] {
  return MBTI_FAMOUS[mbtiBaseType(type)] ?? [];
}
