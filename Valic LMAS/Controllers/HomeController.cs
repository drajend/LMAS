using System;
using System.Web.Mvc;
using Valic_LMAS.Models;
using Valic_LMAS.Log4net;
using System.Configuration;
using System.Net;
using System.IO;
using System.Web.Script.Serialization;
using System.Data;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;

namespace Valic_LMAS.Controllers
{
    public class HomeController : Controller
    {

        WebServiceCall webCall = new WebServiceCall();
        Methods objMethods = new Methods();
        DbEngine db = new DbEngine();

        public static string version1 = ConfigurationManager.AppSettings["WiseURLv1"].ToString();
        public static string version2 = ConfigurationManager.AppSettings["WiseURLv2"].ToString();
        // GET: Home
        public ActionResult Index(bool? QR = false, string UID = "",string objID="",string appType="")
        {
            if (appType == "QR")
                QR = true;
            if (UID != "")
                ViewBag.UID = UID;
            if (QR != false)
                ViewBag.QR = "true";
            if (objID != "")
                ViewBag.objID = objID;
            return View();
        }

        public ActionResult LoanConfirm(bool? QR=false)
        {
            if (QR != false)
                ViewBag.Title = "Quality Review";
            else
                ViewBag.Title = "Loan Confirmation";
            return View();
        }

