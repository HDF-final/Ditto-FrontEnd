"use client";

import { useState } from "react";
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
  const [phase, setPhase] = useState("prompt");
  const [mode, setMode] = useState("auto"); // "auto" (Boni) | "manual"
  const [activePlace, setActivePlace] = useState(null);
  const chat = useCourseChat();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white lg:min-h-[calc(100dvh-72px)]">
      {phase === "prompt" ? (
        <PromptScreen
          mode={mode}
          onModeChange={setMode}
          onStart={(prompt) => {
            // 화면 전환이 먼저, 요청은 그 위 오버레이가 받습니다.
            setPhase("result");
            // 수동 모드는 빈 문자열로 들어오므로 요청을 보내지 않습니다.
            if (prompt) chat.send(prompt);
          }}
        />
      ) : (
        <ResultScreen chat={chat} onPlaceClick={setActivePlace} />
      )}

      {activePlace && (
        <PlaceModal place={activePlace} onClose={() => setActivePlace(null)} />
      )}
    </div>
  );
}
