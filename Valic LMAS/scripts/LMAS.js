
var strSSN = "";
var _STATUS = "";
var OtherCarrierOLB = 0;
var OtherCarrierGLB12Mth = 0;
var strSvcFlag = "";
var acctArray = "";
var varAccount = "";
var totRow = 0;
var intRate = "";
var iActiveLoans = 0;
var ddIndex = "";
var appType = "";
var strUserID = "";
//Local Testing
//var objID = "2017-01-27-18.35.07.026980T01";
var ObjID = "";
var AppID = "VALICV2P";
var qrChange = false;


//Loan MAX
var intNewRowCount;
var bolExcludedAccounts;
var varExcludeAccount = new Array();
var varIncludeAccount = new Array();
var bolMultipleGroups = "";
var bolVestFlag = false;
var varVestingInfo = new Array();
var strSelectedAccount = "";
var errCode, strErrorMsg = "";
var bolLoanConfirmation = false;
var intIndex = '';
var strGroupName = "";
var NumofActiveLoans = "";
//bank
var strEFT = "";
var strBankName = "";
var strAbaRoutingNumber = "";
var strBankAccountNumber = "";
var strBankAccountType = "";
var strBankAddress = "";
var strBankCityStateZip = "";
var strBankPhone = "";

var blnACHavailable = false;

//Ban
var bolMessage = false;
var ACHFreq, PayrollFreq, CouponFreq = "";
var blnManagerApproval = false;
var bolSelectExcludeProcess = false;
var bolExcludeClick = false;
var bolSelectClick = false;

//modLoan setup

var lintLCNewRowCount = "";
var FirstPaymentDate = new Date();
var strEscrow = "";
var strIncomeLock = new Array();
var strFB009Ind = new Array();
var FB009Ind = "";
var strOrgSys = "";
//Add new variables for IncomeLock logic
var strRiderVersion = new Array();
var strRiderDate = new Array();
var SPAccess = false;
var strAccount = "";
var rsLoanInformation;
var bolQualityReview = false;
var bPendingFormReturn = false;
var rsLoanModel = "";
var varFrmTrnID = "";
var strOriginalLoanSetupUID = "";
var strGroupNum = "";
var strSuperUser = false;
var RequestedLoanAmt = "";
var LoanPurp = "";
var RepayMethod = "";
var confnum = "";
var strLoanAccount = "";
var PlanTypeCode = "";
var LoanType = "";
var Frequency = 0;
var WaiveAppFee = "N";
var TermYears = 0;
var isQRChanged = false;
var vesting = false;
var strFB1Amt = 0;
var strFP2Amt = 0;
var strExtractFlag = "";
var bolErrorCorrection = false;
var strBadAddrFlag = false;
var PartInfo = "";
var dsConfNum = "";
var strAWDCreateDate = "";
var strAWDSetUpDate = "";
var strAWDSetUpTime = "";
var strAWDConfirmation = "";
var strAWDStatus = "";
var gsConfirmNumber = "";

var gEffDate = "";
var gDB = "";
var gPWD = "";
var gUID = "";
var gsYears = "";
var gExcepCnt = 0;
var gMALFlag = false;

var strName = "";
var add1 = "";
var add2 = "";
var add3 = "";
var add4 = "";
var City = "";
var State = "";
var Zip1 = "";
var Zip2 = "";
var Phone1 = "";
var Phone2 = "";
var Phone3 = "";

var blnACHavailable2 =false;
var strEFT2 ="";
var strBankName2 ="";
var strAbaRoutingNumber2 ="";
var strBankAccountNumber2 ="";
var strBankAccountType2 ="";
var strBankAddress2 ="";
var strBankCityStateZip2 ="";

//add new public variables for ACH Logic
var gACHFlag = false;
var gBankAccountNumber = ""
var gBankPhoneNumber = "";
var gBankAccountType = "";
var gBankRoutingNumber = "";
var gBankName = "";


//Loan confirmation
var varEFTavailable = "";
var varBankName = "";
var varAbaRoutingNumber = "";
var varBankAccountNumber = "";
var varBankAccountType = "";
var varBankAddress = "";
var varBankCityStateZip = "";
var varSelectedDeliveryOption = 0;
var blnOptionalPayeeFlag = false;

var varFixedArray = new Array();
var varVestingPLLArray = new Array();
var intInvalidPOBox = 0;
var _IsFormInitalizing = true;
var IsInitializing = false;
var IsLoad = 0;
var rbAccountType = "";

var varTRNMaster = new Array();
var strOptionalPayee, strSurrenderWaiver = "";

//Add Comments
var Quality = false;
var mcomments = "";
var mRetVal = false;

var baseurl = "";

$(document).ready(function () {
    var environ = window.location.host;
    var pathname = window.location.pathname;
    var res = pathname.split("/");
    if (location.hostname !== "localhost") {
        baseurl = "//" + environ + "/" + res[1];
    }
    if (res[1] !== undefined && res[1] !== "")
        aLocation = "/" + res[1];
});

