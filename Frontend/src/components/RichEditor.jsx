import React, { useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';

function MyUploadAdapter(loader) {
  this.loader = loader;
  this.controller = new AbortController();
}

MyUploadAdapter.prototype.upload = function () {
  return this.loader.file
    .then(file => {
      if (!file) throw new Error('No file to upload');
      const formData = new FormData();
      formData.append('attachment', file);
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_BASE_URL;
      return fetch(`${base}/attachments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        signal: this.controller.signal,
      })
        .then(res => res.json())
        .then(data => {
          if (data.location) {
            return { default: data.location };
          } else {
            Swal.fire('No URL returned from upload');
            throw new Error('No URL returned from upload');
          }
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            // Upload was aborted, do not show error
            return Promise.reject();
          }
          Swal.fire('Image upload failed');
          throw err;
        });
    });
};

MyUploadAdapter.prototype.abort = function () {
  if (this.controller) {
    this.controller.abort();
  }
};

function CustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

export default function RichEditor({ value, onChange, placeholder = 'Start typing...', className = '' }) {
  const editorConfiguration = {
    placeholder: placeholder,
    extraPlugins: [CustomUploadAdapterPlugin],
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'blockQuote',
      'insertTable',
      'imageUpload',
      'undo',
      'redo'
    ],
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    },
    image: {
      toolbar: [
        'imageTextAlternative', 'imageStyle:full', 'imageStyle:side'
      ]
    }
  };

  return (
    <div className={`rich-editor-container ${className}`}>
      <CKEditor
        editor={ClassicEditor}
        config={editorConfiguration}
        data={value || ''}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        onError={(error, { willEditorRestart }) => {
          if (willEditorRestart) {
            console.error('Editor will restart due to error:', error);
          }
        }}
      />
      <style>{`
        .rich-editor-container {
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          overflow: hidden;
        }
        .rich-editor-container :global(.ck-editor__editable) {
          min-height: 200px;
          max-height: 400px;
          padding: 1rem;
        }
        .rich-editor-container :global(.ck-editor__editable:focus) {
          box-shadow: none;
          border: none;
        }
        .rich-editor-container :global(.ck-toolbar) {
          border: none;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        .option-editor {
          max-width: 390px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .option-editor :global(.ck-editor__editable) {
          min-height: 80px;
          max-height: 120px;
        }
      `}</style>
    </div>
  );
}