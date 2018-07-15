//Loan confirmation form querystring values
var strAccount = "";
var strYears = "";
var strMonths = "";
var strLoanAmount = "";
var bolNewLoan = "";
var intLCNewRowCount = "";

var aSSN = "";
var lAccount = "";
var bPLLInsert = false;
var strStatus = "";
var str_Renamed = "";
var strErrorCode = "";
var UserID = "";
var QualityFlag = false;
var pllUpdateFlag = false;
var qrReject = false;
var qrApprove = false;
var pllUpdate = false;
var pStatus = false;
var pLOB = false;
var pLOBsuccess = false;
var pLOBCount = 0;
var vSystem = false;
var _TransactionID = '';

var chkOptPayee = 0;
var bankinfoFlag = false;

$(document).ready(function () {   
    try {
        appType = getUrlString()["appType"];
        if (appType == "LC")
            LoanConfirmSetup();                 
    }
    catch (err) {
        AlertBox("load page -" + err);
    }    
    
});


function LoanConfirmSetup() {
    //modelDialog.show("loading...");
    try {        
        var loanInfo = window.opener.document.getElementById("rsLoaninfo").value;
        var rsloanFetch = window.opener.document.getElementById("rsLoanModel").value;
        var lmasData = window.opener.document.getElementById("lmasData").value;; 
        rsLoanModel = JSON.parse(rsloanFetch != "" ? rsloanFetch : "{}");
        rsLoanInformation = JSON.parse(loanInfo != "" ? loanInfo : "{}");
        var jsonData = JSON.parse(lmasData != "" ? lmasData : "{}");        
        $("#lblMortgageLoan").css("visibility", "visible");
        $('[data-toggle="tooltip"]').tooltip();
        var qFlag = JSON.parse(getUrlString()['QR']);
        QualityFlag = qFlag != true ? false : true;
        strAWDConfirmation = jsonData.strAWDConfirmation != null ? jsonData.strAWDConfirmation : "";
        strAccount = jsonData.strAccount; //check
        strYears = jsonData.strYears;
        strMonths = jsonData.strMonths;
        strLoanAmount = jsonData.strLoanAmount;
        bolNewLoan = jsonData.bolNewLoan;
        intLCNewRowCount = jsonData.intLCNewRowCount;
        strEFT = jsonData.strEFT;
        strBankName = jsonData.strBankName;
        strAbaRoutingNumber = jsonData.strAbaRoutingNumber;
        strBankAccountNumber = jsonData.strBankAccountNumber;
        strBankAccountType = jsonData.strBankAccountType;
        strBankAddress = jsonData.strBankAddress;
        strBankCityStateZip = jsonData.strBankCityStateZip;
        strBankPhone = jsonData.strBankPhone; 
        aSSN = jsonData.SSN;
        lAccount = jsonData.Account;
        RequestedLoanAmt = strLoanAmount;        
        strUserID = jsonData.userID;
        strOriginalLoanSetupUID = jsonData.strOriginalLoanSetupUID;
        strAWDCreateDate = jsonData.CRDA;
        strSvcFlag = jsonData.SVC;
        strFB1Amt = jsonData.strFB1Amt;
        strFP2Amt = jsonData.strFP2Amt;
        gMALFlag = jsonData.MALflag;
        loanPurp = jsonData.LoanPurp;
        RepayMethod = jsonData.RepayMethod;
        PlanTypeCode = jsonData.PlanTypeCode;
        OtherCarrierOLB = jsonData.OtherCarrierOLB;
        OtherCarrierGLB12Mth = jsonData.OtherCarrierGLB12Mth;
        strBadAddrFlag = jsonData.strBadAddrFlag;
        Frequency = jsonData.Frequency;
        gACHFlag = jsonData.gACHFlag;
        gsYears = strYears;
        strSuperUser = jsonData.strSuperUser;
        isQRChanged = jsonData.isQRChanged;
        LoanType = jsonData.LoanType;   
        _TransactionID = jsonData.TransID;
		bPendingFormReturn = JSON.bPendingFormReturn;
        confnum = window.opener.document.getElementById("strConfirm").value;
        cbDeliveryOption();
        if (QualityFlag) {
            bolQualityReview = true;
            CallControllerMethod("Home", "_GetParticipantMailingAddress", SuccessSetup, "", "SSN", aSSN, "ACCOUNT", lAccount);
        } else {
            CallControllerMethod("Home", "_GetParticipantMailingAddress", SuccessSetup, "", "SSN", aSSN, "ACCOUNT", lAccount);
            CallControllerMethod("Home", "_GetPLLPendingFormReturn", GetAccountExcludeInfoSuccess, "", "lAccount", lAccount, "orgSys", "AWD", "vestValue", "", "creditCardType", "", "creditCardNumber", "", "creditDate", "", "formTrnId", "");
        }
    }
    catch (err) {
        AlertBox("LoanConfirmSetup - " + err, "closer");
    }
}

function SuccessSetup(data) {
    PartInfo = data.PartInfo.split("|");
    if (appType == "LC")
        LaunchLoanConfirm();
    //modelDialog.hide();
}

function LaunchLoanConfirm() {
    try {
        lintLCNewRowCount =parseInt(intLCNewRowCount);
        strOptionalPayee = "N";
        strSurrenderWaiver = "N";
        $("#RequestedLoan").html(RequestedLoanAmt);
        $("#lblAccountNumber").html(strAccount);
        HidePolicyCtrls(true);
       // PlanMessage(true);
        if (LoanType == "P")
            $("#lblLoanType").html("Plan");
        else
            $("#lblLoanType").html("Policy");

        if (LoanType == "P") {
            //HidePolicyCtrls(false);
            //PlanMessage(true);
            var _TableEnable = document.getElementsByName("tblFundSecure");
            _TableEnable[0].style.display = 'none';
        } else {
            var _LabelEnable = document.getElementsByName("lblFundSecure");
            _LabelEnable[0].style.display = 'none';
        }
            //HidePolicyCtrls(true);
        var bMonthApply = false;
        if (strMonths != "")
            if (!isNaN(strMonths))
                bMonthApply = true;

        if (parseInt(strYears) == 1) {
            if (bMonthApply)
                switch (strMonths) {
                    case "1":
                        $("#lblLoanTerm").html(strYears + " Year " + strMonths + " Month");
                        break;
                    default:
                        $("#lblLoanTerm").html(strYears + " Year " + strMonths + " Months");
                        break;
                }
            else
                $("#lblLoanTerm").html(strYears + " Year ");
        } else {
            //years greater than 1
            if (bMonthApply)
                switch (strMonths) {
                    case "1":
                        $("#lblLoanTerm").html(strYears + " Years " + strMonths + " Month");
                        break;
                    default:
                        $("#lblLoanTerm").html(strYears + " Years " + strMonths + " Months");
                        break;
                }
            else
                $("#lblLoanTerm").html(strYears + " Years ");
        }
        //end MAP changes
        GetData(strAccount);

        if (bolQualityReview)
            bolNewLoan = 'false';
        if (bolNewLoan == 'true' || bolNewLoan == true) {
            var dnow = new Date();
            $("#mskDate").val(MMDDYYYY(dnow));
            $("#mskDate").attr("disabled", "disabled");
        }
        
        if (strSuperUser == 'true' || strSuperUser == true) {
            $("#mskDate").removeAttr("disabled");
        }

        varEFTavailable = strEFT;
        varBankName = strBankName;
        varAbaRoutingNumber = strAbaRoutingNumber;
        varBankAccountNumber = strBankAccountNumber;
        varBankAccountType = strBankAccountType;
        varBankAddress = strBankAddress;
        varBankCityStateZip = strBankCityStateZip;                        
        if (bolQualityReview) {
            GetLoanInformation();
            QRCmdButtonsEnable(true);
        }
        DeliveryOptionQRSetup();     
        if (rsLoanInformation != "{}" && rsLoanInformation != null && rsLoanInformation != "" && rsLoanInformation.Table.length > 0) {
            strOrgSys = rsLoanInformation.Table[0].ORG_SYS;
        }
            if (bolQualityReview && loanPurp == "M" && strOrgSys.toUpperCase() != "AWD") {
            $("#lblMortgageLoan").html("This is a mortgage loan, please review supporting documentation.")
        }
    }
    catch (err) {
        //modelDialog.hide();
        AlertBox("LaunchLoanConfirm - " + err, "closer");
    }
}

