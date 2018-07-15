var _processFlag = 0;
var vestingCount = 0;
var setupFlag = false;
var exQR = false;
var exQRcount = 0;
var QrProces = false;
var exceptionVisible = false;
var loanDriver = false;
var IntRate = 0;
var loanErrorcheck = 0;
var varvest = "";
var _LoanCalcFlagClick = false;
var bPLLPend = false;

//Loan calculation variable
var _ErrorCode = "";
var lsMax = 0;
var lsMin = 0;
var errormsg = "";
var lsAccept = true;
var SurRate = 0;
var SurCrgAmt = 0;
var LoanCode = "";
var ActLoans = 0;
var strAcct = "";
var UseMaxFlag = "";
var _TempIndex = 0;
//varr NumofActiveLoans = 0;

$(document).ready(function () {
    QRCheck();
    appType = getUrlString()["appType"];    
    if (strUserID == "")
        strUserID = getUrlString()["UserID"];
    if (ObjID == "")
        ObjID = getUrlString()["objID"];
    if (bolQualityReview == true)
        strAWDConfirmation = getUrlString()["AWDConfirmID"];
    $('[data-toggle="tooltip"]').tooltip();
    rbAccountType = $("input[name=accounttype]");
    if (appType == "LMAS")
        _LoanSetup();
    if (appType == "QR")
        QualityReviewSetup();        
});

function QRCheck() {
    var Qr = $("#boolQR").val();
    if ($("#strUID").val() != "")
        strUserID = $("#strUID").val();
    if (Qr == "true")
        bolQualityReview = true;
    else
        bolQualityReview = false;
    if ($("#strObjid").val() != "")
        ObjID = $("#strObjid").val();
}

function _LoanSetup() {
    if (!bolQualityReview)
        modelDialog.show("Loan Setup progress...");
    CallControllerMethod("Home", "_GetObjectData", GetObjectDataSuccess, "", "ObjId", ObjID, "AppId", AppID, "UserId", strUserID);
}

function GetObjectDataSuccess(data) {
    if (!QrProces) {
        if (data.Response.Message.indexOf("Error") !== -1) {
            AlertBox("<b style='color:red;'>Error in retrieving Data</b> - <b>Can't setup loan</b><br />" + data.Response.Message, "close");
            return false;
        } else {
            for (var keys in data.ObjectFields) {
                if (data.ObjectFields[keys].FieldName === "statusName") {
                    if (!bolQualityReview) {
                        if (data.ObjectFields[keys].FieldValue === "DISBPROCD") {
                            AlertBox("PLL has already been setup.");
                            return;
                        }
                        else
                            _processFlag = 1;
                    }
                }
            }
            if (_processFlag === 1) {
                for (var key in data.IndexFields) {
                    if (data.IndexFields[key].LOBTranslation === "TIN")
                        strSSN = data.IndexFields[key].FieldValue;
                    if (data.IndexFields[key].LOBTranslation === "POLN")
                        strAccount = data.IndexFields[key].FieldValue;

                    if (data.IndexFields[key].LOBTranslation === "OLNM") {
                        //.replace(/\)/g, "");
                        if (data.IndexFields[key].FieldValue.replace(/^0+/, "") !== "")
                            OtherCarrierOLB = parseFloat(data.IndexFields[key].FieldValue.replace(/^0+/, '')) / 100;
                    }
                    if (data.IndexFields[key].LOBTranslation === "GLLM") {
                        if (data.IndexFields[key].FieldValue.replace(/^0+/, '') !== "")
                            OtherCarrierGLB12Mth = parseFloat(data.IndexFields[key].FieldValue.replace(/^0+/, '')) / 100;
                    }
                    if (bolQualityReview) {
                        if (data.IndexFields[key].LOBTranslation === "SRVF") {
                            strSvcFlag = data.IndexFields[key].FieldValue;
                        }
                        if (data.IndexFields[key].LOBTranslation === "SSC") {
                            strAWDConfirmation = data.IndexFields[key].FieldValue;
                        }
                    }
                }
                strAWDCreateDate = data.ObjId.substring(0, 26);                
                if (strSSN === "") {
                    AlertBox("SSN is missing.  Please update worktype.", "close");
                    return false;
                }
                if (strAccount === "") {
                    AlertBox("Acccount number is missing.  Please update worktype.", "close");
                    return false;
                }
                if (bolQualityReview) {
                    if (strAWDConfirmation == "") {
                        AlertBox("The worktype does not have a valid confirmation number. Unable to quality review this loan.  Please retrieve confirmation number from Agilenet and update worktype.", "close");
                        return;
                    }
                }
            }
        }
    }
    CallControllerMethod("Home", "_GetParticipantMailingAddress", GetParticipantMailingAddressSuccess, "", "SSN", strSSN, "ACCOUNT", strAccount);
    
}

function GetParticipantMailingAddressSuccess(data) {
    if (data.EMessage == null) {
        if (data.PartInfo != null) {
            PartInfo = data.PartInfo.split("|");
            $("#lblParticipantInfo").html(PartInfo[1] + "  " + strSSN.substring(0, 3) + "-" + strSSN.substring(3, 5) + "-" + strSSN.substring(5));

            //Get Loan Accounts         
            //CallControllerMethod("Home", "_GetMainDriver", GetMainDriverSuccess, "", "SSNum", strSSN, "AcctNO", strAccount, "ChannelInd", "CTS", "SvcFlag", strSvcFlag, "PLLInd", "N", "AcctArray", VarArray, "LoanMaxAvail", 0, "LoanMinAvail", 0, "EscrowAmt", 0, "LoanArray", varAccount, "ErrorCode", " ", "IntRate", 0, "SurRate", 0, "SurChargeAmt", 0, "AppName", " ", "iActiveLoans", iActiveLoans, "MultiAcctEstimator", false, "Policy_loan_code", " ", "HighestLoanAmount", OtherCarrierGLB12Mth, "CurrentLoanAmount", OtherCarrierOLB, "ErroMessage", "")
            GetAccount(strSSN, "");
        } else {
            modelDialog.hide();
            AlertBox("SSN and Account does not exist.  Please correct AWD object", "close");
        }
    } else {
        modelDialog.hide();
        AlertBox("SSN does not exist.  Please correct AWD object", "close");
    }
}

function GetAccount(_SSN, VarArray) {
    if (varAccount != "")
        varAccount = "";
    if (VarArray != "")
        VarArray = Convert2DArrToStr(VarArray)        
    CallControllerMethod("Home", "_GetMainDriver", GetMainDriverSuccess, "", "SSNum", _SSN, "AcctNO", "", "ChannelInd", "CTS", "SvcFlag", strSvcFlag, "PLLInd", "N", "AcctArray", VarArray, "LoanMaxAvail", 0, "LoanMinAvail", 0, "EscrowAmt", 0, "LoanArray", varAccount, "ErrorCode", " ", "IntRate", 0, "SurRate", 0, "SurChargeAmt", 0, "AppName", " ", "iActiveLoans", iActiveLoans, "MultiAcctEstimator", false, "Policy_loan_code", " ", "HighestLoanAmount", OtherCarrierGLB12Mth, "CurrentLoanAmount", OtherCarrierOLB, "ErroMessage", "")
}

function GetMainDriverSuccess(data) {
    if (data.ErrorCode !== "" || data.ErroMessage !== "") {
        modelDialog.hide();
        if (data.ErroMessage !== "") {
            AlertBox(data.ErroMessage, "close");
            return false;
        } else {
            AlertBox(data.ErrorCode, "close");
            return false;
        }
    } else {
        setupFlag = true;
        varAccount = ConvertStrTo2DArr(data.LoanArray);
        if (data.AcctArray !== "" && data.AcctArray !== null)
            VarArray = ConvertStrTo2DArr(data.AcctArray);
        if (IncludeAccounts(varAccount.length)) {
            if (vesting != true)
                createRows(varIncludeAccount.length);
            totRow = varIncludeAccount.length;
            LoadLoanData();
        } else {
            $("#lblMaxLoanWarn").html("There are no accounts that can have loans.");
            $("#lblMaxLoanWarn").css("visibility", "visible");
        }
    }
}

function IncludeAccounts(intRowCount) {
        var i;
        var j;
        var k;
        var intExcludeRowCount;
        var IncludeAccount;
        try {
            //Determines which accounts to include for Loan processing
            intNewRowCount = 0;
            intExcludeRowCount = 0;
            for (i = 0; i < intRowCount; i++) {
                if (varAccount[i][18] === "N") {
                    intNewRowCount = intNewRowCount + 1;
                } else {
                    intExcludeRowCount = intExcludeRowCount + 1;
                }
            }
            if (intExcludeRowCount > 0)
                bolExcludedAccounts = true;
            else
                bolExcludedAccounts = false;

            if (intNewRowCount > 0)
                IncludeAccount = true;
            else
                IncludeAccount = false;

            intNewRowCount = 0;
            intExcludeRowCount = 0;
            //Creates new array with only included accounts
            for (i = 0; i < intRowCount; i++) {                
                if (varAccount[i][18] === "N") {
                    varIncludeAccount[intNewRowCount] = new Array();
                    for (j = 0; j < varAccount[0].length; j++) {
                        varIncludeAccount[intNewRowCount][j] = varAccount[i][j];
                    }
                    intNewRowCount = intNewRowCount + 1;
                } else {
                    varExcludeAccount[intExcludeRowCount] = new Array();
                    for (k = 0; k < varAccount[0].length; k++) {                        
                        varExcludeAccount[intExcludeRowCount][k] = varAccount[i][k];
                    }
                    intExcludeRowCount = intExcludeRowCount + 1;
                }
            }
            return IncludeAccount;
        }
        catch (err) {
            AlertBox("IncludeAccounts - " + err);
        }
    }

function LoadExcludedAccounts() {
    try {
        if (bolExcludedAccounts) {
            var tempExcludedAccnt = "<table class='table' style='width:100% !important'><thead><tr><th scope='col'>Acct #</th>" +
                "<th scope='col'>Plan Type</th><th scope='col'>Annuity Value</th><th scope='col'>Status</th></tr></thead><tbody>";
            var rowAccnt = "";
            for (i = 1; i < (varExcludeAccount.length + 1) ; i++) {
                rowAccnt = rowAccnt + "<tr><td>" + varExcludeAccount[i - 1][1] + "</td>";
                rowAccnt = rowAccnt + "<td>" + varExcludeAccount[i - 1][7] + "</td>";
                rowAccnt = rowAccnt + "<td>" + accounting.formatMoney(varExcludeAccount[i - 1][8]) + "</td>";
                switch (varExcludeAccount[i - 1][6]) {
                    //Account status
                    case "AF":
                        rowAccnt = rowAccnt + "<td>Active</td></tr>";
                        break;
                    case "FS":
                        rowAccnt = rowAccnt + "<td>Flow</td></tr>";
                        break;
                    case "CN":
                        rowAccnt = rowAccnt + "<td>Cancelled</td></tr>";
                        break;
                    case "AS":
                        rowAccnt = rowAccnt + "<td>Suspended</td></tr>";
                        break;
                    case "HD":
                        rowAccnt = rowAccnt + "<td>Hold</td></tr>";
                        break;
                    case "IS":
                        rowAccnt = rowAccnt + "<td>Issued</td></tr>";
                        break;
                    default:
                        rowAccnt = rowAccnt + "<td>Unknown</td></tr>";
                        break;
                }
            }
            tempExcludedAccnt = tempExcludedAccnt + rowAccnt + "</tbody></table>";
            excludedAccountRow(tempExcludedAccnt)
        }
    }
    catch (err) {
        AlertBox("LoadExcludedAccounts" + err);
    }
}

//Convert string to 2Dimensional array
function ConvertStrTo2DArr(str) {
        var x;
        var y;
        var arr = new Array();
        var i;
        var j;
        try {
            if (str !== "") {
                x = str.split(":");
                if (x.length > 0) {
                    if (x[0] !== "") {
                        y = x[0].split('|');
                        for (i = 0; i < x.length; i++) {
                            arr[i] = new Array();
                            y = x[i].split('|');
                            for (j = 0; j < y.length; j++) {
                                arr[i][j] = y[j];
                            }
                        }
                    }
                }
            }
            return arr;
        }
        catch (err) {
            AlertBox("ConvertStrTo2DArr - " + err);
        }
}

//Convert 2Dimensional array to string 
function Convert2DArrToStr(arr) {
    var str_Renamed = "";
    if (arr.length != -1) {
        for (i = 0; i < arr.length; i++) {
            for (j = 0; j < arr[0].length; j++) {
                str_Renamed = str_Renamed + arr[i][j];
                if (j < arr[0].length - 1)
                    str_Renamed = str_Renamed + "|";
            }
            if (i < arr.length - 1)
                str_Renamed = str_Renamed + ":";
        }
    }
    return str_Renamed;
}

function ddlEmployedChange() {
    ChangeDivRouting(true);
}
//Creates the rows in controls
function createRows(recNum) {
        var i;
        var ilastTabindex = 0;
        try {
            var rowControl = "";

            for (i = 0; i < recNum; i++) {
                var tempControl = "<tr>"
                                + "<td><label class='custom-control custom-checkbox rowLabelmargin'><input type='checkbox' class='custom-control-input' data-id=" + i + " id='chkExclude" + i + "' onChange='chkExclude_CheckedChange(this)'><span class='custom-control-indicator'></span></label></td>"
                                + "<td><label class='custom-control custom-checkbox rowLabelmargin'><input type='checkbox' class='custom-control-input' data-id=" + i + " id='chkSelect" + i + "' onChange='chkSelect_CheckedChanged(this)'><span class='custom-control-indicator'></span></label></td>"
                                + "<td><select class='form-control form-control-sm rowDDpadding' data-id=" + i + " onChange='ddlEmployedChange()' id='ddEmployed" + i + "'><option></option></select></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtAccnt" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtStatus" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtGPC" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtLoanType" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtPenInd" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtLoanInd" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px'data-id=" + i + " type='text' id='txtVesting" + i + "' onChange='tVestingAppliesChange(this)' onFocusout='tVestingAppliesFout(this)'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtAnnValue" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtFixAmt" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtMyefAmt" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtVarAmt" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtOutLoan" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtMaxLoan" + i + "'></td>"
                                + "<td><input class='form-control form-control-sm rowPadding' style='margin-top:2px' disabled data-id=" + i + " type='text' id='txtPendLoan" + i + "'></td>"
                                + "<td><label id='lblVestInfo" + i + "' style='font-size:10px;margin-top:2px'></label></td>" // data-toggle='tooltip' data-placement='bottom title="Tooltip on bottom"
                                + "</tr>";
                rowControl = rowControl + tempControl;                
            }
            appendRow(rowControl);
            for (i = 0; i < recNum; i++) {
                $("#ddEmployed" + i + "").empty();
                bindValue("ddEmployed" + i + "", 0, "");
                bindValue("ddEmployed" + i + "", 1, "Yes");
                bindValue("ddEmployed" + i + "", 2, "No");
            }
        }
        catch (err) {
            AlertBox("createRows - " + err);
        }
    }

