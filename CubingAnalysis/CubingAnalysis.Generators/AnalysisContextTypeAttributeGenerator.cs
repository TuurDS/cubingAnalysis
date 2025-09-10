

using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;

namespace CubingAnalysis.Generators;

[Generator]
public class AnalysisContextTypeAttributeGenerator : IIncrementalGenerator
{

    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        // Find all enums with fields that have [AnalysisContextType]
        var enumDeclarations = context.SyntaxProvider.CreateSyntaxProvider(
            predicate: static (node, _) => node is EnumMemberDeclarationSyntax,
            transform: static (ctx, _) => ctx
        ).Collect();

        context.RegisterSourceOutput(enumDeclarations, GenerateCode);
    }

    private void GenerateCode(SourceProductionContext context, ImmutableArray<GeneratorSyntaxContext> contexts)
    {
        var results = new List<(string EnumName, string GenericType, string? DefaultValue)>();
        var usingDirectives = new HashSet<string>();

        // process each enum member declaration and extract relevant info
        foreach (var ctx in contexts)
        {
            var enumDecl = (EnumMemberDeclarationSyntax) ctx.Node;
            var enumString = enumDecl.Identifier.Text;
            var attributes = enumDecl.AttributeLists.SelectMany(al => al.Attributes).ToList();
            
            var matchingAttributes = attributes
               .Where(a =>
               {
                   var type = ctx.SemanticModel.GetTypeInfo(a.Name).ConvertedType;
                   return type?.Name == "AnalysisContextTypeAttribute";
               }).ToList();

            if (!matchingAttributes.Any()) continue;
            
            // make the default value string
            string? defaultValueString =
                matchingAttributes.First().ArgumentList?.Arguments
                    .Select(arg => ctx.SemanticModel.GetConstantValue(arg.Expression))
                    .Where(c => c.HasValue && c.Value is string)
                    .Select(c => (string) c.Value!)
                    .FirstOrDefault();

            var syntaxTree = enumDecl.SyntaxTree;
            var root = syntaxTree.GetCompilationUnitRoot();

            // Collect all top-level using directives
            var usings = root.Usings
                .Where(u => u.Name is not null)
                .Select(u => u.Name!.ToString())
                .ToList();
            usingDirectives.UnionWith(usings);

            var typeSymbol = ctx.SemanticModel.GetTypeInfo(matchingAttributes.First()).ConvertedType as INamedTypeSymbol;
            var typeArg = typeSymbol?.TypeArguments.First();
            var genericTypeString = typeSymbol!.TypeArguments.First().ToString();

            results.Add((enumString, genericTypeString, defaultValueString));
        }

        if (!results.Any()) return;

        // BUILDING THE SOURCE CODE
        var sb = new StringBuilder();

        // keep the two fixed usings
        sb.AppendLine("using CubingAnalysis.Core.Models.Config;");
        sb.AppendLine("using CubingAnalysis.Core.Models.Parsing;");

        // add all other usings from the set, excluding duplicates
        foreach (var ns in usingDirectives.OrderBy(u => u))
        {
            if (ns != "CubingAnalysis.Core.Models.Config" && ns != "CubingAnalysis.Core.Models.Parsing")
                sb.AppendLine($"using {ns};");
        }

        sb.AppendLine();
        sb.AppendLine("namespace CubingAnalysis.Core.Services;");
        sb.AppendLine();
        sb.AppendLine("#nullable enable");
        sb.AppendLine("public static class AnalysisContextServiceExtensions");
        sb.AppendLine("{");

        // generate methods for each enum member that had the attribute
        foreach (var (enumName, genericType, defaultValue) in results)
        {
            bool hasDefault = defaultValue is not null;
            var getterReturnType = genericType;
            
            if (!hasDefault && !genericType.EndsWith("?"))
                getterReturnType = genericType + "?";

            var NullableType = genericType.EndsWith("?") ? genericType : genericType + "?";

            sb.AppendLine($"    public static void Set{enumName}(this AnalysisContextService context, {NullableType} value) =>");
            sb.AppendLine($"        context.Set<{NullableType}>(AnalysisContextProperty.{enumName}, value);");
            sb.AppendLine($"    public static {getterReturnType} Get{enumName}(this AnalysisContextService context) =>");
            sb.AppendLine($"        context.Get<{NullableType}>(AnalysisContextProperty.{enumName}){(hasDefault ? $" ?? {defaultValue}" : "")};");
            sb.AppendLine("");
        }

        sb.AppendLine("}");

        context.AddSource("AnalysisContextServiceExtensions.g.cs", sb.ToString());

    }
}