function DeliveryOptionQRSetup() {
    varSelectedDeliveryOption = $("#cbDeliveryOption :selected").val();
    varSelectedDeliveryOption = varSelectedDeliveryOption != "" ? varSelectedDeliveryOption : 0;
    if (bolQualityReview)
        bindQualityReview(true);
        //bindFinancialInfo(true);
    else
        bindQualityReview(false);
    if (bolQualityReview && isQRChanged) {
        QRCmdButtonsEnable(false);
    }
    //Check if EFT is available as a delivery option
    if (varEFTavailable == "Y")
        if (varSelectedDeliveryOption == "5" || varSelectedDeliveryOption == 0) {
            bindFinancialInfo(true);
            bankinfoFlag = true;
        }
        else {
            bindFinancialInfo(false);
            bankinfoFlag = false;
        }
    else
        bindFinancialInfo(false);
    
    //Add EFT info if available, and set as default delivery option
    if (varEFTavailable == "Y") {
        var option = false;
        $('#cbDeliveryOption option').each(function () {
            if ($(this).text() == 'EFT - Deposit funds in the bank account on file') {
                option = true;
            }
        });        
        if (!option) {
            var value = 5;
            var dText = "EFT - Deposit funds in the bank account on file";
            $("#cbDeliveryOption").append("<option  value='" + value + "'>" + dText + "</option>");
        }
        IsLoad = 0;
        intDefaultDeliveryOption = 5;
    } else {
        intDefaultDeliveryOption = 1;
    }
    IsLoad = 1;
    if (varSelectedDeliveryOption == "" || varSelectedDeliveryOption == 0) {
        $("#cbDeliveryOption option[value=" + intDefaultDeliveryOption + "]").attr("selected", "selected");

        if (bankinfoFlag) {
            $("#chkOptionalPayee").attr("disabled", "disable");
        }
        if (!bolQualityReview)
            $("#cmdSendVsys").removeAttr("disabled");
    }
    IsLoad = 0;
}

function CreateFixedArray() {
    var k=0;
    for (k = 0; k < 3; k++) {
        varFixedArray[k] = new Array();
        for (j = 0; j < 2; j++) {
            varFixedArray[k][j] = new Array();
        }
    }    
    try {        
        varFixedArray[0][0] = $("#lblAccountNumber").text();
        varFixedArray[0][1] = $("#lblAccountNumber").text();
        varFixedArray[1][0] = $("#lblFB001").text();
        varFixedArray[1][1] = $("#lblFP002").text();        
        varFixedArray[2][0] = dRem($("#txtLoanAmount1").val());
        varFixedArray[2][1] = dRem($("#txtLoanAmount2").val());
    }
    catch (err) {
        AlertBox("CreateFixedArray - " + err);
    }
}

function CreateVestedPLLArray() {
    var K = 0;
    try {
        for (k = 0; k <= 3; k++) {
            varVestingPLLArray[k] = new Array();
            for (j = 0; j <= lintLCNewRowCount - 1; j++) {
                varVestingPLLArray[k][j] = new Array();
            }
        }
        for (i = 0; i < varVestingPLLArray[0].length; i++) {
            varVestingPLLArray[0][i] = $("#lblAccountNumber").text();
            //window.opener.document.getElementById("chkExclude")
            //document.getElementById("myCheck").checked
            varVestingPLLArray[1][i] = window.opener.document.getElementById("txtAccnt" + i + "").value;
            var vest = window.opener.document.getElementById("txtVesting" + i + "").value;
            varVestingPLLArray[2][i] = parseFloat(vest == "" ? 0 : vest);
            //chkExclude
            if (window.opener.document.getElementById("chkExclude" + i + "").checked)
                varVestingPLLArray[3][i] = "Y";
            else
                varVestingPLLArray[3][i] = "N";            
        }
    }
    catch (err) {
        AlertBox("CreateVestedPLLArray - " + err);
    }
}

function GetData(AccountNo){
    try {
        IsLoad = 1;
        //Gathers the Fixed Vehicle cash value
        $("#lblAnnValue1").html(accounting.formatMoney(strFB1Amt))
        $("#lblAnnValue2").html(accounting.formatMoney(strFP2Amt))

        document.getElementById("txtLoanAmount1").readOnly = true;
        toolTip("txtLoanAmount1", "The participant's group or product does not allow this fund.")

        $("#chkCommand1").attr("disabled", "disabled");
        $("#chkCommand2").attr("disabled", "disabled");

        document.getElementById("txtLoanAmount2").readOnly = true;
        toolTip("txtLoanAmount2", "The participant's group or product does not allow this fund.")

        CallControllerMethod("Home", "_GetFundInfo", GetDataFundInfoSuccess, "", "AccountNo", AccountNo, "SysId",
            1, "QueryType", 'F', "Org_sys", "", "SortOrder", "", "Filter", "FBFP");
        //pending PartInfo in window title

        $("#txtOptName").val(PartInfo[1]);
        $("#txtStreetAddr0").val(PartInfo[2]);
        $("#txtStreetAddr1").val(PartInfo[3]);
        $("#txtStreetAddr2").val(PartInfo[4]);
        $("#txtCity").val(PartInfo[5]);
        $("#txtState").val(PartInfo[6]);
        $("#txtZipCode").val(PartInfo[7].substring(0, 5));
        if (PartInfo[7].substring(5) != "")
            $("#txtZipCode").val($("#txtZipCode").val() + "-" + PartInfo[7].substring(5));
    }
    catch (err) {
        //modelDialog.hide();
        AlertBox("GetData - " + err, "closer");
    }
}

function toolTip(txtName,title) {
    $("#"+txtName+"").attr('data-toggle', 'tooltip');
    $("#" + txtName + "").attr('data-placement', 'bottom');
    $("#" + txtName + "").attr('title', title);
}

function GetDataFundInfoSuccess(data) {
    try{
        for (count = 0; count < data.Table.length; count++) {
            switch (data.Table[count].INV_VEH_CODE) {
                case "FB001":                    
                    document.getElementById("txtLoanAmount1").readOnly = false;
                    toolTip("txtLoanAmount1", "");
                    $("#chkCommand1").removeAttr("disabled");
                    break;
                case "FB009":                    
                    $("#lblFB001").val("FB009");
                    document.getElementById("txtLoanAmount1").readOnly = false;
                    toolTip("txtLoanAmount1", "");
                    $("#chkCommand1").removeAttr("disabled");
                    break;
                case "FP002":
                    document.getElementById("txtLoanAmount2").readOnly = false;
                    toolTip("txtLoanAmount2", "");
                    $('#lblFP002').html("FP002");
                    $("#chkCommand2").removeAttr("disabled");
                    break;
                case "FP001":
                    document.getElementById("txtLoanAmount2").readOnly = false;
                    toolTip("txtLoanAmount2", "");
                    $('#lblFP002').html("FP001");
                    $("#chkCommand2").removeAttr("disabled");
                    break;
            }
        }

        if (parseFloat(dRem($("#lblAnnValue1").val())) > 0) {
            document.getElementById("txtLoanAmount1").readOnly = false;
            toolTip("txtLoanAmount1", "");
            $("#chkCommand1").removeAttr("disabled");
        }
        if (parseFloat(dRem($("#lblAnnValue2").val())) > 0) {
            document.getElementById("txtLoanAmount2").readOnly = false;
            toolTip("txtLoanAmount2", "");
            $("#chkCommand2").removeAttr("disabled");
        }
        
        IsLoad = 0;
       // modelDialog.hide();
    } catch (err) {
        //modelDialog.hide();
        AlertBox("GetDataFundInfoSuccess - " + err, "close");
    }
}

//function PlanMessage(flag) {
//    var dFunSecure = document.getElementById("divFundSecure");
//    if (flag) {
//        jQuery('#divFundSecure div').html('');
//        dFunSecure.className += " text-center";
//        var tempControl = "<h6 name='lblFundSecure'>Loan amount will be pro-rated across all loanable funds in the account.</h6>"
//        document.getElementById("divFundSecure").innerHTML = tempControl;
//    } else {
//        dFunSecure.className.replace(new RegExp('(?:^|\\s)' + 'text-center' + '(?:\\s|$)'), ' ');
//        jQuery('#divFundSecure div').html('');
//    }
//}

function HidePolicyCtrls(flag){
    if (flag) {
        var d = document.getElementById("divFundSecure");
        d.className += " text-center";
        bindFundSecure(flag);
    }
    else
        jQuery('#divFundSecure div').html('');
}

function SpecialHandling(intIndex){
    var SpecialHandling="";
    switch(intIndex){
        case "1":
            SpecialHandling="RF";
            break;
        case "2":
            SpecialHandling="XF";
            break;
        case "3":
            SpecialHandling="SF";
            break;
        case "4":
            SpecialHandling="NP";
            break;
        case "5":
            SpecialHandling="ET";
            break;
    }
    return SpecialHandling;
}

