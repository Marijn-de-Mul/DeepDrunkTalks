using System.IO;
using DDT.Backend.Common.Interfaces;

namespace DDT.Backend.BLL.Helpers
{
    public class FileOperations : IFileOperations
    {
        public bool FileExists(string path) => File.Exists(path);

        public FileStream OpenRead(string path) => new FileStream(path, FileMode.Open, FileAccess.Read);
    }
}