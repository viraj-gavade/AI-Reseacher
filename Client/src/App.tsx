import React, { useState } from 'react';
import { MessageCircle, Upload as UploadIcon, Moon, Sun } from 'lucide-react';
import { ChatInterface } from './components/chat/ChatInterface';
import { PDFUpload } from './components/upload/PDFUpload';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import type { UploadedFile } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'upload'>('chat');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFiles(prev => [...prev, file]);
    // Optionally switch to chat tab after successful upload
    setTimeout(() => setActiveTab('chat'), 1000);
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">AI Document Chat</h1>
              {uploadedFiles.length > 0 && (
                <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} uploaded
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Tab Navigation for Mobile */}
              <div className="flex sm:hidden">
                <Button
                  variant={activeTab === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  icon={MessageCircle}
                />
                <Button
                  variant={activeTab === 'upload' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('upload')}
                  icon={UploadIcon}
                />
              </div>
              
              {/* Dark mode toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                icon={isDarkMode ? Sun : Moon}
              />
            </div>
          </div>
          
          {/* Tab Navigation for Desktop */}
          <div className="hidden sm:flex mt-4 space-x-2">
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('chat')}
              icon={MessageCircle}
              iconPosition="left"
            >
              Chat
            </Button>
            <Button
              variant={activeTab === 'upload' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('upload')}
              icon={UploadIcon}
              iconPosition="left"
            >
              Upload PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Chat Section */}
          <div className={`lg:col-span-2 ${activeTab === 'chat' ? 'block' : 'hidden lg:block'}`}>
            <Card className="h-full">
              <ChatInterface className="h-full" />
            </Card>
          </div>

          {/* Upload Section */}
          <div className={`lg:col-span-1 ${activeTab === 'upload' ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              <PDFUpload onFileUploaded={handleFileUploaded} />
              
              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <Card>
                  <div className="p-4">
                    <h3 className="font-semibold mb-3">Uploaded Files</h3>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <UploadIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Usage Instructions */}
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">How to use</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>1. Upload a PDF document using the upload area</p>
                    <p>2. Start chatting about the document content</p>
                    <p>3. Ask questions or request summaries</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>AI Document Chat - Analyze and discuss your PDFs</p>
            <p className="mt-2 sm:mt-0">Built with React, Vite & Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
