using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace Valic_LMAS.App_Start
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {            
            //CSS for Index
            bundles.Add(new StyleBundle("~/Content/css").Include(                        
                        "~/Content/bootstrap.min.css",
                        "~/Content/jquery-ui.css",
                        "~/Content/LMAS.css"
                        ));            

            // JS for Index
            bundles.Add(new ScriptBundle("~/bundles/lmasJB").Include(
                "~/Scripts/Bootstrap/jquery-3.2.1.min.js",
                "~/Scripts/Bootstrap/moment.js",
                "~/Scripts/Bootstrap/popper.min.js",
                "~/Scripts/Bootstrap/bootstrap.js",
                "~/Scripts/Bootstrap/jquery-ui.js",
                "~/Scripts/Bootstrap/datepicker.js",
                "~/Scripts/Bootstrap/bootbox.js",
                "~/Scripts/numeral.min.js",
                "~/Scripts/accounting.min.js",
                "~/Scripts/LMAS.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/LoanSetUp").Include(
                "~/Scripts/LoanSetup.js"                

                ));
            bundles.Add(new ScriptBundle("~/bundles/LoanConfirm").Include(                
                "~/Scripts/loanConfirm.js"

                ));
        }
    }
}