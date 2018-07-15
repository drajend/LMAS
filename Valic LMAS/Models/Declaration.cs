using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;

namespace Valic_LMAS.Models
{
    public class Declaration
    {

    }

    public class CommonProperties
    {
        public string EMessage { get; set; }
    }
    public class GetObjectDataRequestModel
    {
        public string ObjId { get; set; }

        public string AppId { get; set; }
        public string UserId { get; set; }
    }

    public class IndexField
    {
        public string FieldName { get; set; }
        public string FieldValue { get; set; }
        public string LOBTranslation { get; set; }
    }

    public class ResponseMessage
    {
        public int Code { get; set; }
        public string Message { get; set; }
        public string Severity { get; set; }
    }

    public class GetObjectDataResponseModel
    {
        public string ObjId { get; set; }
        public List<IndexField> IndexFields { get; set; }
        public List<IndexField> ObjectFields { get; set; }
        public ResponseMessage Response { get; set; }
        public string URL { get; set; }
    }

    public class GetErrorMessageModel
    {
        public string _EMessage { get; set; }
        public int _ECode { get; set; }
    }

    public class GetParticipantMailingAddressRequest:CommonProperties
    {
        public string SSN { get; set; }
        public string ACCOUNT { get; set; }

        public object PartInfo { get; set; }
    }

    public class GetWebResponse
    {
        public string Result { get; set; }
    }

    public class GetMainDriverRequestandResponse
    {
        public string SSNum { get; set; }
        public string AcctNO { get; set; }
        public string ChannelInd { get; set; }
        public string SvcFlag { get; set; }
        public string PLLInd { get; set; }
        public string AcctArray { get; set; }
        public decimal LoanMaxAvail { get; set; }
        public decimal LoanMinAvail { get; set; }
        public decimal EscrowAmt { get; set; }
        public string LoanArray { get; set; }
        public string ErrorCode { get; set; }
        public decimal IntRate { get; set; }
        public decimal SurRate { get; set; }
        public decimal SurChargeAmt { get; set; }
        public string AppName { get; set; }
        public int iActiveLoans { get; set; }
        public bool MultiAcctEstimator { get; set; }
        public string Policy_loan_code { get; set; }
        public decimal HighestLoanAmount { get; set; }
        public decimal CurrentLoanAmount { get; set; }
        public string ErroMessage { get; set; }

    }

    public class GetVestingDetailsRequest : CommonProperties
    {
        public string SSN { get; set; }
        public string taxInd { get; set; }
        public string grpNum { get; set; }
        public string planNum { get; set; }
    }

    public class CheckAccessRequest : CommonProperties
    {
        public string UserId { get; set; }
        public string AppID { get; set; }
        public int iAccess { get; set; }
    }

    public class GetFundInfoRequest : CommonProperties
    {
        public string AccountNo { get; set; }
        public string SysId { get; set; }
        public string QueryType { get; set; }
        public string Org_sys { get; set; }
        public string SortOrder { get; set; }
        public string Filter { get; set; }


    }

    public class GetPLLPendRequestandResponse : CommonProperties
    {
        public string lAccount { get; set; }
        public string orgSys { get; set; }
        public string vestValue { get; set; }
        public string AWDConfirmation { get; set; }
        public string creditCardType { get; set; }
        public string creditCardNumber { get; set; }
        public string creditDate { get; set; }
        public string rsLoanInformation { get; set; }
        public DataSet ds { get; set; }
    }

    public class GetPLLPendingFormReturnRequest : CommonProperties
    {
        public string lAccount { get; set; }
        public string orgSys { get; set; }
        public object vestValue { get; set; }
        public string creditCardType { get; set; }
        public string creditCardNumber { get; set; }
        public string creditDate { get; set; }
        public string rsLoanInformation { get; set; }
        public DataSet ds { get; set; }
        public string formTrnId { get; set; }
    }

    public class GetPLLPendingFormReturnResponse : CommonProperties
    {
        public object vestValue { get; set; }
        public string creditCardType { get; set; }
        public string creditCardNumber { get; set; }
        public string creditDate { get; set; }
        public string rsLoanInformation { get; set; }
        public string formTrnId { get; set; }
    }

    public class GetPLLPendResponse : CommonProperties
    {
        public string AWDConfirmation { get; set; }
        public object vestValue { get; set; }
        public string creditCardType { get; set; }
        public string creditCardNumber { get; set; }
        public string creditDate { get; set; }
        public string rsLoanInformation { get; set; }        
    }

    public class GetLoanMainByAccountRequest : CommonProperties
    {
        public string sAccount { get; set; }
        public string appName { get; set; }        
        public string rJson { get; set; }

    }

    public class GetModelLoanRequest:CommonProperties
    {
        public string SSNum { get; set; }
        public string AcctNO { get; set; }
        public string UseMaxFlag { get; set; }
        public string LoanReqAmt { get; set; }
        public string TermYrs { get; set; }
        public string SvcFlag { get; set; }
        public string PaymentReq { get; set; }
        public string AcctArray { get; set; }
        public string ErrorCode { get; set; }
        public string AppName { get; set; }
        public int PayFreq { get; set; }
        public string RepayMethod { get; set; }
        public string channelId { get; set; }
        public DataSet dsMAL { get; set; }       
        public string strMAL { get; set; }
        public bool Fee_Waiver_Flag { get; set; }
        public DataSet dsConfirmNum { get; set; }
        public string strConfirmNum { get; set; }
        public string MultiLoanFlag { get; set; } 
        public decimal IntRate { get; set; }
        public string Group_id { get; set; }
        public string Plan_id { get; set; }
        public string Loanpurp { get; set; }
        public string Loantype { get; set; }
        public string MALError { get; set; }
        public bool SuperUserFlg { get; set; }
        public decimal HighestLoanAmount { get; set; }
        public decimal CurrentLoanAmount { get; set; }
        public DataSet rsModalLoan { get; set; }
        public string strModalLoan { get; set; }
    }

