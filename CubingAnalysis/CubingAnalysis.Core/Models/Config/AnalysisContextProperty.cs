using CubingAnalysis.Core.Models.Analysis;
using CubingAnalysis.Core.Models.Parsing;

namespace CubingAnalysis.Core.Models.Config;

public enum AnalysisContextProperty
{
    [AnalysisContextType<List<Session>>("[]")]
    SessionData,

    [AnalysisContextType<AnalysisChartType>("AnalysisChartType.Average")]
    ChartType,

    [AnalysisContextType<AnalysisDataGridType>("AnalysisDataGridType.Sessions")]
    DataGridType,

    [AnalysisContextType<DateTime>("DateTime.Now.AddYears(-10)")]
    StartDate,

    [AnalysisContextType<DateTime>("DateTime.Now")]
    EndDate,

    [AnalysisContextType<int>("1000")]
    ChunkSize,

    [AnalysisContextType<GroupingPeriod>("GroupingPeriod.Month")]
    SessionGroupingPeriod,

    [AnalysisContextType<double>("10.0")]
    ChartSubX,


    [AnalysisContextType<double>("10.0")]
    GridSubX,

    [AnalysisContextType<int>("20")]
    MininmumSessionResults,
}