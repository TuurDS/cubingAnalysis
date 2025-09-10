// See https://aka.ms/new-console-template for more information



var x = new Test().Get<double?>("qsdfqsdfs") ?? 10.0;
Console.WriteLine(x);

public class Test
{
    private readonly Dictionary<string, object?> _values = [];
    public T? Get<T>(string property)
    {
        if (_values.TryGetValue(property, out var value) && value is T typed)
        {
            return typed;
        }
        return default;
    }
}