//Ajax call
function CallControllerMethod(methodController, methodName, onSuccess, onFail) {

    var args = '';
    var l = arguments.length;
    if (l > 4) {
        for (var i = 4; i < l - 1; i += 2) {
            if (args.length !== 0) args += ',';

            if (arguments[i + 1].toString().indexOf('[') === 0) {
                args += '"' + arguments[i] + '":' + arguments[i + 1] + '';
            }
            else {
                args += '"' + arguments[i] + '":"' + arguments[i + 1] + '"';
            }
        }
    }    
    $.ajax(
            {
                type: 'POST',
                url: baseurl + '/' + methodController + '/' + methodName,
                cache: false,
                data: '{' + args + '}',
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: onSuccess,
                fail: onFail
            });
}

//Progress bar
var modelDialog = modelDialog || (function ($) {
    'use strict';

    // Creating modal dialog's DOM
    var $dialog = $(
        '<div class="modal fade bs-example-modal-sm" data-backdrop="static" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="overflow-y:visible;">' +
        '<div class="modal-dialog modal-sm">' +
        '<div class="modal-content">' +
            '<div class="modal-header"><h4 style="margin:0;"></h4></div>' +
            '<div class="modal-body">' +
                '<div class="progress " style="margin-bottom:0;"><div class="progress-bar progress-bar-striped progress-bar-animated active" style="width: 100%"></div></div>' +
            '</div>' +
        '</div></div></div>');

    return {
        show: function (message, options) {
            // Assigning defaults
            if (typeof options === 'undefined') {
                options = {};
            }
            if (typeof message === 'undefined') {
                message = message;
            }
            var settings = $.extend({
                dialogSize: 'sm',
                progressType: '',
                onHide: null // This callback runs after the dialog was hidden
            }, options);

            // Configuring dialog
            $dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
            $dialog.find('h4').text(message);
            // Adding callbacks
            if (typeof settings.onHide === 'function') {
                $dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
                    settings.onHide.call($dialog);
                });
            }
            // Opening dialog
            $dialog.modal();
        },
        /**
         * Closes dialog
         */
        hide: function () {
            $dialog.modal('hide');
        }
    };
})(jQuery);

//Append dropdownlist
function bindValue(controlName, dIteam, dText) {    
    $('#' + controlName + '').append($('<option>', {
        value: dIteam,
        text: dText
    }));
}

//Confirm box
function lgConfirmBox(Messsage,methodName,Title) {
    bootbox.confirm({
        //title: Title,
        message: Messsage,        
        buttons: {
            confirm: {
                label: 'Yes'
            },
            cancel: {
                label: 'No'
            }
        },
        callback: methodName
    });
}
//Remove dollor and comma from value
function dRem(value) {
    var result = value;
    if (result.indexOf('$') != -1)
        result = result.replace("$", "");
    if (result.indexOf(',') != -1)
        result = result.replace(",", "");
    return result;
}
//Remove only dollor symbol
function dRm(value) {
    var result = "";
    if (value.indexOf('$') != -1)
        result = value.replace("$", "");
    return result;
}

//Show alert modal box
function AlertBox(alertMessage, controlName) {
    bootbox.dialog({
        message: alertMessage,
        size: 'small',
        buttons: {
            danger: {
                label: 'Ok',
                className: "btn-primary",
                callback: function () {
                    if (controlName !== null && controlName !== undefined) {
                        setTimeout(function () {
                            $('#' + controlName + '').focus();
                        }, 10);
                    }
                    if (controlName === 'close')
                        closeWindow();
                    if (controlName === 'closer') {
                        opener.closeWindow();
                        parent.window.close();
                    }
                        
                }
            }
        }
    });
}

//Close current window
function closeWindow() {
    parent.window.close();
}

function pad2(n) { return n < 10 ? '0' + n : n }

//date format MM-DD-YYYY
function MMDDYYYY(date) {
    return pad2(date.getMonth() + 1) + "/" + pad2(date.getDate()) + "/" + date.getFullYear().toString();
}

//date format DD-MM-YYYY
function DDMMYYYY(date) {
    var mArray = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var x = date.split("/");
    if (x[0].length == 1)
        x[0] = "0" + x[0];
    if(x[1].length==1)
        x[1] = "0" + x[1];
    return x[1].toString() + "-" + mArray[parseInt(x[0])] + "-" + x[2].substring(0, 4);
}

//date format MM/DD/YYYY
function backSlashMMDDYYYY(date) {
    return pad2(date.getMonth() + 1) + "/" + pad2(date.getDate()) + "/" + date.getFullYear().toString();
}

function getUrlString() {
    var qString = [], hash;
    var href = window.location.href;
    href = ReplacePer(href);    
    var hashes = href.slice(href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        qString.push(hash[0]);
        qString[hash[0]] = hash[1];
    }
    return qString;
}


function ArrayToString(arr) {
    var result = "";
    try{
        if (arr.length > 0) {
            result = arr[0];
            for (i = 1; i < arr.length; i++) {
                result = result + "|" + arr[i];
            }
        }
    } catch (err) {
        AlertBox("ArrayToString - " + err);
    }
    return result;
}

//Large alertbox
function lgAlertBox(Message, funName) {
    bootbox.alert({
        message: Message,
        callback: funName
    })
}
//Remove % from value Chrome browser will not accept ""
function ReplacePer(value) {
    var result = value;
    if (result.indexOf('%22') != -1)
        result = result.replace(/%22/g, '"');
    return result;
}

function noBack() { window.history.forward(); }
noBack();
window.onload = noBack;
window.onpageshow = function (evt) { if (evt.persisted) noBack(); };

window.onbeforeunload = function () { unloadFunction(); };
function unloadFunction() {

    return null;
}