function CreateTRNMasterArray() {
    varTRNMaster[81] = new Array();
    try {
        //Creates Array for WritePLL MTS Component.
        //Array written to pll_trn_master table
        varTRNMaster[0] = $("#lblAccountNumber").text(); //Account Number
        varTRNMaster[1] = $("#mskDate").val(); //Effective Date
        if (bPendingFormReturn){
            varTRNMaster[2] = rsLoanInformation.Table[0].CALLBACK_PHONE_NUM; //Callback Phone number
            varTRNMaster[5] = rsLoanInformation.Table[0].CONFIRMATION_NUM; //Confirmation Number
        } else {
            varTRNMaster[2] = "713" //Callback Phone number  
            var dnow = new Date();
            varTRNMaster[5] = backSlashMMDDYYYY(dnow)  // Confirmation Number
        }
        varTRNMaster[4] = strUserID != undefined && strUserID != "" ? strUserID : " ";
        varTRNMaster[3] = "AWD"; //ORG_Sys
        varTRNMaster[6] = aSSN; //SSN number
        varTRNMaster[7] = gsYears;
        if (strOptionalPayee == "Y") {
            varTRNMaster[8] = "Y";
            varTRNMaster[9] = $.trim($("#txtOptName").val());
            varTRNMaster[10] = $.trim($("#txtStreetAddr0").val());
            varTRNMaster[10] = $.trim($("#txtStreetAddr1").val()) + " ";
            varTRNMaster[12] = $.trim($("#txtStreetAddr2").val()) + " ";
            varTRNMaster[13] = $.trim($("#txtCity").val());
            varTRNMaster[14] = $.trim($("#txtState").val());
            if ($.trim($("#txtState").val()).length == 10)
                varTRNMaster[15] = $.trim($("#txtState").val()).substring(0, 5) + $.trim($("#txtState").val()).substring(6, 4);
            else
                varTRNMaster[15] = $.trim($("#txtState").val());
        } else {
            varTRNMaster[8] = "N";
            varTRNMaster[9] = " ";
            varTRNMaster[10] = " ";
            varTRNMaster[11] = " ";
            varTRNMaster[12] = " ";
            varTRNMaster[13] = " ";
            varTRNMaster[14] = " ";
            varTRNMaster[15] = " ";
        }
        varTRNMaster[16] = dRem(RequestedLoanAmt);
        varTRNMaster[17] = "Y"; //Override Flag
        varTRNMaster[18] = strSurrenderWaiver;        
        varTRNMaster[20] = "N"; //TOV Flag
        varTRNMaster[21] = dRem(rsLoanModel.tabModelLoan[0].Max_Available);
        varTRNMaster[22] = parseFloat(rsLoanModel.tabModelLoan[0].Loan_Fee).toString();
        varTRNMaster[23] = "I";
        varTRNMaster[24] = "";//Credit Card Info - Not Used
        varTRNMaster[25] = "";//Credit Card Info - Not Used
        varTRNMaster[26] = "";//Credit Card Info - Not Used
        varTRNMaster[27] = $("#txtCountry").val() != " " ? $("#txtCountry").val() : "";
        varTRNMaster[19] = SpecialHandling($("#cbDeliveryOption :selected").val());
        varTRNMaster[28] = " ";
        varTRNMaster[29] = strAWDCreateDate;
        varTRNMaster[30] = "";
        varTRNMaster[31] = rsLoanModel.tabModelLoan[0].Escrow_amt;
        varTRNMaster[32] = strSvcFlag;
        if (LoanType == "P")
            varTRNMaster[33] = "P";
        else
            varTRNMaster[33] = "L";
        if (gMALFlag == 'true' || gMALFlag == true)
            varTRNMaster[34] = "M";
        else
            varTRNMaster[34] = "S";
        varTRNMaster[35] = WaiveAppFee != "" ? WaiveAppFee : "N";
        varTRNMaster[36] = loanPurp;
        varTRNMaster[37] = rsLoanModel.tabModelLoan[0].Interest_Rate;
        if (strSuperUser == "true" || strSuperUser == true)
            varTRNMaster[38] = "Y";
        else
            varTRNMaster[38] = "N";
        varTRNMaster[39] = rsLoanModel.tabModelLoan[0].Repay_amt;
        varTRNMaster[40] = rsLoanModel.tabModelLoan[0].Fix_Needed_amt;
        varTRNMaster[41] = rsLoanModel.tabModelLoan[0].Amt_WDL_from_Acct;
        varTRNMaster[42] = rsLoanModel.tabModelLoan[0].Sur_Rate;
        varTRNMaster[43] = dRem(rsLoanModel.tabModelLoan[0].Sur_Charge);
        var lSum = parseFloat(rsLoanModel.tabModelLoan[0].Escrow_amt) - parseFloat(dRem(rsLoanModel.tabModelLoan[0].Sur_Charge));
        varTRNMaster[44] = lSum.toString();
        varTRNMaster[45] = rsLoanModel.tabModelLoan[0].Check_amt;
        varTRNMaster[46] = RepayMethod;
        varTRNMaster[47] = parseFloat(rsLoanModel.tabModelLoan[0].QuarterlyMaintFee).toString();
        switch(Frequency){
            case "4":
                varTRNMaster[48] = "Q";
                break;
            case "12":
                varTRNMaster[48] = "M";
                break;
            case "24":
                varTRNMaster[48] = "S";
                break;
            case "26":
                varTRNMaster[48] = "B";
                break;
            case "52":
                varTRNMaster[48] = "W";
                break;
        }
        if (strSuperUser == 'true' || strSuperUser == true)
            varTRNMaster[49] = gEffDate;
        else
            varTRNMaster[49] = "";
        FirstPaymentDate = rsLoanModel.tabModelLoan[0].first_payment_date;
        varTRNMaster[50] = DDMMYYYY(FirstPaymentDate);
        varTRNMaster[51] = PlanTypeCode;
        varTRNMaster[52] = OtherCarrierGLB12Mth;
        varTRNMaster[53] = OtherCarrierOLB;
        varTRNMaster[54] = "";
        varTRNMaster[55] = "";
        varTRNMaster[56] = "";
        varTRNMaster[57] = "";
        varTRNMaster[58] = "";
        varTRNMaster[59] = "";
        varTRNMaster[60] = "";
        varTRNMaster[61] = "";
        varTRNMaster[62] = "";
        varTRNMaster[63] = "";
        varTRNMaster[64] = "";
        varTRNMaster[65] = "";
        varTRNMaster[66] = "";
        varTRNMaster[67] = "";
        varTRNMaster[68] = "";
        varTRNMaster[69] = "";
        varTRNMaster[70] = "";
        varTRNMaster[71] = "";
        varTRNMaster[72] = "";
        //Banking info
        varTRNMaster[73] = varAbaRoutingNumber; //ABA Routing number
        varTRNMaster[74] = varBankAccountNumber;
        varTRNMaster[75] = varBankAccountType;
        varTRNMaster[76] = varBankName;
        varTRNMaster[77] = varBankAddress;
        varTRNMaster[78] = varBankCityStateZip;
        varTRNMaster[79] = strUserID != undefined && strUserID != "" ? strUserID : "";
        varTRNMaster[80] = varFrmTrnID != undefined && varFrmTrnID != "" ? varFrmTrnID : "";
        varTRNMaster[81] = "";
        
    }
    catch (err) {
        AlertBox("CreateTRNMasterArray - " + err);
    }
}

function QRCmdButtonsEnable(bolFlag) {
    if (!bolFlag) {
        $("#cmdApprove").attr("disabled", "disabled");
        $("#cmdDisapprove").attr("disabled", "disabled");
    } else {
        $("#cmdApprove").removeAttr("disabled");
        $("#cmdDisapprove").removeAttr("disabled");
    }
    if (strBadAddrFlag == true || strBadAddrFlag == 'true') {
        $("#cmdSendVsys").attr("disabled", "disabled");
    }
    else {
        if (bolFlag)
            $("#cmdSendVsys").attr("disabled", "disabled");
        else
            $("#cmdSendVsys").removeAttr("disabled");
    }
}