//Appending row controls
function appendRow(rControl) {
        try {
            //var x = document.getElementById("RowControl").rows.length;
            //for (i = 0; i < x; i++)
            //    document.getElementById("RowControl").deleteRow(i);
            $("#RowControl tr").remove();
            document.getElementById("RowControl").innerHTML = rControl;
        }
        catch (err) {
            AlertBox("appendRow - " + err);
        }
}

//Appending excluded account rows
function excludedAccountRow(rowControl) {
    try{
        var x = document.getElementById("tbExcludedAccount");
        while (x.firstChild) {
            x.removeChild(x.firstChild)
        }        
        document.getElementById("tbExcludedAccount").innerHTML = rowControl;
    }
    catch (err) {
        AlertBox("excludedAccountRow - " + err);
    }
}

//Load loan data into Row controls
function LoadLoanData() {
        var i;
        var appNum = "425"
        var lscntr;
        try {
            //Loads data into controls to diplayed in Accounts considered
            bolMultipleGroups = false;

            //403B Clear Error log (when SSN has more then 10 accounts)
            for (ik = 0; ik < varIncludeAccount.length; ik++)
                strIncomeLock[ik] = new Array();
            for (fi = 0; fi < varIncludeAccount.length; fi++)
                strFB009Ind[fi] = new Array();            

            //Add two new fields for IncomeLock Logic
            for (rv = 0; rv < varIncludeAccount.length; rv++)
                strRiderVersion[rv] = new Array();
            for (rd = 0; rd < varIncludeAccount.length; rd++)
                strRiderDate[rd] = new Array();

            lscntr = "";
            CallControllerMethod("Home", "_CheckAccess", successUser, "", "UserId", strUserID, "AppID", appNum);

        }
        catch (err) {
            AlertBox("LoadLoanData - " + err);
        }
    }

function successUser(data) {
    var PendLoan = "No";
    var LoanTypeCode;
    var CS;
    var TotalWdr;
    var VestingBase;
    var TotalVested;
    var strTotAnnuity;
    var strTotOLb;
    var SaveOLB = 0;
    var DiffOLB = false;
    var SaveTotAnn = 0;
    var DiffAnnuity = false;
    var AnnuityToDisplay = "";
    var OLBToDisplay = "";
    var strPreviousGroup = "";
    var txtTotFixedAnnuity = 0;
    var txtTotMYEFA = 0;
    var txttotVarAnnuity = 0;
    var txtTotLoan = 0;
    var _access = data != undefined ? data.iAccess : 0;
    if (_access == 1) //user has SuperUser Override Access
    {
        SPAccess = true;
        $("#chkException").removeAttr("disabled");
        exceptionVisible = true;
    } else {
        var _chkEnable = document.getElementsByName("chkExcpt");
        _chkEnable[0].style.display = 'none';
        exceptionVisible = false;
        $("#chkException").attr("disabled", "disable");
    }
    var iRowCount = varIncludeAccount.length;
    txtTotFixedAnnuity = 0;
    txtTotMYEFA = 0;
    txttotVarAnnuity = 0;
    txtTotLoan = 0;
    for (i = 0; i < iRowCount; i++) {
        strIncomeLock[i] = varIncludeAccount[i][34];
        strFB009Ind[i] = varIncludeAccount[i][35];

        //add two new field for Income Lock
        strRiderDate[i] = varIncludeAccount[i][70];
        strRiderVersion[i] = varIncludeAccount[i][33];

        $("#txtAccnt" + i + "").val(varIncludeAccount[i][1]); //Account number

        if (varIncludeAccount[i][60] == "Y")
            PendLoan = "Yes";
        else
            PendLoan = "No";
        $("#txtPendLoan" + i + "").val(PendLoan); 
        var cStatus = varIncludeAccount[i][6];
        switch (cStatus) {
            case "AF":
                $("#txtStatus" + i + "").val("Active");
                break;
            case "FS":
                $("#txtStatus" + i + "").val("Flow");
                break;
            case "CN":
                $("#txtStatus" + i + "").val("Cancelled");
                break;
            case "AS":
                $("#txtStatus" + i + "").val("Suspended");
                break;
            case "HD":
                $("#txtStatus" + i + "").val("Hold");
                break;
            case "IS":
                $("#txtStatus" + i + "").val("Issued");
                break;
            default:
                $("#txtStatus" + i + "").val("Unknown");
                break;
        }
        var sGPS = varIncludeAccount[i][2] + " / " + varIncludeAccount[i][3] + " / " + varIncludeAccount[i][4]; //group num,plan number, contribution source
        $("#txtGPC" + i + "").val(sGPS);
        LoanTypeCode = varIncludeAccount[i][37];

        switch (LoanTypeCode) {
            case "POLY":
                $("#txtLoanType" + i + "").val("Policy");
                break;
            case "PLAN":
                $("#txtLoanType" + i + "").val("Plan");
                break;
            case "NONE":
                $("#txtLoanType" + i + "").val("N/A");
                break;
        }

        $("#txtPenInd" + i + "").val(varIncludeAccount[i][24]);
        $("#txtLoanInd" + i + "").val(varIncludeAccount[i][5]); //Loan Indicator

        //Determines if vesting information can be edited for account
        CS = varIncludeAccount[i][4];

        if (varIncludeAccount[i][66] == "N") {     //only added this line - vesting does not apply
            // $("#txtVesting" + i + "").val((varIncludeAccount[i][16] * 100) + "%");
            //numeral(varIncludeAccount[i][16]).format('0%');
            $("#txtVesting" + i + "").val(numeral(varIncludeAccount[i][16]).format('0%'));
            $("#txtVesting" + i + "").attr("disabled", "disable");
            //$("#textbox1").attr("disabled", "disabled");
        }
        else //vesting appplies
        {
            if (bolVestFlag == false && $.trim($("#txtVesting" + i + "").val()) == "") {
                $("#txtVesting" + i + "").val("");
                //move this END If statement below 
                //so this block will only be executed if vesting has not been assigned by processor 
            }
            //********************************Begin changes**********************************************

            //add additional CASE condition to try and fix
            if (varIncludeAccount[i][64] === "NOT AVAILABLE") {  //vesting percent not available on ssinq.account table

                switch ($.trim($("#txtVesting" + i + "").val())) {
                    case "": //if we are not on the QR side of things this means processor has not entered a value
                        $("#txtVesting" + i + "").val(""); //default the grid to blank
                        break;
                }
            }
            else //we had a valid vesting percent on ssinq.account table
            {
                switch ($.trim($("#txtVesting" + i + "").val())) { //
                    case "": //this means we are not in QR so used the value from ssinq.account
                        $("#txtVesting" + i + "").val(numeral(varIncludeAccount[i][16]).format('0%')); //if we are in QR the text would not be blank
                        break;
                }
            }
            $("#txtVesting" + i + "").removeAttr("disabled");
            bolVestFlag = true;
        }
        //MAP Vesting        
        if (varIncludeAccount[i][66] === "Y") {
            //If percent is 0
            if (varIncludeAccount[i][64] === "NOT AVAILABLE")
                $("#lblVestInfo" + i + "").html("Not Avail");
            else
                $("#lblVestInfo" + i + "").html(varIncludeAccount[i][64]);
        }
        else
            $("#lblVestInfo" + i + "").html("Not Applic");
        //if (varIncludeAccount[i][66] === "Y") {
        //    CallControllerMethod("Home", "_GetVestingDetails", "", "", "SSN", "", "taxInd", varIncludeAccount[i][65], "grpNum", varIncludeAccount[i][2], "planNum", varIncludeAccount[i][3]);
        //}

        if ($("#txtVesting" + i + "").prop("disabled") != true)
            $("#btnVesting").removeAttr("disabled");

        TotalWdr = parseFloat(varIncludeAccount[i][31]) + parseFloat(varIncludeAccount[i][32]);
        VestingBase = parseFloat(varIncludeAccount[i][8]) + TotalWdr;
        //If Vesting is not applied (i.e. if varVestingInfo array is empty), else use the applied vesting percent

        if (varVestingInfo.length == 0) {
            //MAP Vesting
            //To handle 0 ZERO value
            if (varIncludeAccount[i][66] === "Y" && varIncludeAccount[i][64] === "NOT AVAILABLE") {
                //If Vesting Percent is ZERO, use 1.
                TotalVested = VestingBase * 1;
            }
            else
                TotalVested = VestingBase * parseFloat(varIncludeAccount[i][16]);
        }
        else
            TotalVested = VestingBase * parseFloat(varIncludeAccount[i][16]);
        var f = (TotalVested - TotalWdr) - 0.00499;
        $("#txtAnnValue" + i + "").val(accounting.formatMoney((TotalVested - TotalWdr) - 0.00499)); //Annuity Value

        if (parseFloat($("#txtAnnValue" + i + "").val()) < 0)
            $("#txtAnnValue" + i + "").val(accounting.formatMoney(0)); //Annuity Value

        $("#txtFixAmt" + i + "").val(accounting.formatMoney(parseFloat(varIncludeAccount[i][13]))); //Fix Amount
        $("#txtMyefAmt" + i + "").val(accounting.formatMoney(parseFloat(varIncludeAccount[i][14]))); //MYEFA Amount
        $("#txtVarAmt" + i + "").val(accounting.formatMoney(parseFloat(varIncludeAccount[i][15]))); //Variable Amount
        $("#txtOutLoan" + i + "").val(accounting.formatMoney(parseFloat(varIncludeAccount[i][22]))); //Outstanding Loans
        $("#txtMaxLoan" + i + "").val(accounting.formatMoney(parseFloat(varIncludeAccount[i][12]))); //Max Loan            
        if (varIncludeAccount[i][18] === "N") {
            txtTotFixedAnnuity = parseFloat(txtTotFixedAnnuity) + parseFloat(varIncludeAccount[i][13]);
            txtTotMYEFA = parseFloat(txtTotMYEFA) + parseFloat(varIncludeAccount[i][14]);
            txttotVarAnnuity = parseFloat(txttotVarAnnuity) + parseFloat(varIncludeAccount[i][15]);
            txtTotLoan = parseFloat(txtTotLoan) + parseFloat(varIncludeAccount[i][22]);
        }

        if (varIncludeAccount[i][25] === "E") {
            //strTotAnnuity = accounting.formatMoney(varIncludeAccount[i][27]);
            //strTotOLb = accounting.formatMoney(varIncludeAccount[i][29]);
            strTotAnnuity = parseFloat(varIncludeAccount[i][27]);
            strTotOLb = parseFloat(varIncludeAccount[i][29]);
        } else {
            //strTotAnnuity = accounting.formatMoney(varIncludeAccount[i][29]);
            //strTotOLb = accounting.formatMoney(varIncludeAccount[i][11]);
            strTotAnnuity = parseFloat(varIncludeAccount[i][9]);
            strTotOLb = parseFloat(varIncludeAccount[i][11]);
        }

        if (varIncludeAccount[i][17] === "Y")
            $("#chkExclude" + i + "").prop('checked', true);

        //RKW 11/12/2013 Moved from above
        //If cbExclude(i).Checked = False Then
        //Call ChangeBackGroundColor(i, "&H00FFFFFF")
        //End If

        if (varIncludeAccount[i][71] === "Y") {
            if (!SPAccess == true) {
                $("#chkExclude" + i + "").attr("disabled", "disable");
                $("#chkSelect" + i + "").attr("disabled", "disable");
            }
        }
        //should be checked that the Exclude check box is NOT checked
        if ($("#chkExclude" + i + "").is(':checked') == false) {
            if (SaveOLB === 0)
                SaveOLB = strTotOLb;
            else
                if (SaveOLB !== strTotOLb)
                    DiffOLB = true;

            if (SaveTotAnn != 0) {
                if (strTotAnnuity != 0) {
                    if (SaveTotAnn != strTotAnnuity) {
                        DiffAnnuity = true;
                    }
                }
            }

            if (strSelectedAccount != "") {
                if (strSelectedAccount == varIncludeAccount[i][1]) {
                    OLBToDisplay = strTotOLb;
                    AnnuityToDisplay = strTotAnnuity;
                }
            }

            if (strTotAnnuity != 0) {
                SaveTotAnn = strTotAnnuity;
            }

            if (strTotOLb != 0) {
                SaveOLB = strTotOLb;
            }

            if (strPreviousGroup != varIncludeAccount[i][2] && varIncludeAccount.length > 0 && i > 0) {
                bolMultipleGroups = true;
            }
            strPreviousGroup = varIncludeAccount[i][2];
        }

        CallControllerMethod("Home", "_GetVestingDetails", GetVestingDetailsSuccess, "", "SSN", "577847422", "taxInd", varIncludeAccount[i][65], "grpNum", varIncludeAccount[i][2], "planNum", varIncludeAccount[i][3]);
        vestingCount = 0;
    }
    try {
        if (bolMultipleGroups == true) {
            $("#txtTotFixedAnnuity").val(accounting.formatMoney(0));
            $("#txtTotMYEFA").val(accounting.formatMoney(0));
            $("#txttotVarAnnuity").val(accounting.formatMoney(0));
            $("#txtTotLoan").val(accounting.formatMoney(0));
            $("#txtTotAnnuityAvail").val(accounting.formatMoney(0));
            $("#txtHighLoan12").val(accounting.formatMoney(0));
            $("#lblMaxLoanWarn").html("Multiple groups involved.  Please select an account for totals.");
            $("#lblMaxLoanWarn").css("visibility", "visible");
        } else {
            $("#lblMaxLoanWarn").css("visibility", "hidden");
        }

        if (DiffAnnuity == true || DiffOLB == true) {
            if (AnnuityToDisplay > 0)
                $("#txtTotAnnuityAvail").val(accounting.formatMoney(AnnuityToDisplay));
            else
                $("#txtTotAnnuityAvail").val(accounting.formatMoney(0));
            if (OLBToDisplay > 0)
                $("#txtHighLoan12").val(accounting.formatMoney(OLBToDisplay));
            else
                $("#txtHighLoan12").val(accounting.formatMoney(0));
        } else {
            $("#txtTotAnnuityAvail").val(accounting.formatMoney(SaveTotAnn));
            $("#txtHighLoan12").val(accounting.formatMoney(SaveOLB));
        }
        if (bolMultipleGroups != true) {
            $("#txtOCOLB").val(accounting.formatMoney(OtherCarrierOLB));
            $("#txtOCGLB12Mth").val(accounting.formatMoney(OtherCarrierGLB12Mth));
            $("#txtTotFixedAnnuity").val(accounting.formatMoney(txtTotFixedAnnuity));
            $("#txtTotMYEFA").val(accounting.formatMoney(txtTotMYEFA));
            $("#txttotVarAnnuity").val(accounting.formatMoney(txttotVarAnnuity));
            $("#txtTotLoan").val(accounting.formatMoney(txtTotLoan));
        }
        if (vesting == true) {
            if (bolLoanConfirmation == false) {
                bolVestFlag = false;
                if (intIndex >= 0 && $("#txtLoanAmount").val() == "") {
                    $("#txtLoanAmount").val($("#txtMaxLoan" + intIndex + "").val());
                    LoanModelEnable(true);
                }
                for (j = 0; j < varIncludeAccount.length; j++) {
                    if (strSelectedAccount == varIncludeAccount[j][1]) {
                        if (varIncludeAccount[j][37] == "POLY")
                            LoanType = "L";
                        else
                            LoanType = "P";
                        //Repayment Options
                        $("#cbPaymentMethod").empty();
                        bindValue("cbPaymentMethod", 0, "");
                        if (varIncludeAccount[j][45] == "Y") {
                            bindValue("cbPaymentMethod", "A", "ACH");
                            blnACHavailable = true;
                        }
                        if (varIncludeAccount[j][46] == "Y") {
                            bindValue("cbPaymentMethod", "I", "Coupon");
                        }
                        //change code to include values of "S" and "M" for payroll deduction options
                        if (varIncludeAccount[j][44] == "Y" || varIncludeAccount[j][44] == "S" || varIncludeAccount[j][44] == "M") {
                            bindValue("cbPaymentMethod", "P", "Payroll Deduction");
                        }
                        //**************************************************************************** 
                        //Note:                                                                      *
                        //this ACHFreq variable is not being populated from the BEPLIB               *
                        //backend logic currently.  An empty string is being passed in.  This may    *
                        //change in the future.  The ACH frequency is currently being hard coded.    *
                        //If this changes, the code in BEPLIB will need to be changed to send the    *
                        //ACH frequencies in ALL cases so if will be available for Super User Excep. *
                        //processing                                                                 *
                        //****************************************************************************
                        ACHFreq = varIncludeAccount[j][47];
                        PayrollFreq = varIncludeAccount[j][48];
                        CouponFreq = varIncludeAccount[j][49];
                        switch (varIncludeAccount[j][44]) {
                            case "Y", "S", "M": //S= payroll deduct allowed but not in service; "M" = max payroll slots used
                                $("#cbPaymentMethod  option[value='P']").attr("selected", "selected");
                                break;
                            default:
                                var count = $('#cbPaymentMethod').children('option').length;
                                if (count > 0)
                                    $("#cbPaymentMethod  option[value=0]").attr("selected", "selected");
                        }
                        //Loan Purpose dropdown
                        $("#cbLoanPurpose").empty();
                        bindValue("cbLoanPurpose", 0, "");
                        switch (varIncludeAccount[j][54]) {
                            case "H", "B":
                                bindValue("cbLoanPurpose", "G", "General Purpose");
                                bindValue("cbLoanPurpose", "M", "Mortgage");
                                break;
                            case "G":
                                bindValue("cbLoanPurpose", "G", "General Purpose");
                                break;
                            case "M":
                                bindValue("cbLoanPurpose", "M", "Mortgage");
                                break;
                        }
                        var pCount = $('#cbLoanPurpose').children('option').length;
                        if (pCount > 0)
                            $("#cbLoanPurpose  option[value=0]").attr("selected", "selected");
                        if (!$("#cbLoanPurpose :selected").text() == "")
                            LoanPurp = $("#cbLoanPurpose :selected").val();

                        //Loan Type (Label)
                        if (varIncludeAccount[intIndex][37] == "POLY") {
                            $("#lblLoanTypeCode").html("Policy");
                            $("#lblFB001Value").css("visibility", "visible");
                            $("#lblFB001").css("visibility", "visible");
                            $("#lblFP002").css("visibility", "visible");
                            $("#lblFP002Value").css("visibility", "visible");
                            $("#lblFixedAmountLabel").css("visibility", "visible");
                            $("#lblFixedAmountLabelValue").css("visibility", "visible");
                        } else {
                            $("#lblLoanTypeCode").html("Plan");
                            $("#lblFB001Value").css("visibility", "hidden");
                            $("#lblFB001").css("visibility", "hidden");
                            $("#lblFP002").css("visibility", "hidden");
                            $("#lblFP002Value").css("visibility", "hidden");
                            $("#lblFixedAmountLabel").css("visibility", "hidden");
                            $("#lblFixedAmountLabelValue").css("visibility", "hidden");
                        }
                        break;
                    }
                }
            }
        }        
        if (setupFlag) {
            LoadExcludedAccounts()

            //Selects account automatically if client has only one account for loans
            //The account will only be selected if vesting does not apply.  If vesting is required,
            //that info must be entered before an account can be selected        
            //if (varIncludeAccount.length == 1) {
            //    if ($('#txtVesting0').prop("disabled") == true) {
            //        $("#chkSelect0").prop('checked', true);            
            //    }
            //}
            if (vesting != true || exQR == true)
                GetAccountExcludeInfo(strAccount);
            setupFlag = false;
        }
        if (bolSelectClick == true) {
            bolSelectClick = false;
            for (i = 0; i < varIncludeAccount.length; i++) {
                if ($('#chkSelect' + i + '').prop('checked') == true) {
                    LoanModelEnable(true)
                    bolSelectExcludeProcess = false;
                    return;
                }
            }
            $('#txtLoanAmount').val("");
            $('#txtMonths').val("");
            $('#txtYears').val("");
            ClearLoanModelControls()
            LoanModelEnable(false)
        }
        if (bolExcludeClick == true) {
            bolExcludeClick = false;
            for (i = 0; i < varIncludeAccount.length; i++) {
                if ($('#chkSelect' + i + '').prop('checked') == true) {
                    LoanModelEnable(true)
                    bolSelectExcludeProcess = false;
                    return;
                }
            }
            $('#txtLoanAmount').val("");
            $('#txtMonths').val("");
            $('#txtYears').val("");
            ClearLoanModelControls()
            LoanModelEnable(false)
        }
        if (bPendingFormReturn == true) {
            var lpText = "";
            var rpText = "";
            var rfInt = 0;
            if (varvest.length > 0) {
                for (i = 0; i < varIncludeAccount.length; i++) {
                    if ($("#txtGPC" + i + "").val().substring(0, 5) != strGroupNum) {
                        $("#txtVesting" + i + "").val("");
                    }
                }

                //Change the Checkbox state to Checked, if 'Waive Init Fee' was set to 'Yes' while entering loan.
                if (varvest[9][0] == "Y")
                    $("#cbWaiveInitFee").prop('checked', true);

                $("#txtLoanAmount").val(accounting.formatMoney(varvest[3][0]));

                //Modified code to display 'Months' while QR'ing
                var strYrMo = varvest[4][0];

                if (strYrMo.indexOf(".") != -1) {
                    var iYear = strYrMo.split(".")[0];
                    var iMonth = strYrMo.split(".")[1] / 100 * 12;
                    $("#txtYears").val(iYear);
                    $("#txtMonths").val(iMonth);
                } else {
                    $("#txtYears").val(varvest[4][0]);
                }

                // user has SuperUser Override Access
                if (SPAccess == true)
                    $("#btnCommand").css("visibility", "visible");
                else
                    $("#btnCommand").css("visibility", "hidden");


                //Checking for Super-User flag
                if (varvest[10][0] == "Y") {
                    $("#chkException").prop('checked', true);
                    if (SPAccess) {
                        strSuperUser = true;
                        $("#txtMonths").css("visibility", "visible");
                        $("#lblMonths").css("visibility", "visible");
                    }
                }

                chkExcepFlagClick();

                if (varvest[6][0] == "G") {
                    lpText = "General Purpose";
                } else if (varvest[6][0] == "M") {
                    lpText = "Mortgage";
                }
                //$("#cbLoanPurpose  option[text='" + lpText + "']").attr("selected", "selected");

                $("#cbLoanPurpose  option:contains(" + lpText + ")").attr("selected", "selected");

                if (bolQualityReview)
                    if ($("#cbLoanPurpose :selected").text() == lpText)
                        cbLoanPurposeChange();

                if (varvest[7][0] == "A") {
                    rpText = "ACH";
                } else if (varvest[7][0] == "I") {
                    rpText = "Coupon";
                } else if (varvest[7][0] == "P") {
                    rpText = "Payroll Deduction";
                }
                $("#cbPaymentMethod  option:contains(" + rpText + ")").attr("selected", "selected");
                cbPaymentChange();
                if (bolQualityReview)
                    if ($("#cbPaymentMethod :selected").text() == rpText)
                        cbPaymentChange();

                switch (varvest[8][0]) {
                    case "Q":
                        rfInt = 4;
                        break;
                    case "M":
                        rfInt = 12;
                        break;
                    case "S":
                        rfInt = 24;
                        break;
                    case "B":
                        rfInt = 26;
                        break;
                    case "W":
                        rfInt = 52;
                        break;
                }
                var _tempSelection = GetFrequencyText(rfInt);
                $('[name=cbRepaymentFrequency] option').filter(function () {
                    return ($(this).text() == _tempSelection); 
                }).prop('selected', true);
                if (bolQualityReview != true) {
                    loanCalculation();
                    DisplayAchInformation();
                }
            }
        }
    }
    catch (err) {
        AlertBox("successUser - " + err);
    }
    modelDialog.hide();
}

