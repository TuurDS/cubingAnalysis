using CubingAnalysis.Core.Models.Analysis;
using CubingAnalysis.Core.Models.Parsing;

namespace CubingAnalysis.Core.Utilities;

public static class AnalyseSessions
{

    public static List<SessionAnalysisResult> SessionAverages(IEnumerable<Session> sessions, int minSessionSolveCount, DateTime startDate, DateTime endDate)
    {
        return FilterValidSessionsAndResults(sessions, minSessionSolveCount, startDate, endDate).Select(session =>
        {
            var times = session.GetSessionTimes();
            double value = Math.Round(times.Average(), 3);
            return new SessionAnalysisResult(session.GetSessionStartDate(), value);
        }).ToList();
    }

    public static List<SessionAnalysisResult> SessionAveragesWithoutWarmupAndCooldown(IEnumerable<Session> sessions, int warmupPercentage, int cooldownPercentage, int minSessionSolveCount, DateTime startDate, DateTime endDate)
    {
        CheckWarmupCooldownPercentages(warmupPercentage, cooldownPercentage);

        return FilterValidSessionsAndResults(sessions, minSessionSolveCount, startDate, endDate).Select(session =>
        {
            var times = session.GetSessionTimes();
            var trimmed = ResultsWithoutWarmupAndCooldown(times, warmupPercentage, cooldownPercentage);
            double value = Math.Round(trimmed.Average(), 3);
            return new SessionAnalysisResult(session.GetSessionStartDate(), value);
        }).ToList();
    }

    public static List<SessionAnalysisResult> SessionSubXPercentages(IEnumerable<Session> sessions, double subX, int minSessionSolveCount, DateTime startDate, DateTime endDate)
    {
        if (subX <= 0)
            throw new ArgumentOutOfRangeException(nameof(subX), "X must be greater than 0.");

        return FilterValidSessionsAndResults(sessions, minSessionSolveCount, startDate, endDate).Select(session =>
        {
            var times = session.Results.Select(r => r.Time).ToList();
            double value = Math.Round((double) times.Count(t => t < subX) / times.Count * 100.0, 2);
            return new SessionAnalysisResult(session.GetSessionStartDate(), value);
        }).ToList();
    }

    public static List<SessionAnalysisResult> SessionSubXPercentagesWithoutWarmupAndCooldown
        (IEnumerable<Session> sessions, double subX, int warmupPercentage, int cooldownPercentage, int minSessionSolveCount, DateTime startDate, DateTime endDate)
    {
        if (subX <= 0)
            throw new ArgumentOutOfRangeException(nameof(subX), "X must be greater than 0.");

        CheckWarmupCooldownPercentages(warmupPercentage, cooldownPercentage);

        return FilterValidSessionsAndResults(sessions, minSessionSolveCount, startDate, endDate).Select(session =>
        {
            var times = session.GetSessionTimes();
            var trimmed = ResultsWithoutWarmupAndCooldown(times, warmupPercentage, cooldownPercentage);
            double value = Math.Round((double) trimmed.Count(t => t < subX) / trimmed.Count * 100.0, 2);
            return new SessionAnalysisResult(session.GetSessionStartDate(), value);
        }).ToList();
    }

    public static List<int> SessionSolveCounts(IEnumerable<Session> sessions, int minSessionSolveCount, DateTime startDate, DateTime endDate)
    {
        return FilterValidSessionsAndResults(sessions, minSessionSolveCount, startDate, endDate)
            .Select(session => session.Results.Count)
            .ToList();
    }

    // HELPER FUNCTIONS
    public static List<Session> FilterValidSessionsAndResults(IEnumerable<Session> sessions, int minSessionSolveCount, DateTime startDate, DateTime endDate)
    {
        return sessions.Select(session =>
        {
            // Create a copy of the session with filtered results
            var filteredResults = session.Results
                .Where(r => r.HasTime && r.DateTime >= startDate && r.DateTime <= endDate)
                .OrderBy(r => r.DateTime)
                .ToList();

            return new Session
            {
                Name = session.Name,
                Results = filteredResults,
            };
        })
        .Where(session => session.Results.Count >= minSessionSolveCount && session.Results.Count >= 1)
        .OrderBy(session => session.GetSessionStartDate())
        .ToList();
    }

    private static void CheckWarmupCooldownPercentages(int warmupPercentage, int cooldownPercentage)
    {
        if (warmupPercentage < 0 || warmupPercentage > 100)
            throw new ArgumentOutOfRangeException(nameof(warmupPercentage), "Warmup percentage must be between 0 and 100.");
        if (cooldownPercentage < 0 || cooldownPercentage > 100)
            throw new ArgumentOutOfRangeException(nameof(cooldownPercentage), "Cooldown percentage must be between 0 and 100.");
        if (warmupPercentage + cooldownPercentage >= 100)
            throw new ArgumentException("The sum of warmup and cooldown percentages must be less than 100.");
    }

    private static List<double> ResultsWithoutWarmupAndCooldown(List<double> results, int warmupPercentage, int cooldownPercentage)
    {
        int totalCount = results.Count;
        int warmupCount = (int) Math.Floor(totalCount * warmupPercentage / 100.0);
        int cooldownCount = (int) Math.Floor(totalCount * cooldownPercentage / 100.0);
        int takeCount = totalCount - warmupCount - cooldownCount;

        return results.Skip(warmupCount).Take(takeCount).ToList();
    }
}