    public class GetModelLoanResponse : CommonProperties
    {
        public string LoanModalRes { get; set; }
        public string strConfirmNum { get; set; }
        public string strMAL { get; set; }
        public string MALError { get; set; }
        public string ErrorCode { get; set; }

    }
    public class GetVhclCashValsRequest : CommonProperties
    {
        public string AcctNO { get; set; }
        public string FB1Amt { get; set; }
        public string FP2Amt { get; set; }      
    }
    public class GetBankNameDetails : CommonProperties
    {
        public string RoutingNumber { get; set; }
        public string BankName { get; set; }
        public int ErrorCode { get; set; }
        public bool retValue { get; set; }
    }

    public class GetDetErrMesgRequest
    {
        public string SSNum { get; set; }
        public string AcctNO { get; set; }
        public string GroupName { get; set; }
        public string ErrorCode { get; set; }
        public string ChannelInd { get; set; }
        public object ConfirmNum { get; set; }
        public string NumActiveLoans { get; set; }
        public string LoanPurpose { get; set; }
        public string strSuperUser { get; set; }
    }

    public class GetDetErrMesgResponse : CommonProperties
    {
        public string GroupName { get; set; }
        public string ErrorCode { get; set; }
        public string NumActiveLoans { get; set; }
        public string DetErrMesgResult { get; set; }
    }

    public class GetUpdateLoanDetailsRequest : CommonProperties
    {
        public string strConfirmationNumber { get; set; }
        public string varPllArray { get; set; }
        public string varDetailArray { get; set; }
        public string varVestedArray { get; set; }
        public string varArrayConfirmNum { get; set; }
        public string varErrorCode { get; set; }
        public string result { get; set; }
    }

    public class GetPLLStoreRequest : CommonProperties
    {
        public string varPllArray { get; set; }
        public string varDetailArray { get; set; }
        public string varVestedArray { get; set; }
        public string varArrayConfirmNum { get; set; }
        public string varErrorCode { get; set; }
        public string result { get; set; }
    }

    public class UpdateObjectFieldsRequestModel
    {
        public string ObjId { get; set; }
        public string AppId { get; set; }
        public string UserId { get; set; }
        public List<IndexField> Fields { get; set; }        
        public string Comment { get; set; }//Optional

    }

    public class UpdateObjectResponseModel : CommonProperties
    {
        public string ObjId { get; set; }
        public ResponseMessage Response { get; set; }
    }

    public class GetCannedCommentsRequest : CommonProperties
    {
        public string dataString { get; set; }
        public string LowVal { get; set; }
        public string HighVal { get; set; }
    }

    public class GetInsertACHRequest : CommonProperties
    {
        public string strAccount { get; set; }
        public string strRoutingNum { get; set; }
        public string strBankName { get; set; }
        public string strFrequency { get; set; }
        public string strACHAmount { get; set; }
        public string strBnkAccountNum { get; set; }
        public string strBnkPhoneNumber { get; set; }
        public string strBnkAccountType { get; set; }
        public string strConfirmationNum { get; set; }
        public string strNumPays { get; set; }
        public string result { get; set; }
    }

    public class GetPLLUpdateRequest : CommonProperties
    {
        public string strConf { get; set; }
        public string ExtFlag { get; set; }
        public object varErrorCode { get; set; }
        public object ProcessMaxFlag { get; set; }
        public bool PLLUpdateStatus { get; set; }
        public string strUserID { get; set; }
    }

    public class GetUpdateACHRequest : CommonProperties
    {
        public string strConfirmationNum { get; set; }
        public string result { get; set; }
    }

    public class PostCommentsRequestModel
    {
        public string ObjId { get; set; }

        public string Comment { get; set; }

        public string AppId { get; set; }

        public string UserId { get; set; }
        
    }
    public class PostCommentsResponseModel
    {
        public ResponseMessage Response { get; set; }
    }

    public class GetQualityStoreRequest : CommonProperties
    {
        public string strConfirmNum { get; set; }
        public string strErrorType { get; set; }
        public string strAWDID { get; set; }
        public string strUserID { get; set; }
        public string strType { get; set; }
        public string result { get; set; }
    }

    public class UnlockInstanceRequestModel
    {
        public string ObjectId { get; set; }
        public string UserId { get; set; }

        //[Display(Name = "Enter App ID. This is an optional field.")]
        public string AppId { get; set; } //Optional
    }
    public class UnlockInstanceResponseModel : CommonProperties
    {
        public string ObjectId { get; set; }
        public ResponseMessage Response { get; set; }
    }

    public class UpdateObjectStatusRequestModel
    {        
        public string ObjId { get; set; }        
        public string AppId { get; set; }
        public string UserId { get; set; }        
        public string Status { get; set; }
        public string Comment { get; set; }
    }
}