using CubingAnalysis.Core.Models.Analysis;
using CubingAnalysis.Core.Models.AnalysisResults;
using CubingAnalysis.Core.Models.Parsing;

namespace CubingAnalysis.Core.Utilities;

public static class AnalyseDate
{
    public static List<DateAnalysisResult> GetAveragesByPeriod(IEnumerable<Session> session, GroupingPeriod period, DateTime startDate, DateTime endDate)
    {
        var results = AnalyseCrossSessions.GetCrossSessionTimes(session, startDate, endDate);

        if (results.Count == 0)
            return [];

        // Group by the chosen period
        var grouped = results
            .GroupBy(r => GetPeriodStart(r.DateTime, period))
            .OrderBy(g => g.Key)
            .ToList();

        // Build full timeline (fill missing with previous avg)
        var first = grouped.First().Key;
        var last = grouped.Last().Key;

        var allPeriods = GetAllPeriods(first, last, period);
        var result = new List<DateAnalysisResult>();

        double lastAvg = 0.0;
        foreach (var p in allPeriods)
        {
            var group = grouped.FirstOrDefault(g => g.Key == p);
            if (group != null)
                lastAvg = Math.Round(group.Average(r => r.Time), 3);

            result.Add(new DateAnalysisResult(p, lastAvg));
        }

        return result;
    }

    private static DateTime GetPeriodStart(DateTime date, GroupingPeriod period)
    {
        return period switch
        {
            GroupingPeriod.Day => date.Date,
            GroupingPeriod.Week => date.Date.AddDays(-(int) date.DayOfWeek), // Sunday start
            GroupingPeriod.Month => new DateTime(date.Year, date.Month, 1),
            GroupingPeriod.Quarter => new DateTime(date.Year, ((date.Month - 1) / 3) * 3 + 1, 1), // convert month to quarter month start 
            GroupingPeriod.Year => new DateTime(date.Year, 1, 1),
            _ => date.Date
        };
    }

    private static IEnumerable<DateTime> GetAllPeriods(DateTime start, DateTime end, GroupingPeriod period)
    {
        var current = start;
        while (current <= end)
        {
            yield return current;
            current = period switch
            {
                GroupingPeriod.Day => current.AddDays(1),
                GroupingPeriod.Week => current.AddDays(7),
                GroupingPeriod.Month => current.AddMonths(1),
                GroupingPeriod.Quarter => current.AddMonths(3),
                GroupingPeriod.Year => current.AddYears(1),
                _ => current
            };
        }
    }
}