function GetVestingDetailsSuccess(data) {
        var VestingToolTip = "";
        try {
            if (data.Table.length > 0) {
                VestingToolTip = VestingToolTip + "Current YTD hours: " + data.Table[0].CURR_YTD_HOURS + "      YTD hours as-of-date: " + data.Table[0].YTD_AS_OF_DATE + "      ";
                VestingToolTip = VestingToolTip + "Previous year hours: " + data.Table[0].PREV_YTD_HOURS + "      ";
                VestingToolTip = VestingToolTip + "Current employment status: " + data.Table[0].EMPLOYMENT_STATUS + "      Employment status date: " + data.Table[0].EMPLOYMENT_STATUS_DATE + "      ";
                VestingToolTip = VestingToolTip + "Current plan status: " + data.Table[0].PLAN_STATUS + "      Plan status date: " + data.Table[0].PLAN_STATUS_DATE;
            }
            else
                VestingToolTip = VestingToolTip + "No additional Vesting and Census info available.";

            $("#lblVestInfo" + vestingCount + "").attr('data-toggle', 'tooltip');
            $("#lblVestInfo" + vestingCount + "").attr('data-placement', 'bottom');
            $("#lblVestInfo" + vestingCount + "").attr('title', VestingToolTip);
            vestingCount++;
        }
        catch (err) {
            AlertBox("GetVestingDetailsSuccess - " + err);
        }
    }

function GetAccountExcludeInfo(accountNumber) {
    try {        
        if (bolQualityReview)
            CallControllerMethod("Home", "_GetPLLPend", GetAccountExcludeInfoSuccess, "", "lAccount", accountNumber, "orgSys", "AWD", "vestValue", "", "AWDConfirmation", strAWDConfirmation, "creditCardType", "", "creditCardNumber", "", "creditDate", "");
        else
            CallControllerMethod("Home", "_GetPLLPendingFormReturn", GetAccountExcludeInfoSuccess, "", "lAccount", accountNumber, "orgSys", "AWD", "vestValue", "", "creditCardType", "", "creditCardNumber", "", "creditDate", "", "formTrnId", "");        
    }
    catch (err) {
        AlertBox("GetAccountExcludeInfo - " + err);
    }
}

function GetAccountExcludeInfoSuccess(data) {    
    var strVarVest = "";
    var strLoanSetupSys = "";
    exQRcount++;
    bPendingFormReturn = false;
    bPLLPend = false;
    rsLoanInformation = null;
    //rsLoanModel = null;

    strVarVest = data.vestValue;
    if (data.rsLoanInformation != "{}" && data.rsLoanInformation != "null")
        rsLoanInformation = JSON.parse(data.rsLoanInformation);
    else
        rsLoanInformation = data.rsLoanInformation;
    
    try {

        if (!bolQualityReview) {
            if (rsLoanInformation == "null" || rsLoanInformation.Table.length == 0 || rsLoanInformation.Table.length == undefined) {
                return false;
            } else {
                bPendingFormReturn = true;
                varFrmTrnID = rsLoanInformation.Table[0].FORM_TRN_ID;
            }
        }
        else {
            bPLLPend = true;
            strAWDConfirmation = data.AWDConfirmation;
        }

        if (strVarVest != "" && strVarVest != null && strVarVest != undefined) {
            varvest = ConvertStrTo2DArr(strVarVest);
        }

        if (bolQualityReview) {
            //Checks to make sure user is not Quality Review there own work
            strOriginalLoanSetupUID = $.trim(rsLoanInformation.Table[0].CSR_NUM);
            if (strUserID == strOriginalLoanSetupUID) {
                AlertBox("Loan quality and loan setup cannot be performed by the same processor", "close");
                return;
            }
        }

        //puts Loan inf
        if (varvest.length > 0) {
            //vesting percentage is stored after dividing by 100 when loan modelling is done from AGILENet or VOL while from LMAS desktop it is stored as actual value
            //For ex If vesting Percent is 100 whne loan modelling is done from AGILENet(NHC) or VOL(EAO) it will stored as 1. So need of dividing again by 100 below
            strLoanSetupSys = rsLoanInformation.Table[0].ORG_SYS;
            for (i = 0; i < varIncludeAccount.length ; i++) {
                for (j = 0; j < varvest[0].length ; j++) {
                    if ($("#txtAccnt" + i + "").val() == varvest[0][j]) {
                        if (strLoanSetupSys == "NHC" || strLoanSetupSys == "EAO")
                            $("#txtVesting" + i + "").val(numeral(varvest[2][j]).format('0%'));
                        else
                            $("#txtVesting" + i + "").val(numeral(varvest[2][j] / 100).format('0%'));
                        j = varvest[0].length;
                    }
                }
            }
            if (bPendingFormReturn)
                if ($("#btnVesting").prop("disabled") == true)
                    applyVesting();

            for (i = 0; i < varIncludeAccount.length; i++) {
                if ($("#txtAccnt" + i + "").val() == strAccount) {
                    $("#chkSelect" + i + "").prop('checked', true);
                    strGroupNum = $("#txtGPC" + i + "").val().substring(0, 5);
                    if (!exQR) {
                        selectionAccount(i);
                    }
                }
                if (varIncludeAccount[i][5] != "N") {
                    for (j = 0; j < varvest[1].length; j++) {
                        if ($("#txtAccnt" + i + "").val() == varvest[0][j]) {
                            if (varvest[1][i] == "Y") {
                                $("#chkExclude" + i + "").prop('checked', true);
                                j = varvest[1].length;
                            }
                        }
                    }
                }
            }
            if (bPLLPend) {
                var lpText = "";
                var rpText = "";
                var rfInt = 0;
                for (i = 0; i < varIncludeAccount.length; i++) {
                    var vestEnable = $("#txtVesting" + i + "").prop('disabled');
                    if ($("#txtGPC" + i + "").val().substring(0, 5) != strGroupNum && !vestEnable) {
                        $("#txtVesting" + i + "").val("");
                    }
                }

                //Change the Checkbox state to Checked, if 'Waive Init Fee' was set to 'Yes' while entering loan.
                if (varvest[9][0] == "Y")
                    $("#cbWaiveInitFee").prop('checked', true);

                $("#txtLoanAmount").val(accounting.formatMoney(varvest[3][0]));

                //Modified code to display 'Months' while QR'ing
                var strYrMo = varvest[4][0];

                if (strYrMo.indexOf(".") != -1) {
                    var iYear = strYrMo.split(".")[0];
                    var iMonth = strYrMo.split(".")[1] / 100 * 12;
                    $("#txtYears").val(iYear);
                    $("#txtMonths").val(iMonth);
                } else {
                    $("#txtYears").val(varvest[4][0]);
                }

                // user has SuperUser Override Access
                if (SPAccess == true)
                    $("#btnCommand").css("visibility", "visible");
                else
                    $("#btnCommand").css("visibility", "hidden");


                //Checking for Super-User flag
                if (varvest[10][0] == "Y") {
                    $("#chkException").prop('checked', true);
                    if (SPAccess) {
                        strSuperUser = true;
                        $("#txtMonths").css("visibility", "visible");
                        $("#lblMonths").css("visibility", "visible");
                    }
                }

                chkExcepFlagClick();

                if (varvest[6][0] == "G") {
                    lpText = "General Purpose";
                } else if (varvest[6][0] == "M") {
                    lpText = "Mortgage";
                }
                //$("#cbLoanPurpose  option[text='" + lpText + "']").attr("selected", "selected");

                $("#cbLoanPurpose  option:contains(" + lpText + ")").attr("selected", "selected");

                if (bolQualityReview)
                    if ($("#cbLoanPurpose :selected").text() == lpText)
                        cbLoanPurposeChange();

                if (varvest[7][0] == "A") {
                    rpText = "ACH";
                } else if (varvest[7][0] == "I") {
                    rpText = "Coupon";
                } else if (varvest[7][0] == "P") {
                    rpText = "Payroll Deduction";
                }
                $("#cbPaymentMethod  option:contains(" + rpText + ")").attr("selected", "selected");
                cbPaymentChange();
                if (bolQualityReview)
                    if ($("#cbPaymentMethod :selected").text() == rpText)
                        cbPaymentChange();

                switch (varvest[8][0]) {
                    case "Q":
                        rfInt = 4;
                        break;
                    case "M":
                        rfInt = 12;
                        break;
                    case "S":
                        rfInt = 24;
                        break;
                    case "B":
                        rfInt = 26;
                        break;
                    case "W":
                        rfInt = 52;
                        break;
                }
                var _tempSelection = GetFrequencyText(rfInt);
                $('[name=cbRepaymentFrequency] option').filter(function () {
                    return ($(this).text() == _tempSelection);
                }).prop('selected', true);
            }
        }
        if (exQRcount == 2) {
            loanCalculation();
            exQRcount = 0;
        }
    }
    catch (err) {
        AlertBox("GetAccountExcludeInfoSuccess - " + err);
    }
}

