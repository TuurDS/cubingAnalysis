using CubingAnalysis.Core.Models.Parsing;
using System.Text.Json;

namespace CubingAnalysis.Core.Parsing;

static public class CsTimerParser
{
    public static List<Session> ParseTimerExport(JsonDocument jsonDocument)
    {
        var root = jsonDocument.RootElement;

        // Extract properties
        if (!root.TryGetProperty("properties", out JsonElement properties))
            return [];

        // Extract properties.sessionData
        if (!properties.TryGetProperty("sessionData", out var sessionDataElement)
            || string.IsNullOrEmpty(sessionDataElement.GetString()))
            return [];

        // parse the sessionData String into Json
        using var sessionData = JsonDocument.Parse(sessionDataElement.GetString()!);

        // make sure the rootElement of the sessionData is an object valuekind
        if (sessionData.RootElement.ValueKind != JsonValueKind.Object)
            return [];

        // parse actual Sessions themselves
        List<Session> sessions = sessionData.RootElement
            .EnumerateObject()
            // filter out only 3x3 sessions
            .Where(p =>
            {
                if (!p.Value.TryGetProperty("opt", out var opt))
                    return true; // keep if "opt" does not exist
                 
                if (!opt.TryGetProperty("scrType", out var scrType))
                    return true; // keep if "scrType" does not exist

                // Keep only if scrType is "333"
                return scrType.GetString() == "333";
            })
            // map the sessionData to Session Objects
            .Select(p =>
            {
                try
                {
                    // Get the "sessionNumber" from the sessionData property
                    var sessionNumber = p.Value.GetProperty("rank");

                    // Construct the corresponding session key
                    string sessionKey = $"session{sessionNumber}";

                    // Try to get that array from the root
                    if (root.TryGetProperty(sessionKey, out var sessionArray))
                    {
                        // parse the Session object from the json session
                        return new Session
                        {
                            Name = p.Value.GetProperty("name").GetString()!,
                            Results = sessionArray.EnumerateArray()
                                .Select(item =>
                                {
                                    return new SessionResult
                                    {
                                        Time = item[0][1].GetDouble() / 1000,
                                        Scramble = item[1].GetString()!,
                                        Date = (long) Math.Round(item[3].GetDouble())
                                    };
                                })
                                .ToList()
                        };
                    }

                    return null;
                }
                catch
                {
                    return null; // if something goes wrong disregarde this session (set to null)
                }
            })
            .Where(x => x != null) // filter out missing sessions
            .OrderBy(s => s!.GetSessionStartDate())
            .ToList()!;

        return sessions;
    }
}
