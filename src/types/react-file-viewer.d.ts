declare module 'react-file-viewer' {
  export interface FileViewerProps {
    fileType: string;
    filePath: string;
    onError?: (error: any) => void;
    width?: string | number;
    height?: string | number;
    errorComponent?: React.ComponentType<any>;
    unsupportedComponent?: React.ComponentType<any>;
  }

  const FileViewer: React.ComponentType<FileViewerProps>;
  export default FileViewer;
}
