import { MypageCourseCard } from "@/components/mypage/mypage-course-card";
import { MypageProfile } from "@/components/mypage/mypage-profile";
import { MypageTabs } from "@/components/mypage/mypage-tabs";
import {
  mypageCourses,
  mypageProfile,
  mypageStats,
  mypageTabs,
} from "@/lib/fixtures/mypage";

export const metadata = { title: "마이페이지" };

export default function MyPage() {
  return (
    <main className="bg-background">
      <MypageProfile profile={mypageProfile} stats={mypageStats} />
      <section className="px-6 sm:px-8 py-[60px] lg:px-28 xl:px-32">
        <MypageTabs tabs={mypageTabs} />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {mypageCourses.map((course) => (
            <MypageCourseCard key={course.title} course={course} />
          ))}
        </div>
      </section>
    </main>
  );
}
