using System.Collections.Generic;

namespace Connections
{
    public class Task
    {
        public Uploadedby uploadedBy { get; set; }
        public Info info { get; set; }
    }

    public class Uploadedby
    {
        public string id { get; set; }
        public string name { get; set; }
        public string email { get; set; }
        public string uploadTime { get; set; }
    }

    public class Info
    {
        public List<string> images { get; set; }
        public string biodataUrl { get; set; }
    }

    public class Data
    {
        public string[] places { get; set; }
        public string[] ages { get; set; }
        public string[] heights { get; set; }
        public string[] occupations { get; set; }
        public string[] variousEducation { get; set; }
        public string[] possibleLookingFor { get; set; }
        public string[] doshas { get; set; }
        public string[] variousMartialStatus { get; set; }
        public string[] sampradayas { get; set; }
        public string[] variousReasons { get; set; }
        public string[] professions { get; set; }
    }
}
