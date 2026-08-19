/**
 * 서버 사이드에서 백엔드를 직접 호출할 때 쓰는 베이스 URL.
 *
 * 브라우저는 next.config.mjs의 rewrite 덕분에 항상 같은 오리진 `/api/*`만
 * 부르지만, 서버 컴포넌트의 fetch는 그 프록시를 거치지 않아 절대 주소가
 * 필요합니다.
 *
 * 이 기본값이 next.config.mjs의 `apiProxyTarget` 기본값과 어긋나면, 같은
 * `API_PROXY_TARGET` 미설정 상태에서 브라우저 요청만 성공하고 서버 요청은
 * 조용히 픽스처로 폴백합니다. 화면은 멀쩡해 보이는데 DB 데이터만 안 나오는
 * 형태라 알아채기 어렵습니다. 실제로 community.server.js가 혼자
 * `http://localhost:8080`을 기본값으로 들고 있어서 그렇게 깨져 있었습니다.
 *
 * 그래서 서버 쪽 기본값은 여기 한 곳에만 둡니다. next.config.mjs는 설정
 * 파일이라 이 모듈을 import하지 않으니, 주소를 바꿀 때는 그쪽도 함께
 * 고쳐야 합니다.
 */
export const DEFAULT_API_ORIGIN =
  "http://hdf-spring-alb-476185930.ap-northeast-2.elb.amazonaws.com";

export function getServerApiBaseUrl() {
  return (
    process.env.API_PROXY_TARGET ||
    process.env.INTERNAL_API_URL ||
    DEFAULT_API_ORIGIN
  );
}
