import React, { useEffect, useRef } from "react";
import "trix/dist/trix.css";
import "trix";
import { DirectUpload } from "@rails/activestorage";

const TrixEditor = ({ value, onChange, inputId, label, required, ...props }) => {
  const editorRef = useRef(null);
  const inputRef = useRef(null);

  // Sync value from React state to Trix editor
  useEffect(() => {
    if (
      inputRef.current &&
      value !== inputRef.current.value &&
      editorRef.current &&
      editorRef.current.editor &&
      value !== editorRef.current.innerHTML
    ) {
      inputRef.current.value = value || "";
      editorRef.current.editor.loadHTML(value || "");
    }
  }, [value]);

  useEffect(() => {
    const handleTrixChange = (event) => {
      if (onChange && editorRef.current) {
        const html = editorRef.current.innerHTML;
        onChange(html);
      }
    };
    const input = inputRef.current;
    input.addEventListener("trix-change", handleTrixChange);
    return () => {
      input.removeEventListener("trix-change", handleTrixChange);
    };
  }, [onChange]);

  // Use Rails Active Storage Direct Upload for Trix images
  useEffect(() => {
    const handleAttachmentAdd = (event) => {
      const attachment = event.attachment;
      if (attachment.file) {
        const upload = new DirectUpload(
          attachment.file,
          `${import.meta.env.VITE_API_BASE_URL2}/rails/active_storage/direct_uploads`
        );
        upload.create((error, blob) => {
          if (error) {
            // Handle error
            console.error(error);
          } else {
            // This is the Rails Active Storage URL for the blob
            const imageUrl = `${import.meta.env.VITE_API_BASE_URL2}/rails/active_storage/blobs/${blob.signed_id}/${blob.filename}`;
            attachment.setAttributes({
              url: imageUrl,
              href: imageUrl,
            });
          }
        });
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("trix-attachment-add", handleAttachmentAdd);
    }
    return () => {
      if (editor) {
        editor.removeEventListener("trix-attachment-add", handleAttachmentAdd);
      }
    };
  }, []);

  return (
    <div className="trix-editor-block w-full mb-4">
      {label && (
        <label htmlFor={inputId} className="block font-semibold text-gray-700 mb-2">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="hidden"
        id={inputId}
        ref={inputRef}
        value={value || ""}
        readOnly
      />
      <trix-editor
        ref={editorRef}
        input={inputId}
        class="trix-custom"
        {...props}
      ></trix-editor>
    </div>
  );
};

export default TrixEditor; 