function GetFrequencyText(Freq) {
    var FreqText = "";
    switch (Freq) {
        case 4:
            FreqText = "Quarterly";
            break;
        case 12:
            FreqText = "Monthly";
            break;
        case 24:
            FreqText = "Semi-Monthly";
            break;
        case 26:
            FreqText = "Bi-Weekly"
            break;
        case 52:
            FreqText = "Weekly"
            break;
    }
    return FreqText;
}

function loanCalculation() {    
    if (loanErrorcheck == 0) {
        _ErrorCode = "";
        lsMax = 0;
        lsMin = 0;
        errormsg = "";
        lsAccept = true;
        SurRate = 0;
        SurCrgAmt = 0;
        LoanCode = "";
        ActLoans = 0;
        strAcct = "";
        UseMaxFlag = "";
        NumofActiveLoans = 0;
        IntRate = 0;
    }
    try {
        if ($('#txtLoanAmount').val() != '')
            RequestedLoanAmt = parseFloat(dRem($('#txtLoanAmount').val()));

        if (bolLoanConfirmation == false) {
            if (bolQualityReview == false) {                
                if ($("#cbLoanPurpose :selected").val() == 0) {
                    AlertBox("Please select Loan Purpose", "cbLoanPurpose")
                    return false;
                }
                if ($("#cbPaymentMethod :selected").val() == 0) {
                    AlertBox("Please select Payment Method", "cbPaymentMethod")
                    return false;
                }
                if ($("#cbRepaymentFrequency :selected").val() == 0) {
                    AlertBox("Please select Repayment Frequency", "cbRepaymentFrequency")
                    return false;
                }
            }
            if (loanErrorcheck == 0) {
                var x = $("#cbLoanPurpose").val()
                LoanPurp = $("#cbLoanPurpose :selected").val();
                RepayMethod = $("#cbPaymentMethod :selected").val();

                errCode = "";
                strErrorMsg = "";

                CallControllerMethod("Home", "_GetDetErrMesg", GetDetErrMesgSuccess, "", "SSNum", strSSN, "AcctNO", strLoanAccount, "GroupName", strGroupName,
                    "ErrorCode", errCode, "ChannelInd", "NHCC", "ConfirmNum", "", "NumActiveLoans", NumofActiveLoans, "LoanPurpose", LoanPurp + "," + RepayMethod, "strSuperUser", strSuperUser);

                strAcct = strLoanAccount;
            }
            if (lsAccept == true) {
                //Make sure Index is set up.  Tells application which account is selected.
                if (loanErrorcheck == 0) {
                    if (intIndex < 0) {
                        for (i = 0; i < varIncludeAccount.length; i++) {
                            if ($('#chkSelect' + i + '').prop('checked') == true) {
                                intIndex = i;
                                break;
                            }
                        }
                    }
                    PlanTypeCode = varIncludeAccount[intIndex][7];

                    if (varIncludeAccount[intIndex][37] == "POLY")
                        LoanType = "L";
                    else
                        LoanType = "P";

                    //to prevent conditions from being checked during Quality Review Process
                    if (bolQualityReview == false) {
                        //MAP changes to allow Super Users to Override loan terms
                        if (LoanPurp == "G") {
                            if (parseInt($("#txtYears").val()) > 5 && !strSuperUser) {
                                AlertBox("Loans are not allowed over 5 years.", "txtYears")
                                return false;
                            }
                        }
                        else {
                            if (LoanPurp == "M" && LoanPurp == "L") {
                                if (parseInt($("#txtYears").val()) > 10 && !strSuperUser) {
                                    AlertBox("Loans are not allowed over 10 years.", "txtYears")
                                    return false;
                                }
                                else {
                                    if (parseInt($("#txtYears").val()) > 5 && parseInt($("#txtYears").val()) <= 10 && !strSuperUser) {
                                        AlertBox("Loans over 5 years must be for a primary residence")
                                        //return;
                                    }
                                }
                            } else {
                                if (LoanPurp == "M" && LoanPurp == "P") {
                                    if (parseInt($("#txtYears").val()) <= 15) {
                                        AlertBox("Loans are not allowed over 15 years.", "txtYears")
                                        return false;
                                    } else {
                                        if (parseInt($("#txtYears").val()) > 5 && parseInt($("#txtYears").val()) <= 15)
                                            AlertBox("Loans over 5 years must be for a primary residence")
                                    }
                                }
                            }
                        }
                        //Make sure Index is set up.  Tells application which account is selected.
                        if (intIndex < 0) {
                            for (i = 0; i < varIncludeAccount.length; i++) {
                                if ($('#chkSelect' + i + '').prop('checked') == true) {
                                    intIndex = i;
                                    break;
                                }
                            }
                        }

                        if ($("#ddEmployed" + intIndex + " :selected").text() == "") {
                            lgConfirmBox("Does the client still work for " + varIncludeAccount[intIndex][19] + " ?", ddSEmployeedSuccess)
                            _LoanCalcFlagClick = true;
                            return false;
                        }
                        else
                            if ($("#ddEmployed" + intIndex + " :selected").val() == "1")
                                strSvcFlag = "Y";
                            else
                                if ($("#ddEmployed" + intIndex + " :selected").val() == "2")
                                    strSvcFlag = "N";
                                else
                                    strSvcFlag = "";

                        strAcct = $("#txtAccnt" + intIndex + "").val();

                        for (j = 0; j < varAccount.length; j++) {
                            if (varAccount[j][1] == strAcct) {
                                //Add code to check for payroll deduction logic
                                //client must be employed to get loan
                                //client may not exceed maximum number of payroll slots allowed by employer
                                //array 44 = payroll deduction allowed indicator (if value = S, then client has separated from service; if M then all of the payroll slots are used)
                                //array 45 = ACH allowed indicator; 
                                //array 46 = coupon allowed indicator
                                //(SN:P106) 403B Array Index Fix (It always looking at 0th element.)
                                if (varAccount[j][44] == "S" & varAccount[j][45] == "N" & varAccount[j][46] == "N") {
                                    AlertBox("Loans are only allowed if client is still employed.");
                                    bolMessage = true;
                                    //this will stop processing
                                }
                                if (varAccount[j][44] == "M" & varAccount[j][45] == "N" & varAccount[j][46] == "N") {
                                    AlertBox("Client already has maximum number of loans via Payroll deduction allowed by employer.");
                                    bolMessage = true;
                                    //this will stop processing
                                }
                            }
                        }
                        CallControllerMethod("Home", "_GetLoanMainByAccount", GetLoanMainByAccountSuccess, "", "sAccount", strAcct, "appName", "AWD");
                        CallControllerMethod("Home", "_GetMainDriver", LoanDriverErrorCheck, "", "SSNum", strSSN, "AcctNO", strAccount, "ChannelInd", "CTS", "SvcFlag", strSvcFlag, "PLLInd", "N", "AcctArray", "", "LoanMaxAvail", 0, "LoanMinAvail", 0, "EscrowAmt", 0, "LoanArray", "", "ErrorCode", "", "IntRate", 0, "SurRate", 0, "SurChargeAmt", 0, "AppName", " ", "iActiveLoans", 0, "MultiAcctEstimator", false, "Policy_loan_code", " ", "HighestLoanAmount", OtherCarrierGLB12Mth, "CurrentLoanAmount", OtherCarrierOLB)
                    }
                }
                if (loanErrorcheck != 1 && loanErrorcheck != 0 || bolQualityReview == true) {
                    loanErrorcheck = 0;
                    $("#lblMaxLoanWarn").css("visibility", "hidden");

                    if (rsLoanModel !== "" && rsLoanModel !== null) {
                        rsLoanModel = "";
                    }
                    SetUpVestingArray();

                    //Makes sure years and loan amount are not blank

                    if ($("#txtYears").val() != "" && $("#txtLoanAmount").val() != "") {
                        //If a Super User enters partial terms (year plus months) convert the months a decimal
                        //that represents the portion of a year
                        if ($("#txtMonths").val() != "") {
                            var ConTwelve = 12;
                            var lsConvMonth = parseInt($("#txtMonths").val()); //change the text field to an integer
                            gsYears = parseFloat(parseFloat($("#txtYears").val()) + (lsConvMonth / ConTwelve)); //add year plus decimal conversion of month
                        } else {
                            gsYears = $("#txtYears").val();
                        }

                        Frequency = $("#cbRepaymentFrequency :selected").val();
                        RepayMethod = $("#cbPaymentMethod :selected").val();
                        var bWaiveInitFee;
                        if ($('#cbWaiveInitFee').prop('checked') == true) {
                            WaiveAppFee = "Y";
                            bWaiveInitFee = true;
                        }
                        else {
                            WaiveAppFee = "N";
                            bWaiveInitFee = false;
                        }

                        TermYears = parseInt($("#txtYears").val());
                        var lsMalInd = "";
                        var lsChannelID = "CTS";
                        var reqAmount = parseFloat(dRem($("#txtLoanAmount").val()));
                        CallControllerMethod("Home", "_GetModelLoan", GetModelLoanSuccess, "", "SSNum", strSSN, "AcctNO", strAcct, "UseMaxFlag", UseMaxFlag, "LoanReqAmt", reqAmount
                            , "TermYrs", gsYears, "SvcFlag", $.trim(strSvcFlag) == "" ? "N" : strSvcFlag, "PaymentReq", 0, "AcctArray", Convert2DArrToStr(varVestingInfo), "ErrorCode", "",
                            "AppName", "", "PayFreq", Frequency, "RepayMethod", RepayMethod, "channelId", lsChannelID, "Fee_Waiver_Flag", bWaiveInitFee,
                            "MultiLoanFlag", varIncludeAccount[intIndex][43], "IntRate", IntRate, "Group_id", varIncludeAccount[intIndex][2], "Plan_id", varIncludeAccount[intIndex][3],
                            "Loanpurp", LoanPurp, "Loantype", LoanType, "MALError", lsMalInd, "SuperUserFlg", strSuperUser, "HighestLoanAmount", parseFloat(OtherCarrierGLB12Mth), "CurrentLoanAmount", parseFloat(OtherCarrierOLB));
                    } else {
                        AlertBox("Please check the amount and term of the loan.");
                    }
                }
            }
        } else {
            AlertBox("Please close Loan Confirmation Screen to access this feature");
        }
    } catch (err) {
        AlertBox("loanCalculation - " + err);
    }
}

function LoanDriverErrorCheck(data) {
    var errorMsg = "";
    if (data.ErrorCode != "") {
        for (var _key = 1; ; _key++) {
            if (data.ErrorCode.substring(_key, 1) == ".") {
                errorMsg = data.ErrorCode.substring(1, _key);
                loanErrorcheck = 1;
                break;
            }            
        }
        $("#lblMaxLoanWarn").html(errorMsg);
        $("#lblMaxLoanWarn").css("visibility", "visible");
    } else {
        loanErrorcheck = 2;
    }
    lsMax = data.LoanMaxAvail != undefined && data.LoanMaxAvail != null ? data.LoanMaxAvail : 0;
    lsMin = data.LoanMinAvail != undefined && data.LoanMinAvail != null ? data.LoanMinAvail : 0;
    loanCalculation();
}

function GetDetErrMesgSuccess(data) {
    try{
        if (data.EMessage != "" && data.EMessage != null)
            alert("GetDetErrMesgSuccess - " + data.EMessage);
        else {
            strGroupName = data.GroupName;
            errCode = data.ErrorCode;
            NumofActiveLoans = data.NumActiveLoans;
            strErrorMsg = data.DetErrMesgResult;
        }
    }
    catch (err) {
        AlertBox("GetDetErrMesgSuccess - " + err);
    }
}

function GetLoanMainByAccountSuccess(data) {    
    var jsonObj = JSON.parse(data.rJson);
    var intLoanMin = jsonObj.Table[0].LOAN_MIN_AVAILABLE;
    if (parseFloat(dRem($("#txtLoanAmount").val())) < intLoanMin && !strSuperUser && parseFloat(dRem($("#txtMaxLoan" + intIndex + "").val())) > 0) {
        AlertBox("Loan amount requested is less than the required $" + intLoanMin + " minimum.  Management approval is required.");
    }
}

