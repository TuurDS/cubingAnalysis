using CubingAnalysis.Core.Models;

namespace CubingAnalysis.Core.Services;

public class SessionState
{
    private List<Session> _value = [];

    // Event triggered when the value changes
    public event Action? OnChange;

    // Getter/Setter
    public List<Session> Value
    {
        get => _value;
        set
        {
            _value = value ?? []; // in case someone tries to set null
            OnChange?.Invoke();
        }
    }
}