function OptionalPayeeAdress(boloptionalPayee) {
    if (boloptionalPayee == true) {
        $("#txtOptName").removeAttr("disabled")
        for (i = 0; i < 3; i++) {
            $("#txtStreetAddr" + i + "").removeAttr("disabled");
            $("#txtStreetAddr" + i + "").removeAttr("disabled");
            $("#txtStreetAddr" + i + "").removeAttr("disabled");
        }
        $("#txtCity").removeAttr("disabled");
        $("#txtState").removeAttr("disabled");
        $("#txtZipCode").removeAttr("disabled");
        $("#txtCountry").removeAttr("disabled");
        strOptionalPayee = "Y";
        $("#txtOptName").val(PartInfo[1]);
        $("#txtStreetAddr0").val(PartInfo[2]);
        $("#txtStreetAddr1").val(PartInfo[3]);
        $("#txtStreetAddr2").val(PartInfo[4]);
        $("#txtCity").val(PartInfo[5]);
        $("#txtState").val(PartInfo[6]);
        $("#txtZipCode").val(PartInfo[7].substring(0, 5));
        if (PartInfo[7].substring(5) != "")
            $("#txtZipCode").val($("#txtZipCode").val() + "-" + PartInfo[7].substring(5));
    } else {
        $("#txtOptName").attr("disabled", "disabled");
        for (i = 0; i < 3; i++) {
            $("#txtStreetAddr" + i + "").attr("disabled","disabled");
            $("#txtStreetAddr" + i + "").attr("disabled","disabled");
            $("#txtStreetAddr" + i + "").attr("disabled","disabled");
        }
        $("#txtCity").attr("disabled", "disabled");
        $("#txtState").attr("disabled", "disabled");
        $("#txtZipCode").attr("disabled", "disabled");
        $("#txtCountry").attr("disabled", "disabled");
        strOptionalPayee = "N";
        if (LoanType == "P")
            AlertBox("For plan loans, a signature guarantee must be obtained when the check is being mailed to a temporary address.");
    }
}

function cbDeliveryOption() {
    var options = ["", "Regular Mail", "Express Mail", "Special Handling", "No Print"];
    $("#cbDeliveryOption").empty();
    for (i = 0; i < options.length; i++) {
        $("#cbDeliveryOption").append("<option  value='" + i + "'>" + options[i] + "</option>");
    }
    bindFinancialInfo(true);
}

function bindFundSecure(flag) {    
    if (flag == true) {
        var TempbindFundSecure = "<table class='table' name='tblFundSecure' align='center'>" +
            "<thead><tr><th scope ='col'>Fund</th><th scope ='col'>Annuity Value</th><th scope ='col'>Requested Loan Amount</th><th scope ='col'></th></tr></thead><tbody>" +
            "<tr><td><label id='lblFB001' class='heightlbl'>FB001</label></td><td><label id='lblAnnValue1' class='heightlbl'></label></td>" +
            "<td><input type='text' class='form-control form-control-sm' value='$0.00' onChange='txtLoanAmount1Change()' onfocusout='txtLoanAmount1()'  id='txtLoanAmount1'/></td><td><button type='button' class='btn btn-primary fundSecure' onClick='chkCommand1Check()' id='chkCommand1'></button></td></tr>" +
            "<tr><td><label id='lblFP002' class='heightlbl'>FP002</label></td><td><label id='lblAnnValue2' class='heightlbl'></label></td>" +
            "<td><input type='text' id='txtLoanAmount2' onfocusout='txtLoanAmount2()' onChange='txtLoanAmount2Change()' class='form-control form-control-sm' value='$0.00' /></td><td><button type='button' class='btn btn-primary fundSecure' onClick='chkCommand2Check()' id='chkCommand2'></button></td></tr>" +
            "<tr><td></td><td></td><td style='text-align:center'><label id='lblTotalAmount'></label></td></tr></tbody></table>" +
            "<h6 name='lblFundSecure' style='padding-top: 35px;'>Loan amount will be pro-rated across all loanable funds in the account.</h6>";
        document.getElementById("divFundSecure").innerHTML = TempbindFundSecure;
    }
    else {
        jQuery('#divFundSecure div').html('');
    }
}

function bindMortgageLoan(flag) {
    if (flag == true) {
        var TempMortgageLoan = "<div class='col-sm-12' style='margin:auto;'><label id='lblMortgageLoan' style='color:red;padding-top:5px;width:350px'><b>" +
"</b></label></div>";
        document.getElementById("divMortgageLoan").innerHTML = TempMortgageLoan;
    }
    else {
        jQuery('#divMortgageLoan div').html('');
    }
}

function bindFinancialInfoBankShow() {
    var temp = "";
    $("#lblBankname").html(strBankName);
    if (strBankAccountNumber.length > 0) {
        for (t = 0; t < strBankAccountNumber.length - 2; t++) {
            temp = temp + "*";
        }
    }
    temp = temp + strBankAccountNumber.substring(strBankAccountNumber.length - 2, strBankAccountNumber.length);
    $("#lblBankAcctNum").html(temp);
}

function POBOX(straddress) {
    var i;
    var bolTemp = false;
    var selectedValue = $("#cbDeliveryOption :selected").val();
    switch (selectedValue) {
        case 1:
        case 4:
            if (straddress.length > 5) {
                for (var i = 1; i < straddress.length - 5; i++) {
                    if ((straddress.toUpperCase().substring((i - 1), 6) == "PO BOX")) {
                        bolTemp = true;
                        i = (straddress.length - 5);
                    }
                    else if ((straddress.toUpperCase().substring((i - 1), 7) == "P.O.BOX")) {
                        bolTemp = true;
                        i = (straddress.length - 5);
                    }
                    else if ((straddress.toUpperCase().substring((i - 1), 8) == "P.O. BOX")) {
                        bolTemp = true;
                        i = (straddress.length - 5);
                    }
                }
                if (bolTemp) {
                    alert("Loans cannot be delivered to a PO Box with Express Mail.  Please re-enter address.")
                    return true;
                }
            }
            break;
    }
    return false;
}

function bindFinancialInfo(boolflag) {
    if (boolflag == true) {
        var Temp = "<div class='col-sm-6' style='margin:auto'><div class='card text-center'><div class='card-header'>Financial Institution Information</div>" +
"<div class='card-body' style='align-content:center'><div class='row'><div class='col-sm-8' style='margin:auto'>" +
"<label id='lblBankname'>(bank name)</label></div></div><div class='row'><div class='col-sm-8' style='margin:auto'>" +
"<label id='lblBankAcctNumber'>Bank Account Number:</label> <label id='lblBankAcctNum'>(masked #)</label></div></div></div></div></div>";
        document.getElementById("divFinancialInfo").innerHTML = Temp;
        bindFinancialInfoBankShow();
    }
    else {
        jQuery('#divFinancialInfo div').html('');
    }
}

function bindQualityReview(flag) {
    if (flag) {
        bindMortgageLoan(flag);
        var TempQualityReview = "<div class='col-sm-6' style='margin:auto'><div class='card card text-center'><div class='card-header'>Quality Review</div>" +
"<div class='card-body'><div class='row'><div class='col-sm-2'></div><div class='col-sm-4'>" +
"<button type='button' id='cmdApprove' class='btn btn-primary' onClick='btnApprove()'><b>Approve</b></button></div>" +
"<div class='col-sm-4'><button type='button' id='cmdDisapprove' class='btn btn-primary' onClick='btnDisApprove()'><b>Reject</b></button></div></div></div></div>";
        document.getElementById("divQualityReview").innerHTML = TempQualityReview;
    }
    else {
        jQuery('#divQualityReview div').html('');
    }
}

