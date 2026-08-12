"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const storageKey = "ditto:shared-community-courses";

function CourseOption({ course, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-4 rounded-[24px] border bg-white px-4 py-4 text-left transition ${
        selected
          ? "border-brand shadow-[0_8px_20px_rgba(92,46,245,0.1)]"
          : "border-line hover:border-line-hover"
      }`}
      aria-pressed={selected}
    >
      <div
        className={`h-[92px] w-[116px] shrink-0 rounded-[16px] bg-linear-to-br ${course.gradient}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-brand">{course.category}</p>
        <h2 className="mt-3 truncate text-xl font-black text-ink">
          {course.title}
        </h2>
        <p className="mt-2 truncate text-[11px] font-medium text-ink-muted">
          {course.tags}
        </p>
        <p className="mt-3 text-[11px] font-medium text-ink-muted">
          {course.meta}
        </p>
      </div>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
          selected ? "bg-brand text-white" : "bg-brand-soft text-transparent"
        }`}
        aria-hidden="true"
      >
        ✓
      </span>
    </button>
  );
}

function PhotoTile({ label, upload }) {
  if (upload) {
    return (
      <button
        type="button"
        className="flex h-[166px] w-[176px] shrink-0 flex-col items-center justify-center rounded-[18px] border border-line bg-white text-center"
      >
        <span className="text-[34px] font-black leading-none text-brand">+</span>
        <span className="mt-4 text-sm font-black text-ink">사진 첨부</span>
        <span className="mt-3 text-xs font-medium text-ink-muted">최대 10장</span>
      </button>
    );
  }

  return (
    <div className="h-[166px] w-[118px] shrink-0 rounded-[18px] bg-linear-to-br from-[#2d1b8e] to-[#7c3ff2] p-5">
      <span className="text-[10px] font-black text-white">{label}</span>
    </div>
  );
}

export function ShareCourseForm({ courses }) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedCourse = courses[selectedIndex];
  const shouldScroll = courses.length > 4;
  const publishCourse = () => {
    const sharedCourse = {
      country: "JP",
      name: "Annie",
      hash: selectedCourse.tags,
      title: selectedCourse.title,
      likes: 0,
      comments: 0,
      saves: 0,
      gradient: selectedCourse.gradient,
    };

    try {
      const savedCards = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const nextCards = Array.isArray(savedCards)
        ? [...savedCards, sharedCourse]
        : [sharedCourse];
      localStorage.setItem(storageKey, JSON.stringify(nextCards));
    } catch {
      localStorage.setItem(storageKey, JSON.stringify([sharedCourse]));
    }

    router.push("/community");
  };

  return (
    <main className="bg-background">
      <section className="bg-white px-5 pb-12 pt-[94px] lg:px-24">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black text-brand">SHARE MY COURSE</p>
            <h1 className="mt-6 text-[38px] font-black leading-none text-ink">
              내 코스 공유하기
            </h1>
            <p className="mt-5 text-sm font-medium text-ink-muted">
              마이페이지의 내 코스 목록에서 공유할 코스를 선택하고, 직접 찍은
              사진과 후기를 첨부하세요.
            </p>
          </div>
          <button
            type="button"
            onClick={publishCourse}
            className="inline-flex w-fit items-center justify-center rounded-full bg-brand px-10 py-4 text-sm font-black text-white shadow-control transition hover:bg-brand-dark"
          >
            게시하기
          </button>
        </div>
      </section>

      <section className="bg-white px-5 pb-[120px] lg:px-24">
        <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[28px] bg-surface-soft p-7 lg:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-ink">내 코스</h2>
              <span className="text-sm font-black text-brand">
                {courses.length}개
              </span>
            </div>
            <div className="mt-8">
              <span className="rounded-full bg-brand px-4 py-2 text-xs font-black text-white">
                내 코스
              </span>
            </div>
            <div
              className={`mt-6 flex flex-col gap-4 pr-1 ${
                shouldScroll
                  ? "max-h-[530px] overflow-y-auto overscroll-contain"
                  : ""
              }`}
            >
              {courses.map((course, index) => (
                <CourseOption
                  key={course.title}
                  course={course}
                  selected={selectedIndex === index}
                  onSelect={() => setSelectedIndex(index)}
                />
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-7 lg:p-8">
            <h2 className="text-2xl font-black text-ink">
              선택한 코스에 사진 첨부
            </h2>
            <p className="mt-6 text-base font-black text-brand">
              {selectedCourse.title}
            </p>
            <div className="mt-6 flex gap-4 overflow-x-auto rounded-[28px] bg-surface-soft p-6">
              <PhotoTile upload />
              <PhotoTile label="PHOTO 02" />
              <PhotoTile label="PHOTO 03" />
            </div>

            <label
              htmlFor="review-caption"
              className="mt-7 block text-base font-black text-ink"
            >
              후기 캡션
            </label>
            <textarea
              id="review-caption"
              className="mt-3 h-[160px] w-full resize-none rounded-[20px] border-0 bg-surface-soft p-5 text-sm font-medium leading-6 text-ink outline-none focus:ring-2 focus:ring-brand/30"
              defaultValue={`처음 온 친구랑 따라가기 좋은 코스였어요. 사진 순서대로 보면 동선이 바로 이해됩니다.`}
            />

            <div className="mt-10 flex flex-col gap-5 rounded-[24px] bg-surface-soft p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div
                  className={`size-[100px] rounded-[18px] bg-linear-to-br ${selectedCourse.gradient}`}
                />
                <div>
                  <p className="text-sm font-black text-brand">공유 미리보기</p>
                  <h3 className="mt-3 text-xl font-black text-ink">
                    {selectedCourse.title}
                  </h3>
                  <p className="mt-3 text-xs font-medium text-ink-muted">
                    {selectedCourse.tags}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={publishCourse}
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand px-9 py-4 text-sm font-black text-white transition hover:bg-brand-dark"
              >
                게시하기
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
