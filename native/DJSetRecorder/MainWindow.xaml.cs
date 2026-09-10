using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Windows;
using System.Windows.Media;
using System.Windows.Threading;
using SLSTUDIO.AudioEngine;
using SLSTUDIO.Recording;

namespace SLSTUDIO;

public partial class MainWindow : Window
{
    private readonly RecordingEngine _engine = new();
    private readonly DispatcherTimer _uiTimer;
    private readonly Stopwatch _elapsed = new();
    private readonly SolidColorBrush _accent = new(Color.FromRgb(20, 184, 166));
    private readonly SolidColorBrush _recording = new(Color.FromRgb(251, 113, 133));
    private bool _isClosing;
    private bool _asioAvailable;

    public MainWindow()
    {
        InitializeComponent();
        _engine.LevelAvailable += Engine_LevelAvailable;
        _engine.CaptureWarning += Engine_CaptureWarning;

        _uiTimer = new DispatcherTimer(DispatcherPriority.Background)
        {
            Interval = TimeSpan.FromMilliseconds(250)
        };
        _uiTimer.Tick += UiTimer_Tick;

        Loaded += MainWindow_Loaded;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        PopulateAsioDrivers();
        try
        {
            DeviceNameText.Text = _engine.RefreshDefaultDevice();
            FormatText.Text = "Ready to capture default Windows output.";
        }
        catch (Exception ex)
        {
            DeviceNameText.Text = "No Windows playback device available";
            StatusText.Text = ex.Message;
            if (!_asioAvailable)
            {
                RecordToggleButton.IsEnabled = false;
            }
        }
    }

    private void PopulateAsioDrivers()
    {
        AsioDriverComboBox.Items.Clear();
        var driverNames = _engine.GetAsioDriverNames();
        _asioAvailable = driverNames.Count > 0;
        foreach (var driverName in driverNames)
        {
            AsioDriverComboBox.Items.Add(driverName);
        }

        if (AsioDriverComboBox.Items.Count > 0)
        {
            AsioDriverComboBox.SelectedIndex = 0;
        }
        else
        {
            AsioDriverComboBox.Items.Add("No ASIO drivers detected");
            AsioDriverComboBox.IsEnabled = false;
        }
    }

    private void OnSourceSelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
    {
        if (SourceComboBox is null ||
            AsioDriverComboBox is null ||
            EndpointLabelText is null ||
            SourceBadgeText is null ||
            DeviceNameText is null ||
            FormatText is null ||
            SourceComboBox.SelectedItem is not System.Windows.Controls.ComboBoxItem item)
        {
            return;
        }

        var isAsio = string.Equals(item.Tag?.ToString(), "Asio", StringComparison.Ordinal);
        _engine.Source = isAsio ? AudioSourceMode.Asio : AudioSourceMode.WasapiLoopback;
        AsioDriverComboBox.Visibility = isAsio ? Visibility.Visible : Visibility.Collapsed;
        EndpointLabelText.Text = isAsio ? "ASIO INPUT DRIVER" : "ACTIVE WINDOWS PLAYBACK ENDPOINT";
        SourceBadgeText.Text = isAsio ? "ASIO INPUT" : "WASAPI LOOPBACK";

        if (!isAsio)
        {
            FormatText.Text = "Ready to capture default Windows output.";
            DeviceNameText.Text = _engine.DeviceName;
        }
        else if (AsioDriverComboBox.SelectedItem is string driverName)
        {
            _engine.AsioDriverName = driverName;
            DeviceNameText.Text = driverName;
            FormatText.Text = "ASIO format is selected when recording starts.";
        }
    }

    private void OnAsioDriverSelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
    {
        if (AsioDriverComboBox.SelectedItem is string driverName &&
            !driverName.StartsWith("No ASIO", StringComparison.Ordinal))
        {
            _engine.AsioDriverName = driverName;
            if (_engine.Source == AudioSourceMode.Asio)
            {
                DeviceNameText.Text = driverName;
            }
        }
    }