function GetLoanInformation() { 
    var LI = 0;
    try {
        if (rsLoanInformation.Table.length > 0) {
            IsLoad = 1;
            $("#mskDate").val(checkDate(rsLoanInformation.Table[0].TRN_EFFECTIVE_DATE));
            strExtractFlag = rsLoanInformation.Table[0].EXTRACT_FLAG == "Y" ? "Y" : "N";
            if (rsLoanInformation.Table[0].SURRENDER_CHARGE_OVERRIDE == "Y")
                $('#chkSurrenderWaiver').prop('checked', true);
            else
                $('#chkSurrenderWaiver').prop('checked', false);
            if (rsLoanInformation.Table[0].OPTIONAL_PAYEE_FLAG == "Y") {
                blnOptionalPayeeFlag = true;
                $('#chkOptionalPayee').prop("checked", true);
                $("#txtOptName").val(rsLoanInformation.Table[0].OPTIONAL_PAYEE_NAME)
                $("#txtStreetAddr0").val(rsLoanInformation.Table[0].ADDRESS_LINE_1)
                $("#txtStreetAddr1").val(rsLoanInformation.Table[0].ADDRESS_LINE_2)
                $("#txtStreetAddr2").val(rsLoanInformation.Table[0].ADDRESS_LINE_3)
                $("#txtCity").val(rsLoanInformation.Table[0].CITY)
                $("#txtState").val(rsLoanInformation.Table[0].STATE)
                $("#txtZipCode").val(rsLoanInformation.Table[0].ZIP_CODE)
            }

            switch (rsLoanInformation.Table[0].SPECIAL_HANDLE_CODE) {
                case "RF":
                    $("#cbDeliveryOption  option[value=1]").attr("selected", "selected");
                    varSelectedDeliveryOption = 1;
                    break;
                case "XF":
                    $("#cbDeliveryOption  option[value=2]").attr("selected", "selected");
                    varSelectedDeliveryOption = 2;
                    break;
                case "SF":
                    $("#cbDeliveryOption  option[value=3]").attr("selected", "selected");
                    varSelectedDeliveryOption = 3;
                    break;
                case "NP":
                    $("#cbDeliveryOption  option[value=4]").attr("selected", "selected");
                    varSelectedDeliveryOption = 4;
                    break;
            }

            for (LI = 0; LI < rsLoanInformation.Table.length; LI++) {
                switch (rsLoanInformation.Table[0].INV_VEH_CODE) {
                    case "FB001":
                        //$('#txtLoanAmount1').val(accounting.formatMoney(rsLoanInformation.Table[0].AMOUNT));
                        $('#txtLoanAmount1').val(accounting.formatMoney(dRem(RequestedLoanAmt)));
                        var fText = parseFloat(dRem($('#txtLoanAmount1').val()));
                        var pText = parseFloat(dRem($('#txtLoanAmount2').val()));
                        $('#lblTotalAmount').html(accounting.formatMoney(fText + pText));
                        break;
                    case "FB009":                        
                        FB009Ind = "Y";
                        $('#txtLoanAmount1').val(accounting.formatMoney(dRem(RequestedLoanAmt)));
                        //$('#txtLoanAmount1').val(accounting.formatMoney(rsLoanInformation.Table[0].AMOUNT));
                        $('#lblTotalAmount').html(accounting.formatMoney(parseFloat(dRem($('#txtLoanAmount1').val())) + parseFloat(dRem($('#txtLoanAmount2').val()))));
                        break;
                    case "FP002":
                        $('#txtLoanAmount1').val(accounting.formatMoney(rsLoanInformation.Table[0].AMOUNT));
                        $('#lblTotalAmount').html(accounting.formatMoney(parseFloat(dRem($('#txtLoanAmount1').val())) + parseFloat(dRem($('#txtLoanAmount2').val()))));
                        break;
                    case "FP001":
                        $('#txtLoanAmount1').val(accounting.formatMoney(rsLoanInformation.Table[0].AMOUNT));
                        $('#lblTotalAmount').html(accounting.formatMoney(parseFloat(dRem($('#txtLoanAmount1').val())) + parseFloat(dRem($('#txtLoanAmount2').val()))));
                        break;
                }
            }
        }
        $("#cmdSendVsys").text("Update PLL");
        toolTip("cmdSendVsys", "This button will update the PLL");
        IsLoad = 0;
    }
    catch (err) {
        AlertBox(err);
    }
}

$("#cbDeliveryOption").change(function () {
    cboDeliveryOptionsCheck();
    var selectedText = $(this).find("option:selected").text();
    var selectedValue = $("#cbDeliveryOption :selected").val();
    var bolInvalidPOBox = false;
    var i;
    if ($("#cbDeliveryOption :selected").val() != "") {
        $("#cmdSendVsys").removeAttr("disabled");
    }
    QRCmdButtonsEnable(false);
    if (bolInvalidPOBox == false) {
        for (var i = 0; i <= 2; i++) {
            if (POBOX($("#txtStreetAddr" + i + "").val())) {
                bolInvalidPOBox = true;
                $("#cbDeliveryOption  option[value=0]").attr("selected", "selected");
                $('#cbDeliveryOption').focus();
                return;
            }
        }
    }
    if (selectedValue == '5') {
        $('#chkOptionalPayee').prop('checked', false);
        $('#chkOptionalPayee').attr('disabled', "disabled");
        OptionalPayeeAdress(false);
        bindFinancialInfo(true);        
    }
    else {
        if (blnOptionalPayeeFlag) {
            $('#chkOptionalPayee').prop('checked', true);
            OptionalPayeeAdress(true);
        }
        else {
            $('#chkOptionalPayee').prop('checked', false);
            OptionalPayeeAdress(false);
        }
        $('#chkOptionalPayee').removeAttr('disabled');
        bindFinancialInfo(false);
    }
    if (bolQualityReview)
        isQRChanged = true;
    DeliveryOptionQRSetup();
});

$("#cmdSendVsys").click(function () {
    var msgBad = "";
    try{
        if (strSuperUser == 'true' || strSuperUser == true) {
            gEffDate = $("#mskDate").val();
        }
        msgBad = "";
        if (chkOptPayee == 1) {
            if ($("#txtOptName").val() == "") {
                AlertBox("Please enter an optional payee name.", "txtOptName");
                return;
            }
            if ($("#txtStreetAddr0").val() == "") {
                AlertBox("Please enter an optional payee address.", "txtStreetAddr0");
                return;
            }
            if ($("#txtCity").val() == "") {
                AlertBox("Please enter an optional payee city.", "txtCity");
                return;
            }
            if ($("#txtState").val() == "") {
                AlertBox("Please enter an optional payee state.", "txtState");
                return;
            }
            if ($("#txtZipCode").val() == "") {
                AlertBox("Please enter an optional payee zip code.", "txtZipCode");
                return;
            }
        }
        if ($("#cbDeliveryOption :selected").val() == "0") {
            AlertBox("Please select a delivery option.", "cbDeliveryOption");
            return;
        }
        if (LoanType != "P") {
            if ($("#lblTotalAmount").text() != RequestedLoanAmt) {
                AlertBox("Requested total amount does not equal original loan amount.");
                return;
            }
        }
        if ($("#cmdSendVsys").text() == "Send to V-System") {
            loading("v-system");
            var lsConfirmArray = new Array();
            CreateTRNMasterArray();
            CreateFixedArray();
            CreateVestedPLLArray();
            var strConfirmationNum = "";
            if (bPendingFormReturn) { 
                strConfirmationNum = rsLoanInformation.Table[0].CONFIRMATION_NUM; // confnum.ConfirmationNumber[0].confirmation_num;
                if (confnum != "") {
                    dsConfNum = confnum;
                    gsConfirmNumber = '';
                    lsConfirmArray = '';
                    for (n = 0; n < dsConfNum.length; n++) {
                        gsConfirmNumber = gsConfirmNumber + "|" + dsConfNum.ConfirmationNumber[n].confirmation_num;
                    }
                    lsConfirmArray = gsConfirmNumber.split("|");                    
                    CallControllerMethod("Home", "_UpdateLoanDetails", updateLoanDetailSuccess, "", "strConfirmationNumber", strConfirmationNum, "varPllArray", ArrayToString(varTRNMaster), "varDetailArray", Convert2DArrToStr(varFixedArray),
                        "varVestedArray", Convert2DArrToStr(varVestingPLLArray), "varArrayConfirmNum", ArrayToString(lsConfirmArray));                    
                } else {
                    CallControllerMethod("Home", "_UpdateLoanDetails", updateLoanDetailSuccess, "", "strConfirmationNumber", strConfirmationNum, "varPllArray", ArrayToString(varTRNMaster), "varDetailArray", Convert2DArrToStr(varFixedArray),
                       "varVestedArray", Convert2DArrToStr(varVestingPLLArray), "varArrayConfirmNum", "");
                }
            } else {
                strAWDConfirmation = "";
                if (confnum != "") {
                    dsConfNum = confnum;
                    gsConfirmNumber = '';
                    lsConfirmArray = '';
                    for (n = 0; n < dsConfNum.length; n++) {
                        gsConfirmNumber = gsConfirmNumber + "|" + dsConfNum.ConfirmationNumber[n].confirmation_num;
                    }
                    lsConfirmArray = gsConfirmNumber.split("|");
                    CallControllerMethod("Home", "_PLLStore", updateLoanDetailSuccess, "", "varPllArray", ArrayToString(varTRNMaster), "varDetailArray", Convert2DArrToStr(varFixedArray),
                        "varVestedArray", Convert2DArrToStr(varVestingPLLArray),"varArrayConfirmNum", ArrayToString(lsConfirmArray));                    
                } else {
                    CallControllerMethod("Home", "_PLLStore", updateLoanDetailSuccess, "", "varPllArray", ArrayToString(varTRNMaster), "varDetailArray", Convert2DArrToStr(varFixedArray),
                        "varVestedArray", Convert2DArrToStr(varVestingPLLArray), "varArrayConfirmNum", "");
                }
            }
            
        } else { //this is the PLL Maintenance path
            CreateTRNMasterArray();
            CreateFixedArray();
            CreateVestedPLLArray();
            var strResult = false;
            CallControllerMethod("Home", "_PLLUpdate", PLLUpdateSuccess, "", "strConf", strAWDConfirmation, "ExtFlag", "D",
                "ProcessMaxFlag", "", "strUserID", strUserID);
            //(strAWDConfirmation, "D", str_Renamed, "", strResult, strUserID)
        }
    }
    catch (err) {
        loadHide()
        AlertBox("cmdSendVsys click - " + err);
    }
});

