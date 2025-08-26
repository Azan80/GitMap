'use client';

import { RepositoryFile } from '@/lib/database';
import { fileClient } from '@/lib/file-client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface FileManagerProps {
    repositoryId: number;
}

export function FileManager({ repositoryId }: FileManagerProps) {
    const [files, setFiles] = useState<RepositoryFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddFile, setShowAddFile] = useState(false);
    const [showUploadFile, setShowUploadFile] = useState(false);
    const [newFile, setNewFile] = useState({
        fileName: '',
        filePath: '',
        fileContent: '',
        fileType: ''
    });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPath, setUploadPath] = useState('/');

    useEffect(() => {
        loadFiles();
    }, [repositoryId]);

    const loadFiles = async () => {
        try {
            setLoading(true);
            const filesData = await fileClient.getFiles(repositoryId);
            setFiles(filesData);
        } catch (error) {
            toast.error('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFile = async () => {
        if (!newFile.fileName.trim()) {
            toast.error('File name is required');
            return;
        }

        try {
            await fileClient.createFile(
                repositoryId,
                newFile.filePath || '/',
                newFile.fileName,
                newFile.fileContent,
                newFile.fileType
            );

            toast.success('File created successfully');
            setShowAddFile(false);
            setNewFile({ fileName: '', filePath: '', fileContent: '', fileType: '' });
            loadFiles();
        } catch (error) {
            toast.error('Failed to create file');
        }
    };

    const handleUploadFile = async () => {
        if (!uploadFile) {
            toast.error('Please select a file to upload');
            return;
        }

        try {
            await fileClient.uploadFile(repositoryId, uploadFile, uploadPath);

            toast.success('File uploaded successfully');
            setShowUploadFile(false);
            setUploadFile(null);
            setUploadPath('/');
            loadFiles();
        } catch (error) {
            toast.error('Failed to upload file');
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadFile(file);
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            await fileClient.deleteFile(repositoryId, fileId);
            toast.success('File deleted successfully');
            loadFiles();
        } catch (error) {
            toast.error('Failed to delete file');
        }
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'js':
            case 'ts':
            case 'jsx':
            case 'tsx':
                return '📄';
            case 'html':
            case 'htm':
                return '🌐';
            case 'css':
            case 'scss':
            case 'sass':
                return '🎨';
            case 'json':
                return '📋';
            case 'md':
                return '📝';
            case 'txt':
                return '📄';
            default:
                return '📁';
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Repository Files</h3>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Add File
                    </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Repository Files</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setShowUploadFile(true)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                        Upload File
                    </button>
                    <button
                        onClick={() => setShowAddFile(true)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                        Add File
                    </button>
                </div>
            </div>

            {/* Upload File Modal */}
            {showUploadFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload File from System</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select File *
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {uploadFile && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Path
                                </label>
                                <input
                                    type="text"
                                    value={uploadPath}
                                    onChange={(e) => setUploadPath(e.target.value)}
                                    placeholder="/src/components"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={handleUploadFile}
                                disabled={!uploadFile}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Upload File
                            </button>
                            <button
                                onClick={() => {
                                    setShowUploadFile(false);
                                    setUploadFile(null);
                                    setUploadPath('/');
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add File Modal */}
            {showAddFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New File</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Name *
                                </label>
                                <input
                                    type="text"
                                    value={newFile.fileName}
                                    onChange={(e) => setNewFile({ ...newFile, fileName: e.target.value })}
                                    placeholder="index.js"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Path
                                </label>
                                <input
                                    type="text"
                                    value={newFile.filePath}
                                    onChange={(e) => setNewFile({ ...newFile, filePath: e.target.value })}
                                    placeholder="/src/components"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Content
                                </label>
                                <textarea
                                    value={newFile.fileContent}
                                    onChange={(e) => setNewFile({ ...newFile, fileContent: e.target.value })}
                                    placeholder="// Your file content here..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    File Type
                                </label>
                                <input
                                    type="text"
                                    value={newFile.fileType}
                                    onChange={(e) => setNewFile({ ...newFile, fileType: e.target.value })}
                                    placeholder="text/javascript"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={handleAddFile}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                            >
                                Create File
                            </button>
                            <button
                                onClick={() => setShowAddFile(false)}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Files List */}
            {files.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-center py-8">
                        No files yet. Click "Add File" to create your first file!
                    </p>
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg">
                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                        >
                            <div className="flex items-center space-x-3">
                                <span className="text-lg">{getFileIcon(file.file_name)}</span>
                                <div>
                                    <div className="font-medium text-gray-900">{file.file_name}</div>
                                    <div className="text-sm text-gray-500">
                                        {file.file_path} • {file.file_size} bytes
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        // TODO: Implement file editing
                                        toast('File editing coming soon!');
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteFile(file.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
