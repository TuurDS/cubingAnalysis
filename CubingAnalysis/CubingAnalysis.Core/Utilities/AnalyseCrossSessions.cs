using CubingAnalysis.Core.Models.AnalysisResults;
using CubingAnalysis.Core.Models.Parsing;

namespace CubingAnalysis.Core.Utilities;

public static class AnalyseCrossSessions
{
    public static List<SessionResult> GetCrossSessionTimes(IEnumerable<Session> sessions, DateTime startDate, DateTime endDate)
    {
        return AnalyseSessions.FilterValidSessionsAndResults(sessions, minSessionSolveCount: 1, startDate, endDate)
            .SelectMany(session => session.Results)
            .OrderBy(r => r.DateTime)
            .ToList();
    }

    public static List<ChunkAverageResult> GetChunkedCrossSessionAverages(IEnumerable<Session> sessions, 
        int chunksize, DateTime startDate, DateTime endDate)
    {
        if (chunksize <= 0)
            throw new ArgumentOutOfRangeException(nameof(chunksize), "Chunk size must be greater than 0.");

        var allResults = GetCrossSessionTimes(sessions,startDate, endDate).Select(r => r.Time).ToList();
        var averages = new List<ChunkAverageResult>();

        for (int i = 0; i < allResults.Count; i += chunksize)
        {
            int count = Math.Min(chunksize, allResults.Count - i);
            var chunk = allResults.GetRange(i, count);
            double avg = Math.Round(chunk.Average(), 3);

            int totalSoFar = i + count;
            averages.Add(new ChunkAverageResult(totalSoFar, avg));
        }

        return averages;
    }
}