$("#cmdCancel").click(function () {
    //bolLoanConfirmation = false
    //LoanModelEnable(true)
    //VestingEnable(true)
    opener.parentAlert();
    parent.window.close();
});

function PLLUpdateSuccess(data) {
    try{
        //Add logic to delete corresponding ACH record
        if (rsLoanInformation.Table[0].PAYMENT_OPTION == "A") {
            CallControllerMethod("Home", "_UpdateACH", UpdateACHSuccess, "", "strConfirmationNum", strAWDConfirmation);
        } else {
            varTRNMaster[23] = "N";
            varTRNMaster[4] = strOriginalLoanSetupUID;
            strAWDConfirmation = "";
            CallControllerMethod("Home", "_PLLStore", vPLLStoreSuccess, "", "varPllArray", ArrayToString(varTRNMaster), "varDetailArray", Convert2DArrToStr(varFixedArray),
                                "varVestedArray", Convert2DArrToStr(varVestingPLLArray), "varArrayConfirmNum", "");
        }
    }
    catch (err) {
        loadHide()
        AlertBox("PLLUpdateSuccess - " + err);
    }
}

function UpdateACHSuccess(data) {
    try {
        if (data.result == false) {
            lgAlertBox("Unable to delete ACH Record. Please delete manually.", vSystemPLLstore);            
        } else {
            vSystemPLLstore(data);
        }
        
    }
    catch (err) {
        loadHide()
        AlertBox("UpdateACHSuccess - " + err);
    }
}

function vSystemPLLstore(data) {
    varTRNMaster[23] = "N";
    varTRNMaster[4] = strOriginalLoanSetupUID;
    strAWDConfirmation = "";
    CallControllerMethod("Home", "_PLLStore", vPLLStoreSuccess, "", "varPllArray", ArrayToString(varTRNMaster), "varDetailArray", Convert2DArrToStr(varFixedArray),
                        "varVestedArray", Convert2DArrToStr(varVestingPLLArray), "varArrayConfirmNum", "");
}

function vPLLStoreSuccess(data) {
    strAWDConfirmation = data.result;
    //Writes New ACH Record if necessary
    if (strAWDConfirmation == "" || strAWDConfirmation == null) {
        AlertBox("Unable to process loan. Try again.");
        loadHide()
        return;
    } else { //PLL was sucessfully setup; now setup ACH record
        bPLLInsert = true; //pll was successfuly inserted
        if (varTRNMaster[46] == "A") {
            switch (varTRNMaster[46]) {
                case "A": //ACH
                    var lBankRouting = "";
                    var lBankName = "";
                    var lBankAcctNum = "";
                    var lBankAcctType = "";
                    var lBankPhone = "";
                    lBankRouting = $.trim(rsLoanInformation.Table[0].ABA_NUMBER);
                    lBankName = $.trim(rsLoanInformation.Table[0].BNK_NAM);
                    lBankAcctNum = $.trim(rsLoanInformation.Table[0].BANK_ACCOUNT_NUM);
                    lBankAcctType = $.trim(rsLoanInformation.Table[0].BANK_ACCOUNT_TYPE);
                    lBankPhone = $.trim(rsLoanInformation.Table[0].BANK_PHONE_NUMBER);
                    CallControllerMethod("Home", "_InsertACH", vInsertACHSuccess, "", "strAccount", varTRNMaster[0], "strRoutingNum", lBankRouting,
                           "strBankName", lBankName, "strFrequency", varTRNMaster[48], "strACHAmount", varTRNMaster[39], "strBnkAccountNum", lBankAcctNum,
                           "strBnkPhoneNumber", lBankPhone, "strBnkAccountType", lBankAcctType, "strConfirmationNum", strAWDConfirmation, "strNumPays", Frequency);
                    break;
            }
        } else {
            pllUpdate = true;
            AWDComments(false);
        }
    }
}

function vInsertACHSuccess(data) {
    try {
        if (data.result == true) {
            bACHInsert = true;
        } else {         
            bACHInsert = false;
        }
        pllUpdate = true;
        AWDComments(false);
    }
    catch (err) {
        loadHide()
        AlertBox("InsertACHSuccess - " + err);
    }
}

function updateLoanDetailSuccess(data) {
    var lsConfirmArray = "";
    strErrorCode = data.varErrorCode != null ? data.varErrorCode : "";
    if (data.EMessage != "" && data.EMessage != null) {        
        exceptionCheck();
    }
    else {
        try {
            gsConfirmNumber = "";
            dtConfirmNum = "";
            gMALFlag = false;
            strAWDConfirmation = data.result;
            if (strAWDConfirmation == "" || strAWDConfirmation == null) {
                loadHide()
                AlertBox("Unable to process loan. Please try again.");
                return;
            } else { //PLL sucessfully setup; now setup ACH record
                bPLLInsert = true; //pll was successfuly inserted
                vSystem = true;
                if (varTRNMaster[46] == "A") {
                    switch (varTRNMaster[46]) {
                        case "A": //ACH
                            CallControllerMethod("Home", "_InsertACH", InsertACHSuccess, "", "strAccount", varTRNMaster[0], "strRoutingNum", strAbaRoutingNumber,
                          "strBankName", strBankName, "strFrequency", varTRNMaster[48], "strACHAmount", varTRNMaster[39], "strBnkAccountNum", strBankAccountNumber,
                          "strBnkPhoneNumber", strBankPhone, "strBnkAccountType", strBankAccountType, "strConfirmationNum", strAWDConfirmation, "strNumPays", Frequency);
                            break;
                    }
                } else {
                    vErrorPLLCheckandUpdate();
                }
            }
        }
        catch (err) {
            loadHide()
            AlertBox("updateLoanDetailSuccess - " + err);
        }
    }
}

function InsertACHSuccess(data) {
    try{
        if (data.result == true) {
            bACHInsert = true;
        } else {            
            bACHInsert = false;
        }        
        vErrorPLLCheckandUpdate();
    }
    catch (err) {
        loadHide()
        AlertBox("InsertACHSuccess - " + err);
    }
}

function vErrorPLLCheckandUpdate() {
    var status = "";
    if (pllUpdate)
        status = "DISBAPPVD";
    if (vSystem)
        status = "DISBPROCD";
    try{
        if (strErrorCode == "") {
            CallControllerMethod("Home", "_UpdateObjectStatus", UpdateObjectStatuPSuccess, "", "ObjId", _TransactionID, "AppId", AppID, "Status", status);
        } else {
            AlertBox("Error.  PLL not completed");
        }
    }
    catch (err) {
        loadHide()
        AlertBox("vErrorPLLCheck - " + err);
    }
}

function exceptionCheck() {
    try{
        switch (gACHFlag) {
            case 'true', true:
                if (bPLLInsert == true && bACHInsert == false) {
                    lgAlertBox("Error occured setting up PLL.  Please try again.  If still unsuccessful, place a ticket with the helpdesk");
                }
                break;
            case 'false', false: //no ACH insert involved
                lgAlertBox("Error occured inserting ACH record.  Please insert ACH record manually");
                //Update AWD because PLL was suscessfully inserted; so move to END queue
                AWDComments(false);
                break;
        }
    }
    catch (err) {
        AlertBox("exceptionCheck - " + err);
    }

}

function AWDComments(bolErrorCorrection, strWorkType, str_Renamed) {
    var strWorkTypes = strWorkType != undefined ? strWorkType : "";
    var str_Rename = str_Renamed != undefined ? str_Renamed : "";

    if (mRetVal == true) {
        CallControllerMethod("Home", "_AddComments", AddCommentsSuccess, "", "ObjId", _TransactionID, "Comment", mcomments, "AppId", AppID);
        mRetVal = false;
    } else {
        GetComments(str_Rename);
    }
}

function AddCommentsSuccess(data) {
    if (data.Response.Message.indexOf("Successfully") < 0) {
        AlertBox('Adding Comments failed. Please add comment manually.');
        loadHide()
    } else {
        var sComments = mcomments.replace(/\n/g, '');
        if (sComments == "")
            sComments = "others";
        CallControllerMethod("Home", "_QualityStore", QualityStoreSuccess, "", "strConfirmNum", strAWDConfirmation, "strErrorType", sComments, "strAWDID", strAWDCreateDate, "strUserID", strUserID, "strType", bolErrorCorrection == true ? "E" : "s");
    }
}

