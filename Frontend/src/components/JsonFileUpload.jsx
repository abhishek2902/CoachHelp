import React, { useState } from 'react';
import { Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { Upload, Download, FileText } from 'react-bootstrap-icons';
import aiChatService from '../services/aiChatService';

const JsonFileUpload = ({ conversationId, onUpdate, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setError('Please select a valid JSON file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !conversationId) return;
    
    setUploading(true);
    setError('');
    
    try {
      const result = await aiChatService.uploadJsonFile(selectedFile, conversationId, message);
      
      if (result.test_update && onUpdate) {
        onUpdate(result.test_update);
      }
      
      setShowUploadModal(false);
      setSelectedFile(null);
      setMessage('');
      
      // Show success message
      alert('JSON file processed successfully!');
      
    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'Failed to process JSON file.';
      
      if (err.response) {
        if (err.response.status === 503) {
          errorMessage = 'AI service is currently unavailable. Please try again in a few minutes.';
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    if (!conversationId) return;
    
    setExporting(true);
    setError('');
    
    try {
      await aiChatService.exportTestJson(conversationId);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export test structure.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={`json-file-upload ${className}`}>
      <div className="d-flex gap-2 mb-3">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
        >
          <Upload className="me-1" />
          Upload JSON
        </Button>
        
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <Spinner animation="border" size="sm" className="me-1" />
          ) : (
            <Download className="me-1" />
          )}
          Export JSON
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FileText className="me-2" />
            Upload JSON Test Structure
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Select JSON File</Form.Label>
              <Form.Control
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <Form.Text className="text-muted">
                Upload a JSON file containing test structure (max 5MB)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Processing Instructions (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="e.g., Add 5 more questions to the Ruby Basics section"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={uploading}
              />
              <Form.Text className="text-muted">
                Tell the AI what changes to make to the uploaded test structure
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Processing...
              </>
            ) : (
              'Upload & Process'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JsonFileUpload; 