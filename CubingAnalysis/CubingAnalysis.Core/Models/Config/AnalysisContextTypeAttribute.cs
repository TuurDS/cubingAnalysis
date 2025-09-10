namespace CubingAnalysis.Core.Models.Config;

[AttributeUsage(AttributeTargets.Field)]
public sealed class AnalysisContextTypeAttribute<T>(string? defaultValueString = default) : Attribute
{
    public Type Type { get; } = typeof(T);
    public string? DefaultValueString { get; } = defaultValueString;
}