//Workitem status update for Reject logic
function UpdateObjectStatuRSuccess(data) {
    if (data.Response.Message != "") {
        if (data.Response.Message.indexOf("Locked ") !== -1) {
            var lockUser = data.Response.Message.split("(");
            lockUser[1] = lockUser[1].replace(/\)/g, "");
            CallControllerMethod("Home", "_UnLockInstance", UnLockInstanceASuccess, "", "ObjectId", _TransactionID, "AppId", AppID, "UserId", lockUser[1]);
        } else {
            if (data.Response.Message.indexOf("error ") !== -1) {
                AlertBox("Can't able to update status.Please update status manually to <b>DISBREJCTD</b>.");
                loadHide()
            }
        }
        if (qrReject) {
            loadHide()
            AlertBox("PLL Disapproved.", "closer");
        }
    }
}

//Workitem status update for PLL update logic
function UpdateObjectStatuPSuccess(data) {
    var status = "";
    if (pllUpdate)
        status = "DISBAPPVD";
    if (vSystem)
        status = "DISBPROCD";
    if (data.Response.Message != "") {
        if (data.Response.Message.indexOf("Locked ") !== -1) {
            var lockUser = data.Response.Message.split("(");
            lockUser[1] = lockUser[1].replace(/\)/g, "");
            CallControllerMethod("Home", "_UnLockInstance", UnLockInstancePSuccess, "", "ObjectId", _TransactionID, "AppId", AppID, "UserId", lockUser[1]);
        } else {
            if (data.Response.Message.indexOf("error ") !== -1) {
                if (!pStatus)
                    AlertBox("Can't able to update status.Please update status manually to <b>" + status + "</b>.");
                if (pLOBCount == 1)
                    AlertBox("Can't able to update SSC and SRVF LOB field.");
                loadHide()
            } else {
                pLOB = true;
                pStatus = true;
                if (pLOBCount == 1) // to check _UpdateObjectFields controller call executed or not
                    pLOBsuccess = true; //to confirm SRVF and SSC LOB field updated to AWD
            }
        }
        if (pllUpdate) {                      
            if (pStatus == true && pLOB == true)
                AlertBox("PLL successfully updated.", "closer");
        }
        if (vSystem) {            
            if (pLOB) {
                if (pLOBCount != 1) {
                    var jsonInput = ",-,SeldServConf," + strAWDConfirmation + ",SSC,-,LoanServiceFlag," + strSvcFlag + ",SRVF";
                    CallControllerMethod("Home", "_UpdateObjectFields", UpdateObjectStatuPSuccess, "", "ObjId", _TransactionID, "AppId", AppID,
                        "UserId", strUserID, "fldLOBValuesUOF", jsonInput);
                    pLOBCount = 1;
                }                
            }
            if (pStatus == true && pLOB == true && pLOBsuccess == true) {
                loadHide()
                AlertBox("PLL successfully updated.", "closer");
            }
        }
    }
}

function UnLockInstancePSuccess(data) {
    var status = "";
    if (pllUpdate)
        status = "DISBAPPVD";
    if (vSystem)
        status = "DISBPROCD";
    if (data.Response.Message.indexOf("Error") !== -1) {
        loadHide()
        AlertBox("Can't able to update status.Please Update status manually to <b>" + status + "</b>.")
    } else {
        if (!pStatus)
            CallControllerMethod("Home", "_UpdateObjectStatus", UpdateObjectStatuPSuccess, "", "ObjId", _TransactionID, "AppId", AppID, "Status", status);
        else
        {
            var jsonInput = ",-,SeldServConf," + strAWDConfirmation + ",SSC,-,LoanServiceFlag," + strSvcFlag + ",SRVF";
            CallControllerMethod("Home", "_UpdateObjectFields", UpdateObjectStatuPSuccess, "", "ObjId", _TransactionID, "AppId", AppID,
                "UserId", strUserID, "fldLOBValuesUOF", jsonInput);
            pLOBCount = 1;
        }
    }
}

function UnLockInstanceRSuccess(data) {
    if (data.Response.Message.indexOf("Error") !== -1) {
        AlertBox("Can't able to update status.Please Update status manually to <b>DISBREJCTD</b>.")
        loadHide()
    } else {
        CallControllerMethod("Home", "_UpdateObjectStatus", UpdateObjectStatuRSuccess, "", "ObjId", _TransactionID, "AppId", AppID, "Status", "DISBREJCTD");
    }
}

function QualityStoreSuccess(data) {
    if (data.EMessage != "" && data.EMessage != null) {
        AlertBox("Error in adding QualityStore - " + data.EMessage);
        loadHide()
    }
    else {
        if (qrReject) {
            CallControllerMethod("Home", "_UpdateObjectStatus", UpdateObjectStatuRSuccess, "", "ObjId", _TransactionID, "AppId", AppID, "Status", "DISBREJCTD");
        }
        if (pllUpdate) {
            vErrorPLLCheckandUpdate();
        }
    }

}

function GetComments(comments, maxLen, RO, QA) {
    var dComments = comments;
    var dMaxLen = maxLen == undefined ? 0 : maxLen;
    var dRO = RO == undefined ? false : RO;
    var dQA = QA == undefined ? false : QA;    
    try {
        if (mRetVal == false) {
            mcomments = "";
            $("#lblwarn").css("visibility", "hidden");
            //$("#txtComments").attr('maxlength', dMaxLen);
            Quality = dQA;
            $("#txtComments").val(dComments);            
            var selectionStart = $("#txtComments").val().length;
            $('#txtComments')[0].selectionStart = $("#txtComments").val().length;
            CallControllerMethod("Home", "_GetCannedComments", GetCannedCommentsSuccess, "", "LowVal", 5000, "HighVal", 5200);
        } else {
            if (dMaxLen != 0 && mcomments.length > 0)
                mcomments = mcomments.substring(0, dMaxLen);
            if (mcomments == "")
                mcomments = " ";
            AWDComments();
        }

    }
    catch (err) {
        AlertBox("GetComments - " + err);
    }
}

function GetCannedCommentsSuccess(data) {    
    $('#cboCannedCmnts').empty();
    bindValue("cboCannedCmnts", 0, "[SELECT COMMENT]");
    for (i = 0; i < data.Table.length; i++)
        bindValue("cboCannedCmnts", i + 1, data.Table[i].COT_VAL);
    $("#cboCannedCmnts  option[value=0]").attr("selected", "selected");
    $('#myModal').modal('show');
}

$("#btnDone").click(function () {
    mcomments = $("#txtComments").val();
    if ($("#cboCannedCmnts :selected").val() == 0) {
        $("#lblwarn").html("Please select a comment from the drop down menu.");
        $("#lblwarn").css("visibility", "visible");
        mRetVal = false;
        mcomments = "";
    } else {
        mcomments = $("#cboCannedCmnts :selected").text() + " " + mcomments;
        $('#myModal').modal('hide');
        mRetVal = true;
        GetComments();
    }    
});

$("#chkOptionalPayee").change(function () {
    QRCmdButtonsEnable(false);
    if (this.checked) {
        chkOptPayee = 1;
        OptionalPayeeAdress(true);
    } else {
        chkOptPayee = 0;
        OptionalPayeeAdress(false);
    }
});

function btnApprove() {
    qrApprove = true;
    CallControllerMethod("Home", "_PLLUpdate", ApproveSuccess, "", "strConf", strAWDConfirmation, "ExtFlag", strExtractFlag,
                "ProcessMaxFlag", " ", "strUserID", strUserID);
}

function ApproveSuccess(data) {
    if (data.EMessage != "" && data.EMessage != null)
        AlertBox("Unable to Approve PLL.  Please try again. " + data.varErrorCode);
    else {        
        if (qrApprove) {
            qrApprove = false;
            AlertBox("PLL Approved.", "closer");
            CallControllerMethod("Home", "_UpdateObjectStatus", UpdateObjectStatuASuccess, "", "ObjId", _TransactionID, "AppId", AppID, "Status", "DISBAPPVD");
        }
    }
}


//Updating Workitem status for Approve logic
function UpdateObjectStatuASuccess(data) {
    if (data.Response.Message != "") {
        if (data.Response.Message.indexOf("Locked ") !== -1) {
            var lockUser = data.Response.Message.split("(");
            lockUser[1] = lockUser[1].replace(/\)/g, "");
            CallControllerMethod("Home", "_UnLockInstance", UnLockInstanceASuccess, "", "ObjectId", _TransactionID, "AppId", AppID, "UserId", lockUser[1]);
        } else {
            if (data.Response.Message.indexOf("error ") !== -1)
                AlertBox("Can't able to update status.Please update status manually to <b>DISBAPPVD</b>.");
        }
    }
}

