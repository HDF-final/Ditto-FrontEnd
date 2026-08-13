"use client";

import { useState } from "react";
import { PromptScreen } from "./prompt-screen";
import { ResultScreen } from "./result-screen";
import { PlaceModal } from "./place-modal";

/**
 * Course recommendation flow ported from the Figma wireframe.
 *
 * Two phases:
 *  - "prompt": Boni intro + a 자동/수동 toggle.
 *      · 자동 (default): describe a vibe and Boni pre-fills a course.
 *      · 수동: start from an empty course and add every place yourself.
 *  - "result": editable course list, map placeholder, and docked Boni chat.
 *
 * The site header/footer come from the global AppFrame, so this only renders
 * the flow between them.
 */
export function CourseRecommend() {
  const [phase, setPhase] = useState("prompt");
  const [mode, setMode] = useState("auto"); // "auto" (Boni) | "manual"
  const [, setPrompt] = useState("");
  const [activePlace, setActivePlace] = useState(null);

  return (
    <div className="flex flex-col bg-white">
      {phase === "prompt" ? (
        <PromptScreen
          mode={mode}
          onModeChange={setMode}
          onStart={(p) => {
            setPrompt(p);
            setPhase("result");
          }}
        />
      ) : (
        // 수동 mode starts with no places so the user builds the course from scratch.
        <ResultScreen startEmpty={mode === "manual"} onPlaceClick={setActivePlace} />
      )}

      {activePlace && (
        <PlaceModal place={activePlace} onClose={() => setActivePlace(null)} />
      )}
    </div>
  );
}