function GetModelLoanSuccess(data) {
    var strErrorCode = "";
    rsLoanModel = JSON.parse(data.LoanModalRes);
    var lsMessage = "";
    var lsMalInd = "";
    lsMalInd = data.MALError;
    strErrorCode = data.ErrorCode;
    if (data.EMessage != "" && data.EMessage != null)
        AlertBox("GetModelLoanSuccess - " + data.EMessage);
    else {
        if (rsLoanModel != "" && rsLoanModel != undefined && rsLoanModel != null) {
            if ((parseFloat(dRem(rsLoanModel.tabModelLoan[0].Loan_Requested_amt)) - parseFloat(rsLoanModel.tabModelLoan[0].Repay_amt)) > 0) {
                $("#txtLoanAmount").val(accounting.formatMoney(rsLoanModel.tabModelLoan[0].Loan_Requested_amt));
                $("#lblLoanFeeValue").val(accounting.formatMoney(rsLoanModel.tabModelLoan[0].Loan_Fee));                 
                $("#lblTOVneededValue").val(accounting.formatMoney(rsLoanModel.tabModelLoan[0].Fix_Needed_amt));
                $("#txtInterestRate").val(numeral((parseFloat(rsLoanModel.tabModelLoan[0].Interest_Rate) * 0.01)).format('0.00%'));
                $("#txtSurrenderValue").val(numeral((parseFloat(rsLoanModel.tabModelLoan[0].Sur_Rate) * 0.01)).format('0.00%'));                
                $("#lblFixedAmountLabelValue").val(accounting.formatMoney((rsLoanModel.tabModelLoan[0].Escrow_amt) + $("#txtLoanAmount").val()));
                strEscrow = rsLoanModel.tabModelLoan[0].Escrow_amt;
                FirstPaymentDate = rsLoanModel.tabModelLoan[0].first_payment_date;
                if (parseInt(rsLoanModel.tabModelLoan[0].Repay_amt) == 0)
                    WaiveAppFee = "Y";
                else
                    WaiveAppFee = "N";
                //Checks for error messages               
                if (strErrorCode != "") {
                    $("#lblMaxLoanWarn").html(strErrorCode);
                    $("#lblMaxLoanWarn").css("visibility", "visible");
                }

                //check for valid interest rate
                if ($("#txtInterestRate").val() == "99999.00%") {
                    lsMessage = "Interest rate is invalid.  Please check Group data.";
                    $("#lblMaxLoanWarn").html(lsMessage);
                    $("#lblMaxLoanWarn").css("visibility", "visible");
                    bolMessage = true;
                }

                //check for multi-acct loan 
                if (bolQualityReview == false) {
                    if (data.strMAL != null && data.strMAL != "{}") {
                        //build table with related multi acct loan confirmation numbers
                        //the confnum dataset that is being returned from the rsLoanModel can
                        //is not working (not sending back the numbers) so I am building the 
                        //table here

                        confnum = { "ConfirmationNumber": [] };

                        for (i = 0; i < data.strMAL.Table[0].length - 1; i++) {
                            confnum.ConfirmationNumber[i] = "confirmation_num :"[data.strMAL.Table[0].confirmation_num[i]];
                        }
                        $('#strConfirm').val(confnum)
                        gMALFlag = true;
                        //Note:   This message was added because if they enter 2+ loans with the same MAL criteria,
                        //        but different effective dates, the loans will be consolidated and their effective dates will be updated to be the 
                        //        same (which will be the max (most recent) effective date of the MAL loans.
                        //        (Possible future enhancement:  To allow multiple backdated loans to be set up on the same day, but with different backdated dates, and to process
                        //        as single loans, the effective date would need to be moved to the first screen and included in the comparison logic.)  
                        AlertBox("Another loan setup for this client already exists.  As a result, additional loans will result in a Multi-Account Loan being established with the same effective date.  If setting up a single loan for each account, each loan setup must be entered on different days.")
                    }
                }
                //Reset objects and recordset
                EnableProcessLoan();
                $("#btnCalculate").attr("disabled", "disable");
                $("#btnVesting").attr("disabled", "disable"); //pending added extra vesting disable
                //$("#chkException").attr("disabled", "disable")
                $("#txtInterestRate").removeAttr("disable");
                $("#txtSurrenderValue").removeAttr("disable");
                if (qrChange)
                    if (bolQualityReview)
                        isQRChanged = true;
                if (exceptionVisible)
                    $("#chkException").attr("disabled", "disable");
                //RequestedLoanAmt again, just in case if the amount changes after fees are applied.
                if ($('#txtLoanAmount').val() == '')
                    RequestedLoanAmt = parseFloat(dRem($('#txtLoanAmount').val()));
                if (bolQualityReview && qrChange != true)
                    ProcessLoan();

            } else
                AlertBox("Loan amount equals zero after fees are applied.  Please re-enter.");
        } else {
            //add logic to display multi-acct loan (MAL) error message is needed
            //MAL error message exists
            if (lsMalInd.length > 0) {
                lsMessage = lsMalInd;
                //shorten message concerning mutlti-acct loan (MAL)
                var bstr;
                bstr = lsMessage.includes("Another loan under the same group and plan is pending for this client. If all loan setup criteria (with the exception of loan amount)");
                if (bstr == true)
                    lsMessage = "Another loan under the same group and plan is pending for this client.  All of the multi-account loan (MAL) criteria has not been meet to set up another loan.";
                if (lsMessage.indexOf("(MAL)") > 0)
                    AlertBox(lsMessage);
                bolMessage = true  //this will stop the setup process
            } else {
                $("#lblMaxLoanWarn").html(strErrorCode);
                $("#lblMaxLoanWarn").css("visibility", "visible");
            }
        } //end rsloanmodel empty logic
    }
}

function ddSEmployeedSuccess(result){
    if(!result){
        strSvcFlag = "N";
        $("#ddEmployed" + ddIndex + "  option[value=2]").attr("selected", "selected");
    }else{
        strSvcFlag = "Y";
        $("#ddEmployed" + ddIndex + "  option[value=1]").attr("selected", "selected");
    }
    ChangeDivRouting(true);
    ddIndex = "";
    if (_LoanCalcFlagClick) {
        _LoanCalcFlagClick = false;
        loanCalculation();        
    }
}

function SetUpVestingArray() {
    var strVestingAmount = "";
    try {
        for (k = 0; k < 3; k++)
            varVestingInfo[k] = new Array();

        for (i = 0; i < varIncludeAccount.length; i++) {            
            varVestingInfo[0][i] = $("#txtAccnt" + i + "").val();
            strVestingAmount = $("#txtVesting" + i + "").val() == "" ? "0%" : $("#txtVesting" + i + "").val();
            strVestingAmount = strVestingAmount.substring(0, strVestingAmount.length - 1);
            varVestingInfo[1][i] = parseFloat($.isNumeric(strVestingAmount) ? parseFloat(strVestingAmount) / 100 : 0);
            if ($('#chkExclude' + i + '').prop('checked') == true)
                varVestingInfo[2][i] = "Y";
            else
                varVestingInfo[2][i] = "N";
        }
    }
    catch (err) {
        AlertBox(err + " - SetUpVestingArray")
    }
}

function applyVesting() {
    blnACHavailable = false;
    try{
        if (bolLoanConfirmation == false) {
            for (i = 0; i < varIncludeAccount.length; i++) {
                if ($("#txtAccnt" + i + "").val() != "") {
                    if ($("#txtVesting" + i + "").val() == "" && strGroupNum == $("#txtGPC" + i + "").val().substring(0, 5)) {
                        AlertBox("Please enter vesting information.", "txtVesting" + i + "");
                        return;
                    }
                    var t = $("#txtAccnt" + i + "").val();
                    if ($('#chkSelect' + i + '').prop('checked') == true)
                        strSelectedAccount = $("#txtAccnt" + i + "").val();
                } else
                    return;
            }
            //Applies vesting information when command button is clicked
            ClearControls(true, "cmdApplyVesting");
            $("#txtYears").val("");
            $("#txtMonths").val("");

            //Vesting information is stored in an array that is passed to MTS components
            SetUpVestingArray();

            //Account information is refreshed with vesting info.
            vesting = true;
            if (bolQualityReview) {
                exQR = true;                
            }
            //Get Loan Accounts         
            //CallControllerMethod("Home", "_GetMainDriver", GetMainDriverSuccess, "", "SSNum", strSSN, "AcctNO", strAccount, "ChannelInd", "CTS", "SvcFlag", strSvcFlag, "PLLInd", "N", "AcctArray", varVestingInfo, "LoanMaxAvail", 0, "LoanMinAvail", 0, "EscrowAmt", 0, "LoanArray", varAccount, "ErrorCode", " ", "IntRate", 0, "SurRate", 0, "SurChargeAmt", 0, "AppName", " ", "iActiveLoans", iActiveLoans, "MultiAcctEstimator", false, "Policy_loan_code", " ", "HighestLoanAmount", OtherCarrierGLB12Mth, "CurrentLoanAmount", OtherCarrierOLB, "ErroMessage", "")
            GetAccount(strSSN, varVestingInfo);
        }
        else
            AlertBox("Please close Loan Confirmation Screen to access this feature");
    }
    catch (err) {
        AlertBox("Apply vesting - " + err);
    }
}

function ClearControls(bolIndicator,strControlName) {
    try{
        for (i = 0; i < varIncludeAccount.length; i++) {
            if ($('#chkExclude' + i + '').prop('checked') == false && strControlName == "btnReset") {
                $("#lblFB001Value").val("");
                $("#lblFP002Value").val("");

                $('#chkSelect' + i + '').prop('checked', false);
                $("#ddEmployed  option[value=0]").attr("selected", "selected");
//                $("select#ddEmployed").prop('selectedIndex', 0);
                $("#ddEmployed").attr("disabled", "disable");

                intIndex = -1;
                //Existing Issue(Status=Fixed): When the 'Reset' button clicked, clear the selected account variable.
                strLoanAccount = "";
            }
            if ($('#chkExclude' + i + '').prop('checked') == true && strControlName == "btnReset")
                $('#chkExclude' + i + '').prop('checked', false);
        }
        $("#btnCalculate").attr("disabled", "disable");
        $("#txtLoanAmount").val("");
        ClearLoanModelControls();
        if (bolIndicator == true) {
            $("#txtTotFixedAnnuity").val("0");
            $("#txtTotLoan").val("0");
            $("#txtTotMYEFA").val("0");
            $("#txttotVarAnnuity").val("0");
        }
        $("#lblMaxLoanWarn").css("visibility", "hidden");
        LoanModelEnable(false);
    }
    catch (err) {
        AlertBox("ClearControls - " + err);
    }
}

function ClearLoanModelControls() {    
    $("#btnProcess").attr("disabled", "disable");
    $("#txtSurrenderValue").attr("disabled", "disable");
    $("#txtInterestRate").attr("disabled", "disable");
    $("#txtInterestRate").val("%");
    $("#txtSurrenderValue").val("%");
    $("#lblFixedAmountLabelValue").val("");
    $("#lblLoanFeeValue").val("");
    $("#lblTOVneededValue").val("");   
}

function LoanModelEnable(bolIndicator) {    
    if (bolIndicator)
    {
        $("#btnCommand").removeAttr("disabled");
        $("#txtLoanAmount").removeAttr("disabled");
        $("#txtYears").removeAttr("disabled");
        $("#txtMonths").removeAttr("disabled");
        $("#cbLoanPurpose").removeAttr("disabled");
        $("#cbRepaymentFrequency").removeAttr("disabled");
        $("#cbPaymentMethod").removeAttr("disabled");
        $("#cbWaiveInitFee").removeAttr("disabled");
        if (RepayMethod != "" && RepayMethod == "A") {
            //$('#divRouting').css("visibility", "hidden");
            //ChangeDivRouting(bolIndicator);
            $("#txtRoutingNum").removeAttr("disabled");
            $("#txtAccountNum").removeAttr("disabled");
            $('#txtphone').removeAttr("disabled");
            $('#rbChecking').removeAttr("disabled");
            $('#rbSavings').removeAttr("disabled");

        }
    } else {

        //Determines whether loan model is enable or not
        $("#btnCommand").attr("disabled", "disable");
        $("#txtLoanAmount").attr("disabled", "disable");
        $("#txtYears").attr("disabled", "disable");
        $("#txtMonths").attr("disabled", "disable");
        $("#cbLoanPurpose").attr("disabled", "disable");
        $("#cbRepaymentFrequency").attr("disabled", "disable");
        $("#cbPaymentMethod").attr("disabled", "disable");
        $("#cbWaiveInitFee").attr("disabled", "disable");

        if (RepayMethod != "" && RepayMethod == "A") {
            ////$('#divRouting').css("visibility", "hidden");
            //ChangeDivRouting(bolIndicator);
            $("#txtRoutingNum").attr("disabled", "disable");
            $("#txtAccountNum").attr("disabled", "disable");
            $('#txtphone').attr("disabled", "disable");            
            $('#rbChecking').attr("disabled", "disable");
            $('#rbSavings').attr("disabled", "disable");
        }
    }
}

function mgrApproval(data) {
    if (data)
        blnManagerApproval = true;
    else
        blnManagerApproval = false;
}

function chkExcepFlagClick() {
    //blnACHavailable = false;
    //if ($('#chkException').prop('checked') == true) {

    //}
    if (bolQualityReview == false) {
        if (strLoanAccount == "") {
            AlertBox("Please select an Account first");
            $('#chkException').prop('checked', false);
            return;
        }
    }
    if ($('#chkException').prop('checked') == true) {
        strSuperUser = true;
        gExcepCnt = 1;
        $('#txtMonths').css("visibility", "visible");
        $("#txtMonths").removeAttr("disabled");
        $('#lblMonths').css("visibility", "visible");
        //load all available repayment methods for Super Users        
        for (k = 0; k < varIncludeAccount.length; k++) {
            //Existing Issue(Status=Fixed): Added If statement, otherwise it's always looking at 'First' account values (K=0) in the grid

            if (strLoanAccount == varIncludeAccount[k][1]) {
                //Repayment Options

                //declare variables to indicate whether specific repayment methods
                //have been added for Super User exception processing 
                var swtCouponOverride;
                $("#cbPaymentMethod").empty();
                bindValue("cbPaymentMethod", 0, "");
                if (varIncludeAccount[k][45] == "Y") {
                    bindValue("cbPaymentMethod", "A", "ACH");
                    //allow super user to override repayment methods
                    if (strSuperUser) {
                        switch (varIncludeAccount[k][46]) {
                            case "N":
                                bindValue("cbPaymentMethod", "I", "Coupon");
                                swtCouponOverride = true;
                        }
                        if (varIncludeAccount[k][44] == "N") {
                            bindValue("cbPaymentMethod", "P", "Payroll Deduction");
                        }
                    }
                }
                if (varIncludeAccount[k][46] == "Y") {
                    bindValue("cbPaymentMethod", "I", "Coupon");
                    //allow super user to override repayment methods
                    if (strSuperUser) {
                        switch (varIncludeAccount[k][45]) {
                            // ACH option
                            case "N":
                                bindValue("cbPaymentMethod", "A", "ACH");
                        }
                        switch (varIncludeAccount[k][44]) {
                            // payroll deduction option
                            case "N":
                                //(SN:P106) 403B 'Existing Issue(Status=Fixed): In some cases 'Payroll Deduction' is being added twice, this logic will check and if its already exists it won't add again
                                var exists = false;
                                $('#cbPaymentMethod option').each(function () {
                                    if (this.value == 'Payroll Deduction') {
                                        exists = true;
                                        return false;
                                    }
                                });
                                if (exists)
                                    bindValue("cbPaymentMethod", "P", "Payroll Deduction");
                                break;
                        }
                    }
                }

                if (varIncludeAccount[k][44] == "Y" || varIncludeAccount[k][44] == "S" || varIncludeAccount[k][44] == "M") {

                    bindValue("cbPaymentMethod", "P", "Payroll Deduction");
                    //super user to override repayment methods
                    if (strSuperUser) {
                        switch (varIncludeAccount[K][46]) {
                            //coupon option
                            case "N":
                                //(SN:P106) 403B 'Existing Issue(Status=Fixed): In some cases 'Coupon' is being added twice, this logic will check and if its already exists it won't add again
                                var exists = false;
                                $('#cbPaymentMethod option').each(function () {
                                    if (this.value == 'Payroll Deduction') {
                                        exists = true;
                                        return false;
                                    }
                                });
                                if (exists)
                                    bindValue("cbPaymentMethod", "I", "Coupon");
                                swtCouponOverride = true;
                                break;
                        }

                        switch (varIncludeAccount[k][45]) {
                            //ACH option
                            case "N":
                                //(SN:P106) 403B 'Existing Issue(Status=Fixed): In some cases 'ACH' is being added twice, this logic will check and if its already exists it won't add again
                                var exists = false;
                                $('#cbPaymentMethod option').each(function () {
                                    if (this.value == 'ACH') {
                                        exists = true;
                                        return false;
                                    }
                                });
                                if (exists)
                                    bindValue("cbPaymentMethod", "A", "ACH");
                                break;
                        }
                    }
                }
                //**************************************************************************** 
                //Note:                                                                      *
                //this ACHFreq variable is not being populated from the BEPLIB               *
                //backend logic currently.  An empty string is being passed in.  This may    *
                //change in the future.  The ACH frequency is currently being hard coded.    *
                //If this changes, the code in BEPLIB will need to be changed to send the    *
                //ACH frequencies in ALL cases so if will be available for Super User Excep. *
                //processing                                                                 *
                //****************************************************************************
                ACHFreq = varIncludeAccount[k][47];
                PayrollFreq = varIncludeAccount[k][48];
                //***********************************************************************************
                //Set repayment frequency for repayments that have added as result    *
                //of Super User Exception processing                                                *
                //***********************************************************************************

                if (swtCouponOverride == true) {
                    CouponFreq = 4;
                } else {
                    CouponFreq = varIncludeAccount[k][49];
                }

                //change code to include values of S, and M for payroll deduction
                if (varIncludeAccount[k][44] == "Y" || varIncludeAccount[k][44] == "S" || varIncludeAccount[k][44] == "M") {
                    $("#cbPaymentMethod  option[text='Payroll Deduction']").attr("selected", "selected");
                } else {
                    $("#cbPaymentMethod  option[value=0]").attr("selected", "selected");
                }
                if (strSuperUser) {
                    switch (varIncludeAccount[k][54]) {
                        case "G":
                            bindValue("cbLoanPurpose", "M", "Mortgage");
                            break;
                        case "M":
                            bindValue("cbLoanPurpose", "G", "General Purpose");
                            break;
                    }
                }
                break;
            }
        }

    }
    else {
        strSuperUser = false;
        $('#txtMonths').val("");
        $('#txtMonths').css("visibility", "hidden");
        $("#txtMonths").attr("disabled", "disabled");
        $("#lblMonths").css("visibility", "hidden");
    }
}


