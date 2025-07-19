import React, { useState, useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Folder,
  File,
  MoreVertical,
  Search,
  Upload,
  FolderPlus,
  Download,
  Edit,
  Trash2,
  FileText,
  ChevronRight,
  ChevronDown,
  FilePlus,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  Archive,
  FileType,
  Move,
} from "lucide-react";
import {
  SelectContent,
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

// Import players
import {
  ImageViewer,
  VideoPlayer,
  AudioPlayer,
  PDFViewer,
  ExcelViewer,
} from "./players";
import { useApiQuery } from "@/hooks/useApi";

interface Folder {
  _id: string;
  name: string;
  parentFolder: string | null;
  owner: string;
  path: string;
  isRoot: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  _id: string;
  name: string;
  originalName: string;
  fileType: "pdf" | "image" | "video" | "audio" | "document" | "excel";
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folder: string | null;
  owner: string;
  path: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FileTreeItem {
  id: string;
  name: string;
  type: "file" | "folder";
  data: Folder | Document;
  children?: FileTreeItem[];
  expanded?: boolean;
}

// Add formatFileSize as a utility function at the top level
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const FileIcon = ({
  fileType,
  fileName,
}: {
  fileType?: string;
  fileName?: string;
}) => {
  // Get file extension for more specific icons
  const extension = fileName?.split(".").pop()?.toLowerCase();

  switch (fileType) {
    case "pdf":
      return <FileText className="h-4 w-4 text-red-500" />;
    case "document":
      // More specific document types
      if (["doc", "docx"].includes(extension || "")) {
        return <FileText className="h-4 w-4 text-blue-600" />;
      }
      if (["ppt", "pptx"].includes(extension || "")) {
        return <FileText className="h-4 w-4 text-orange-500" />;
      }
      if (["txt", "md"].includes(extension || "")) {
        return <FileCode className="h-4 w-4 text-gray-600" />;
      }
      if (extension === "zip") {
        return <Archive className="h-4 w-4 text-yellow-600" />;
      }
      return <FileText className="h-4 w-4 text-gray-500" />;
    case "excel":
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
    case "image":
      // Different colors for different image types
      if (["svg"].includes(extension || "")) {
        return <FileImage className="h-4 w-4 text-purple-500" />;
      }
      if (["png", "gif"].includes(extension || "")) {
        return <FileImage className="h-4 w-4 text-blue-500" />;
      }
      return <FileImage className="h-4 w-4 text-green-500" />;
    case "video":
      return <FileVideo className="h-4 w-4 text-blue-500" />;
    case "audio":
      // Different colors for different audio types
      if (["wav", "flac"].includes(extension || "")) {
        return <FileAudio className="h-4 w-4 text-indigo-500" />;
      }
      return <FileAudio className="h-4 w-4 text-purple-500" />;
    default:
      return <FileType className="h-4 w-4 text-gray-500" />;
  }
};

const FileTreeItem = ({
  item,
  level = 0,
  onSelect,
  onToggle,
  onAction,
  isLast = false,
  parentLines = [],
  onDrop,
}: {
  item: FileTreeItem;
  level?: number;
  onSelect: (item: FileTreeItem) => void;
  onToggle: (id: string) => void;
  onAction: (action: string, item: FileTreeItem) => void;
  isLast?: boolean;
  parentLines?: boolean[];
  onDrop: (files: FileList, targetFolder: Folder | null) => void;
}) => {
  const { t } = useTranslation("documents");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const dragData: DragItem = {
      id: item.id,
      type: item.type,
      data: item.data,
    };
    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Allow dropping files from outside or moving items
    if (item.type === "folder" && !isDragging) {
      setIsDragOver(true);
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    // Only hide drag over if we're actually leaving this element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (item.type !== "folder") return;

    // Handle file uploads from outside
    if (e.dataTransfer.files.length > 0) {
      onDrop(e.dataTransfer.files, item.data as Folder);
      return;
    }

    // Handle moving existing items
    try {
      const dragDataStr = e.dataTransfer.getData("application/json");
      if (dragDataStr) {
        const dragItem: DragItem = JSON.parse(dragDataStr);

        // Don't allow dropping on self or moving folder into its own child
        if (dragItem.id === item.id) return;

        if (dragItem.type === "folder") {
          const dragFolder = dragItem.data as Folder;
          const targetFolder = item.data as Folder;

          // Check if target is a child of the dragged folder
          if (targetFolder.path.startsWith(dragFolder.path + "/")) {
            toast.error(t("cannotMoveToChild"), {
              description: t("cannotMoveFolderToItsChild"),
            });
            return;
          }
        }

        // Trigger move action
        onAction("move", {
          ...dragItem,
          targetFolder: item.data as Folder,
        } as any);
      }
    } catch (error) {
      console.error("Error parsing drag data:", error);
    }
  };

  const handleItemClick = () => {
    if (item.type === "folder") {
      onToggle(item.id);
    } else {
      onSelect(item);
    }
  };

  return (
    <div>
      <div
        className={`group relative mx-1 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50 ${
          isDragOver && item.type === "folder"
            ? "border-2 border-dashed border-primary bg-accent"
            : ""
        } ${isDragging ? "opacity-50" : ""}`}
        style={{ paddingLeft: `${Math.max(0, level * 12 + 8)}px` }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleItemClick}
      >
        {/* Tree lines */}
        <div
          className="absolute left-0 flex items-center"
          style={{ width: `${level * 12}px` }}
        >
          {parentLines.map((hasLine, index) => (
            <div key={index} className="flex w-3 justify-center">
              {hasLine && <div className="h-6 w-px bg-border" />}
            </div>
          ))}
          {level > 0 && (
            <div className="flex w-3 flex-col items-center">
              <div className="h-2 w-px bg-border" />
              <div
                className={`h-px w-2 bg-border ${!isLast ? "relative" : ""}`}
              />
              {!isLast && <div className="h-4 w-px bg-border" />}
            </div>
          )}
        </div>

        {/* Folder toggle button or spacer */}
        <div className="flex h-4 w-4 shrink-0 items-center justify-center">
          {item.type === "folder" ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onToggle(item.id);
              }}
            >
              {item.expanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>

        {/* Icon */}
        <div className="shrink-0">
          {item.type === "folder" ? (
            <Folder className="h-4 w-4 text-blue-500" />
          ) : (
            <FileIcon
              fileType={(item.data as Document).fileType}
              fileName={(item.data as Document).name}
            />
          )}
        </div>

        {/* File name */}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {item.name}
        </span>

        {/* Actions dropdown - always visible on small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 shrink-0 p-0 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {item.type === "folder" && (
              <>
                <DropdownMenuItem onClick={() => onAction("newFolder", item)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  {t("newFolder")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction("uploadFile", item)}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  {t("uploadFile")}
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onAction("move", item)}>
              <Move className="mr-2 h-4 w-4" />
              {t("move")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("download", item)}>
              <Download className="mr-2 h-4 w-4" />
              {t("download")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction("rename", item)}>
              <Edit className="mr-2 h-4 w-4" />
              {t("rename")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction("delete", item)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Child items */}
      {item.type === "folder" && item.expanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              onAction={onAction}
              isLast={index === item.children!.length - 1}
              parentLines={[...parentLines, !isLast]}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Update FileSkeleton to match the new tree spacing
const FileSkeleton = ({ level = 0 }: { level?: number }) => (
  <div
    className="mx-1 flex items-center gap-2 px-2 py-1.5"
    style={{ paddingLeft: `${Math.max(0, level * 12 + 8)}px` }}
  >
    <Skeleton className="h-4 w-4" />
    <Skeleton className="h-4 w-4" />
    <Skeleton className="h-4 flex-1" />
  </div>
);

const TreeSkeleton = () => (
  <div className="space-y-1 p-2">
    <FileSkeleton />
    <FileSkeleton level={1} />
    <FileSkeleton level={1} />
    <FileSkeleton level={2} />
    <FileSkeleton level={2} />
    <FileSkeleton />
    <FileSkeleton level={1} />
    <FileSkeleton level={1} />
    <FileSkeleton level={2} />
    <FileSkeleton level={1} />
    <FileSkeleton level={1} />
    <FileSkeleton />
    <FileSkeleton />
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation("documents");

  return (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col">
          <span>{t("errorLoadingFiles")}</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("retry")}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

const EmptyState = () => {
  const { t } = useTranslation("documents");

  return (
    <div className="flex h-32 items-center justify-center text-muted-foreground">
      <div className="text-center">
        <Folder className="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p className="text-sm">{t("noFilesFound")}</p>
      </div>
    </div>
  );
};

const DocumentViewer = ({
  selectedFile,
  isLoading,
}: {
  selectedFile: FileTreeItem | null;
  isLoading: boolean;
}) => {
  const { t } = useTranslation("documents");

  const getTagTranslation = (tagKey: string): string => {
    // Try to get translation from tags namespace, fallback to original tag if not found
    const translationKey = `tags.${tagKey}`;
    const translation = t(translationKey, { defaultValue: tagKey });
    return translation === translationKey ? tagKey : translation;
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <Skeleton className="mb-2 h-6 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  if (!selectedFile || selectedFile.type === "folder") {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <File className="mx-auto mb-4 h-16 w-16" />
          <p>{t("selectFileToView")}</p>
        </div>
      </div>
    );
  }

  const document = selectedFile.data as Document;

  const renderFileContent = () => {
    switch (document.fileType) {
      case "pdf":
        return <PDFViewer document={document} />;

      case "image":
        return <ImageViewer document={document} />;

      case "video":
        return <VideoPlayer document={document} />;

      case "audio":
        return <AudioPlayer document={document} />;

      case "excel":
        return <ExcelViewer document={document} />;

      case "document":
        return (
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="max-w-md rounded-lg bg-card p-8 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-blue-500" />
              <h3 className="mb-2 font-semibold">{document.name}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {t("documentCannotBePreviewedDirectly")}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const link = window.document.createElement("a");
                    link.href = document.url;
                    link.download = document.name;
                    link.click();
                  }}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t("downloadToView")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(document.url, "_blank")}
                  className="w-full"
                >
                  {t("tryOpeningInNewTab")}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex h-full w-full items-center justify-center p-4">
            <div className="max-w-md rounded-lg bg-card p-8 text-center">
              <File className="mx-auto mb-4 h-16 w-16 text-gray-500" />
              <h3 className="mb-2 font-semibold">{document.name}</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                This file type is not supported for preview
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const link = window.document.createElement("a");
                    link.href = document.url;
                    link.download = document.name;
                    link.click();
                  }}
                  className="w-full gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(document.url, "_blank")}
                  className="w-full"
                >
                  Open in New Tab
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">{document.name}</h2>
        <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
          <span>{formatFileSize(document.size)}</span>
          <span>{new Date(document.createdAt).toLocaleDateString()}</span>
          <Badge variant="secondary">{document.fileType}</Badge>
        </div>
        {document.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {document.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {getTagTranslation(tag)}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1">{renderFileContent()}</div>
    </div>
  );
};

// Add DragItem interface for drag and drop
interface DragItem {
  id: string;
  type: "file" | "folder";
  data: Folder | Document;
}

export default function Documents() {
  const { t } = useTranslation("documents");

  // Fetch data using API hooks
  const {
    data: folders = [],
    isLoading: foldersLoading,
    error: foldersError,
    refetch: refetchFolders,
  } = useApiQuery<Folder[]>({
    queryKey: ["folders"],
    endpoint: "/data/folders.json",
    useLocalJson: true,
  });

  const {
    data: documents = [],
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useApiQuery<Document[]>({
    queryKey: ["documents"],
    endpoint: "/data/documents.json",
    useLocalJson: true,
  });

  // Derived state
  const isLoading = foldersLoading || documentsLoading;
  const error = foldersError || documentsError;

  // Local state - remove fileTree state as it's causing the loop
  const [selectedFile, setSelectedFile] = useState<FileTreeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [renameItem, setRenameItem] = useState<FileTreeItem | null>(null);
  const [newFolderParent, setNewFolderParent] = useState<FileTreeItem | null>(
    null,
  );
  const [newName, setNewName] = useState("");
  const [isDragOverWhitespace, setIsDragOverWhitespace] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveItem, setMoveItem] = useState<FileTreeItem | null>(null);
  const [selectedTargetFolder, setSelectedTargetFolder] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderFileInputRef = useRef<HTMLInputElement>(null);

  const buildFileTree = useCallback(
    (folders: Folder[], documents: Document[]): FileTreeItem[] => {
      const folderMap = new Map<string, FileTreeItem>();
      const rootItems: FileTreeItem[] = [];

      // Create folder items
      folders.forEach((folder) => {
        const item: FileTreeItem = {
          id: folder._id,
          name: folder.name,
          type: "folder",
          data: folder,
          children: [],
          expanded: expandedFolders.has(folder._id),
        };
        folderMap.set(folder._id, item);
      });

      // Create document items
      documents.forEach((doc) => {
        const item: FileTreeItem = {
          id: doc._id,
          name: doc.name,
          type: "file",
          data: doc,
        };

        if (doc.folder) {
          const parentFolder = folderMap.get(doc.folder);
          if (parentFolder) {
            parentFolder.children!.push(item);
          }
        } else {
          rootItems.push(item);
        }
      });

      // Build folder hierarchy
      folders.forEach((folder) => {
        const item = folderMap.get(folder._id)!;
        if (folder.parentFolder) {
          const parentFolder = folderMap.get(folder.parentFolder);
          if (parentFolder) {
            parentFolder.children!.push(item);
          }
        } else {
          rootItems.push(item);
        }
      });

      return rootItems;
    },
    [expandedFolders],
  );

  // Build file tree when data changes - use useMemo to prevent unnecessary recalculations
  const fileTree = useMemo(() => {
    if (folders.length > 0 || documents.length > 0) {
      return buildFileTree(folders, documents);
    }
    return [];
  }, [folders, documents, buildFileTree]);

  const handleRetry = useCallback(() => {
    refetchFolders();
    refetchDocuments();
  }, [refetchFolders, refetchDocuments]);

  const handleToggleFolder = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const generateId = useCallback(
    () => Math.random().toString(36).substr(2, 9),
    [],
  );

  const getFileType = useCallback(
    (
      fileName: string,
    ): "pdf" | "image" | "video" | "audio" | "document" | "excel" => {
      const ext = fileName.split(".").pop()?.toLowerCase();
      if (
        ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext || "")
      )
        return "image";
      if (["mp4", "avi", "mov", "wmv", "webm", "mkv"].includes(ext || ""))
        return "video";
      if (["mp3", "wav", "flac", "aac", "ogg", "m4a"].includes(ext || ""))
        return "audio";
      if (ext === "pdf") return "pdf";
      if (["xlsx", "xls", "csv"].includes(ext || "")) return "excel";
      if (["doc", "docx", "ppt", "pptx", "txt", "rtf"].includes(ext || ""))
        return "document";
      return "document";
    },
    [],
  );

  const handleFileUpload = useCallback(
    (uploadedFiles: FileList, targetFolder: Folder | null = null) => {
      // Create new documents from uploaded files
      const newDocuments: Document[] = Array.from(uploadedFiles).map(
        (file) => ({
          _id: generateId(),
          name: file.name,
          originalName: file.name,
          fileType: getFileType(file.name),
          mimeType: file.type,
          size: file.size,
          url: URL.createObjectURL(file), // In production, upload to server and get URL
          folder: targetFolder?._id || null,
          owner: "user1",
          path: targetFolder
            ? `${targetFolder.path}/${file.name}`
            : `/${file.name}`,
          tags: [],
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      );

      // In a real app, you would call an API mutation here
      // For now, we'll just show a success message
      toast.success(t("uploadSuccess"), {
        description: targetFolder
          ? t("filesUploadedToFolder", {
              folder: targetFolder.name,
              count: newDocuments.length,
            })
          : t("filesUploadedToRoot", { count: newDocuments.length }),
      });
    },
    [generateId, getFileType, t],
  );

  const handleCreateFolder = useCallback(
    () => {
      if (!newName.trim()) return;

      // In a real app, you would call an API mutation here
      toast.success(t("folderCreated"), {
        description: t("folderCreatedSuccess", { name: newName.trim() }),
      });

      setNewName("");
      setShowNewFolderDialog(false);
      setNewFolderParent(null);
    },
    [newName, t],
  );

  const handleRename = useCallback(() => {
    if (!renameItem || !newName.trim()) return;

    // In a real app, you would call an API mutation here
    toast.success(t("itemRenamed"), {
      description: t("itemRenamedSuccess", { name: newName.trim() }),
    });

    setNewName("");
    setShowRenameDialog(false);
    setRenameItem(null);
  }, [renameItem, newName, t]);

  const handleDelete = useCallback(
    (item: FileTreeItem) => {
      // In a real app, you would call an API mutation here
      if (selectedFile?.id === item.id) {
        setSelectedFile(null);
      }

      toast.success(t("itemDeleted"), {
        description: t("itemDeletedSuccess", { name: item.name }),
      });
    },
    [selectedFile, t],
  );

  const handleDownload = useCallback(
    (item: FileTreeItem) => {
      if (item.type === "folder") {
        toast.success(t("downloadStarted"), {
          description: t("folderDownloadZip", { name: item.name }),
        });
      } else {
        const doc = item.data as Document;
        // Create download link
        const link = window.document.createElement("a");
        link.href = doc.url;
        link.download = doc.name;
        link.click();

        toast.success(t("downloadStarted"), {
          description: t("fileDownloadStarted", { name: item.name }),
        });
      }
    },
    [t],
  );

  const handleMove = useCallback(
    (item: FileTreeItem, targetFolder?: Folder) => {
      if (targetFolder) {
        // Direct move from drag and drop
        const itemName = item.name;
        const targetName = targetFolder.name;

        // In a real app, you would call an API mutation here
        toast.success(t("itemMoved"), {
          description: t("itemMovedSuccess", {
            item: itemName,
            folder: targetName,
          }),
        });
      } else {
        // Show move dialog
        setMoveItem(item);
        setShowMoveDialog(true);
      }
    },
    [t],
  );

  const handleMoveConfirm = useCallback(() => {
    if (!moveItem || !selectedTargetFolder) return;

    const targetFolder = folders.find((f) => f._id === selectedTargetFolder);
    if (!targetFolder) return;

    // In a real app, you would call an API mutation here
    toast.success(t("itemMoved"), {
      description: t("itemMovedSuccess", {
        item: moveItem.name,
        folder: targetFolder.name,
      }),
    });

    setShowMoveDialog(false);
    setMoveItem(null);
    setSelectedTargetFolder("");
  }, [moveItem, selectedTargetFolder, folders, t]);

  const handleFileAction = useCallback(
    (action: string, item: FileTreeItem) => {
      switch (action) {
        case "download":
          handleDownload(item);
          break;
        case "rename":
          setRenameItem(item);
          setNewName(item.name);
          setShowRenameDialog(true);
          break;
        case "delete":
          handleDelete(item);
          break;
        case "move":
          if ((item as any).targetFolder) {
            // Direct move from drag and drop
            handleMove(item, (item as any).targetFolder);
          } else {
            // Show move dialog
            handleMove(item);
          }
          break;
        case "newFolder":
          setNewFolderParent(item);
          setShowNewFolderDialog(true);
          break;
        case "uploadFile":
          setNewFolderParent(item);
          folderFileInputRef.current?.click();
          break;
      }
    },
    [handleDownload, handleDelete, handleMove],
  );

  // Get available folders for move dialog (exclude the item being moved and its children)
  const getAvailableFoldersForMove = useCallback(() => {
    if (!moveItem) return folders;

    if (moveItem.type === "file") {
      return folders;
    }

    // For folders, exclude the folder itself and its children
    const moveFolder = moveItem.data as Folder;
    return folders.filter(
      (folder) =>
        folder._id !== moveFolder._id &&
        !folder.path.startsWith(moveFolder.path + "/"),
    );
  }, [folders, moveItem]);

  const filteredTree = useMemo(() => {
    if (!searchTerm) return fileTree;

    return fileTree.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [fileTree, searchTerm]);

  const handleWhitespaceUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleWhitespaceDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverWhitespace(true);
  }, []);

  const handleWhitespaceDragLeave = useCallback(() => {
    setIsDragOverWhitespace(false);
  }, []);

  const handleWhitespaceDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOverWhitespace(false);

      if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files);
      }
    },
    [handleFileUpload],
  );

  return (
    <div className="flex h-[calc(97vh-var(--header-height))] flex-col">
      <div className="flex flex-1 gap-2 overflow-hidden p-2 sm:gap-4 sm:p-4">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-72 sm:w-80" : "w-0"
          } flex flex-col transition-all duration-300 lg:block lg:w-80 ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          <Card className="h-full flex-1 py-0!">
            <CardContent className="flex h-full flex-col p-0">
              <div className="flex flex-col gap-3 border-b p-3 sm:p-4">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder={t("searchFiles")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={handleWhitespaceUpload}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Upload className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t("upload")}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => {
                      setNewFolderParent(null);
                      setShowNewFolderDialog(true);
                    }}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <FolderPlus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{t("newFolder")}</span>
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 overflow-auto">
                <div className="min-w-max overflow-x-auto overflow-y-auto py-2">
                  {isLoading ? (
                    <TreeSkeleton />
                  ) : error ? (
                    <ErrorState onRetry={handleRetry} />
                  ) : filteredTree.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="space-y-0.5">
                      {filteredTree.map((item, index) => (
                        <FileTreeItem
                          key={item.id}
                          item={item}
                          onSelect={setSelectedFile}
                          onToggle={handleToggleFolder}
                          onAction={handleFileAction}
                          onDrop={handleFileUpload}
                          isLast={index === filteredTree.length - 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <Card
            className={`flex-1 py-0! ${
              isDragOverWhitespace
                ? "border-2 border-dashed border-primary bg-accent"
                : ""
            }`}
            onDragOver={handleWhitespaceDragOver}
            onDragLeave={handleWhitespaceDragLeave}
            onDrop={handleWhitespaceDrop}
          >
            <CardContent className="h-full p-0">
              <DocumentViewer
                selectedFile={selectedFile}
                isLoading={isLoading && !selectedFile}
              />
              {isDragOverWhitespace && (
                <div className="absolute inset-0 flex items-center justify-center bg-accent/80 text-primary">
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 h-8 w-8 sm:h-12 sm:w-12" />
                    <p className="text-sm font-medium sm:text-lg">
                      {t("dropFilesHere")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files);
          }
        }}
      />
      <input
        ref={folderFileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && newFolderParent) {
            handleFileUpload(e.target.files, newFolderParent.data as Folder);
            setNewFolderParent(null);
          }
        }}
      />

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("renameItem")}</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("enterNewName")}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleRename}>{t("rename")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newFolderParent
                ? t("createFolderIn", { folder: newFolderParent.name })
                : t("createNewFolder")}
            </DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("enterFolderName")}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewFolderDialog(false)}
            >
              {t("cancel")}
            </Button>
            <Button onClick={() => handleCreateFolder()}>
              {t("create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("moveItem")} - {moveItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {t("selectTargetFolder")}
              </label>
              <Select
                value={selectedTargetFolder}
                onValueChange={setSelectedTargetFolder}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("selectFolder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">{t("rootFolder")}</SelectItem>
                  {getAvailableFoldersForMove().map((folder) => (
                    <SelectItem key={folder._id} value={folder._id}>
                      {folder.path}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleMoveConfirm}
              disabled={!selectedTargetFolder}
            >
              {t("move")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile sidebar toggle */}
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-50 h-10 w-10 p-0 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Folder className="h-4 w-4" />
      </Button>
    </div>
  );
}
