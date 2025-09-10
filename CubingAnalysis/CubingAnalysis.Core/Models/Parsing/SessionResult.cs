namespace CubingAnalysis.Core.Models.Parsing;

public class SessionResult
{
    public double Time { get; set; }
    public long Date { get; set; }
    public string Scramble { get; set; } = "";

    public bool HasTime => Time > 0;
    public DateTime DateTime => DateTimeOffset.FromUnixTimeSeconds(Date).UtcDateTime;

}