function chkSelect_CheckedChanged(elem) {
    //var dataId = $(elem).data("id");
    //bolSelectClick = true;
    try {
        var Index = $(elem).data("id");
        selectionAccount(Index);       
    }
    catch (err) {
        AlertBox("chkSelect_CheckedChanged - " + err);
    }
}

function selectionAccount(Index) {    
    bolSelectClick = true;
    try{

        if (bolQualityReview) {
            if (strSvcFlag == "Y")
                $("#ddEmployed" + Index + "  option[value=1]").prop("selected", "selected");
            else
                if (strSvcFlag == "N")
                    $("#ddEmployed" + Index + "  option[value=2]").prop("selected", "selected");
        }

        bolSelectExcludeProcess = true;
        var response;
        var str_Renamed = "";
        if ($('#chkSelect' + Index + '').prop('checked') == true) {
            if ($('#chkExclude' + Index + '').prop('checked') == true) {
                $('#chkExclude' + Index + '').prop('checked', false);
                $("#ddEmployed" + Index + "  option[value=0]").attr("selected", "selected");
                $("#ddEmployed" + Index + "").attr("disabled", "disabled");
            }
            if ($('#txtLoanInd' + Index + '').val() == "N") {
                AlertBox("Loans are not allowed on this account.");
                $('#chkSelect' + Index + '').prop('checked', false);
                bolSelectExcludeProcess = false;                
                return;
            }

            for (i = 0; i < varIncludeAccount.length; i++) {
                // loop through Loan accounts to see if vesting needs to be applied before selecting an account
                // Vesting needs to be applied for this condition
                if ($("#txtVesting" + i + "").val() == "") {
                    //for multiple groups if group numbers match the user needs to enter vesting                    
                    if (varIncludeAccount[i][2] == $("#txtGPC" + i + "").val().substring(0, 5)) {
                        AlertBox("Please enter vesting information before selecting this account.");
                        $('#chkSelect' + Index + '').prop('checked', false);
                        bolSelectExcludeProcess = false;
                        return;
                        bolSelectExcludeProcess = false;
                        if (bolVestFlag == true) {
                            AlertBox("Vesting must be applied before selecting this account.");
                            $('#chkSelect' + Index + '').prop('checked', false);
                            bolSelectExcludeProcess = false;
                            return;
                        }
                    }
                }
            }
            ClearControls(false);            

            intIndex = Index;
            // Clear out all other selected accounts
            for (i = 0; i < totRow; i++) {
                if ($('#chkSelect' + i + '').prop('checked') == true && i != intIndex) {
                    $('#chkSelect' + i + '').prop('checked', false);
                    $("#ddEmployed" + i + "  option[value=0]").attr("selected", "selected");
                    $("#ddEmployed" + i + "").attr("disabled", "disabled");
                }
            }
            strGroupNum = $("#txtGPC" + Index + "").val().substring(0, 5);
            var k = $("#ddEmployed" + Index + " :selected").val();
            ddIndex = Index;
            if (!bPendingFormReturn)
                if ($("#ddEmployed" + Index + " :selected").val() == "0") {                    
                    lgConfirmBox("Does the client still work for " + varIncludeAccount[Index][19] + "?", ddSEmployeedSuccess)
                }
                else
                    if ($("#ddEmployed" + Index + " :selected").val() == "1")
                        strSvcFlag = "Y";
                    else if ($("#ddEmployed" + Index + " :selected").val() == "2")
                        strSvcFlag = "N";
                    else
                        strSvcFlag = "";
            applyVesting(); // recalculate
            if (bolMultipleGroups == true) {
                //Multiple groups affects totals section.  Only apply totals by group selected.
                ClearControls(true, "NoGridClear");
                txtTotFixedAnnuity = parseFloat(dRem($("#txtTotFixedAnnuity").val()));
                txtTotMYEFA = parseFloat(dRem($("#txtTotMYEFA").val()));
                txttotVarAnnuity = parseFloat(dRem($("#txttotVarAnnuity").val()));
                txtTotLoan = parseFloat(dRem($("#txtTotLoan").val()));
                for (i = 0; i < varIncludeAccount.length; i++) {
                    if ($("#txtGPC" + i + "").val().substring(0, 5) == varIncludeAccount[i][2]) {
                        txtTotFixedAnnuity = parseFloat(txtTotFixedAnnuity) + parseFloat(varIncludeAccount[i][13]);
                        txtTotMYEFA = parseFloat(txtTotMYEFA) + parseFloat(varIncludeAccount[i][14]);
                        txttotVarAnnuity = parseFloat(txttotVarAnnuity) + parseFloat(varIncludeAccount[i][15]);
                        txtTotLoan = parseFloat(txtTotLoan) + parseFloat(varIncludeAccount[i][22]);
                    }
                }
                $("#txtTotFixedAnnuity").val(accounting.formatMoney(txtTotFixedAnnuity));
                $("#txtTotMYEFA").val(accounting.formatMoney(txtTotMYEFA));
                $("#txttotVarAnnuity").val(accounting.formatMoney(txttotVarAnnuity));
                $("#txtTotLoan").val(accounting.formatMoney(txtTotLoan));
            }
            //Added edit for 'Cash Value';which will disable the loan modeling process.
            if (parseFloat($('#txtAnnValue' + Index + '').val()) == 0 && bolQualityReview == false) {
                $("#lblMaxLoanWarn").html("Selected account must have vested cash value greater than zero.");
                $("#lblMaxLoanWarn").css("visibility", "visible");

                LoanModelEnable(false);
                //bolSelectExcludeProcess = false;
                return;
            }
            else {
                //If max loan is < 1000, give message but set below variables and allow to continue modeling
                //   (necessary so that the exception processing (superuser) can setup a loan less than 1000
                // $1000 is minimum loan allowed so a warning message is displayed if account does not have enough money.

                if (parseFloat($('#txtMaxLoan' + Index + '').val()) < 1000 && bolQualityReview == false) {
                    $("#lblMaxLoanWarn").html("Selected account balance less than $1000 minimum needed for loan");
                    $("#lblMaxLoanWarn").css("visibility", "visible");
                }
                //If enough money, model loan section enabled
                CallControllerMethod("Home", "_GetVhclCashVals", GetVhclCashValsSuccess, "", "AcctNO", strSelectedAccount, "FB1Amt",
                    strFB1Amt, "FP2Amt", strFP2Amt);

                strLoanAccount = $("#txtAccnt" + Index + "").val();
                $("#txtLoanAmount").val($("#txtMaxLoan" + Index + "").val());
                RequestedLoanAmt = parseFloat(dRem($('#txtLoanAmount').val()));
                $("#ddEmployed" + Index + "").removeAttr("disabled");
                LoanModelEnable(true);

                CallControllerMethod("Home", "_GetFundInfo", GetFundInfoSuccess, "", "AccountNo", strSelectedAccount, "SysId",
                    1, "QueryType", 'F', "Org_sys", "NHCC", "SortOrder", "", "Filter", "FBFP");

                // strSelectedAccount = "";

                //Redo code for IncomeLock Logic
                if (strIncomeLock[Index] == "Y" || strIncomeLock[Index] == "C") {
                    if (strRiderVersion[Index] == "P" || strRiderVersion[Index] == "I") {
                        str_Renamed = "Has participant agreed to cancellation of IncomeLock on the Loan Application or verbally through CCC?"
                        //_TempIndex = Index;
                        //lgConfirmBox(str_Renamed, cResponse, "IncomeLock Notice!");
                        //return false;
                    }
                } else {
                    var strIssueDate;
                    strIssueDate = strRiderDate[Index];
                    strIssueDate = parseInt(strIssueDate.substring(6)) + 5;
                    //strIssueDate = strIs
                    var tDate = new Date();
                    tDate = tDate.getFullYear();
                    if (strIssueDate <= tDate) {
                        str_Renamed = "Has participant agreed to cancellation of IncomeLock on the Loan Application or verbally through CCC?"
                        //_TempIndex = Index;
                        //lgConfirmBox(str_Renamed, cResponse, "IncomeLock Notice!"); 
                        //return false;
                    } else {
                        str_Renamed = "Loans are not available on this account until after the IncomeLOCK Plus rider 5th benefit anniversary and the client requests the rider be terminated."
                        $("#lblMaxLoanWarn").html(str_Renamed);
                        $('#lblMaxLoanWarn').css("visibility", "visible");
                        LoanModelEnable(false);
                        return;
                    }
                }

                $("#lblFB001").html('FB001:');
                if (strFB009Ind[Index] == "Y")
                    $("#lblFB001").html('FB009:');

                for (i = 0; i < varIncludeAccount.length; i++) {
                    if ($('#chkSelect' + i + '').prop('checked') == true) {
                        LoanModelEnable(true)
                        bolSelectExcludeProcess = false;
                        return;
                    }
                }
            }

        }
        if (bolSelectExcludeProcess == true) {
            return;
        }
    }
    catch (err) {
        AlertBox("selectionAccount - " + err);
    }
}

function chkExclude_CheckedChange(elem) {
    try {
        bolExcludeClick = true;
        var Index = $(elem).data("id");
        
        bolSelectExcludeProcess = true;
        if ($('#chkExclude' + Index + '').prop('checked') == true) {
            if ($('#chkSelect' + Index + '').prop('checked') == true) {
                $('#chkSelect' + Index + '').prop('checked', false);
                $("#ddEmployed" + Index + "  option[value=0]").prop("selected", "selected");
                $("#ddEmployed" + Index + "").attr("disabled", "disabled");
            }
            ClearLoanModelControls();

            if ($("#txtVesting").val() == "") {
                $("#txtVesting").val("0%");
                $('#chkSelect' + Index + '').prop('checked', true);
            }
            applyVesting();
            if (bolMultipleGroups == true) {
                txtTotFixedAnnuity = parseFloat(dRem($("#txtTotFixedAnnuity").val()));
                txtTotMYEFA = parseFloat(dRem($("#txtTotMYEFA").val()));
                txttotVarAnnuity = parseFloat(dRem($("#txttotVarAnnuity").val()));
                txtTotLoan = parseFloat(dRem($("#txtTotLoan").val()));
                for (i = 0; i < varIncludeAccount.length; i++) {
                    if ($("#txtGPC" + Index + "").val().substring(0, 5) == varIncludeAccount[i][1]) {
                        txtTotFixedAnnuity = parseFloat(txtTotFixedAnnuity) + parseFloat(varIncludeAccount[i][13]);
                        txtTotMYEFA = parseFloat(txtTotMYEFA) + parseFloat(varIncludeAccount[i][14]);
                        txttotVarAnnuity = parseFloat(txttotVarAnnuity) + parseFloat(varIncludeAccount[i][15]);
                        txtTotLoan = parseFloat(txtTotLoan) + parseFloat(varIncludeAccount[i][22]);
                    }
                }
            }
        }
        if (bolSelectExcludeProcess == true) {
            return;
        }
    }
    catch (err) {
        AlertBox("chkExclude_CheckedChange - " + err);
    }
}

function cResponse(data) {
    if (data)
        selectionAccount(_TempIndex);
}

function GetFundInfoSuccess(data) {
    try {
        for (count = 0; count < data.Table.length; count++) {
            switch (data.Table[count].INV_VEH_CODE) {
                case "FB001", "FB009":
                    break;
                case "FP002":
                    $('#lblFP002').html("FP002:");
                    break;
                case "FP001":
                    $('#lblFP002').html("FP001:");
                    break;
            }
        }
    }
    catch (err) {
        AlertBox("GetFundInfoSuccess - " + err);
    }
}

function GetVhclCashValsSuccess(data) {
    try {
        strFB1Amt = data.FB1Amt;
        strFP2Amt = data.FP2Amt;

        $('#lblFB001Value').val((accounting.formatMoney(strFB1Amt)));
        $('#lblFP002Value').val((accounting.formatMoney(strFP2Amt)));

        //_GetFundInfo

        // CallControllerMethod("Home", "_GetFundInfo", GetFundInfoSuccess, "", "AccountNo", strSelectedAccount, "SysId",1, "QueryType", "F","Org_sys"," ","SortOrder"," ","Filter","FBFP");
    }
    catch (err) {
        AlertBox("GetVhclCashValsSuccess - " + err);
    }
}

function ClearBankName() {
    $("#lblBankName").val("");
    $("#lblBankName").css("visibility", "hidden");
}

