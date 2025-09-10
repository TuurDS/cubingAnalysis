using CubingAnalysis.Core.Models.Config;

namespace CubingAnalysis.Core.Services;

//public class AnalysisContextService
//{
//    private readonly Dictionary<AnalysisContextProperty, object?> _values = [];
//    private readonly HashSet<AnalysisContextProperty> _changedProperties = [];

//    private readonly Dictionary<AnalysisComponentType, List<Action<HashSet<AnalysisContextProperty>>>> _subscribers = [];

//    // Subscribe to a specific component type
//    public void Subscribe(AnalysisComponentType componentType, Action<HashSet<AnalysisContextProperty>> handler)
//    {
//        if (!_subscribers.TryGetValue(componentType, out var handlers))
//        {
//            handlers = [];
//            _subscribers[componentType] = handlers;
//        }

//        handlers.Add(handler);
//    }

//    // Unsubscribe
//    public void Unsubscribe(AnalysisComponentType componentType, Action<HashSet<AnalysisContextProperty>> handler)
//    {
//        if (_subscribers.TryGetValue(componentType, out var handlers))
//        {
//            handlers.Remove(handler);
//            if (handlers.Count == 0)
//                _subscribers.Remove(componentType);
//        }
//    }

//    // Generic Set
//    public void Set<T>(AnalysisContextProperty property, T value)
//    {
//        _values[property] = value;
//        _changedProperties.Add(property);
//    }

//    // Generic Get
//    public T? Get<T>(AnalysisContextProperty property)
//    {
//        if (_values.TryGetValue(property, out var value) && value is T typed)
//        {
//            return typed;
//        }
//        return default;
//    }

//    // Commit changes -> notify only relevant subscribers
//    public void Commit(AnalysisComponentType componentType)
//    {
//        if (_changedProperties.Count > 0 &&
//            _subscribers.TryGetValue(componentType, out var handlers))
//        {
//            foreach (var handler in handlers)
//                handler.Invoke([.. _changedProperties]);

//            _changedProperties.Clear();
//        }
//    }
//}

public class AnalysisContextService
{
    private readonly Dictionary<AnalysisContextProperty, object?> _values = [];
    private readonly Dictionary<AnalysisComponentType, HashSet<AnalysisContextProperty>> _changedPropertiesPerComponent = [];
    private readonly Dictionary<AnalysisComponentType, List<Action<HashSet<AnalysisContextProperty>>>> _subscribers = [];

    // Subscribe
    public void Subscribe(AnalysisComponentType componentType, Action<HashSet<AnalysisContextProperty>> handler)
    {
        if (!_subscribers.TryGetValue(componentType, out var handlers))
        {
            handlers = [];
            _subscribers[componentType] = handlers;
        }
        handlers.Add(handler);
    }

    // Unsubscribe
    public void Unsubscribe(AnalysisComponentType componentType, Action<HashSet<AnalysisContextProperty>> handler)
    {
        if (_subscribers.TryGetValue(componentType, out var handlers))
        {
            handlers.Remove(handler);
            if (handlers.Count == 0)
            {
                _subscribers.Remove(componentType);
            }
        }
    }

    // Generic Set (no component type)
    public void Set<T>(AnalysisContextProperty property, T value)
    {
        _values[property] = value;

        // Add changed property to all component types
        foreach (var componentType in _subscribers.Keys)
        {
            if (!_changedPropertiesPerComponent.TryGetValue(componentType, out var changedSet))
            {
                changedSet = [];
                _changedPropertiesPerComponent[componentType] = changedSet;
            }

            changedSet.Add(property);
        }
    }

    // Generic Get
    public T? Get<T>(AnalysisContextProperty property)
    {
        if (_values.TryGetValue(property, out var value) && value is T typed)
            return typed;
        return default;
    }

    // Commit changes for a specific component type
    public void Commit(AnalysisComponentType componentType)
    {
        if (_subscribers.TryGetValue(componentType, out var handlers) &&
            _changedPropertiesPerComponent.TryGetValue(componentType, out var changedProperties) &&
            changedProperties.Count > 0)
        {
            foreach (var handler in handlers)
                handler.Invoke([.. changedProperties]);

            // Clear after notifying
            changedProperties.Clear();
        }
    }
}
