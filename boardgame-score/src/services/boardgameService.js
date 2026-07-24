(function createBoardgameService(global) {
  const returnRows = { Prefer: "return=representation" };
  const insert = (table, record) => global.SupabaseClient.rest(table, {
    method: "POST",
    headers: returnRows,
    body: JSON.stringify(record)
  });

  global.BoardgameService = Object.freeze({
    isRemoteReady: () => global.SupabaseClient.isConfigured(),
    listGames: () => global.SupabaseClient.rest("bg_games", "?select=*&order=name"),
    createGame: (game) => insert("bg_games", game),
    listUsers: () => global.SupabaseClient.rest("bg_users", "?select=*&order=nickname"),
    createUser: (user) => insert("bg_users", user),
    createMatch: (match) => insert("bg_matches", match),
    saveScores: (scores) => insert("bg_scores", scores),
    getMatchRanking(matchId) {
      return global.SupabaseClient.rest(
        "bg_scores",
        `?select=*,bg_users(nickname)&match_id=eq.${encodeURIComponent(matchId)}&order=rank`
      );
    }
  });
})(window);