function success(data) {
    if (data.EMessage != "" && data.EMessage != null) {
        ClearBankName();
    } else {
        gBankName = data.BankName
        if (data.retValue == true) {
            if (gBankName != null && gBankName != undefined) {
                $("#lblBankName").html(gBankName);
                $("#lblBankName").css("visibility", "visible");
            }
            else {
                ClearBankName();
            }
        } else {
            AlertBox("Can't find routing number on AIG Retirement's bank validation table. Please correct routing number.", "txtRoutingNum");
        }
    }
}

function EnableProcessLoan() {
    var m;
    try {

        if (bolErrorCorrection == false) {
            //Determine account status.  If account is AD or HD then do not allow
            //processor to process loan
            for (m = 0; m < varIncludeAccount.length; m++) {
                var accntNo = $("#txtAccnt" + m + "").val();
                if (varIncludeAccount[m][1] == accntNo)
                    break;
            }
            if (varIncludeAccount[m][6] == "AS" || varIncludeAccount[m][6] == "HD") {
                $("#lblMaxLoanWarn").html("Selected account has an invalid status.  Unable to process loan at this time.");
                $("#lblMaxLoanWarn").css("visibility", "visible");
            } else
                $("#btnProcess").removeAttr("disabled");
            if (bolMessage == true)
                $("#btnProcess").attr("disabled", "disabled");
        }
    }
    catch (err) {
        AlertBox("EnableProcessLoan - " + err);
    }
}

function error(data) {
    return false;
}

function tVestingAppliesChange(elem) {

    var Index = $(elem).data("id");

    try {
        if ($('#btnVesting').prop('disabled') == true) {
            LoanModelEnable(false);
            ClearLoanModelControls();
            $("#txtLoanAmount").val("");
            $("#txtYears").val("");
            $("#txtMonths").val("");
            $("#btnCalculate").attr("disabled", "disabled");
        }
    }
    catch (err) {
        AlertBox("Vesting change - " + err);
    }
}

function tVestingAppliesFout(elem) {
    var Index = $(elem).data("id");

    var strVest = "";
    try {
        var vestingValue = $("#txtVesting" + Index + "").val();
        if (vestingValue != "") {
            for (i = 0; i < vestingValue.length; i++) {                
                if (!isNaN((vestingValue.substring(i, 1)))) {
                    //strVest = strVest +  vestingValue.substring(i, 0);
                    strVest = vestingValue;
                } else {
                    if (vestingValue.substring(i,1) == "%") {
                        AlertBox("Please enter whole numeric numbers only.");
                        $("#txtVesting" + Index + "").val("");
                        return;
                    }
                }
            }

            if (parseFloat(strVest) < 0 || parseFloat(strVest) > 100) {
                AlertBox("Please enter a vesting value between 0 and 100");
                $("#txtVesting" + Index + "").val(numeral(1).format('0%'));
            } else {
                $("#txtVesting" + Index + "").val(numeral(parseFloat(strVest / 100)).format('0%'));
                ClearLoanModelControls();
                if ($.trim($("#txtLoanAmount").val()) != "" && $.trim($("#txtYears").val()) != "") {
                    $("#btnCalculate").removeAttr("disabled");
                }
            }
        }
        strGroupNum = $("#txtGPC" + Index + "").val().substring(0, 5);
    }
    catch (err) {
        AlertBox("Vesting Focusout - " + err);
    }
}

function ChangeDivRouting(divbool) {
    if (divbool) {
        $('#divRouting').css("visibility", "visible");
        $('#lblRoutingNum').css("visibility", "visible");
        $('#txtRoutingNum').css("visibility", "visible");
        $('#lblBankName').css("visibility", "hidden");
        $('#lblAccountNum').css("visibility", "visible");
        $('#txtAccountNum').css("visibility", "visible");
        $('#lblPhone').css("visibility", "visible");
        $('#txtphone').css("visibility", "visible");
        $('#lblAccountType').css("visibility", "visible");
        $('#rbChecking').css("visibility", "visible");
        $('#rbSavings').css("visibility", "visible");
        //$("#lblLoanTypeCode").css("visibility", "visible");
    } else {
        $('#divRouting').css("visibility", "hidden");
        $('#lblRoutingNum').css("visibility", "hidden");
        $('#txtRoutingNum').css("visibility", "hidden");
        $('#lblBankName').css("visibility", "hidden");
        $('#lblAccountNum').css("visibility", "hidden");
        $('#txtAccountNum').css("visibility", "hidden");
        $('#lblPhone').css("visibility", "hidden");
        $('#txtphone').css("visibility", "hidden");
        $('#lblAccountType').css("visibility", "hidden");
        $('#rbChecking').css("visibility", "hidden");
        $('#rbSavings').css("visibility", "hidden");
       // $("#lblLoanTypeCode").css("visibility", "hidden");
    }
}

function VestingEnable(bolFlag) {
    if (bolFlag == false) {
        if (varIncludeAccount.length > 0) {
            for (var i = 0; i < varIncludeAccount.length; i++) {
                $("#chkExclude" + i + "").attr("disabled", "disabled");
                $("#chkSelect" + i + "").attr("disabled", "disabled");
                $("#txtVesting" + i + "").attr("disabled", "disabled");
            }
        }
    } else {
        if (varIncludeAccount.length > 0) {
            for (var i = 0; i < varIncludeAccount.length; i++) {
                $("#chkExclude" + i + "").removeAttr("disabled");
                $("#chkSelect" + i + "").removeAttr("disabled");
                if (varIncludeAccount[i][4] == "1" || varIncludeAccount[i][4] == "2" ||varIncludeAccount[i][24].substring(1,2)!="V") {
                    $("#txtVesting" + i + "").attr("disabled", "disabled");
                } else {
                    $("#txtVesting" + i + "").removeAttr("disabled");
                }                
            }
        }
    }
}



$('#cbPaymentMethod').change(function () {
    cbPaymentChange();
});

function cbPaymentChange() {
    try {
        var selectedItem = $("#cbPaymentMethod :selected").val();
        $("#cbRepaymentFrequency").empty();
        if (selectedItem == "I" && !blnManagerApproval) {
            lgConfirmBox("Coupon Repayment Method Requires Manager Approval. Have you obtained approval?", mgrApproval, "Manager Approval Required!")
        }
        if (selectedItem != 0) {
            switch (selectedItem) {
                case "A":
                    bindValue("cbRepaymentFrequency", 0, "");
                    bindValue("cbRepaymentFrequency", 4, "Quarterly");
                    bindValue("cbRepaymentFrequency", 12, "Monthly");
                    bindValue("cbRepaymentFrequency", 24, "Semi-Monthly");
                    bindValue("cbRepaymentFrequency", 26, "Bi-Weekly");
                    bindValue("cbRepaymentFrequency", 52, "Weekly");
                    //add logic to display banking information group box when ACH is selected
                    ChangeDivRouting(true);
                    gACHFlag = true;
                    break;
                case "I":
                    if (!blnManagerApproval) {
                        $('#cbPaymentMethod').focus();
                    }
                    bindValue("cbRepaymentFrequency", CouponFreq, GetFrequencyText(CouponFreq));
                    //add logic NOT to display banking information group box unless ACH is selected

                    ChangeDivRouting(false);
                    gACHFlag = false;
                    break;
                case "P":
                    bindValue("cbRepaymentFrequency", PayrollFreq, GetFrequencyText(PayrollFreq));
                    //add logic NOT to display banking information group box unless ACH is selected
                    ChangeDivRouting(false);
                    gACHFlag = false;
                    break;
            }
        }

        var s = $("#cbRepaymentFrequency :selected").val();
        if ($("#cbRepaymentFrequency :selected").val() > 0)
            // $("#cbPaymentMethod  option[value=0]").attr("selected", "selected");
            $('#cbPaymentMethod  option[value=' + s + ']').prop("selected", "selected");

        if ($("#txtLoanAmount").val() != "") {
            $("#btnProcess").attr("disabled", "disabled");
            ClearLoanModelControls()
        }

        if ($("#txtYears").val() != "" && $("#txtLoanAmount").val() != "")
            $("#btnCalculate").removeAttr("disabled");
        else
            $("#btnCalculate").attr("disabled", "disabled");


        //$("#cbRepaymentFrequency").empty();
        //bindValue("cbRepaymentFrequency", "0", " ");
        //bindValue("cbRepaymentFrequency", "Y", "Yes");
        //bindValue("cbRepaymentFrequency", "N", "No");

    }
    catch (err) {
        AlertBox("cbPaymentChange - " + err);
    }
}

$('#cbLoanPurpose').change(function () {
    cbLoanPurposeChange();
});

function cbLoanPurposeChange() {
    try {
        if ($("#txtLoanAmount").val() != "") {
            $("#btnProcess").attr("disabled", "disabled");
            ClearLoanModelControls()
        }
        if ($("#txtYears").val() != "" && $("#txtLoanAmount").val() != "")
            $("#btnCalculate").removeAttr("disabled");
        else {
            $("#btnCalculate").attr("disabled", "disabled");

        }
    }
    catch (err) {
        ALertBox("cbLoanPurposeChange - " + err);
    }
}

$('#cbRepaymentFrequency').change(function () {
    try {
        if ($("#txtLoanAmount").val() != "") {
            $("#btnProcess").attr("disabled", "disabled");
            ClearLoanModelControls()
        }
        if ($("#txtYears").val() != "" && $("#txtLoanAmount").val() != "")
            $("#btnCalculate").removeAttr("disabled");
        else {
            $("#btnCalculate").attr("disabled", "disabled");

        }
    }
    catch (err) {
        ALertBox("cbRepaymentFrequency change - " + err);
    }
});

$('#cbWaiveInitFee').change(function () {
    try {
        if ($("#txtLoanAmount").val() != "") {
            $("#btnProcess").attr("disabled", "disabled");
            ClearLoanModelControls()
        }
        if ($("#txtYears").val() != "" && $("#txtLoanAmount").val() != "")
            $("#btnCalculate").removeAttr("disabled");
        else {
            $("#btnCalculate").attr("disabled", "disabled");

        }
    }
    catch (err) {
        ALertBox("cbRepaymentFrequency change - " + err);
    }
});

$("#txtYears").focusout(function () {
    if ($("#txtLoanAmount").val() != "") {
        $("#btnProcess").attr("disabled", "disabled");
        ClearLoanModelControls();
    }
    if ($("#txtLoanAmount").val() != "" && $("#txtYears").val() != "")
        $("#btnCalculate").removeAttr("disabled");
    else
        $("#btnCalculate").attr("disabled", "disabled");
});

$("#txtMonths").focusout(function () {
    if ($("#txtLoanAmount").val() != "") {
        $("#btnProcess").attr("disabled", "disabled");
        ClearLoanModelControls();
    }
    if ($("#txtLoanAmount").val() != "" && $("#txtYears").val() != "")
        $("#btnCalculate").removeAttr("disabled");
    else
        $("#btnCalculate").attr("disabled", "disabled");
});

$("#txtLoanAmount").change(function () {
    if ($("#txtLoanAmount").val() != "") {
        $("#btnProcess").attr("disabled", "disabled");
        ClearLoanModelControls();
    }
    if ($("#txtLoanAmount").val() != "" && $("#txtYears").val() != "")
        $("#btnCalculate").removeAttr("disabled");
    else
        $("#btnCalculate").attr("disabled", "disabled");
});


$("#chkException").click(function () {    
    chkExcepFlagClick();    
});

$("#chkException").change(function () {
    blnACHavailable = false;
    if ($('#chkException').prop('checked') == false) {
        switch (gExcepCnt) {
            case 1:
                $("#cbPaymentMethod").empty();
                bindValue("cbPaymentMethod", 0, "");
                for (j = 0; j < varIncludeAccount.length; j++) {
                    if (strLoanAccount == varIncludeAccount[j][1]) {
                        if (varIncludeAccount[j][45] == "Y") {
                            bindValue("cbPaymentMethod", "A", "ACH");
                            blnACHavailable = true;                            
                        }
                        if (varIncludeAccount[j][46] == "Y") {
                            bindValue("cbPaymentMethod", "I", "Coupon");                           
                        }
                        if (varIncludeAccount[j][44] == "Y" || varIncludeAccount[j][44] == "S" || varIncludeAccount[j][44] == "M") {
                            bindValue("cbPaymentMethod", "P", "Payroll Deduction");
                        }
                        //**************************************************************************** 
                        //Note:                                                                      *
                        //this ACHFreq variable is not being populated from the BEPLIB               *
                        //backend logic currently.  An empty string is being passed in.  This may    *
                        //change in the future.  The ACH frequency is currently being hard coded.    *
                        //If this changes, the code in BEPLIB will need to be changed to send the    *
                        //ACH frequencies in ALL cases so if will be available for Super User Excep. *
                        //processing                                                                 *
                        //****************************************************************************
                        ACHFreq = varIncludeAccount[j][47];
                        PayrollFreq = varIncludeAccount[j][48];
                        CouponFreq = varIncludeAccount[j][49];

                        //reset Loan Purpose to defaults
                        $("#cbLoanPurpose").empty();
                        bindValue("cbLoanPurpose", 0, "");
                        switch (varIncludeAccount[j][54]) {
                            case "H", "B":
                                bindValue("cbLoanPurpose", "G", "General Purpose");
                                bindValue("cbLoanPurpose", "M", "Mortgage");
                                break;
                            case "G":
                                bindValue("cbLoanPurpose", "G", "General Purpose");
                                break;
                            case "M":
                                bindValue("cbLoanPurpose", "M", "Mortgage");
                                break;
                        }
                        var pCount = $('#cbLoanPurpose').children('option').length;
                        if (pCount > 0) 
                            $("#cbLoanPurpose  option[value=0]").prop("selected", "selected");
                        LoanPurp = $("#cbLoanPurpose :selected").val();
                        break;                        
                    }
                }
                if (blnACHavailable)
                    //$('#divRouting').css("visibility", "visible");
                    ChangeDivRouting(true);
                else
                    //$('#divRouting').css("visibility", "hidden");
                    ChangeDivRouting(false);
                break;
            case 2:
                break;
        }
    }
});

$('#btnCalculate').click(function () {
    loanCalculation();
});

$('#btnVesting').click(function () {
    applyVesting();
});

$('#btnProcess').click(function () {
    ProcessLoan();    
});

$("#txtRoutingNum").focusout(function () {
    var txtRoutingNum = $("#txtRoutingNum").val();
    if (txtRoutingNum != "" && txtRoutingNum != undefined) {
        var isNumeric = !isNaN(txtRoutingNum);
        if (!isNumeric) {
            ClearBankName();
            AlertBox("Routing Number Must Be Numeric.  Please Re-Enter.");
            return;
        }
        else if (txtRoutingNum.length != 9) {
            ClearBankName();
            AlertBox("Routing Number Must be 9 Digits.  Please Re-Enter.");
            return;
        }

        var sum = 0;        
        var strErrCode;
        var retValue = false

        // If the resulting sum is an even multiple of ten (but not zero),
        // the aba routing number is good.
        //number is okay, so retrieve bank name
        for (i = 0; i < txtRoutingNum.length; i += 3) {
            var routNum1 = parseInt(txtRoutingNum.substring(i, i + 1)) * 3;
            var routNum2 = parseInt(txtRoutingNum.substring(i + 1, i + 2)) * 7;
            var routNum3 = parseInt(txtRoutingNum.substring(i + 2, i + 3)) * 1;
            sum = sum + routNum1 + routNum2 + routNum3;
        }
        if ((sum != 0 && sum % 10 == 0)) {
            var strErrCode;
            var retValue = false

            //retrieve bank name
            CallControllerMethod("Home", "_GetBankName", success, error, "RoutingNumber", txtRoutingNum)
        } else {
            AlertBox("Routing Number is not valid. Please Re-enter.", "txtRoutingNum");
            ClearBankName();
        }
    } else
        if ($.trim(txtRoutingNum) == "" || txtRoutingNum == undefined)
            ClearBankName();    
});