function UnLockInstanceASuccess(data) {
    if (data.Response.Message.indexOf("Error") !== -1) {
        AlertBox("Can't able to update status.Please update status manually to <b>DISBAPPVD</b>.")
    } else {
        CallControllerMethod("Home", "_UpdateObjectStatus", UpdateObjectStatuASuccess, "", "ObjId", _TransactionID, "AppId", AppID, "Status", "DISBAPPVD");
    }
}

function ApprovedObjectFieldsSuccess(data) {
    if (data.EMessage == "" || data.EMessage == null)
        AlertBox("Updating status to AWD failed. Please update status manually - DISBAPPVD");
    else
        parent.window.close();
}

function btnDisApprove() {
    CallControllerMethod("Home", "_PLLUpdate", DisapproveSuccess, "", "strConf", strAWDConfirmation, "ExtFlag", "D",
            "ProcessMaxFlag", " ", "strUserID", strUserID);    
}

function DisapproveUpdateACHSuccess(data) {
    if (data.result == "false") {
        if (data.result == "false" && !pllUpdateFlag) {
            AlertBox("<ul><li>Unable to delete ACH Record</li><li>Unable to disapprove PLL.  Please try again.</li></ul>");
            return;
        } else {
            AlertBox("Unable to delete ACH Record");
        }
        
    } else {
        if (!pllUpdateFlag) {
            AlertBox("Unable to disapprove PLL.  Please try again. ");
            pllUpdateFlag = false;
            return;
        } else {
            AWDComments(false);
        }
    }
    

}

function DisapproveSuccess(data) {
    qrReject = true;
    pllUpdateFlag = data.PLLUpdateStatus != true ? false : true;
    if (data.EMessage != "" && data.EMessage != null) {
        qrReject = false;
        AlertBox("Unable to disapprove PLL.  Please try again. " + data.varErrorCode);
    } else {
        if (rsLoanInformation.Table[0].PAYMENT_OPTION == "A") {
            CallControllerMethod("Home", "_UpdateACH", DisapproveUpdateACHSuccess, "", "strConfirmationNum", strAWDConfirmation);
        } else {            
            if (!pllUpdateFlag) {
                AlertBox("Unable to disapprove PLL.  Please try again. ");
                qrReject = false;
                pllUpdateFlag = false;
                return;
            } else {
                AWDComments(false);
            }
        }
        
    }
}

function DisapproveObjectFieldsSuccess(data) {
    if (data.EMessage != "" && data.EMessage != null)
        AlertBox("Updating status to AWD failed. Please update status manually - DISBREJCTD");
    else
        parent.window.close();
}

function chkCommand1Check() {
        $('#txtLoanAmount2').val(accounting.formatMoney(0));
        $("#txtLoanAmount1").val(accounting.formatMoney(parseFloat(dRem(RequestedLoanAmt))));
        var t1 = parseFloat(dRem($('#txtLoanAmount1').val()));
        var t2 = parseFloat(dRem($('#txtLoanAmount2').val()));
        $("#lblTotalAmount").html(accounting.formatMoney(t1 + t2));
}

function chkCommand2Check() {
        $('#txtLoanAmount1').val(accounting.formatMoney(0));
        $("#txtLoanAmount2").val(accounting.formatMoney(parseFloat(dRem(RequestedLoanAmt))));
        var t1 = parseFloat(dRem($('#txtLoanAmount1').val()));
        var t2=parseFloat(dRem($('#txtLoanAmount2').val()));
        $("#lblTotalAmount").html(accounting.formatMoney(t1 + t2));
}


$("#txtZipCode").focusout(function () {
    if ($(this).val() != "") {
        switch ($(this).val().length) {
            case 5:
                if (isNaN($(this).val())) {
                    AlertBox("Invalid Zip Code.  Please re-enter.", "txtZipCode");
                }
                break;
            case 10:
                if (isNaN($(this).val().substring(0, 5)) == true && isNaN($(this).val().substring(6)) == true && $(this).val().substring(5, 6) != "-") {
                    AlertBox("Invalid Zip Code.  Please re-enter.", "txtZipCode");
                }
                break;
            default:
                AlertBox("Invalid Zip Code.  Please re-enter.", "txtZipCode");
        }
    }
});

$('#txtOptName').focusout(function () {
    this.value = this.value.toUpperCase();
});

function streetBlur(elem) {
    var sIndex = $(elem).data("id");
    var sValue = $('#txtStreetAddr' + sIndex + '').val()
    $('#txtStreetAddr' + sIndex + '').val(sValue.toUpperCase());
}

$("#txtCity").focusout(function () {
    this.value = this.value.toUpperCase();
});

$("#txtState").focusout(function () {
    this.value = this.value.toUpperCase();
});

$("#txtCountry").focusout(function () {
    this.value = this.value.toUpperCase();
});

$("#chkSurrenderWaiver").change(function () {
    QRCmdButtonsEnable(false);
    var x=$("#chkSurrenderWaiver").is(':checked') ? 1 : 0;
    switch (x) {
        case 0:
            strSurrenderWaiver = "N";
            break;
        case 1:
            strSurrenderWaiver = "Y";
            break;
    }
});

$("#mskDate").change(function () {
    QRCmdButtonsEnable((false));
});

function checkDate(dValue) {
    var DateArray = dValue.split("-");
    if (DateArray.length >0) {
        var year = DateArray[0];
        var month = DateArray[1];
        var Day = DateArray[2].substring(0, 2);
        return month + "/" + Day + "/" + year;
    }
    return "";
}

function txtLoanAmount1() {
    var txtLoanAmount1 = dRem($("#txtLoanAmount1").val());
    var isNumeric = !isNaN(txtLoanAmount1)
    if (!isNumeric) {
        AlertBox("Invalid Amount.  Please re-enter.", txtLoanAmount1);
        $('#txtLoanAmount1').html(accounting.formatMoney(0));
    } else {
        $('#txtLoanAmount1').html(accounting.formatMoney(parseFloat(dRem($('#txtLoanAmount1').val()))));
        $('#lblTotalAmount').html(accounting.formatMoney(parseFloat(dRem($('#txtLoanAmount1').val())) + parseFloat(dRem($('#txtLoanAmount2').val()))));
    }
};

function txtLoanAmount1Change() {
    QRCmdButtonsEnable(false);
};

function txtLoanAmount2Change() {
    QRCmdButtonsEnable(false);
};

function txtLoanAmount2() {
    var txtLoanAmount2 = dRem($("#txtLoanAmount2").val());
    var isNumeric = !isNaN(txtLoanAmount2)
    if (!isNumeric) {
        AlertBox("Invalid Amount.  Please re-enter.", txtLoanAmount2);
        $('#txtLoanAmount2').html(accounting.formatMoney(0));
    } else {
        $('#txtLoanAmount2').html(accounting.formatMoney(parseFloat(dRem($('#txtLoanAmount1').val()))));
        $('#lblTotalAmount').html(accounting.formatMoney(parseFloat(dRem($('#txtLoanAmount1').val())) + parseFloat(dRem($('#txtLoanAmount2').val()))));
    }
}

$("#txtCity").focusout(function () {
    this.value = this.value.toUpperCase();
})

$("#txtCity").change(function () {
    QRCmdButtonsEnable(false);
});

$("#txtState").focusout(function () {
    this.value = this.value.toUpperCase();
});

$("#txtState").change(function () {
    QRCmdButtonsEnable(false);
});

$("#txtCountry").focusout(function () {
    this.value = this.value.toUpperCase();
});

function cboDeliveryOptionsCheck() {
    if (LoanType != "P") {
        if ($("#lblTotalAmount").text() != RequestedLoanAmt) {
            AlertBox("Requested total amount does not equal original loan amount.", "txtLoanAmount1");
            $("#cmdSendVsys").attr("disabled", "disabled");
        }
    }
};

$("#chkSurrenderWaiver").change(function () {
    QRCmdButtonsEnable(false);
    var x = $("#chkSurrenderWaiver").is(':checked') ? 1 : 0;
    switch (x) {
        case 0:
            strSurrenderWaiver = "N";
            break;
        case 1:
            strSurrenderWaiver = "Y";
            break;
    }
});

$('#mskDate').datepicker({maxDate: "0", dateFormat: 'mm/dd/yy' });

function mskDatedateChange() {
    QRCmdButtonsEnable(false);
};

function loading(value) {
    var $this = $("#cmdSendVsys");
    if (value == "v-system")
        $this.attr("data-loading-text", "<i class='fa fa-spinner fa-spin '></i> Sending");
    else
        $this.attr("data-loading-text", "<i class='fa fa-spinner fa-spin '></i> Updating");
    $this.button('loading');    
}

function loadHide() {
    setTimeout(function () {
        var $this = $("#cmdSendVsys");
        $this.button('reset');
    }, 1000);
}