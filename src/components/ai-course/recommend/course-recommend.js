"use client";

import { useState } from "react";
import { PromptScreen } from "./prompt-screen";
import { ResultScreen } from "./result-screen";
import { PlaceModal } from "./place-modal";

/**
 * Course recommendation flow ported from the Figma wireframe.
 *
 * Two phases:
 *  - "prompt": Boni intro + prompt bar with quick suggestions.
 *  - "result": editable course list, map placeholder, and docked Boni chat.
 *
 * The site header/footer come from the global AppFrame, so this only renders
 * the flow between them.
 */
export function CourseRecommend() {
  const [phase, setPhase] = useState("prompt");
  const [, setPrompt] = useState("");
  const [activePlace, setActivePlace] = useState(null);

  return (
    <div className="flex flex-col bg-white">
      {phase === "prompt" ? (
        <PromptScreen
          onSubmit={(p) => {
            setPrompt(p);
            setPhase("result");
          }}
        />
      ) : (
        <ResultScreen onPlaceClick={setActivePlace} />
      )}

      {activePlace && (
        <PlaceModal place={activePlace} onClose={() => setActivePlace(null)} />
      )}
    </div>
  );
}
