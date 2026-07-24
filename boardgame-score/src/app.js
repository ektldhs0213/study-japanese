const statusEl = document.querySelector("#status");
const healthBtn = document.querySelector("#healthBtn");

healthBtn.addEventListener("click", async () => {
  statusEl.textContent = "확인 중...";
  healthBtn.disabled = true;
  try {
    if (!window.BoardgameService.isRemoteReady()) {
      throw new Error("Cloudflare Pages 환경변수를 먼저 설정해 주세요.");
    }
    await window.BoardgameService.listGames();
    statusEl.textContent = "Supabase 연결 성공";
  } catch (error) {
    statusEl.textContent = `연결 실패: ${error.message}`;
  } finally {
    healthBtn.disabled = false;
  }
});
