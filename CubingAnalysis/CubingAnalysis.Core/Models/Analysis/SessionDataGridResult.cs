

namespace CubingAnalysis.Core.Models.Analysis;

public record class SessionDataGridResult
{
    public string Name { get; init; } = "";
    public DateTime SessionStartDate { get; init; }
    public int SolveCount { get; init; }
    public double SessionAverage { get; init; }
    public double SessionSubXPercentages { get; init; }
}


