import { QuizAssetsSeed } from "@/components/admin/quiz-assets-seed";

export const metadata = { title: "ქვიზის ფოტოები · ადმინი" };

export default function QuizAssetsPage() {
  return <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6"><QuizAssetsSeed /></main>;
}
