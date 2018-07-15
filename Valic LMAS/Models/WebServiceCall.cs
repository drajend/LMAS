using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using Valic_LMAS.Log4net;
using Valic_LMAS.Models;

namespace Valic_LMAS.Models
{
    public class WebServiceCall
    {
        public object GetParticipantMailingAddress(GetParticipantMailingAddressRequest getObj)
        {            
            try
            {
                Utility.LogMessage("Invoke GetParticipantMailingAddress method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                var _Account = proxy.GetParticipantMailingAddress(getObj.SSN, getObj.ACCOUNT);
                Utility.LogMessage("GetParticipantMailingAddress success - " + _Account != null ? _Account : "Account is not exist in valic", Utility.LogLevel.INFO);
                return _Account;
            }
            catch (Exception ex)
            {
                Utility.LogMessage("GetParticipantMailingAddress Failed - " + ex.Message, Utility.LogLevel.ERROR);
                throw ex;
            }
        }

        public GetMainDriverRequestandResponse GetMainDriver(GetMainDriverRequestandResponse getObj)
        {
            try
            {
                string strSvcFlag = getObj.SvcFlag != null && getObj.SvcFlag != "" ? getObj.SvcFlag : "";
                var varAccount = "";
                string strErrorCode = "";
                decimal IntRate = 0;
                decimal LoanMaxAvail = 0;
                decimal LoanMinAvail = 0;
                decimal EscrowAmt = 0;
                decimal SurRate = 0;
                decimal SurChargeAmt = 0;
                string Policy_loan_code = "";
                string AcctArray = getObj.AcctArray != null && getObj.AcctArray != "" ? getObj.AcctArray : "";
                Utility.LogMessage("Invoke GetMainDriver method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                //proxy.MainDriver(_SSN, "", "CTS",ref strSvcFlag, "N", varArray, ref I, ref I,ref I, ref varAccount, ref strErrorCode, ref IntRate, ref I, ref I, "", ActLoans, false, ref empty, OtherCarrierGLB12Mth, OtherCarrierOLB);
                proxy.MainDriver(getObj.SSNum, getObj.AcctNO, getObj.ChannelInd, ref strSvcFlag, getObj.PLLInd, AcctArray, ref LoanMaxAvail, ref LoanMinAvail, ref EscrowAmt, ref varAccount, ref strErrorCode,ref IntRate, ref SurRate, ref SurChargeAmt, getObj.AppName, getObj.iActiveLoans, getObj.MultiAcctEstimator, ref Policy_loan_code, getObj.HighestLoanAmount, getObj.CurrentLoanAmount);

                getObj.SvcFlag = strSvcFlag;
                getObj.LoanMaxAvail = LoanMaxAvail;
                getObj.LoanMinAvail = LoanMinAvail;
                getObj.EscrowAmt = EscrowAmt;
                getObj.LoanArray = varAccount;
                getObj.ErrorCode = strErrorCode;
                getObj.IntRate = IntRate;
                getObj.SurRate = SurRate;
                getObj.SurChargeAmt = SurChargeAmt;
                getObj.Policy_loan_code = Policy_loan_code;
                getObj.ErroMessage = "";                
            }
            catch (Exception ex)
            {
               getObj.ErroMessage = ex.Message;
                Utility.LogMessage("GetMainDriver Failed - " + ex.Message, Utility.LogLevel.ERROR);
            }
            return getObj;
        }

        public DataSet GetVestingDetails(GetVestingDetailsRequest getObj)
        {
            DataSet ds = new DataSet();
            try
            {
                Utility.LogMessage("Invoke GetVestingDetails method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                ds = proxy.GetVestingDetails(getObj.SSN, getObj.taxInd, getObj.grpNum, getObj.planNum);

            }
            catch(Exception ex)
            {
                Utility.LogMessage("GetVestingDetails Failed - " + ex.Message, Utility.LogLevel.ERROR);
            }
            return ds;
        }

        public GetPLLPendRequestandResponse PllPend(GetPLLPendRequestandResponse getObj)
        {
            string vestArray = "";
            string ccType = string.Empty;
            string ccNumber = string.Empty;
            string cDate = string.Empty;
            try
            {                
                DataSet ds = new DataSet();
                Utility.LogMessage("Invoke PllPend method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                proxy.PLLPend(getObj.lAccount, getObj.orgSys, ref vestArray, getObj.AWDConfirmation,ref ccType, ref ccNumber, ref cDate, ref ds);
                getObj.vestValue = vestArray;
                getObj.creditCardType = ccType;
                getObj.creditCardNumber = ccNumber;
                getObj.creditDate = cDate;
                getObj.ds = ds;
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return getObj;
        }

        public  GetPLLPendingFormReturnRequest PLLPendingFormReturn(GetPLLPendingFormReturnRequest getObj)
        {            
            object vestArray = "";
            string ccType = string.Empty;
            string ccNumber = string.Empty;
            string cDate = string.Empty;
            string formTrnId = string.Empty;
            try
            {
                DataSet ds = new DataSet();
                Utility.LogMessage("Invoke PLLPendingFormReturn method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                proxy.PLLPendingFormReturn(getObj.lAccount, getObj.orgSys, ref vestArray, ref ccType, ref ccNumber, ref cDate, ref ds,ref formTrnId);
                getObj.vestValue = vestArray;
                getObj.creditCardType = ccType;
                getObj.creditCardNumber = ccNumber;
                getObj.creditDate = cDate;
                getObj.ds = ds;
                getObj.formTrnId = formTrnId;
                if (getObj.ds.Tables[0].Rows.Count == 0)
                    Utility.LogMessage("PLLPendingFormReturn Fetched record", Utility.LogLevel.INFO);
                else
                    Utility.LogMessage("PLLPendingFormReturn No record", Utility.LogLevel.INFO);
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return getObj;
        }

        public DataSet LoanMainByAccount(GetLoanMainByAccountRequest getObj)
        {
            DataSet ds = new DataSet();
            try
            {
                Utility.LogMessage("Invoke LoanMainByAccount method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                ds = proxy.LoanMainByAccount(getObj.sAccount, getObj.appName);                  
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return ds;
        }

        public GetModelLoanRequest ModelLoan(GetModelLoanRequest getObj)
        {
            DataSet ds = new DataSet();
            DataSet dsMal = new DataSet();
            DataSet dsConfirm = new DataSet();
            string eCode = string.Empty;
            string eMalCode = string.Empty;
            string multiLoan = string.Empty;
            decimal IntRate = decimal.Zero;
            double reqAmount = double.Parse(getObj.LoanReqAmt);
            try
            {
                Utility.LogMessage("Invoke ModelLoan method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                ds = proxy.ModelLoan(getObj.SSNum, getObj.AcctNO, getObj.UseMaxFlag, reqAmount, getObj.TermYrs,
                    getObj.SvcFlag, getObj.PaymentReq, getObj.AcctArray, ref eCode, getObj.AppName, getObj.PayFreq, getObj.RepayMethod, getObj.channelId,
                    ref dsMal, getObj.Fee_Waiver_Flag, ref dsConfirm, ref multiLoan, ref IntRate, getObj.Group_id, getObj.Plan_id, getObj.Loanpurp, getObj.Loantype,
                    ref eMalCode, getObj.SuperUserFlg, getObj.HighestLoanAmount, getObj.CurrentLoanAmount);
                getObj.dsMAL = dsMal;
                getObj.dsConfirmNum = dsConfirm;
                getObj.ErrorCode = eCode;
                getObj.MALError = eMalCode;
                getObj.MultiLoanFlag = multiLoan;
                getObj.IntRate = IntRate;
                getObj.rsModalLoan = ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return getObj;
        }

        public GetVhclCashValsRequest GetVhclCashVals(GetVhclCashValsRequest getObj)
        {            
            object strFB1 = new object();
            object strFP2 = new object();            
            try
            {
                Utility.LogMessage("Invoke LoanMainByAccount method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                proxy.GetVhclCashVals(getObj.AcctNO,ref strFB1,ref strFP2);
                getObj.FB1Amt = strFB1.ToString();
                getObj.FP2Amt = strFP2.ToString();
                Utility.LogMessage("LoanMainByAccount Result: FB1Amount - " + getObj.FB1Amt + " FP2Amount - " + getObj.FP2Amt, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return getObj;
        }
        public GetBankNameDetails GetBankName(GetBankNameDetails getObj)
        {
            string BankName = string.Empty;
            int ErrCode = 0;
            bool i = false;
            try
            {
                Utility.LogMessage("Invoke GetBankName method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();

                i = proxy.GetBankName(getObj.RoutingNumber, ref BankName, ref ErrCode);
                getObj.BankName = BankName;
                getObj.ErrorCode = ErrCode;
                getObj.retValue = i;
                Utility.LogMessage("Bank name: " + getObj.BankName, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                throw ex;                
            }
            return getObj;
        }

        public GetDetErrMesgResponse GetDetErrMesg(GetDetErrMesgRequest getObj)
        {
            GetDetErrMesgResponse oResponse = new GetDetErrMesgResponse();
            try
            {
                string gpName = string.Empty;
                string eCode = string.Empty;
                int NumActiveLoan = 0;
                getObj.ConfirmNum = "";
                Utility.LogMessage("Invoke GetDetErrMesg method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                oResponse.DetErrMesgResult = proxy.DetErrMesg(getObj.SSNum, getObj.AcctNO, ref gpName, ref eCode, getObj.ChannelInd, getObj.ConfirmNum, ref NumActiveLoan, getObj.LoanPurpose, bool.Parse(getObj.strSuperUser));
                oResponse.GroupName = gpName;
                oResponse.ErrorCode = eCode;
                oResponse.NumActiveLoans = NumActiveLoan.ToString();
                Utility.LogMessage("ErrMesg: " + oResponse.DetErrMesgResult, Utility.LogLevel.ERROR);
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return oResponse;
        }

        public GetUpdateLoanDetailsRequest UpdateLoanDetails(GetUpdateLoanDetailsRequest getObj)
        {            
            string eCode = string.Empty;
            object result = new object();
            try
            {
                Utility.LogMessage("Invoke UpdateLoanDetails method", Utility.LogLevel.INFO);
                Utility.LogMessage("PLLarray - " + getObj.varPllArray, Utility.LogLevel.DEBUG);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                result = proxy.UpdateLoanDetails(getObj.strConfirmationNumber, getObj.varPllArray, getObj.varDetailArray, getObj.varVestedArray, getObj.varArrayConfirmNum != null ? getObj.varArrayConfirmNum : "", ref eCode);
                getObj.varErrorCode = eCode;
                getObj.result = result.ToString();
                Utility.LogMessage("UpdateLoanDetails Result : " + getObj.result + " - " + getObj.varErrorCode, Utility.LogLevel.DEBUG);
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return getObj;
        }

        public GetPLLStoreRequest PLLStore(GetPLLStoreRequest getObj)
        {
            string _ResError = string.Empty;
            string _pllArray = string.Empty;
            _pllArray = getObj.varPllArray;
            object result = new object();
            try
            {
                Utility.LogMessage("Invoke PLLStore method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                result = proxy.PLLStore(ref _pllArray, getObj.varDetailArray, getObj.varVestedArray, getObj.varArrayConfirmNum != null ? getObj.varArrayConfirmNum : "", ref _ResError);
                getObj.result = result != null ? result.ToString() : "";
                getObj.varPllArray = _pllArray;
                getObj.varErrorCode = _ResError;
                Utility.LogMessage("PLLStore result : " + getObj.result, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return getObj;
        }

        public GetInsertACHRequest InsertACH(GetInsertACHRequest getObj)
        {
            object result = new object();
            try
            {
                Utility.LogMessage("Invoke InsertACH method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                result = proxy.InsertACH(getObj.strAccount, getObj.strRoutingNum, getObj.strBankName, getObj.strFrequency, getObj.strACHAmount, getObj.strBnkAccountNum, getObj.strBnkPhoneNumber, getObj.strBnkAccountType, getObj.strConfirmationNum, getObj.strNumPays);
                getObj.result = result != null ? result.ToString() : "";
                Utility.LogMessage("InsertACH Result: " + getObj.result, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return getObj;
        }

        public GetPLLUpdateRequest PLLUpdate(GetPLLUpdateRequest getObj)
        {            
            var varErrorCode = new object();
            bool PLLUpdateStatus = false;
            try
            {
                Utility.LogMessage("Invoke PLLUpdate method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                proxy.PLLUpdate(getObj.strConf, getObj.ExtFlag, ref varErrorCode, getObj.ProcessMaxFlag, ref PLLUpdateStatus, getObj.strUserID);
                getObj.varErrorCode = varErrorCode;
                getObj.PLLUpdateStatus = PLLUpdateStatus;
                Utility.LogMessage("PLLUpdate Status: " + getObj.PLLUpdateStatus, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return getObj;
        }

        public GetUpdateACHRequest UpdateACH(GetUpdateACHRequest getObj)
        {
            bool result = false;            
            try
            {
                Utility.LogMessage("Invoke UpdateACH method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                result = proxy.UpdateACH(getObj.strConfirmationNum);
                getObj.result = result.ToString();
                Utility.LogMessage("UpdateACH Result: " + getObj.result, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return getObj;
        }

        public DataSet GetCannedComments(GetCannedCommentsRequest getObj)
        {
            DataSet ds = new DataSet();
            try
            {
                Utility.LogMessage("Invoke GetCannedComments method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                ds = proxy.GetCannedComments(Int16.Parse(getObj.LowVal), Int16.Parse(getObj.HighVal));
                if (ds != null)
                    Utility.LogMessage("GetCannedComments Result: No Data", Utility.LogLevel.INFO);
                else
                    Utility.LogMessage("GetCannedComments Result: Fetched comments", Utility.LogLevel.INFO);
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return ds;
        }

        public GetQualityStoreRequest QualityStore(GetQualityStoreRequest getObj)
        {
            bool res = false;
            try
            {
                getObj.strAWDID = getObj.strUserID == null ? "" : getObj.strUserID;
                Utility.LogMessage("Invoke QualityStore method", Utility.LogLevel.INFO);
                Valic_LMAS.LMAS_Service.WebServicesSoapClient proxy = new Valic_LMAS.LMAS_Service.WebServicesSoapClient();
                res = proxy.QualityStore(getObj.strConfirmNum, getObj.strErrorType, getObj.strAWDID, getObj.strUserID, getObj.strType);
                getObj.result = res.ToString();
                Utility.LogMessage("QualityStore Result: " + getObj.result, Utility.LogLevel.INFO);
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return getObj;
        }
    }
}