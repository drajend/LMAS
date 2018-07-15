using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using Newtonsoft.Json;

namespace Valic_LMAS.Models
{
    public class Methods
    {
        public string DataSetToJSONString(DataSet table)
        {
            try
            {
                string JSONString = string.Empty;
                JSONString = JsonConvert.SerializeObject(table);
                return JSONString;
            }
            catch(Exception ex)
            {
                throw ex;
            }
        }

        public List<IndexField> createIndexFields(string fields)
        {
            //Example:  ,-,FNAME,HEINZ,FIRST NAME
            //          ,-,LNAME,AYLLON,LAST NAME
            string replaceLOBFields = fields.Replace(",-,", ";");
            string[] parts = replaceLOBFields.Split(';');
            List<IndexField> listIndexFields = new List<IndexField>();
            foreach (string prt in parts)
            {
                if (prt != "")
                {
                    string[] prt2 = prt.Split(',');
                    IndexField newField = new IndexField();
                    newField.FieldName = prt2[0];
                    newField.FieldValue = prt2[1];
                    newField.LOBTranslation = prt2[2];
                    listIndexFields.Add(newField);
                }
            }
            return listIndexFields;
        }
    }
}