$("#txtphone").focusout(function () {
    var txtPhone = $("#txtphone").val();
    if (txtPhone != "" && txtPhone != undefined) {
        var isNumeric = !isNaN(txtPhone)
        if (!isNumeric) {
            AlertBox("Phone Number Must Be Numeric. Please Re-Enter without dashes", "txtphone");
        }
        else if (txtPhone.length > 0 && txtPhone.length < 10) {
            AlertBox("Phone Number Must Be 10 Digits.  Please Re-Enter");
        }
    }
    
});

$("#txtAccountNum").focusout(function () {
    var txtAccountNum = $("#txtAccountNum").val();
    if (txtAccountNum != "" && txtAccountNum != undefined) {
        var isNumeric = !isNaN(txtAccountNum)
        if (!isNumeric) {
            AlertBox("Account Number Must Be Numeric.  Please Re-Enter.", "txtAccountNum");            
        }
    }
});

$("input[name=accounttype]").click(function () {    
    if (rbAccountType[1].checked == true) {
        gBankAccountType = "S"
        $('#rbChecking').prop('checked', false);
    } else if (rbAccountType[0].checked == true) {
        gBankAccountType = "C"
        $('#rbSavings').prop('checked', false);
    }
})

$("#txtLoanAmount").focusout(function () {
    var txtLoanAmount = $("#txtLoanAmount").val()
    if (!isNaN(dRem(txtLoanAmount))) {
        var r = dRem(txtLoanAmount);
        $("#txtLoanAmount").val(accounting.formatMoney(dRem(txtLoanAmount)));
    } else {
        AlertBox("Invalid Loan Amount.  Please re-enter.", "txtLoanAmount");
        $("#txtLoanAmount").val("");
    }
});

function ProcessLoan() {
    try {
        var intStart = 0;

        strEFT = "";
        strBankName = "";
        strAbaRoutingNumber = "";
        strBankAccountNumber = "";
        strBankAccountType = "";
        strBankAddress = "";
        strBankCityStateZip = "";

        strEFT = varAccount[intIndex][72];
        strBankName = varAccount[intIndex][76];
        strAbaRoutingNumber = varAccount[intIndex][73];
        strBankAccountNumber = varAccount[intIndex][74];
        strBankAccountType = varAccount[intIndex][75];
        strBankAddress = varAccount[intIndex][77];
        strBankCityStateZip = varAccount[intIndex][78];
        if (bolLoanConfirmation == false) {
            if (bolQualityReview == true) {
                //$("#cmdSendVsys").text("Update PLL");
                DisplayAchInformation();
            } else {
                //make sure all ACH is filled in before going to Confirmation Page
                if (gACHFlag == true) {
                    var strACHMsg = "";
                    if ($("#txtRoutingNum").val() == "" || $("#txtRoutingNum").val() == null) {
                        strACHMsg = "Routing number is missing. Please enter.";
                        AlertBox(strACHMsg);
                        bolLoanConfirmation = false;
                        strACHMsg = "";
                        return;
                    } else {
                        gBankRoutingNumber = $.trim($("#txtRoutingNum").val());
                    }
                    //check bank name
                    if ($("#lblBankName").text() == "" || $("#lblBankName").text() == null) {
                        strACHMsg = "Bank name is missing. Please make sure routing number is correct.";
                        AlertBox(strACHMsg);
                        bolLoanConfirmation = false;
                        strACHMsg = "";
                        return;
                    }
                    //check bank account number
                    if ($("#txtAccountNum").val() == "" || $("#txtAccountNum").val() == undefined) {
                        strACHMsg = "Bank account number is missing. Please enter.";
                        AlertBox(strACHMsg);
                        bolLoanConfirmation = false;
                        strACHMsg = "";
                        return;
                    } else {
                        gBankAccountNumber = $.trim($("#txtAccountNum").val());
                    }

                    //check bank phone number
                    if ($("#txtphone").val() == "" || $("#txtphone").val() == undefined) {
                        strACHMsg = "Bank phone number is missing. Please enter.";
                        AlertBox(strACHMsg);
                        bolLoanConfirmation = false;
                        strACHMsg = "";
                        return;
                    }
                    else {
                        gBankPhoneNumber = $.trim($("#txtphone").val());
                    }

                    //check bank account type

                    if (rbAccountType[0].checked == false && rbAccountType[1].checked == false) {
                        strACHMsg = "Bank account type is not selected. Please choose Checking or Savings.";
                        AlertBox(strACHMsg);
                        bolLoanConfirmation = false;
                        strACHMsg = "";
                        return;
                    }
                }
                //end ACH changes

                intStart = 1;
                if (errCode == "BAD ADDRESS") {
                    for (var i = 1; (i <= strErrorMsg.length) ; i++) {
                        if ((strErrorMsg.substring((i - 1), 1) == ".")) {
                            strErrorMsg = (strErrorMsg.substring((intStart - 1), i) + ("\r\n" + " Please update the address."));
                            break;
                        }
                    }
                }
                switch (errCode) {
                    case "PLL_IN_PENDING":
                        AlertBox(strErrorMsg)
                        bolLoanConfirmation = false;
                        return;
                    case "BAD ADDRESS":
                        AlertBox(strErrorMsg)
                        strBadAddrFlag = true;
                        return;
                    case "PLL_IN_VSYSTEM_PENDING":
                        AlertBox(strErrorMsg)
                        bolLoanConfirmation = false;
                        return;
                    case "7":
                    case "8": 
                        AlertBox(strErrorMsg)
                        return;                    
                    case "3":
                        if (strSuperUser == false) {
                            AlertBox(strErrorMsg + "Unable to process loan")
                            bolLoanConfirmation = false;
                            return;
                        }
                        break;
                    case "11":
                        if (strErrorMsg != "") {
                            AlertBox(strErrorMsg)
                            bolLoanConfirmation = false;
                            return;
                        }
                        break;
                    case "5":
                        strErrorMsg = "Loans are not available on Set Rate Annuity accounts.";
                        AlertBox(strErrorMsg)
                        bolLoanConfirmation = false;
                        return;
                }
            }
            LoanModelEnable(false);
            //ClearBankName();
            VestingEnable(false);
            $("#btnVesting").attr("disabled", "disabled");                     
            var jsonLMASDatas = jsonLMASData();
            var viewerUrl = "";
            if (!bolQualityReview) {                
                viewerUrl = baseurl + '/Home/LoanConfirm?appType=LC&QR=false';
            }
            else {
                viewerUrl = baseurl + '/Home/LoanConfirm?appType=LC&QR=true';
            }
            bolLoanConfirmation = true;
            $("#rsLoaninfo").val(JSON.stringify(rsLoanInformation));
            $("#rsLoanModel").val(JSON.stringify(rsLoanModel));
            $("#lmasData").val(jsonLMASData());
            parent = window.open(viewerUrl, 'Tiff Viewer', ' toolbar=no, scrollbars=no, menubar=no, status=no, directories=no,scrollbars=1,width=700,height=650,left=250,resizable=yes');            
        } else {
            AlertBox("Please close Loan Confirmation Screen to access this feature");
        }
    }
    catch (err) {
        AlertBox("Process Loan - " + err);
    }
}

function jsonLMASData() {
    var result = "";    
    try {
        result = {
            "strAccount": strLoanAccount,
            "strYears": $("#txtYears").val(),
            "strMonths": $("#txtMonths").val(),
            "strLoanAmount": $("#txtLoanAmount").val(),
            "bolNewLoan": true,
            "intLCNewRowCount": intNewRowCount,
            "strEFT": strEFT,
            "strBankName": strBankName,
            "strAbaRoutingNumber": strAbaRoutingNumber,
            "strBankAccountNumber": strBankAccountNumber,
            "strBankAccountType": strBankAccountType,
            "strBankAddress": strBankAddress,
            "strBankCityStateZip": strBankCityStateZip,
            "SSN": strSSN,
            "Account": strAccount,
            "userID": strUserID,
            "CRDA": strAWDCreateDate,
            "SVC": strSvcFlag,
            "MALflag": gMALFlag,
            "WaiveAppFee": WaiveAppFee,
            "LoanPurp": LoanPurp,
            "RepayMethod": RepayMethod,
            "Frequency": Frequency,
            "PlanTypeCode": PlanTypeCode,
            "OtherCarrierGLB12Mth": OtherCarrierGLB12Mth,
            "OtherCarrierOLB": OtherCarrierOLB,
            "strBadAddrFlag": strBadAddrFlag,
            "gACHFlag": gACHFlag,
            "strBankPhone": $("#txtphone").val(),
            "strFB1Amt": $("#lblFB001Value").val(),
            "strFP2Amt": $("#lblFP002Value").val(),
            "strAWDConfirmation": strAWDConfirmation,
            "strSuperUser": strSuperUser,
            "isQRChanged": isQRChanged,
            "strOriginalLoanSetupUID": strOriginalLoanSetupUID,
            "LoanType": LoanType,
            "TransID": ObjID,
	    "bPendingFormReturn": bPendingFormReturn
        };
    }
    catch (err) {
        AlertBox("jsonFormat - " + err);
    }
    return JSON.stringify(result);

}

function QualityReviewSetup() {
    try {
        modelDialog.show("Loan Setup progress...");
        CallControllerMethod("Home", "_GetObjectData", GetObjectDataQRSuccess, "", "ObjId", ObjID, "AppId", AppID, "UserId", strUserID);        
    }
    catch (err) {
        AlertBox("QualityReviewSetup - " + err, "close");
    }
}

function GetObjectDataQRSuccess(data) {
    try {
        if (data.Response.Message.indexOf("Error") !== -1) {
            AlertBox("<b style='color:red;'>Error in retrieving Data</b> - <b>Can't setup loan</b><br />" + data.Response.Message, "close");
        } else {
            for (var keys in data.ObjectFields) {
                if (data.ObjectFields[keys].FieldName === "statusName") {
                    if (data.ObjectFields[keys].FieldValue === "DISBAPPVD" || data.ObjectFields[keys].FieldValue === "DISBREJCTD") {
                        AlertBox("Quality Review has been performed.", "close");
                        return;
                    }
                    else
                        _processFlag = 1;
                }
            }
            if (_processFlag === 1) {
                for (var key in data.IndexFields) {
                    if (data.IndexFields[key].LOBTranslation === "TIN")
                        strSSN = data.IndexFields[key].FieldValue;
                    if (data.IndexFields[key].LOBTranslation === "POLN")
                        strAccount = data.IndexFields[key].FieldValue;

                    if (data.IndexFields[key].LOBTranslation === "OLNM") {                        
                        if (data.IndexFields[key].FieldValue.replace(/^0+/, '') !== "")
                            OtherCarrierOLB = parseFloat(data.IndexFields[key].FieldValue.replace(/^0+/, '')) / 100;
                    }
                    if (data.IndexFields[key].LOBTranslation === "GLLM") {
                        if (data.IndexFields[key].FieldValue.replace(/^0+/, '') !== "")
                            OtherCarrierGLB12Mth = parseFloat(data.IndexFields[key].FieldValue.replace(/^0+/, '')) / 100;
                    }
                    if (data.IndexFields[key].LOBTranslation === "SRVF") {
                        strSvcFlag = data.IndexFields[key].FieldValue;
                    }
                    if (data.IndexFields[key].LOBTranslation === "SSC") {
                        strAWDConfirmation = data.IndexFields[key].FieldValue;
                    }
                }
                strAWDCreateDate = data.ObjId.substring(0, 26);
                if (strSvcFlag == "")
                    strSvcFlag = "Y";
                if (strSSN === "") {
                    AlertBox("SSN is missing.  Please update worktype.", "close");
                    return false;
                }
                if (strAccount === "") {
                    AlertBox("Acccount number is missing.  Please update worktype.", "close");
                    return false;
                }
                if (strAWDConfirmation == "")
                    AlertBox("The worktype does not have a valid confirmation number. Unable to quality review this loan.  Please retrieve confirmation number from Agilenet and update worktype.", "close");
            }
            QrProces = true;
            GetObjectDataSuccess(data);
        }
    }
    catch (err) {
        AlertBox("GetObjectDataQRSuccess - " + err);
    }
}

function DisplayAchInformation() {
    if (rsLoanInformation.Table[0].PAYMENT_OPTION == "A") {
        ChangeDivRouting(true);

        if (rsLoanInformation.Table[0].ABA_NUMBER != null)
            $("#txtRoutingNum").val(rsLoanInformation.Table[0].ABA_NUMBER);
        if (rsLoanInformation.Table[0].BANK_ACCOUNT_NUM != null)
            $("#txtAccountNum").val(rsLoanInformation.Table[0].BANK_ACCOUNT_NUM);
        if (rsLoanInformation.Table[0].BANK_PHONE_NUMBER != null)
            $("#txtphone").val(rsLoanInformation.Table[0].BANK_PHONE_NUMBER);
        if (rsLoanInformation.Table[0].BANK_ACCOUNT_TYPE != null)
            if (rsLoanInformation.Table[0].BANK_ACCOUNT_TYPE == "C")
                $("#rbChecking").prop('checked', true);
            else
                $("#rbSavings").prop('checked', true);
        if (rsLoanInformation.Table[0].BNK_NAM != null)
            $("#lblBankName").html(rsLoanInformation.Table[0].BNK_NAM);
        $("#lblBankName").css("visibility", "visible");

        if (bolQualityReview) {
            $('#txtRoutingNum').attr("disabled", "disable");
            $('#lblBankName').attr("disabled", "disable");
            $('#txtAccountNum').attr("disabled", "disable");
            $('#txtphone').attr("disabled", "disable");
            $('#rbChecking').attr("disabled", "disable");
            $('#rbSavings').attr("disabled", "disable");
        }
    }
}

function parentAlert() {
    LoanModelEnable(true)
    VestingEnable(true)
    bolLoanConfirmation = false;
    if (bolQualityReview)
        qrChange = true;      
}

$("#btnCommand").click(function () {
    for (i = 0; i < varIncludeAccount.length; i++) {
        if ($("#chkSelect" + i + "").prop("checked")) {
            var x = $("#txtMaxLoan" + i + "").val();
            $("#txtLoanAmount").val(x);
        }
    }
});

$("#btnCancel").click(function () {
    if (bolLoanConfirmation == false) {
        bolQualityReview = false;
        blnManagerApproval = false;
        //window.open('', '_self', '');
        parent.window.close();
    } else {
        AlertBox("Please close Loan Confirmation Screen to access this feature");
    }
})

$("#btnReset").click(function () {
    if (bolLoanConfirmation == false) {
        window.location.reload();
    } else {
        AlertBox("Please close Loan Confirmation Screen to access this feature");
    }
});