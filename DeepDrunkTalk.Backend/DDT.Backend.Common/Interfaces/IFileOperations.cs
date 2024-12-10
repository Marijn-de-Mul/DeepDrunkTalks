namespace DDT.Backend.Common.Interfaces
{
    public interface IFileOperations
    {
        bool FileExists(string path);
        FileStream OpenRead(string path);
    }
}
