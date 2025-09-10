using CubingAnalysis.Core.Models;

namespace CubingAnalysis.Core.Utilities;

public static class Helpers
{
    public static string[] GetLimitedLabels<T>(IList<T> items, int maxLabels, Func<T, string> labelSelector)
    {
        int labelCount = items.Count;

        if (labelCount <= maxLabels)
        {
            // show all labels
            return items.Select(labelSelector).ToArray();
        }

        // spread labels evenly
        var labels = new string[labelCount];
        for (int i = 0; i < maxLabels; i++)
        {
            int index = (int)Math.Round(i * (labelCount - 1) / (double)(maxLabels - 1));
            labels[index] = labelSelector(items[index]);
        }

        // fill the rest with empty strings
        for (int i = 0; i < labelCount; i++)
        {
            if (labels[i] == null)
                labels[i] = "";
        }

        return labels;
    }


}
