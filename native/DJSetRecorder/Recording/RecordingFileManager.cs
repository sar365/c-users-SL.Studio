using System;
using System.IO;

namespace SLSTUDIO.Recording
{
    public sealed class RecordingPaths
    {
        public string TemporaryPath { get; set; } = string.Empty;
        public string FinalPath { get; set; } = string.Empty;
    }

    public sealed class RecordingFileManager
    {
        private static readonly string BaseDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.MyMusic),
            "SL.STUDIO Sets"
        );

        public static string EnsureDirectoryExists()
        {
            if (!Directory.Exists(BaseDirectory))
            {
                Directory.CreateDirectory(BaseDirectory);
            }
            return BaseDirectory;
        }

        public RecordingPaths CreatePaths()
        {
            var dir = EnsureDirectoryExists();
            var timestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");
            var tempFileName = $"SL.STUDIO_{timestamp}.djrec";
            var finalFileName = $"SL.STUDIO_{timestamp}.wav";

            return new RecordingPaths
            {
                TemporaryPath = Path.Combine(dir, tempFileName),
                FinalPath = Path.Combine(dir, finalFileName)
            };
        }

        public static string GetBaseDirectory() => EnsureDirectoryExists();
    }
}
