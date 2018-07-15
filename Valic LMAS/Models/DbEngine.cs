using Oracle.ManagedDataAccess.Client;
using System;
using System.Configuration;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using Valic_LMAS.Log4net;

namespace Valic_LMAS.Models
{
    public class DbEngine
    {
        OracleConnection con;
        public static string O_Connectionstring = ConfigurationManager.ConnectionStrings["OracleConnection"].ToString();

        void Connect()
        {
            try
            {
                con = new OracleConnection();
                con.ConnectionString = O_Connectionstring;
                con.Open();
                Utility.LogMessage("Db Configuration String: " + O_Connectionstring, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                Utility.LogMessage(ex.Message, Utility.LogLevel.ERROR);
                throw ex;
            }
        }

        void Close()
        {
            try
            {
                con.Close();
                con.Dispose();
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public bool CheckAccess(CheckAccessRequest objAccess)
        {
            try
            {
                Connect();
                OracleCommand objCmd = new OracleCommand("ssadmin.pkg_beploans.sp_checkuseraccess",con);
                objCmd.CommandType = CommandType.StoredProcedure;
                objCmd.Parameters.Add("userid", OracleDbType.Varchar2, 7).Value = objAccess.UserId;
                objCmd.Parameters.Add("appid", OracleDbType.Varchar2, 3).Value = objAccess.AppID;
                objCmd.Parameters.Add("cntr", OracleDbType.Int32, 1).Direction = ParameterDirection.Output;
                objCmd.ExecuteNonQuery();
                objAccess.iAccess = int.Parse(objCmd.Parameters["cntr"].Value.ToString());
                Close();
                return true;
            }
            catch (Exception ex)
            {
                Utility.LogMessage("CheckAccessRequest Method : " + ex.Message, Utility.LogLevel.ERROR);
                return false;
            }
        }

        public DataSet GetFundInfo(GetFundInfoRequest objFundinfo)
        {
            DataSet ds = new DataSet("ret_recordset");
            try
            {
                Connect();
                OracleCommand objCmd = new OracleCommand("SSADMIN.PKG_FUND_INFO.get_fund_info", con);
                objCmd.CommandType = CommandType.StoredProcedure;
                objCmd.Parameters.Add("account_in", OracleDbType.Varchar2, 7).Value = objFundinfo.AccountNo;
                objCmd.Parameters.Add("sysid", OracleDbType.Varchar2, 1).Value = objFundinfo.SysId;
                objCmd.Parameters.Add("querytype", OracleDbType.Varchar2, 1).Value = objFundinfo.QueryType == null ? "" : objFundinfo.QueryType;
                objCmd.Parameters.Add("org_sys_in", OracleDbType.Varchar2, 1).Value = "NHCC";
                objCmd.Parameters.Add("sort_order", OracleDbType.Varchar2, 1).Value = objFundinfo.SortOrder == null ? "" : objFundinfo.SortOrder;
                objCmd.Parameters.Add("ret_recordset", OracleDbType.RefCursor, 1).Direction = ParameterDirection.Output;
                OracleDataAdapter da = new OracleDataAdapter(objCmd);
                da.SelectCommand = objCmd;
                da.Fill(ds);
                Close();                
            }
            catch (Exception ex)
            {
                Utility.LogMessage("Insert Method : " + ex.Message, Utility.LogLevel.ERROR);
                throw ex;                
            }
            return ds;
        }
    }
}
