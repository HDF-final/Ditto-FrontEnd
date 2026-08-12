# Jira(Atlassian) MCP 연동 가이드

DITTO 프로젝트에서 AI 개발 도구(Claude Code / OpenAI Codex CLI)를 Jira와 연동하기 위한 설정 문서입니다.
Atlassian이 제공하는 원격 MCP 서버(`https://mcp.atlassian.com/v1/mcp`)에 연결해, 에디터/CLI 안에서
바로 Jira 이슈 조회·생성·전환·코멘트 등을 수행할 수 있습니다.

- 인증은 **OAuth**로 처리됩니다. 최초 연결 시 브라우저 창이 열리고 Atlassian 계정으로 로그인/승인합니다.
- **토큰·비밀값을 이 저장소에 커밋하지 마세요.** MCP 설정 파일에는 서버 URL만 들어갑니다.

---

## 1. Claude Code 버전 — `.mcp.json`

저장소 루트의 [`.mcp.json`](../.mcp.json)에 서버가 정의돼 있습니다. Claude Code는 이 파일을 자동으로 읽습니다.

```json
{
  "mcpServers": {
    "atlassian": {
      "type": "http",
      "url": "https://mcp.atlassian.com/v1/mcp"
    }
  }
}
```

### 연결 방법

1. 저장소 루트에서 `claude`를 실행합니다.
2. 프로젝트 스코프 MCP 서버를 신뢰할지 물으면 승인합니다.
3. `/mcp` 명령으로 `atlassian` 서버 상태를 확인하고, 필요 시 `/mcp`에서 인증(로그인)을 진행합니다.
4. 브라우저에서 Atlassian OAuth 승인을 마치면 연결이 완료됩니다.

> 상태가 `connected`로 보이면 이제 대화 중에 "내 Jira 이슈 보여줘" 같은 요청으로 도구를 사용할 수 있습니다.

---

## 2. Codex CLI 버전 — `config.toml`

OpenAI Codex CLI는 `.mcp.json`이 아니라 **`~/.codex/config.toml`** (사용자 홈의 전역 설정)에서 MCP 서버를
읽습니다. 저장소에는 예시 파일 [`docs/codex.config.example.toml`](./codex.config.example.toml)을 두었으니,
아래 절차대로 본인 홈 디렉터리 설정에 반영하세요.

Codex는 전통적으로 **stdio 방식**의 MCP 서버만 직접 실행할 수 있으므로, 원격 HTTP 서버인 Atlassian MCP는
`mcp-remote` 브리지를 통해 연결하는 방식을 권장합니다.

```toml
# ~/.codex/config.toml
[mcp_servers.atlassian]
command = "npx"
args = ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/mcp"]
```

### 연결 방법

1. Node.js가 설치돼 있어야 합니다 (`npx` 사용). 
2. 위 내용을 `~/.codex/config.toml`에 추가합니다. (Windows: `C:\Users\<사용자>\.codex\config.toml`)
3. `codex`를 실행합니다. 최초 연결 시 `mcp-remote`가 브라우저를 열어 Atlassian OAuth 로그인을 요청합니다.
4. 승인 후에는 인증 토큰이 로컬(`~/.mcp-auth` 등)에 캐시되어 이후 자동 연결됩니다.

> 최신 Codex는 스트리밍 HTTP transport를 실험적으로 지원하기도 합니다. 사용 중인 Codex 버전이 이를 지원한다면
> `command`/`args` 대신 `url = "https://mcp.atlassian.com/v1/mcp"` 형태로 직접 지정할 수 있습니다.
> 버전별 지원 여부는 `codex --version` 확인 후 Codex 공식 문서를 참고하세요.

---

## 3. 연동 후 사용 예시

두 도구 모두 아래와 같은 작업을 자연어로 요청할 수 있습니다.

- 담당 이슈 목록 조회 (JQL 검색)
- 이슈 상세 조회 / 코멘트 작성
- 새 이슈 생성, 상태(트랜지션) 변경
- 스프린트/보드 정보 확인

## 4. 주의사항

- `.mcp.json`과 `config.toml`에는 **URL만** 넣고, OAuth 토큰·API 키는 절대 커밋하지 않습니다.
- 인증 캐시 파일(`~/.mcp-auth`, `~/.codex/` 하위 등)은 로컬에만 두고 저장소에 포함하지 마세요.
