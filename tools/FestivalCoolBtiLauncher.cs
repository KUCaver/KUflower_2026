using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;

internal static class FestivalCoolBtiLauncher
{
    private const string ProjectDir =
        @"C:\Users\gando\OneDrive\바탕 화면\건국대학교\건국대학교3학년 1학기\공모전\똥아리\축제쿨비티아이";

    private const string Url = "http://127.0.0.1:5173";

    private static int Main()
    {
        if (!Directory.Exists(ProjectDir))
        {
            ShowError("프로젝트 폴더를 찾을 수 없습니다:\n" + ProjectDir);
            return 1;
        }

        try
        {
            StartDevServer();
            OpenBrowserWhenReady();
            return 0;
        }
        catch (Exception ex)
        {
            ShowError(ex.Message);
            return 1;
        }
    }

    private static void StartDevServer()
    {
        var command =
            "$Host.UI.RawUI.WindowTitle = '축제쿨비티아이 로컬 서버'; " +
            "Write-Host '축제쿨비티아이 로컬 서버를 시작합니다.'; " +
            "Write-Host '이 창을 닫으면 로컬 서버가 종료됩니다.'; " +
            "if (!(Test-Path -LiteralPath 'node_modules')) { npm.cmd install }; " +
            "npm.cmd run dev -- --host 127.0.0.1 --port 5173";

        var startInfo = new ProcessStartInfo
        {
            FileName = "powershell.exe",
            WorkingDirectory = ProjectDir,
            UseShellExecute = true,
            Arguments = "-NoExit -ExecutionPolicy Bypass -Command " + Quote(command),
        };

        Process.Start(startInfo);
    }

    private static void OpenBrowserWhenReady()
    {
        for (var attempt = 0; attempt < 45; attempt++)
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(Url);
                request.Timeout = 800;
                request.Method = "GET";

                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    if ((int)response.StatusCode < 500)
                    {
                        OpenChrome();
                        return;
                    }
                }
            }
            catch
            {
                // Server is still starting.
            }

            Thread.Sleep(700);
        }

        OpenChrome();
    }

    private static void OpenChrome()
    {
        var chromePaths = new[]
        {
            @"C:\Program Files\Google\Chrome\Application\chrome.exe",
            @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        };

        foreach (var chromePath in chromePaths)
        {
            if (File.Exists(chromePath))
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = chromePath,
                    Arguments = Url,
                    UseShellExecute = false,
                });
                return;
            }
        }

        Process.Start(new ProcessStartInfo
        {
            FileName = Url,
            UseShellExecute = true,
        });
    }

    private static string Quote(string value)
    {
        return "\"" + value.Replace("\"", "\\\"") + "\"";
    }

    private static void ShowError(string message)
    {
        Process.Start(new ProcessStartInfo
        {
            FileName = "powershell.exe",
            UseShellExecute = true,
            Arguments = "-NoExit -Command " + Quote("Write-Host " + Quote(message) + " -ForegroundColor Red"),
        });
    }
}
