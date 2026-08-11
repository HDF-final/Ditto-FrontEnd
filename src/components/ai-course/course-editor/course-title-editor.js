"use client";

import { useState } from "react";

export function CourseTitleEditor({ defaultTitle = "" }) {
  const [title, setTitle] = useState(defaultTitle);

  return (
    <div>
      <label htmlFor="course-title" className="sr-only">
        코스 제목
      </label>
      <input
        id="course-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="코스 제목을 입력하세요"
        className="w-full border-b-2 border-dashed border-transparent bg-transparent pb-1 text-3xl font-black tracking-tight text-ink outline-none transition placeholder:text-ink-subtle focus:border-line-strong sm:text-4xl"
      />
    </div>
  );
}
