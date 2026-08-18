"use client";

import { useState } from "react";
import Image from "next/image";
import { normalizePersonaId, getPersonaPageCopy } from "@/lib/fixtures/personas";
import { updateMyProfile } from "@/lib/api/users";
import { useAuthStore } from "@/stores/use-auth-store";

export function ProfileEditModal({ isOpen, onClose, currentProfile, onProfileUpdated }) {
  const setUser = useAuthStore((state) => state.setUser);
  const authUser = useAuthStore((state) => state.user);

  const initialPersonaId = normalizePersonaId(currentProfile?.persona?.id || authUser?.persona);
  const [nickname, setNickname] = useState(currentProfile?.name || authUser?.nickname || authUser?.name || "");
  const [password, setPassword] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(initialPersonaId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const copy = getPersonaPageCopy("ko");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!nickname.trim()) {
      setError("닉네임을 입력해 주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const updatedUser = await updateMyProfile({
        nickname: nickname.trim(),
        password: password.trim() || undefined,
        persona: selectedPersona,
      });

      const nextUser = {
        ...authUser,
        ...(updatedUser || {}),
        nickname: nickname.trim(),
        name: nickname.trim(),
        persona: selectedPersona,
      };

      setUser(nextUser);
      if (onProfileUpdated) {
        onProfileUpdated(nextUser);
      }
      onClose();
    } catch (err) {
      setError(err?.message || "프로필 수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-xl font-black text-ink">프로필 편집</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-ink-muted hover:bg-surface-soft hover:text-ink cursor-pointer"
            aria-label="닫기"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {/* 닉네임 */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError("");
              }}
              placeholder="새로운 닉네임을 입력하세요"
              className="w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm font-medium text-ink focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">
              비밀번호 변경 <span className="text-xs font-normal text-ink-muted">(선택)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="변경할 비밀번호 (미입력 시 기존 유지)"
              autoComplete="new-password"
              className="w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm font-medium text-ink focus:border-brand focus:bg-white focus:outline-none"
            />
          </div>

          {/* 페르소나 선택 */}
          <div>
            <label className="mb-2 block text-xs font-bold text-ink">쇼핑 타입 (페르소나)</label>
            <div className="grid grid-cols-2 gap-2.5">
              {copy.personas.map((persona) => {
                const isSelected = selectedPersona === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => setSelectedPersona(persona.id)}
                    className={`flex items-center gap-2.5 rounded-2xl border p-2.5 text-left transition cursor-pointer ${
                      isSelected
                        ? "border-brand bg-brand-soft ring-1 ring-brand"
                        : "border-line bg-white hover:bg-surface-soft"
                    }`}
                  >
                    <Image
                      src={persona.imageSrc}
                      alt={persona.name}
                      width={42}
                      height={42}
                      className="size-[42px] shrink-0 object-contain"
                      unoptimized
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink">{persona.name}</p>
                      <p className="truncate text-[10px] text-ink-muted">{persona.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-xs font-medium text-red-600">
              {error}
            </div>
          ) : null}

          {/* 버튼 */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-5 py-2.5 text-xs font-bold text-ink hover:bg-surface-soft cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-brand px-6 py-2.5 text-xs font-black text-white hover:bg-brand-dark cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "저장 중..." : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
