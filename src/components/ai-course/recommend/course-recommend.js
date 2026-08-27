"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PromptScreen } from "./prompt-screen";
import { ResultScreen } from "./result-screen";
import { PlaceModal } from "./place-modal";
import { useCourseChat } from "./use-course-chat";

/**
 * Course recommendation flow ported from the Figma wireframe.
 *
 * Two phases:
 *  - "prompt": Boni intro + a 자동/수동 toggle.
 *      · 자동 (default): describe a vibe and Boni builds the course.
 *      · 수동: start from an empty course and add every place yourself.
 *  - "result": editable course list, map, and docked Boni chat.
 *
 * 자동 모드는 프롬프트를 보내는 즉시 결과 화면으로 넘어가고, 40초 안팎 걸리는
 * 추천 응답은 결과 화면 위 버퍼링 오버레이로 기다립니다. 결과 화면 안의 Boni
 * 대화도 같은 세션·같은 엔드포인트를 쓰므로 대화 상태는 여기서 한 번만 만듭니다.
 *
 * The site header comes from the global AppFrame. Desktop hides the footer on
 * this route so the editor can fill the remaining viewport.
 */
export function CourseRecommend() {
  const searchParams = useSearchParams();
  const promptParam = searchParams?.get("prompt")?.trim() || "";
  const courseIdParam = searchParams?.get("courseId")?.trim() || "";
  const fromParam = searchParams?.get("from")?.trim() || "";
  const fromScan = fromParam === "scan";
  const fromMypage = fromParam === "mypage";
  const handledPromptRef = useRef("");

  const [phase, setPhase] = useState(() =>
    promptParam || fromScan || courseIdParam ? "result" : "prompt",
  );
  const [mode, setMode] = useState(() => (fromScan || courseIdParam ? "manual" : "auto"));
  const [startedEmpty, setStartedEmpty] = useState(false);
  const [activePlace, setActivePlace] = useState(null);
  const chat = useCourseChat();

  useEffect(() => {
    if (promptParam && handledPromptRef.current !== promptParam) {
      handledPromptRef.current = promptParam;
      setPhase("result");
      chat.send(promptParam);
    }
  }, [promptParam, chat]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-white lg:overflow-hidden">
      {phase === "prompt" ? (
        <PromptScreen
          mode={mode}
          initialPrompt={promptParam}
          onModeChange={setMode}
          onStart={(prompt) => {
            const isEmptyStart = !prompt;
            setStartedEmpty(isEmptyStart);
            setPhase("result");
            if (prompt) chat.send(prompt);
          }}
        />
      ) : (
        <ResultScreen
          chat={chat}
          onPlaceClick={setActivePlace}
          seedFromScan={fromScan}
          sourceCourseId={courseIdParam}
          fromMypage={fromMypage && Boolean(courseIdParam) && !startedEmpty}
        />
      )}

      {activePlace && (
        <PlaceModal place={activePlace} onClose={() => setActivePlace(null)} />
      )}
    </div>
  );
}
