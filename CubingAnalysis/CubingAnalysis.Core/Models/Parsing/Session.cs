
namespace CubingAnalysis.Core.Models.Parsing;

public class Session
{
    public string Name { get; set; } = "";
    public List<SessionResult> Results { get; set; } = [];

    public DateTime GetSessionStartDate()
    {
        if (Results.Count == 0)
            throw new Exception("Session with no results does not have a start date");
        return DateTimeOffset.FromUnixTimeSeconds(Results.Select(r => r.Date).Min()).UtcDateTime;
    }

    public List<double> GetSessionTimes()
    {
        return Results.Select(result => result.Time).ToList();
    }

}