    private async void OnRecordToggleClicked(object sender, RoutedEventArgs e)
    {
        RecordToggleButton.IsEnabled = false;
        SourceComboBox.IsEnabled = false;
        AsioDriverComboBox.IsEnabled = false;
        try
        {
            if (_engine.IsRecording)
            {
                await StopRecordingAsync();
            }
            else
            {
                await StartRecordingAsync();
            }
        }
        catch (Exception ex)
        {
            StatusText.Text = ex.Message;
            MessageBox.Show(this, ex.Message, "SL.STUDIO", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            RecordToggleButton.IsEnabled = true;
            SourceComboBox.IsEnabled = !_engine.IsRecording;
            AsioDriverComboBox.IsEnabled = !_engine.IsRecording && _asioAvailable;
        }
    }

    private void OnOpenFolderClicked(object sender, RoutedEventArgs e)
    {
        try
        {
            var dir = RecordingFileManager.GetBaseDirectory();
            Process.Start(new ProcessStartInfo
            {
                FileName = dir,
                UseShellExecute = true
            });
        }
        catch (Exception ex)
        {
            StatusText.Text = $"Could not open folder: {ex.Message}";
        }
    }

    private async Task StartRecordingAsync()
    {
        await _engine.StartAsync();
        _elapsed.Restart();
        _uiTimer.Start();

        DeviceNameText.Text = _engine.DeviceName;
        FormatText.Text = _engine.FormatDescription;
        EndpointLabelText.Text = _engine.Source == AudioSourceMode.Asio
            ? "ASIO INPUT DRIVER"
            : "ACTIVE WINDOWS PLAYBACK ENDPOINT";
        SourceBadgeText.Text = _engine.Source == AudioSourceMode.Asio
            ? "ASIO INPUT"
            : "WASAPI LOOPBACK";
        StatusText.Text = "RECORDING";
        StatusText.Foreground = _recording;
        ButtonLabel.Text = "STOP RECORDING";
        RecordToggleButton.Background = _recording;
        BytesWrittenText.Text = "Recording in progress…";
    }

    private async Task StopRecordingAsync()
    {
        StatusText.Text = "Finalizing WAV safely…";
        var savedPath = await _engine.StopAsync();
        _elapsed.Stop();
        _uiTimer.Stop();
        UiTimer_Tick(this, EventArgs.Empty);

        StatusText.Text = "READY";
        StatusText.Foreground = _accent;
        ButtonLabel.Text = "START RECORDING";
        RecordToggleButton.Background = _accent;
        MeterLeft.Value = 0;
        MeterRight.Value = 0;
        MeterLeftText.Text = "−∞";
        MeterRightText.Text = "−∞";
        BytesWrittenText.Text = savedPath is null ? "Recording stopped." : $"Saved: {Path.GetFileName(savedPath)}";
    }

    private void Engine_LevelAvailable(object? sender, StereoLevel level)
    {
        Dispatcher.BeginInvoke(() =>
        {
            MeterLeft.Value = level.Left * 100;
            MeterRight.Value = level.Right * 100;
            MeterLeftText.Text = ToDecibels(level.Left);
            MeterRightText.Text = ToDecibels(level.Right);
        }, DispatcherPriority.Background);
    }

    private void Engine_CaptureWarning(object? sender, string warning) =>
        Dispatcher.BeginInvoke(() => StatusText.Text = warning, DispatcherPriority.Send);

    private void UiTimer_Tick(object? sender, EventArgs e)
    {
        TimerText.Text = $"{(int)_elapsed.Elapsed.TotalHours:00}:{_elapsed.Elapsed.Minutes:00}:{_elapsed.Elapsed.Seconds:00}";
        BytesWrittenText.Text = FormatBytes(_engine.BytesWritten);
    }

    private static string ToDecibels(float level) =>
        level <= 0.00001f ? "−∞" : $"{20 * Math.Log10(level):0.0}";

    private static string FormatBytes(long bytes)
    {
        if (bytes >= 1024L * 1024 * 1024) return $"{bytes / (1024d * 1024 * 1024):0.00} GB";
        return $"{bytes / (1024d * 1024):0.0} MB";
    }

    protected override void OnClosing(CancelEventArgs e)
    {
        if (!_isClosing && _engine.IsRecording)
        {
            var choice = MessageBox.Show(
                this,
                "Stopping the application will end and finalize your current recording.",
                "Recording in Progress",
                MessageBoxButton.OKCancel,
                MessageBoxImage.Warning);

            if (choice != MessageBoxResult.OK)
            {
                e.Cancel = true;
                return;
            }

            _isClosing = true;
            _engine.StopAsync().GetAwaiter().GetResult();
        }

        _uiTimer.Stop();
        _engine.Dispose();
        base.OnClosing(e);
    }
}
