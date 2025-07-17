// import React from 'react';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';

// export default function RichEditor2({ value, onChange, placeholder = "Write your content..." }) {
//   const editor = useEditor({
//     extensions: [StarterKit],
//     content: value,
//     onUpdate({ editor }) {
//       onChange(editor.getHTML());
//     },
//   });

//   return (
//     // <div className="border border-gray-300 rounded-md px-3 py-2 bg-white">
//       <EditorContent editor={editor} className="min-h-[150px]" />
//     // {/* </div> */}
//   );
// }

// src/components/RichEditor2.jsx
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const RichEditor2 = ({ value, onChange }) => {
  return (
    <div className="border border-gray-300 rounded-md bg-white p-2">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default RichEditor2;
