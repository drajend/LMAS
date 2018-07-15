using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Valic_LMAS.Log4net
{
    public class Utility
    {
        private static readonly log4net.ILog _Log = log4net.LogManager.GetLogger("LMAS");

        static Utility()
        {
            log4net.Config.XmlConfigurator.Configure();
        }

        public static void LogException(int pErrorCode, string pErrorMessage, LogLevel pLevel, Exception e)
        {
            string strMessage = pErrorCode.ToString() + " - " + pErrorMessage + System.Environment.NewLine + System.Environment.NewLine; ;

            try
            {
                if (e != null)
                {
                    strMessage += "Exception = " + e.Message + System.Environment.NewLine + System.Environment.NewLine;
                    strMessage += "Source = " + e.Source + System.Environment.NewLine + System.Environment.NewLine;
                    strMessage += "Stack Trace = " + e.StackTrace + System.Environment.NewLine + System.Environment.NewLine;
                }

                if (pLevel == LogLevel.DEBUG)
                {
                    LogMessage(strMessage, LogLevel.DEBUG);
                }
                if (pLevel == LogLevel.INFO)
                {
                    LogMessage(strMessage, LogLevel.INFO);
                }
                if (pLevel == LogLevel.WARN)
                {
                    LogMessage(strMessage, LogLevel.WARN);
                }
                if (pLevel == LogLevel.ERROR)
                {
                    LogMessage(strMessage, LogLevel.ERROR);
                }
                if (pLevel == LogLevel.FATAL)
                {
                    LogMessage(strMessage, LogLevel.FATAL);
                }
            }
            catch { }
        }

        public static void LogMessage(string pMessage, LogLevel pLevel)
        {
            try
            {
                if (pLevel == LogLevel.DEBUG)
                {
                    _Log.Debug(pMessage);
                }
                if (pLevel == LogLevel.INFO)
                {
                    _Log.Info(pMessage);
                }
                if (pLevel == LogLevel.WARN)
                {
                    _Log.Warn(pMessage);
                }
                if (pLevel == LogLevel.ERROR)
                {
                    _Log.Error(pMessage);
                }
                if (pLevel == LogLevel.FATAL)
                {
                    _Log.Fatal(pMessage);
                }
            }
            catch { }
        }

        public enum LogLevel
        {
            DEBUG = 1,
            INFO = 2,
            WARN = 3,
            ERROR = 4,
            FATAL = 5
        }

        public enum LogSource
        {
            LMAS = 1,
        }
    }
}