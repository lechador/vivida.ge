"use client";

import { useRouter } from "next/navigation";

import { MbtiQuiz } from "@/components/mbti-quiz";
import { MBTI_ANSWERS_STORAGE_KEY, type MbtiQuestion } from "@/lib/mbti-questions";

/**
 * Public test host. The quiz runs for everyone (no login needed); on finish
 * we stash the answers and send the user to /pirovnebis-testi/claim, which decides —
 * authed → generate the result, anonymous → show the teaser gate. No AI runs
 * here, so anonymous takers can't trigger the expensive synthesis.
 */
export function MbtiTestClient({ questions }: { questions: MbtiQuestion[] }) {
  const router = useRouter();
  return (
    <MbtiQuiz
      questions={questions}
      workingLabel="ვამზადებ შენს შედეგს…"
      onSubmit={async (answers) => {
        try {
          window.localStorage.setItem(
            MBTI_ANSWERS_STORAGE_KEY,
            JSON.stringify(answers)
          );
        } catch {
          /* private mode / storage disabled — fall through to claim, which
             will bounce back to /pirovnebis-testi if it can't read the answers */
        }
        router.push("/pirovnebis-testi/claim");
        return { ok: true };
      }}
    />
  );
}