        public JsonResult _GetParticipantMailingAddress(GetParticipantMailingAddressRequest getObj)
        {
            try
            {
                getObj.PartInfo = webCall.GetParticipantMailingAddress(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetParticipantMailingAddress Failed - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }
        
        public JsonResult _GetObjectData(GetObjectDataRequestModel getObj)
        {
            Utility.LogMessage("Retrieving object id's [" + getObj.ObjId + "] LOB fields.", Utility.LogLevel.DEBUG);
            GetObjectDataResponseModel oResponse = new GetObjectDataResponseModel();
            String URL = version2;
            URL += "GetObjectData/" + getObj.ObjId + "/" + getObj.AppId;
            try
            {
                HttpWebRequest oRequest = (HttpWebRequest)WebRequest.Create(URL);
                string ResponseString = string.Empty;
                oRequest.Method = "GET";
                oRequest.ContentType = "application/json; charset=utf-8";
                oRequest.Timeout = Int32.MaxValue;
                var Response = (HttpWebResponse)oRequest.GetResponse();
                if (Response.StatusCode != HttpStatusCode.OK)
                {
                    var iReader = new StreamReader(Response.GetResponseStream());
                    string response = iReader.ReadToEnd();
                }
                var oResponseStream = Response.GetResponseStream();
                var oReader = new StreamReader(oResponseStream);
                ResponseString = oReader.ReadToEnd();
                JavaScriptSerializer oSerializer = new JavaScriptSerializer();
                oSerializer.MaxJsonLength = Int32.MaxValue;
                oResponse = oSerializer.Deserialize<GetObjectDataResponseModel>(ResponseString);
                Utility.LogMessage("Retrieved required Lob fields ", Utility.LogLevel.INFO);
            }
            catch (Exception ex)
            {
                oResponse.Response = new ResponseMessage();
                oResponse.Response.Code = 0;
                oResponse.Response.Message = ex.Message;
                oResponse.Response.Severity = "Error";
                Utility.LogMessage("GetObjectData Method : " + ex.Message, Utility.LogLevel.ERROR);
            }
            return Json(oResponse, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _GetMainDriver(GetMainDriverRequestandResponse getObj)
        {
            try
            {
                Utility.LogMessage("Retrieving _GetMainDriver SSN [" + getObj.SSNum + "] and Account number [" + getObj.AcctNO + "] Details.", Utility.LogLevel.DEBUG);
                getObj = webCall.GetMainDriver(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetParticipantMailingAddress Failed - " + ex.Message, Utility.LogLevel.ERROR);
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public string _GetVestingDetails(GetVestingDetailsRequest getObj)
        {
            string vestingInfo = string.Empty;
            try
            {
                Utility.LogMessage("Retrieving _GetVestingDetails SSN [" + getObj.SSN + "] Details.", Utility.LogLevel.DEBUG);
                vestingInfo = objMethods.DataSetToJSONString(webCall.GetVestingDetails(getObj));
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetVestingDetails Failed -" + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return vestingInfo;
        }

        
        public JsonResult _CheckAccess(CheckAccessRequest getObj)
        {
            try
            {
                if (!db.CheckAccess(getObj))
                    Utility.LogMessage("Checkaccess method error", Utility.LogLevel.ERROR);
                //Comment below line - its for local testing
                getObj.iAccess = 1;
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_CheckAccess method error - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _GetPLLPend(GetPLLPendRequestandResponse getObj)
        {
            GetPLLPendResponse oResponse = new GetPLLPendResponse();
            try
            {
                Utility.LogMessage("Retrieving _GetPLLPend Account number [" + getObj.lAccount + "] Details.", Utility.LogLevel.DEBUG);
                getObj = webCall.PllPend(getObj);
                oResponse.AWDConfirmation = getObj.AWDConfirmation;
                oResponse.rsLoanInformation = objMethods.DataSetToJSONString(getObj.ds);
                oResponse.vestValue = getObj.vestValue;                                
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetPLLPend Failed -" + ex.Message, Utility.LogLevel.ERROR);
                oResponse.EMessage = ex.Message;
            }
            return Json(oResponse, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _GetPLLPendingFormReturn(GetPLLPendingFormReturnRequest getObj)
        {
            GetPLLPendingFormReturnResponse oResponse = new GetPLLPendingFormReturnResponse();
            try
            {
                Utility.LogMessage("Retrieving _GetPLLPendingFormReturnRequest Account number [" + getObj.lAccount + "] Details.", Utility.LogLevel.DEBUG);
                webCall.PLLPendingFormReturn(getObj);
                oResponse.rsLoanInformation = objMethods.DataSetToJSONString(getObj.ds);
                oResponse.vestValue = getObj.vestValue;
                oResponse.creditCardType = getObj.creditCardType;
                oResponse.creditCardNumber = getObj.creditCardNumber;
                oResponse.creditDate = getObj.creditDate;
                oResponse.formTrnId = getObj.formTrnId;
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetPLLPendingFormReturnRequest Failed -" + ex.Message, Utility.LogLevel.ERROR);
                oResponse.EMessage = ex.Message;
            }
            return Json(oResponse, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _GetLoanMainByAccount(GetLoanMainByAccountRequest getObj)
        {
            try
            {                
                getObj.rJson = objMethods.DataSetToJSONString(webCall.LoanMainByAccount(getObj));
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetLoanMainByAccount method - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _GetModelLoan(GetModelLoanRequest getObj)
        {
            GetModelLoanResponse oResponse = new GetModelLoanResponse();
            try {
                webCall.ModelLoan(getObj);
                oResponse.LoanModalRes = objMethods.DataSetToJSONString(getObj.rsModalLoan);
                oResponse.strMAL = objMethods.DataSetToJSONString(getObj.dsMAL);
                oResponse.strConfirmNum = objMethods.DataSetToJSONString(getObj.dsConfirmNum);
                oResponse.MALError = getObj.MALError != null ? getObj.MALError : "";
                oResponse.ErrorCode = getObj.ErrorCode != null ? getObj.ErrorCode : "";
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetModelLoan Method - " + ex.Message, Utility.LogLevel.ERROR);
                oResponse.EMessage = ex.Message;
            }
            return Json(oResponse, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _GetVhclCashVals(GetVhclCashValsRequest getObj)
        {
            try
            {
                getObj = webCall.GetVhclCashVals(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetVhclCashVals Method - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public string _GetFundInfo(GetFundInfoRequest getObj)
        {
            string result = string.Empty;
            DataSet ds = new DataSet();
            try
            {
                ds = db.GetFundInfo(getObj);
                result = objMethods.DataSetToJSONString(ds);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetFundInfo Method - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return result;
        }

        
        public JsonResult _GetBankName(GetBankNameDetails getObj)
        {
            try
            {
                getObj = webCall.GetBankName(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetBankName Failed - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _GetDetErrMesg(GetDetErrMesgRequest getObj)
        {
            GetDetErrMesgResponse oResponse = new GetDetErrMesgResponse();
            try {
                oResponse = webCall.GetDetErrMesg(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_GetDetErrMesg Failed - " + ex.Message, Utility.LogLevel.ERROR);
                oResponse.EMessage = ex.Message;
            }
            return Json(oResponse, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _UpdateLoanDetails(GetUpdateLoanDetailsRequest getObj)
        {
            string result = string.Empty;
            try {
                getObj = webCall.UpdateLoanDetails(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_UpdateLoanDetails Failed - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _PLLStore(GetPLLStoreRequest getObj)
        {
            string result = string.Empty;
            try
            {
                getObj = webCall.PLLStore(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_PLLStore Failed - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _InsertACH(GetInsertACHRequest getObj)
        {
            string result = string.Empty;
            try
            {
                getObj = webCall.InsertACH(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_InsertACH Failed - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _PLLUpdate(GetPLLUpdateRequest getObj)
        {            
            try
            {
                getObj = webCall.PLLUpdate(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_PLLUpdate Failed - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _UpdateACH(GetUpdateACHRequest getObj)
        {
            string result = string.Empty;
            try
            {
                getObj = webCall.UpdateACH(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_UpdateACH Failed - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _UpdateObjectFields(UpdateObjectFieldsRequestModel getObj, string fldLOBValuesUOF, string wStatus = "")
        {
            UpdateObjectResponseModel oResponseMessage = new UpdateObjectResponseModel();
            Utility.LogMessage("_UpdateObjectFields Method - " + getObj.UserId + " Object Fields - " + fldLOBValuesUOF, Utility.LogLevel.INFO);
            String URL = version2;
            URL += "UpdateObjectFields";
            getObj.UserId = string.IsNullOrWhiteSpace(getObj.UserId) ? string.Empty : getObj.UserId;
            getObj.Fields = objMethods.createIndexFields(fldLOBValuesUOF);

            HttpWebRequest oRequest = (HttpWebRequest)WebRequest.Create(URL);

            oRequest.Method = "POST";
            oRequest.ContentType = "application/json; charset=utf-8";
            oRequest.Timeout = Int32.MaxValue;

            JavaScriptSerializer oSerializer = new JavaScriptSerializer();
            try
            {
                string strRequest = oSerializer.Serialize(getObj);
                using (StreamWriter oWriter = new StreamWriter(oRequest.GetRequestStream()))
                {
                    oWriter.Write(strRequest);
                }

                System.Net.ServicePointManager.ServerCertificateValidationCallback =
                    delegate (object sender, X509Certificate
                            certificate, X509Chain chain,
                            SslPolicyErrors sslPolicyErrors)
                    { return true; };

                WebResponse oResponse = oRequest.GetResponse();
                Stream oStream = oResponse.GetResponseStream();
                StreamReader oReader = new StreamReader(oStream);
                string oResultStr = oReader.ReadToEnd();

                JavaScriptSerializer resSerializer = new JavaScriptSerializer();
                resSerializer.MaxJsonLength = Int32.MaxValue;

                if (oResponse != null)
                {
                    oResponseMessage = resSerializer.Deserialize<UpdateObjectResponseModel>(oResultStr);
                }
                Utility.LogMessage("_UpdateObjectFields Method result - " + oResponseMessage.Response.Message, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_UpdateObjectFields Failed - " + ex.Message, Utility.LogLevel.ERROR);
                oResponseMessage.Response.Message = ex.Message;
                if (ex.Message.Contains("Locked"))
                {
                    object lUserid;
                    lUserid = ex.Message.Split('(');
                }
            }
            return Json(oResponseMessage, JsonRequestBehavior.AllowGet);
        }

        public string _GetCannedComments(GetCannedCommentsRequest getObj)
        {
            string dsString = string.Empty;
            try
            {
                dsString = objMethods.DataSetToJSONString(webCall.GetCannedComments(getObj));
            }
            catch(Exception ex)
            {
                Utility.LogMessage("_GetCannedComments Failed - " + ex.Message, Utility.LogLevel.ERROR);
                dsString = "error";
            }
            return dsString;
        }

        
        public JsonResult _AddComments(PostCommentsRequestModel oModel)
        {
            Utility.LogMessage("Comment added to work " + oModel.Comment, Utility.LogLevel.DEBUG);
            Utility.LogMessage("Adding Comments to work...", Utility.LogLevel.INFO);
            PostCommentsResponseModel oResponseMessage = new PostCommentsResponseModel();
            string URL = version2 + "PostComment";

            HttpWebRequest oRequest = (HttpWebRequest)WebRequest.Create(URL);
            oRequest.Method = "POST";
            oRequest.ContentType = "application/json; charset=utf-8";
            oRequest.Timeout = Int32.MaxValue;
            JavaScriptSerializer oSerializer = new JavaScriptSerializer();
            try
            {
                string strRequest = oSerializer.Serialize(oModel);
                using (StreamWriter oWriter = new StreamWriter(oRequest.GetRequestStream()))
                {
                    oWriter.Write(strRequest);
                }

                System.Net.ServicePointManager.ServerCertificateValidationCallback =
                    delegate (object sender, X509Certificate
                            certificate, X509Chain chain,
                            SslPolicyErrors sslPolicyErrors)
                    { return true; };

                WebResponse oResponse = oRequest.GetResponse();
                Stream oStream = oResponse.GetResponseStream();
                StreamReader oReader = new StreamReader(oStream);
                string oResultStr = oReader.ReadToEnd();

                JavaScriptSerializer resSerializer = new JavaScriptSerializer();
                resSerializer.MaxJsonLength = Int32.MaxValue;                

                if (oResponse != null)
                {
                    oResponseMessage = resSerializer.Deserialize<PostCommentsResponseModel>(oResultStr);
                }
                Utility.LogMessage("Comments successfully added to work.", Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("AddComments Method : " + ex.Message, Utility.LogLevel.ERROR);
                oResponseMessage.Response.Message = ex.Message;
            }
            return Json(oResponseMessage, JsonRequestBehavior.AllowGet);
        }

        
        public JsonResult _QualityStore(GetQualityStoreRequest getObj)
        {
            string result = string.Empty;
            try
            {
                getObj = webCall.QualityStore(getObj);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_QualityStore Failed - " + ex.Message, Utility.LogLevel.ERROR);
                getObj.EMessage = ex.Message;
            }
            return Json(getObj, JsonRequestBehavior.AllowGet);
        }
        
        public JsonResult _UnLockInstance(UnlockInstanceRequestModel getObj)
        {
            Utility.LogMessage("_UnLockInstance Method invoked - " + getObj.ObjectId, Utility.LogLevel.INFO);
            UnlockInstanceResponseModel oResponseMessage = new UnlockInstanceResponseModel();

            getObj.AppId = getObj.AppId != null ? getObj.AppId.ToString() : ""; 
            getObj.ObjectId = getObj.ObjectId != null ? getObj.ObjectId.ToString() : ""; //required
            getObj.UserId = getObj.UserId != null ? getObj.UserId.ToString() : ""; //required

            String URL = version2;
            URL = URL + "UnlockInstance";
            URL += "/" + getObj.ObjectId + "/" + getObj.UserId + (!String.IsNullOrEmpty(getObj.AppId) ? "/" + getObj.AppId : "");

            HttpWebRequest oRequest = (HttpWebRequest)WebRequest.Create(URL);

            oRequest.Method = "DELETE";
            oRequest.ContentType = "application/json; charset=utf-8";
            oRequest.Timeout = Int32.MaxValue;

            JavaScriptSerializer oSerializer = new JavaScriptSerializer();
            try
            {
                string strRequest = oSerializer.Serialize(getObj);
                using (StreamWriter oWriter = new StreamWriter(oRequest.GetRequestStream()))
                {
                    oWriter.Write(strRequest);
                }

                System.Net.ServicePointManager.ServerCertificateValidationCallback =
                    delegate (object sender, X509Certificate
                            certificate, X509Chain chain,
                            SslPolicyErrors sslPolicyErrors)
                    {
                        return true;
                    };

                WebResponse oResponse = oRequest.GetResponse();
                Stream oStream = oResponse.GetResponseStream();
                StreamReader oReader = new StreamReader(oStream);
                string oResultStr = oReader.ReadToEnd();

                JavaScriptSerializer resSerializer = new JavaScriptSerializer();
                resSerializer.MaxJsonLength = Int32.MaxValue;

                if (oResponse != null)
                {
                    oResponseMessage = resSerializer.Deserialize<UnlockInstanceResponseModel>(oResultStr);
                }
                Utility.LogMessage("_UnLockInstance Method result - " + oResponseMessage.Response.Message, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_UnLockInstance Method Failed - " + ex.Message, Utility.LogLevel.ERROR);
                oResponseMessage.Response = new ResponseMessage();
                oResponseMessage.Response.Code = 0;
                oResponseMessage.EMessage = ex.Message;
                oResponseMessage.Response.Severity = "Error";
            }
            return Json(oResponseMessage, JsonRequestBehavior.AllowGet);
        }

        public JsonResult _UpdateObjectStatus(UpdateObjectStatusRequestModel uoModel)
        {            
            UpdateObjectResponseModel oResponseMessage = new UpdateObjectResponseModel();
            Utility.LogMessage("_UpdateObjectStatus Method - " + uoModel.UserId + " - " + uoModel.Status, Utility.LogLevel.INFO);
            String URL = version2;
            URL += "UpdateObjectStatus";
            HttpWebRequest oRequest = (HttpWebRequest)WebRequest.Create(URL);

            oRequest.Method = "POST";
            oRequest.ContentType = "application/json; charset=utf-8";
            oRequest.Timeout = Int32.MaxValue;

            JavaScriptSerializer oSerializer = new JavaScriptSerializer();
            try
            {                
                string strRequest = oSerializer.Serialize(uoModel);
                using (StreamWriter oWriter = new StreamWriter(oRequest.GetRequestStream()))
                {
                    oWriter.Write(strRequest);
                }

                System.Net.ServicePointManager.ServerCertificateValidationCallback =
                    delegate (object sender, X509Certificate
                            certificate, X509Chain chain,
                            SslPolicyErrors sslPolicyErrors)
                    { return true; };

                WebResponse oResponse = oRequest.GetResponse();
                Stream oStream = oResponse.GetResponseStream();
                StreamReader oReader = new StreamReader(oStream);
                string oResultStr = oReader.ReadToEnd();

                JavaScriptSerializer resSerializer = new JavaScriptSerializer();
                resSerializer.MaxJsonLength = Int32.MaxValue;

                if (oResponse != null)
                {
                    oResponseMessage = resSerializer.Deserialize<UpdateObjectResponseModel>(oResultStr);
                }
                Utility.LogMessage("_UpdateObjectStatus Method result - " + oResponseMessage.Response.Message, Utility.LogLevel.DEBUG);
            }
            catch (Exception ex)
            {
                Utility.LogMessage("_UpdateObjectStatus Method Failed - " + ex.Message, Utility.LogLevel.ERROR);
                oResponseMessage.Response.Message = ex.Message;
            }
            return Json(oResponseMessage, JsonRequestBehavior.AllowGet);
        }
    }
}
